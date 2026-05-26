/*
 * Why: Forge issue operations live in their own module so the IPC layer
 * imports a small surface (no transport details). All mutations return a
 * tagged union so the IPC handler can pass errors back to the renderer
 * without leaking exception stacks.
 */
import type {
  ForgeAgentSummary,
  ForgeComment,
  ForgeCommentCreateResult,
  ForgeConnectionStatus,
  ForgeIssue,
  ForgeIssueCreate,
  ForgeIssueCreateResult,
  ForgeIssueListOptions,
  ForgeIssueSort,
  ForgeIssueStatus,
  ForgeIssueUpdate,
  ForgeListFilter,
  ForgeMutationResult,
  ForgeWorkspaceSummary
} from '../../shared/types'
import { DEFAULT_FORGE_SORT } from '../../shared/forge-types'
import { sortForgeIssues } from '../../shared/forge-issue-sort'
import { resolveForgeConfig } from './config'
import {
  agentArray,
  commentArray,
  forgeTool,
  issueArray,
  normalizeComment,
  normalizeIssue,
  statusArray,
  workspaceArray
} from './client'

/** Maps our sort keys to the field names the Forge MCP `issues.list` accepts. */
const SORT_KEY_TO_API: Record<ForgeIssueSort['key'], string> = {
  updated: 'updatedAt',
  created: 'createdAt',
  priority: 'priority',
  identifier: 'identifier',
  title: 'title'
}

/** Applies sort/workspace/project params to an issues.list-style payload. */
function applyListParams(input: Record<string, unknown>, options: ForgeIssueListOptions): void {
  if (Object.prototype.hasOwnProperty.call(options, 'assignedAgentId')) {
    input.assignedAgentId = options.assignedAgentId ?? null
  }
  if (options.projectId) {
    input.projectId = options.projectId
  }
  if (options.workspaceId) {
    input.workspaceId = options.workspaceId
  }
  const sort = options.sort ?? DEFAULT_FORGE_SORT
  input.orderBy = SORT_KEY_TO_API[sort.key]
  input.order = sort.direction
}

/**
 * Why: the Forge MCP surface does not guarantee order or honor every filter,
 * so we re-apply the project filter and sort locally. This makes the result
 * deterministic and correct even when the server ignores a hint.
 */
function finalizeIssues(issues: ForgeIssue[], options: ForgeIssueListOptions): ForgeIssue[] {
  let result = issues
  if (options.projectId) {
    result = result.filter((issue) => issue.project?.id === options.projectId)
  }
  return sortForgeIssues(result, options.sort ?? DEFAULT_FORGE_SORT)
}

export async function getStatus(): Promise<ForgeConnectionStatus> {
  const resolved = resolveForgeConfig()
  if (!resolved.baseUrl) {
    return {
      connected: false,
      baseUrl: null,
      hasToken: resolved.hasToken,
      configSource: resolved.baseUrlSource,
      error: 'Forge API URL is not configured'
    }
  }
  try {
    const json = await forgeTool('workspace.get')
    const workspace = json && typeof json === 'object' ? (json as Record<string, unknown>) : {}
    return {
      connected: true,
      baseUrl: resolved.baseUrl,
      hasToken: resolved.hasToken,
      configSource: resolved.baseUrlSource,
      workspaceId: typeof workspace.id === 'string' ? workspace.id : null,
      workspaceName: typeof workspace.name === 'string' ? workspace.name : null,
      workspaceSlug: typeof workspace.slug === 'string' ? workspace.slug : null
    }
  } catch (error) {
    return {
      connected: false,
      baseUrl: resolved.baseUrl,
      hasToken: resolved.hasToken,
      configSource: resolved.baseUrlSource,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function listIssues(
  filter: ForgeListFilter = 'active',
  limit = 50,
  options: ForgeIssueListOptions = {}
): Promise<ForgeIssue[]> {
  if (filter === 'assigned' && !Object.prototype.hasOwnProperty.call(options, 'assignedAgentId')) {
    const input: Record<string, unknown> = { limit, includeDone: false }
    applyListParams(input, options)
    const json = await forgeTool('issues.assigned', input)
    return finalizeIssues(issueArray(json), options)
  }

  const input: Record<string, unknown> = { limit }
  applyListParams(input, options)
  if (filter === 'done') {
    input.includeDone = true
    input.statusCategories = ['DONE']
  } else if (filter === 'all') {
    input.includeDone = true
  } else if (filter === 'created') {
    // Why: best-effort "created by me" — Forge may honor `createdByViewer`.
    // finalizeIssues still sorts; if the server ignores the flag the tab
    // degrades to the full list rather than breaking.
    input.includeDone = true
    input.createdByViewer = true
  } else {
    input.statusCategories = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW']
  }

  const json = await forgeTool('issues.list', input)
  return finalizeIssues(issueArray(json), options)
}

export async function searchIssues(
  query: string,
  limit = 50,
  options: ForgeIssueListOptions = {}
): Promise<ForgeIssue[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }
  const input: Record<string, unknown> = { query: trimmed, limit, includeDone: true }
  applyListParams(input, options)
  const json = await forgeTool('issues.list', input)
  return finalizeIssues(issueArray(json), options)
}

export async function listStatuses(): Promise<ForgeIssueStatus[]> {
  const json = await forgeTool('statuses.list')
  return statusArray(json)
}

export async function updateIssue(
  id: string,
  updates: ForgeIssueUpdate
): Promise<ForgeMutationResult> {
  try {
    const { statusId, labelIds, removeLabelIds, assignedAgentId, ...patch } = updates
    const patchPayload: Record<string, unknown> = {}
    if (Object.prototype.hasOwnProperty.call(patch, 'title') && patch.title !== undefined) {
      patchPayload.title = patch.title
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'priority') && patch.priority !== undefined) {
      patchPayload.priority = patch.priority
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'description')) {
      patchPayload.description = patch.description
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'projectId')) {
      patchPayload.projectId = patch.projectId
    }

    if (Object.keys(patchPayload).length > 0) {
      await forgeTool('issues.update', { id, ...patchPayload })
    }
    if (statusId) {
      await forgeTool('issues.transition', { id, statusId })
    }
    if (labelIds || removeLabelIds) {
      // Why: Forge MCP uses additive/removal label mutations rather than a
      // replacement field. The UI sends explicit add/remove deltas.
      await forgeTool('issues.setLabels', {
        issueId: id,
        add: labelIds ?? [],
        remove: removeLabelIds ?? []
      })
    }
    if (assignedAgentId !== undefined) {
      await forgeTool('issues.assign', { issueId: id, agentId: assignedAgentId })
    }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function createIssue(input: ForgeIssueCreate): Promise<ForgeIssueCreateResult> {
  const title = input.title?.trim()
  if (!title) {
    return { ok: false, error: 'Title is required' }
  }
  try {
    const payload: Record<string, unknown> = { title }
    if (input.description !== undefined) {
      payload.description = input.description
    }
    if (input.projectId !== undefined && input.projectId !== null) {
      payload.projectId = input.projectId
    }
    if (input.priority) {
      payload.priority = input.priority
    }

    const json = await forgeTool('issues.create', payload)
    const issue = normalizeIssue(json) ?? normalizeIssue((json as { issue?: unknown })?.issue)
    if (!issue) {
      return { ok: false, error: 'Forge did not return a created issue' }
    }
    if (input.statusId) {
      await forgeTool('issues.transition', { id: issue.id, statusId: input.statusId })
    }
    if (input.labelIds && input.labelIds.length > 0) {
      await forgeTool('issues.setLabels', { issueId: issue.id, add: input.labelIds })
    }
    if (input.assignedAgentId) {
      await forgeTool('issues.assign', { issueId: issue.id, agentId: input.assignedAgentId })
    }
    return { ok: true, issue }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function listComments(issueId: string): Promise<ForgeComment[]> {
  const json = await forgeTool('comments.list', { issueId })
  return commentArray(json)
}

export async function createComment(
  issueId: string,
  body: string
): Promise<ForgeCommentCreateResult> {
  const trimmed = body.trim()
  if (!trimmed) {
    return { ok: false, error: 'Comment body is required' }
  }
  try {
    const json = await forgeTool('comments.create', { issueId, body: trimmed })
    const comment =
      normalizeComment(json) ?? normalizeComment((json as { comment?: unknown })?.comment)
    if (!comment) {
      return { ok: false, error: 'Forge did not return a created comment' }
    }
    return { ok: true, comment }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function listWorkspaces(): Promise<ForgeWorkspaceSummary[]> {
  // Why: most tokens are scoped to one workspace, but orgs with several expose
  // `workspaces.list`. Fall back to the single connected workspace so the UI
  // can always render at least the current one.
  try {
    const json = await forgeTool('workspaces.list')
    const workspaces = workspaceArray(json)
    if (workspaces.length > 0) {
      return workspaces
    }
  } catch {
    // fall through to the single-workspace path
  }
  try {
    const json = await forgeTool('workspace.get')
    const workspace = workspaceArray({ workspaces: [json] })
    return workspace
  } catch {
    return []
  }
}

export async function listAssignableAgents(): Promise<ForgeAgentSummary[]> {
  // Why: Forge exposes both `agents_list` and `workspace.members` depending on
  // role. Try agents first (more useful), fall back to an empty list rather
  // than throwing so the UI still renders.
  try {
    const json = await forgeTool('agents.list')
    const agents = agentArray(json)
    if (agents.length > 0) {
      return agents
    }
  } catch {
    // fall through to members
  }
  try {
    const json = await forgeTool('workspace.members')
    return agentArray(json)
  } catch {
    return []
  }
}
