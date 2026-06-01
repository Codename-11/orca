import { toast } from 'sonner'

import { buildWorkspaceSessionPayload } from './workspace-session'
import { useAppStore } from '../store'

type DetachedTerminalWindowContext = {
  tabId: string
  worktreeId: string
  worktreePath: string
  title?: string
}

export function getDetachedTerminalWindowContext(): DetachedTerminalWindowContext | null {
  const params = new URLSearchParams(window.location.search)
  if (params.get('orcaWindow') !== 'detached-terminal') {
    return null
  }
  const tabId = params.get('tabId')
  const worktreeId = params.get('worktreeId')
  const worktreePath = params.get('worktreePath')
  if (!tabId || !worktreeId || !worktreePath) {
    return null
  }
  const title = params.get('title') ?? undefined
  return { tabId, worktreeId, worktreePath, title }
}

function findWorktreePath(worktreeId: string): string | null {
  const state = useAppStore.getState()
  const worktree = Object.values(state.worktreesByRepo)
    .flat()
    .find((entry) => entry.id === worktreeId)
  return worktree?.path ?? null
}

export async function openDetachedTerminalTab(args: {
  tabId: string
  worktreeId: string
  title?: string
}): Promise<void> {
  const worktreePath = findWorktreePath(args.worktreeId)
  if (!worktreePath) {
    toast.error('Could not pop out terminal: workspace path was not loaded.')
    return
  }

  // Why: secondary renderers hydrate from the persisted session file, not the
  // main renderer's in-memory Zustand heap. Flush before opening so recently
  // created tabs/PTY ids are visible to the detached window on first paint.
  window.api.session.setSync(buildWorkspaceSessionPayload(useAppStore.getState()))

  try {
    const { windowId } = await window.api.app.openDetachedTerminalWindow({
      tabId: args.tabId,
      worktreeId: args.worktreeId,
      worktreePath,
      title: args.title
    })
    useAppStore.getState().detachTerminalTab({
      tabId: args.tabId,
      worktreeId: args.worktreeId,
      windowId
    })
    window.api.session.setSync(buildWorkspaceSessionPayload(useAppStore.getState()))
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Could not pop out terminal window.')
  }
}

export type { DetachedTerminalWindowContext }
