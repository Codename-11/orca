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
}

export type ForgeMutationResult = { ok: true } | { ok: false; error: string }
