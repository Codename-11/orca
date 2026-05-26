import type {
  ForgeAgentSummary,
  ForgeComment,
  ForgeCommentCreateResult,
  ForgeConfigSettings,
  ForgeConnectionStatus,
  ForgeIssue,
  ForgeIssueCreate,
  ForgeIssueCreateResult,
  ForgeIssueListOptions,
  ForgeIssueStatus,
  ForgeIssueUpdate,
  ForgeLabel,
  ForgeListFilter,
  ForgeMutationResult,
  ForgeProjectSummary,
  ForgeSaveConfigArgs,
  ForgeWorkspaceSummary,
  GlobalSettings
} from '../../../shared/types'
import { callRuntimeRpc, getActiveRuntimeTarget } from './runtime-rpc-client'

export type RuntimeForgeSettings =
  | Pick<GlobalSettings, 'activeRuntimeEnvironmentId'>
  | null
  | undefined

const READ_TIMEOUT_MS = 15_000
const WRITE_TIMEOUT_MS = 30_000

function remoteTarget(
  settings: RuntimeForgeSettings
): { kind: 'environment'; environmentId: string } | null {
  const target = getActiveRuntimeTarget(settings)
  return target.kind === 'environment' ? target : null
}

export async function forgeStatus(settings: RuntimeForgeSettings): Promise<ForgeConnectionStatus> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeConnectionStatus>(remote, 'forge.status', undefined, {
        timeoutMs: READ_TIMEOUT_MS
      })
    : window.api.forge.status()
}

export async function forgeGetConfig(settings: RuntimeForgeSettings): Promise<ForgeConfigSettings> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeConfigSettings>(remote, 'forge.getConfig', undefined, {
        timeoutMs: READ_TIMEOUT_MS
      })
    : window.api.forge.getConfig()
}

export async function forgeSaveConfig(
  settings: RuntimeForgeSettings,
  args: ForgeSaveConfigArgs
): Promise<{ ok: true; config: ForgeConfigSettings } | { ok: false; error: string }> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<{ ok: true; config: ForgeConfigSettings } | { ok: false; error: string }>(
        remote,
        'forge.saveConfig',
        args,
        { timeoutMs: WRITE_TIMEOUT_MS }
      )
    : window.api.forge.saveConfig(args)
}

export async function forgeClearConfig(
  settings: RuntimeForgeSettings
): Promise<{ ok: true; config: ForgeConfigSettings }> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<{ ok: true; config: ForgeConfigSettings }>(
        remote,
        'forge.clearConfig',
        undefined,
        { timeoutMs: WRITE_TIMEOUT_MS }
      )
    : window.api.forge.clearConfig()
}

export async function forgeListStatuses(
  settings: RuntimeForgeSettings
): Promise<ForgeIssueStatus[]> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeIssueStatus[]>(remote, 'forge.listStatuses', undefined, {
        timeoutMs: READ_TIMEOUT_MS
      })
    : window.api.forge.listStatuses()
}

export async function forgeListProjects(
  settings: RuntimeForgeSettings
): Promise<ForgeProjectSummary[]> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeProjectSummary[]>(remote, 'forge.listProjects', undefined, {
        timeoutMs: READ_TIMEOUT_MS
      })
    : window.api.forge.listProjects()
}

export async function forgeListLabels(settings: RuntimeForgeSettings): Promise<ForgeLabel[]> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeLabel[]>(remote, 'forge.listLabels', undefined, {
        timeoutMs: READ_TIMEOUT_MS
      })
    : window.api.forge.listLabels()
}

export async function forgeListAgents(
  settings: RuntimeForgeSettings
): Promise<ForgeAgentSummary[]> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeAgentSummary[]>(remote, 'forge.listAgents', undefined, {
        timeoutMs: READ_TIMEOUT_MS
      })
    : window.api.forge.listAgents()
}

export async function forgeListWorkspaces(
  settings: RuntimeForgeSettings
): Promise<ForgeWorkspaceSummary[]> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeWorkspaceSummary[]>(remote, 'forge.listWorkspaces', undefined, {
        timeoutMs: READ_TIMEOUT_MS
      })
    : window.api.forge.listWorkspaces()
}

export async function forgeListIssues(
  settings: RuntimeForgeSettings,
  filter?: ForgeListFilter,
  limit?: number,
  options: ForgeIssueListOptions = {}
): Promise<ForgeIssue[]> {
  const args = { filter, limit, ...options }
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeIssue[]>(remote, 'forge.listIssues', args, {
        timeoutMs: WRITE_TIMEOUT_MS
      })
    : window.api.forge.listIssues(args)
}

export async function forgeSearchIssues(
  settings: RuntimeForgeSettings,
  query: string,
  limit?: number,
  options: ForgeIssueListOptions = {}
): Promise<ForgeIssue[]> {
  const args = { query, limit, ...options }
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeIssue[]>(remote, 'forge.searchIssues', args, {
        timeoutMs: WRITE_TIMEOUT_MS
      })
    : window.api.forge.searchIssues(args)
}

export async function forgeListComments(
  settings: RuntimeForgeSettings,
  issueId: string
): Promise<ForgeComment[]> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeComment[]>(
        remote,
        'forge.listComments',
        { issueId },
        { timeoutMs: READ_TIMEOUT_MS }
      )
    : window.api.forge.listComments({ issueId })
}

export async function forgeUpdateIssue(
  settings: RuntimeForgeSettings,
  id: string,
  updates: ForgeIssueUpdate
): Promise<ForgeMutationResult> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeMutationResult>(
        remote,
        'forge.updateIssue',
        { id, updates },
        { timeoutMs: WRITE_TIMEOUT_MS }
      )
    : window.api.forge.updateIssue({ id, updates })
}

export async function forgeCreateIssue(
  settings: RuntimeForgeSettings,
  input: ForgeIssueCreate
): Promise<ForgeIssueCreateResult> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeIssueCreateResult>(
        remote,
        'forge.createIssue',
        { input },
        { timeoutMs: WRITE_TIMEOUT_MS }
      )
    : window.api.forge.createIssue({ input })
}

export async function forgeCreateComment(
  settings: RuntimeForgeSettings,
  issueId: string,
  body: string
): Promise<ForgeCommentCreateResult> {
  const remote = remoteTarget(settings)
  return remote
    ? callRuntimeRpc<ForgeCommentCreateResult>(
        remote,
        'forge.createComment',
        { issueId, body },
        { timeoutMs: WRITE_TIMEOUT_MS }
      )
    : window.api.forge.createComment({ issueId, body })
}
