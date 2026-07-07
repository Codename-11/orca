import { existsSync, lstatSync, readlinkSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { getServeUnitPath, readPackageVersion, readText, runCapture } from './paths'
import type { RuntimeSnapshot, RuntimeStatus, UpdateOptions } from './types'

export function buildStatus(options: UpdateOptions): RuntimeStatus {
  const cliPath = path.join(homedir(), '.local', 'bin', 'orca')
  const cliTarget = readSymlinkTarget(cliPath)
  const serveUnit = getServeUnitPath()
  const serveRuntimePath = resolveServeRuntimePath(serveUnit)
  return {
    sourceRoot: options.sourceRoot,
    branch: options.branch,
    runtimeRoot: options.runtimeRoot,
    cliPath,
    cliTarget,
    cliRuntime: snapshotRuntime(path.join(options.runtimeRoot, 'cli')),
    serveUnit,
    serveUnitExists: existsSync(serveUnit),
    serveRuntime: serveRuntimePath
      ? snapshotRuntime(serveRuntimePath)
      : snapshotRuntime(path.join(options.runtimeRoot, 'serve'))
  }
}

export function formatPayload(payload: unknown): string {
  if (!isRecord(payload)) {
    return String(payload)
  }
  if ('status' in payload && isRecord(payload.status)) {
    return [`Orca update complete.`, '', formatStatus(payload.status as RuntimeStatus)].join('\n')
  }
  return formatStatus(payload as RuntimeStatus)
}

export function formatStatus(status: RuntimeStatus): string {
  return [
    `Source repo: ${status.sourceRoot}`,
    `Update ref: ${status.branch}`,
    `Runtime root: ${status.runtimeRoot}`,
    `CLI shim: ${status.cliPath}${status.cliTarget ? ` -> ${status.cliTarget}` : ' (missing)'}`,
    `CLI runtime: ${formatSnapshot(status.cliRuntime)}`,
    `Serve unit: ${status.serveUnit}${status.serveUnitExists ? '' : ' (missing)'}`,
    `Serve runtime: ${formatSnapshot(status.serveRuntime)}`
  ].join('\n')
}

function snapshotRuntime(runtimePath: string): RuntimeSnapshot | null {
  if (!existsSync(runtimePath)) {
    return null
  }
  return {
    path: runtimePath,
    version: readPackageVersion(runtimePath),
    sha: runCapture(['git', '-C', runtimePath, 'rev-parse', '--short', 'HEAD']),
    ref: runCapture(['git', '-C', runtimePath, 'rev-parse', '--abbrev-ref', 'HEAD']),
    dirty: inferDirty(runtimePath)
  }
}

function formatSnapshot(snapshot: RuntimeSnapshot | null): string {
  if (!snapshot) {
    return 'missing'
  }
  const dirty = snapshot.dirty === true ? ', dirty' : ''
  return `${snapshot.path} (${snapshot.version ?? 'unknown version'}, ${snapshot.sha ?? 'unknown sha'}${dirty})`
}

function inferDirty(runtimePath: string): boolean | null {
  const output = runCapture(['git', '-C', runtimePath, 'status', '--short'])
  return output === null ? null : output.length > 0
}

function readSymlinkTarget(candidate: string): string | null {
  try {
    if (!lstatSync(candidate).isSymbolicLink()) {
      return null
    }
    return readlinkSync(candidate)
  } catch {
    return null
  }
}

function resolveServeRuntimePath(unitPath: string): string | null {
  const content = readText(unitPath)
  if (!content) {
    return null
  }
  const match = /^WorkingDirectory=(.+)$/m.exec(content)
  return match?.[1]?.trim() ?? null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
