export type ForgeIssueStatusCategory =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'
  | 'CANCELED'

export type ForgeIssuePriority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type ForgeIssueStatus = {
  id: string
  name: string
  category: ForgeIssueStatusCategory
  color?: string
}

export type ForgeProjectSummary = {
  id: string
  key?: string
  name: string
}

export type ForgeWorkspaceSummary = {
  id: string
  name: string
  slug?: string
}

export type ForgeAgentSummary = {
  id: string
  name?: string
  profileKey?: string
}

export type ForgeIssue = {
  id: string
  identifier: string
  title: string
  description?: string
  url?: string
  status: ForgeIssueStatus
  priority: ForgeIssuePriority
  project?: ForgeProjectSummary | null
  assignedAgent?: ForgeAgentSummary | null
  labels?: string[]
  updatedAt: string
  createdAt?: string
  dueDate?: string | null
}

export type ForgeConnectionStatus = {
  connected: boolean
  baseUrl: string | null
  hasToken?: boolean
  configSource?: 'config' | 'env' | 'none'
  workspaceId?: string | null
  workspaceName?: string | null
  workspaceSlug?: string | null
  error?: string
}

export type ForgeListFilter = 'active' | 'assigned' | 'created' | 'all' | 'done'

/** Fields the issue list can be ordered by. `updated` is the product default. */
export type ForgeIssueSortKey = 'updated' | 'created' | 'priority' | 'identifier' | 'title'

export type ForgeSortDirection = 'asc' | 'desc'

export type ForgeIssueSort = {
  key: ForgeIssueSortKey
  direction: ForgeSortDirection
}

/** Why: every Forge view (list, board, mobile) defaults to most-recently
 *  updated first so the freshest work surfaces without the user choosing. */
export const DEFAULT_FORGE_SORT: ForgeIssueSort = { key: 'updated', direction: 'desc' }

export type ForgeIssueListOptions = {
  assignedAgentId?: string | null
  projectId?: string | null
  workspaceId?: string | null
  sort?: ForgeIssueSort
}

export type ForgeIssueUpdate = {
  statusId?: string
  title?: string
  priority?: ForgeIssuePriority
  description?: string | null
  projectId?: string | null
  labelIds?: string[]
  removeLabelIds?: string[]
  assignedAgentId?: string | null
}

export type ForgeIssueCreate = {
  title: string
  description?: string
  projectId?: string | null
  statusId?: string
  priority?: ForgeIssuePriority
  labelIds?: string[]
  assignedAgentId?: string | null
}

export type ForgeLabel = {
  id: string
  name: string
  color?: string
  description?: string
}

export type ForgeComment = {
  id: string
  body: string
  author: ForgeAgentSummary | null
  createdAt: string
  updatedAt?: string
}

export type ForgeMutationResult = { ok: true } | { ok: false; error: string }

export type ForgeIssueCreateResult = { ok: true; issue: ForgeIssue } | { ok: false; error: string }

export type ForgeCommentCreateResult =
  | { ok: true; comment: ForgeComment }
  | { ok: false; error: string }

export type ForgeConfigSettings = {
  baseUrl: string | null
  hasToken: boolean
  source: 'config' | 'env' | 'none'
}

export type ForgeSaveConfigArgs = {
  baseUrl: string
  apiKey?: string | null
}
