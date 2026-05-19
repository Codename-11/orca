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
  workspaceName?: string | null
  error?: string
}

export type ForgeListFilter = 'active' | 'assigned' | 'created' | 'all' | 'done'

export type ForgeIssueUpdate = {
  statusId?: string
  title?: string
  priority?: ForgeIssuePriority
  description?: string | null
  projectId?: string | null
  labelIds?: string[]
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
