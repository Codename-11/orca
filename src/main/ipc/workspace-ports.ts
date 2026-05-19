import { ipcMain } from 'electron'
import path from 'path'
import type { Store } from '../persistence'
import type {
  WorkspacePortKillRequest,
  WorkspacePortKillResult,
  WorkspacePortProbe,
  WorkspacePortScanRequest,
  WorkspacePortScanResult
} from '../../shared/workspace-ports'
import { scanWorkspacePorts } from '../ports/local-workspace-port-scanner'
import { splitWorktreeId } from '../../shared/worktree-id'

export function registerWorkspacePortHandlers(store: Store): void {
  const inFlightScans = new Map<string, Promise<WorkspacePortScanResult>>()

  ipcMain.handle(
    'workspacePorts:scan',
    (_event, args: WorkspacePortScanRequest): Promise<WorkspacePortScanResult> => {
      const worktrees = getLocalWorktreeProbes(store, args.repoId)
      const key = JSON.stringify(
        worktrees
          .map((worktree) => [worktree.id, worktree.repoId, worktree.displayName, worktree.path])
          .sort(([a], [b]) => String(a).localeCompare(String(b)))
      )
      const existing = inFlightScans.get(key)
      if (existing) {
        return existing
      }

      const promise = scanWorkspacePorts(worktrees).finally(() => {
        if (inFlightScans.get(key) === promise) {
          inFlightScans.delete(key)
        }
      })
      inFlightScans.set(key, promise)
      return promise
    }
  )

  ipcMain.handle(
    'workspacePorts:kill',
    async (_event, args: WorkspacePortKillRequest): Promise<WorkspacePortKillResult> => {
      if (!Number.isSafeInteger(args.pid) || args.pid <= 0 || !Number.isSafeInteger(args.port)) {
        return { ok: false, reason: 'Invalid process or port.' }
      }

      const worktrees = getLocalWorktreeProbes(store, args.repoId)
      const scan = await scanWorkspacePorts(worktrees)
      const port = scan.ports.find(
        (candidate) => candidate.pid === args.pid && candidate.port === args.port
      )

      if (!port) {
        return { ok: false, reason: 'The port is no longer listening.' }
      }
      if (port.kind !== 'workspace') {
        return { ok: false, reason: 'Only workspace-owned local processes can be stopped here.' }
      }
      const pid = port.pid
      if (!pid) {
        return { ok: false, reason: 'The owning process is unknown.' }
      }
      if (pid === process.pid) {
        return { ok: false, reason: 'Orca cannot stop its own process.' }
      }

      try {
        // Why: renderer-supplied pids are not trusted; the re-scan above proves
        // this pid still owns the requested workspace listener before SIGTERM.
        process.kill(pid, 'SIGTERM')
        return { ok: true }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { ok: false, reason: message || 'Failed to stop the process.' }
      }
    }
  )
}

function getLocalWorktreeProbes(store: Store, repoId?: string): WorkspacePortProbe[] {
  const reposById = new Map(store.getRepos().map((repo) => [repo.id, repo]))
  return Object.entries(store.getAllWorktreeMeta()).flatMap(([worktreeId, meta]) => {
    const parsed = splitWorktreeId(worktreeId)
    if (!parsed || (repoId && parsed.repoId !== repoId)) {
      return []
    }
    const repo = reposById.get(parsed.repoId)
    if (!repo || repo.connectionId) {
      return []
    }
    return [
      {
        id: worktreeId,
        repoId: parsed.repoId,
        displayName: meta.displayName || path.basename(parsed.worktreePath),
        path: parsed.worktreePath
      }
    ]
  })
}
