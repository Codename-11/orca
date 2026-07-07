import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { RuntimeClientError } from '../runtime-client'
import {
  DEFAULT_PAIRING_ADDRESS,
  DEFAULT_RUNTIME_ROOT,
  DEFAULT_SERVE_PORT,
  assertGitCheckout,
  assertPosixSourceUpdate,
  assertSourceCheckout,
  getBuiltCliSourceRoot,
  getServeUnitPath,
  getStringFlag,
  inferDefaultUpdateBranch,
  parseServeArg,
  quoteCommand,
  readText
} from './paths'
import { buildStatus, formatPayload } from './status'
import type { CommandResult, UpdateOptions, UpdateTarget } from './types'

export async function runLocalSourceUpdate(
  target: UpdateTarget,
  flags: Map<string, string | boolean>,
  json: boolean
): Promise<void> {
  const options = buildOptions(flags)
  if (target === 'status') {
    printPayload(buildStatus(options), json)
    return
  }

  const results: CommandResult[] = []
  if (target === 'cli' || target === 'all') {
    results.push(...updateCliRuntime(options))
  }
  if (target === 'serve' || target === 'all') {
    results.push(...updateServeRuntime(options))
  }
  printPayload(
    { ok: true, target, dryRun: options.dryRun, status: buildStatus(options), commands: results },
    json
  )
}

function buildOptions(flags: Map<string, string | boolean>): UpdateOptions {
  const sourceRoot =
    getStringFlag(flags, 'repo') ?? process.env.ORCA_UPDATE_SOURCE_REPO ?? getBuiltCliSourceRoot()
  assertSourceCheckout(sourceRoot)
  return {
    sourceRoot,
    branch: getStringFlag(flags, 'branch') ?? inferDefaultUpdateBranch(sourceRoot),
    runtimeRoot:
      getStringFlag(flags, 'runtime-root') ??
      process.env.ORCA_LOCAL_RUNTIME_ROOT ??
      DEFAULT_RUNTIME_ROOT,
    dryRun: flags.get('dry-run') === true,
    restart: flags.get('no-restart') !== true
  }
}

function updateCliRuntime(options: UpdateOptions): CommandResult[] {
  assertPosixSourceUpdate()
  const targetDir = path.join(options.runtimeRoot, 'cli')
  const commands = updateManagedWorktree(options, targetDir, 'cli')
  commands.push(runManaged(options, ['pnpm', 'install', '--frozen-lockfile'], targetDir))
  commands.push(runManaged(options, ['pnpm', 'run', 'build:cli'], targetDir))
  linkCliShim(options, targetDir, 'orca')
  linkCliShim(options, targetDir, 'orca-dev')
  return commands
}

function updateServeRuntime(options: UpdateOptions): CommandResult[] {
  assertPosixSourceUpdate()
  const targetDir = path.join(options.runtimeRoot, 'serve')
  const commands = updateManagedWorktree(options, targetDir, 'serve')
  commands.push(runManaged(options, ['pnpm', 'install', '--frozen-lockfile'], targetDir))
  commands.push(runManaged(options, ['pnpm', 'run', 'build:desktop'], targetDir))
  const currentServe = path.join(options.runtimeRoot, 'current-serve')
  replaceSymlink(options, currentServe, targetDir)
  writeServeUnit(options, currentServe)
  if (options.restart) {
    commands.push(runManaged(options, ['systemctl', '--user', 'daemon-reload']))
    commands.push(runManaged(options, ['systemctl', '--user', 'restart', 'orca-serve.service']))
    commands.push(runManaged(options, ['systemctl', '--user', 'is-active', 'orca-serve.service']))
  }
  return commands
}

function updateManagedWorktree(
  options: UpdateOptions,
  targetDir: string,
  label: string
): CommandResult[] {
  const commands = [
    runManaged(options, ['git', '-C', options.sourceRoot, 'fetch', 'origin', '--prune'])
  ]
  mkdirSync(path.dirname(targetDir), { recursive: true })
  if (!existsSync(targetDir)) {
    commands.push(
      runManaged(options, [
        'git',
        '-C',
        options.sourceRoot,
        'worktree',
        'add',
        '--detach',
        targetDir,
        options.branch
      ])
    )
    return commands
  }
  assertGitCheckout(targetDir, `managed ${label} runtime`)
  commands.push(runManaged(options, ['git', '-C', targetDir, 'fetch', 'origin', '--prune']))
  commands.push(
    runManaged(options, ['git', '-C', targetDir, 'checkout', '--detach', options.branch])
  )
  commands.push(runManaged(options, ['git', '-C', targetDir, 'reset', '--hard', options.branch]))
  commands.push(runManaged(options, ['git', '-C', targetDir, 'clean', '-fd']))
  return commands
}

function writeServeUnit(options: UpdateOptions, currentServe: string): void {
  const unitPath = getServeUnitPath()
  const existing = readText(unitPath)
  const servePort =
    process.env.ORCA_SERVE_PORT ?? parseServeArg(existing, '--serve-port') ?? DEFAULT_SERVE_PORT
  const pairingAddress =
    process.env.ORCA_SERVE_PAIRING_ADDRESS ??
    parseServeArg(existing, '--serve-pairing-address') ??
    DEFAULT_PAIRING_ADDRESS
  const userDataPath =
    process.env.ORCA_SERVE_USER_DATA_PATH ?? path.join(homedir(), '.config', 'orca-serve')
  const content = buildServeUnitContent(currentServe, userDataPath, servePort, pairingAddress)
  if (!options.dryRun) {
    mkdirSync(path.dirname(unitPath), { recursive: true })
    writeFileSync(unitPath, content)
  }
}

function buildServeUnitContent(
  currentServe: string,
  userDataPath: string,
  servePort: string,
  pairingAddress: string
): string {
  return `[Unit]
Description=Orca headless runtime server
Documentation=https://github.com/stablyai/orca
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${currentServe}
Environment=ORCA_DEV_USER_DATA_PATH=${userDataPath}
Environment=ORCA_USER_DATA_PATH=${userDataPath}
Environment=ELECTRON_DISABLE_SECURITY_WARNINGS=true
ExecStart=/usr/bin/xvfb-run -a -s "-screen 0 1280x720x24" ${currentServe}/node_modules/.bin/electron --no-sandbox ${currentServe} --serve --serve-port ${servePort} --serve-pairing-address ${pairingAddress} --serve-json
Restart=on-failure
RestartSec=5
TimeoutStopSec=30
KillMode=control-group

MemoryMax=4G
TasksMax=512
NoNewPrivileges=true

[Install]
WantedBy=default.target
`
}

function linkCliShim(options: UpdateOptions, runtimeDir: string, name: string): void {
  const preferred = path.join(runtimeDir, 'config', 'scripts', 'orca-dev.mjs')
  const fallback = path.join(runtimeDir, 'config', 'scripts', 'orca-dev')
  replaceSymlink(
    options,
    path.join(homedir(), '.local', 'bin', name),
    existsSync(preferred) ? preferred : fallback
  )
}

function replaceSymlink(options: UpdateOptions, destination: string, source: string): void {
  if (options.dryRun) {
    return
  }
  mkdirSync(path.dirname(destination), { recursive: true })
  rmSync(destination, { force: true, recursive: false })
  symlinkSync(source, destination)
}

function runManaged(options: UpdateOptions, command: string[], cwd?: string): CommandResult {
  const result = { command: quoteCommand(command), cwd, exitCode: 0 }
  if (options.dryRun) {
    return result
  }
  const child = spawnSync(command[0], command.slice(1), { cwd, stdio: 'inherit', env: process.env })
  result.exitCode = child.status ?? (child.signal ? 1 : 0)
  if (child.error) {
    throw child.error
  }
  if (result.exitCode !== 0) {
    throw new RuntimeClientError(
      'update_failed',
      `Command failed (${result.exitCode}): ${result.command}`
    )
  }
  return result
}

function printPayload(payload: unknown, json: boolean): void {
  console.log(json ? JSON.stringify(payload, null, 2) : formatPayload(payload))
}
