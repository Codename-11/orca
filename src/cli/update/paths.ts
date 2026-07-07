import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { RuntimeClientError } from '../runtime-client'

export const DEFAULT_RUNTIME_ROOT = path.join(
  homedir(),
  '.local',
  'share',
  'orca',
  'source-runtimes'
)
export const DEFAULT_SERVE_PORT = '6768'
export const DEFAULT_PAIRING_ADDRESS = '127.0.0.1'

export function inferDefaultUpdateBranch(sourceRoot: string): string {
  const explicit = process.env.ORCA_UPDATE_BRANCH
  if (explicit) {
    return explicit
  }
  const version = readPackageVersion(sourceRoot) ?? ''
  const originUrl = runCapture(['git', '-C', sourceRoot, 'remote', 'get-url', 'origin']) ?? ''
  if (version.includes('axiom') || /Codename-11[/:]orca(?:\.git)?$/i.test(originUrl.trim())) {
    return 'origin/axiom/deploy'
  }
  return 'origin/main'
}

export function getBuiltCliSourceRoot(): string {
  return path.resolve(__dirname, '..', '..', '..')
}

export function assertSourceCheckout(sourceRoot: string): void {
  if (
    !existsSync(path.join(sourceRoot, 'package.json')) ||
    !existsSync(path.join(sourceRoot, '.git'))
  ) {
    throw new RuntimeClientError(
      'unsupported_installation',
      'orca update for source runtimes must be run from a git checkout. Packaged apps use the built-in app updater.'
    )
  }
}

export function assertGitCheckout(candidate: string, label: string): void {
  if (!existsSync(path.join(candidate, '.git'))) {
    throw new RuntimeClientError(
      'invalid_runtime_path',
      `${label} is not a git checkout: ${candidate}`
    )
  }
}

export function assertPosixSourceUpdate(): void {
  if (process.platform === 'win32') {
    throw new RuntimeClientError(
      'unsupported_platform',
      'orca update for source runtimes is currently supported on macOS/Linux.'
    )
  }
}

export function getStringFlag(flags: Map<string, string | boolean>, name: string): string | null {
  const value = flags.get(name)
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function readPackageVersion(root: string): string | null {
  try {
    const parsed = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      version?: unknown
    }
    return typeof parsed.version === 'string' ? parsed.version : null
  } catch {
    return null
  }
}

export function runCapture(command: string[]): string | null {
  const child = spawnSync(command[0], command.slice(1), { encoding: 'utf8' })
  if (child.status !== 0 || child.error) {
    return null
  }
  return String(child.stdout).trim()
}

export function readText(candidate: string): string | null {
  try {
    return readFileSync(candidate, 'utf8')
  } catch {
    return null
  }
}

export function getServeUnitPath(): string {
  return path.join(homedir(), '.config', 'systemd', 'user', 'orca-serve.service')
}

export function parseServeArg(content: string | null, name: string): string | null {
  if (!content) {
    return null
  }
  const match = new RegExp(`${escapeRegExp(name)}\\s+([^\\s]+)`).exec(content)
  return match?.[1] ?? null
}

export function quoteCommand(command: string[]): string {
  return command.map((part) => (/[\s"']/.test(part) ? JSON.stringify(part) : part)).join(' ')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
