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
  ForgeIssueStatus,
  ForgeIssueUpdate,
  ForgeListFilter,
  ForgeMutationResult
} from '../../shared/types'
import { resolveForgeConfig } from './config'
import {
  agentArray,
  commentArray,
  forgeTool,
  issueArray,
  normalizeComment,
  normalizeIssue,
  statusArray
} from './client'

export async function getStatus(): Promise<ForgeConnectionStatus> {
  const resolved = resolveForgeConfig()
  if (!resolved.baseUrl) {
    return {
      connected: false,
      baseUrl: null,
      error: 'Forge API URL is not configured'
    }
  }
  try {
    const json = await forgeTool('workspace.get')
    const workspace = json && typeof json === 'object' ? (json as Record<string, unknown>) : {}
    return {
      connected: true,
      baseUrl: resolved.baseUrl,
      workspaceName: typeof workspace.name === 'string' ? workspace.name : null
    }
  } catch (error) {
    return {
      connected: false,
      baseUrl: resolved.baseUrl,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function listIssues(
  filter: ForgeListFilter = 'active',
  limit = 50
): Promise<ForgeIssue[]> {
  if (filter === 'assigned') {
    const json = await forgeTool('issues.assigned', { limit, includeDone: false })
    return issueArray(json)
  }

  const input: Record<string, unknown> = { limit }
  if (filter === 'done') {
    input.includeDone = true
    input.statusCategories = ['DONE']
  } else if (filter === 'all') {
    input.includeDone = true
  } else {
    // Why: Forge's MCP surface does not expose a "created by me" filter yet.
    // Keep that tab useful by showing the active queue instead of pretending
    // to filter server-side.
    input.statusCategories = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW']
  }

  const json = await forgeTool('issues.list', input)
  return issueArray(json)
}

export async function searchIssues(query: string, limit = 50): Promise<ForgeIssue[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }
  const json = await forgeTool('issues.list', { query: trimmed, limit, includeDone: true })
  return issueArray(json)
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
    const { statusId, labelIds, assignedAgentId, ...patch } = updates
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
    if (labelIds) {
      await forgeTool('issues.setLabels', { id, labelIds })
    }
    if (assignedAgentId !== undefined) {
      await (assignedAgentId === null
        ? forgeTool('issues.release', { id })
        : forgeTool('issues.assign', { id, agentId: assignedAgentId }))
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
    if (input.statusId) {
      payload.statusId = input.statusId
    }
    if (input.priority) {
      payload.priority = input.priority
    }
    if (input.labelIds && input.labelIds.length > 0) {
      payload.labelIds = input.labelIds
    }
    if (input.assignedAgentId) {
      payload.assignedAgentId = input.assignedAgentId
    }

    const json = await forgeTool('issues.create', payload)
    const issue = normalizeIssue(json) ?? normalizeIssue((json as { issue?: unknown })?.issue)
    if (!issue) {
      return { ok: false, error: 'Forge did not return a created issue' }
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
