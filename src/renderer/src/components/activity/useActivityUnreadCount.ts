import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAppStore } from '@/store'
import type { AppState } from '@/store/types'
import type { AgentStatusState } from '../../../../shared/agent-status-types'

type ActivityUnreadCountSource = Pick<
  AppState,
  | 'agentStatusByPaneKey'
  | 'retainedAgentsByPaneKey'
  | 'worktreesByRepo'
  | 'acknowledgedAgentsByPaneKey'
>

const EMPTY_WORKTREES_BY_REPO: AppState['worktreesByRepo'] = {}
const EMPTY_RETAINED_AGENTS: AppState['retainedAgentsByPaneKey'] = {}
const EMPTY_ACKNOWLEDGED_AGENTS: AppState['acknowledgedAgentsByPaneKey'] = {}

const DISABLED_ACTIVITY_UNREAD_INPUTS = {
  sortEpoch: 0,
  worktreesByRepo: EMPTY_WORKTREES_BY_REPO,
  retainedAgentsByPaneKey: EMPTY_RETAINED_AGENTS,
  acknowledgedAgentsByPaneKey: EMPTY_ACKNOWLEDGED_AGENTS
}

function isUnreadAgentState(state: AgentStatusState): boolean {
  return state === 'done' || state === 'blocked' || state === 'waiting'
}

export function countActivityUnread(source: ActivityUnreadCountSource): number {
  let count = 0
  for (const worktrees of Object.values(source.worktreesByRepo)) {
    for (const worktree of worktrees) {
      if (worktree.createdAt && worktree.isUnread) {
        count += 1
      }
    }
  }
  for (const [paneKey, entry] of Object.entries(source.agentStatusByPaneKey)) {
    if (!isUnreadAgentState(entry.state)) {
      continue
    }
    if ((source.acknowledgedAgentsByPaneKey[paneKey] ?? 0) < entry.stateStartedAt) {
      count += 1
    }
  }
  for (const [paneKey, retained] of Object.entries(source.retainedAgentsByPaneKey)) {
    if (retained.entry.state !== 'done') {
      continue
    }
    if ((source.acknowledgedAgentsByPaneKey[paneKey] ?? 0) < retained.entry.stateStartedAt) {
      count += 1
    }
  }
  return count
}

export function collectActivityAgentPaneKeys(source: ActivityUnreadCountSource): string[] {
  const paneKeys: string[] = []
  for (const entry of Object.values(source.agentStatusByPaneKey)) {
    if (isUnreadAgentState(entry.state)) {
      paneKeys.push(entry.paneKey)
    }
  }
  for (const retained of Object.values(source.retainedAgentsByPaneKey)) {
    paneKeys.push(retained.entry.paneKey)
  }
  return paneKeys
}

export function useActivityUnreadCount(enabled: boolean): number {
  const { sortEpoch, worktreesByRepo, retainedAgentsByPaneKey, acknowledgedAgentsByPaneKey } =
    useAppStore(
      useShallow((state) => {
        if (!enabled) {
          return DISABLED_ACTIVITY_UNREAD_INPUTS
        }
        return {
          // Why: live status prompt/tool updates churn agentStatusByPaneKey but
          // cannot change unread count unless a sort-relevant state transition
          // or removal occurred. sortEpoch is the cheap invalidation signal.
          sortEpoch: state.sortEpoch,
          worktreesByRepo: state.worktreesByRepo,
          retainedAgentsByPaneKey: state.retainedAgentsByPaneKey,
          acknowledgedAgentsByPaneKey: state.acknowledgedAgentsByPaneKey
        }
      })
    )

  return useMemo(() => {
    if (!enabled) {
      return 0
    }
    void sortEpoch
    return countActivityUnread({
      agentStatusByPaneKey: useAppStore.getState().agentStatusByPaneKey,
      retainedAgentsByPaneKey,
      worktreesByRepo,
      acknowledgedAgentsByPaneKey
    })
  }, [enabled, sortEpoch, worktreesByRepo, retainedAgentsByPaneKey, acknowledgedAgentsByPaneKey])
}
