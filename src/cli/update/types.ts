export type UpdateTarget = 'cli' | 'serve' | 'all' | 'status'

export type CommandResult = {
  command: string
  cwd?: string
  exitCode: number
}

export type RuntimeSnapshot = {
  path: string
  version: string | null
  sha: string | null
  ref: string | null
  dirty: boolean | null
}

export type RuntimeStatus = {
  sourceRoot: string
  branch: string
  runtimeRoot: string
  cliPath: string
  cliTarget: string | null
  cliRuntime: RuntimeSnapshot | null
  serveUnit: string
  serveUnitExists: boolean
  serveRuntime: RuntimeSnapshot | null
}

export type UpdateOptions = {
  branch: string
  runtimeRoot: string
  sourceRoot: string
  dryRun: boolean
  restart: boolean
}
