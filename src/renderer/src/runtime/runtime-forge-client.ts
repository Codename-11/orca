import type {
  ForgeConnectionStatus,
  ForgeIssue,
  ForgeIssueStatus,
  ForgeIssueUpdate,
  ForgeListFilter,
  ForgeMutationResult,
  GlobalSettings
} from '../../../shared/types'
import { callRuntimeRpc, getActiveRuntimeTarget } from './runtime-rpc-client'

export type RuntimeForgeSettings =
  | Pick<GlobalSettings, 'activeRuntimeEnvironmentId'>
  | null
  | undefined

export async function forgeStatus(settings: RuntimeForgeSettings): Promise<ForgeConnectionStatus> {
  const target = getActiveRuntimeTarget(settings)
  return target.kind === 'environment'
    ? callRuntimeRpc<ForgeConnectionStatus>(target, 'forge.status', undefined, {
        timeoutMs: 15_000
      })
    : window.api.forge.status()
}

export async function forgeListStatuses(
  settings: RuntimeForgeSettings
): Promise<ForgeIssueStatus[]> {
  const target = getActiveRuntimeTarget(settings)
  return target.kind === 'environment'
    ? callRuntimeRpc<ForgeIssueStatus[]>(target, 'forge.listStatuses', undefined, {
        timeoutMs: 15_000
      })
    : window.api.forge.listStatuses()
}

export async function forgeListIssues(
  settings: RuntimeForgeSettings,
  filter?: ForgeListFilter,
  limit?: number
): Promise<ForgeIssue[]> {
  const target = getActiveRuntimeTarget(settings)
  return target.kind === 'environment'
    ? callRuntimeRpc<ForgeIssue[]>(
        target,
        'forge.listIssues',
        { filter, limit },
        { timeoutMs: 30_000 }
      )
    : window.api.forge.listIssues({ filter, limit })
}

export async function forgeSearchIssues(
  settings: RuntimeForgeSettings,
  query: string,
  limit?: number
): Promise<ForgeIssue[]> {
  const target = getActiveRuntimeTarget(settings)
  return target.kind === 'environment'
    ? callRuntimeRpc<ForgeIssue[]>(
        target,
        'forge.searchIssues',
        { query, limit },
        { timeoutMs: 30_000 }
      )
    : window.api.forge.searchIssues({ query, limit })
}

export async function forgeUpdateIssue(
  settings: RuntimeForgeSettings,
  id: string,
  updates: ForgeIssueUpdate
): Promise<ForgeMutationResult> {
  const target = getActiveRuntimeTarget(settings)
  return target.kind === 'environment'
    ? callRuntimeRpc<ForgeMutationResult>(
        target,
        'forge.updateIssue',
        { id, updates },
        { timeoutMs: 30_000 }
      )
    : window.api.forge.updateIssue({ id, updates })
}
