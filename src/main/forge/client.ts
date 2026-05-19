import type {
  ForgeConnectionStatus,
  ForgeIssue,
  ForgeIssuePriority,
  ForgeIssueStatus,
  ForgeIssueStatusCategory,
  ForgeIssueUpdate,
  ForgeListFilter,
  ForgeMutationResult
} from '../../shared/types'

const DEFAULT_TIMEOUT_MS = 15_000

function envString(name: string): string | null {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getForgeBaseUrl(): string | null {
  const raw =
    envString('ORCA_FORGE_API_URL') ?? envString('FORGE_API_URL') ?? envString('FORGE_BASE_URL')
  return raw ? raw.replace(/\/+$/, '') : null
}

function getForgeToken(): string | null {
  return (
    envString('ORCA_FORGE_API_TOKEN') ?? envString('FORGE_API_TOKEN') ?? envString('FORGE_TOKEN')
  )
}

function forgeHeaders(): HeadersInit {
  const token = getForgeToken()
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

function normalizeStatus(value: unknown): ForgeIssueStatus {
  const obj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const category = String(obj.category ?? 'TODO').toUpperCase() as ForgeIssueStatusCategory
  return {
    id: String(obj.id ?? category.toLowerCase()),
    name: String(obj.name ?? obj.title ?? category),
    category,
    color: typeof obj.color === 'string' ? obj.color : undefined
  }
}

function normalizePriority(value: unknown): ForgeIssuePriority {
  const priority = String(value ?? 'NONE').toUpperCase()
  if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH' || priority === 'URGENT') {
    return priority
  }
  return 'NONE'
}

function issueIdentifier(issue: Record<string, unknown>): string {
  if (typeof issue.identifier === 'string' && issue.identifier.trim()) {
    return issue.identifier
  }
  const project =
    issue.project && typeof issue.project === 'object'
      ? (issue.project as Record<string, unknown>)
      : null
  const key = typeof project?.key === 'string' && project.key.trim() ? project.key : 'FORGE'
  const number = issue.number ?? issue.sequence ?? issue.issueNumber
  return number !== undefined && number !== null ? `${key}-${number}` : String(issue.id ?? 'FORGE')
}

function normalizeIssue(value: unknown): ForgeIssue | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const issue = value as Record<string, unknown>
  const id = typeof issue.id === 'string' && issue.id.trim() ? issue.id : null
  const title = typeof issue.title === 'string' && issue.title.trim() ? issue.title : null
  if (!id || !title) {
    return null
  }
  const project =
    issue.project && typeof issue.project === 'object'
      ? (issue.project as Record<string, unknown>)
      : null
  const assignedAgent =
    issue.assignedAgent && typeof issue.assignedAgent === 'object'
      ? (issue.assignedAgent as Record<string, unknown>)
      : null
  return {
    id,
    identifier: issueIdentifier(issue),
    title,
    description: typeof issue.description === 'string' ? issue.description : undefined,
    url:
      typeof issue.url === 'string'
        ? issue.url
        : typeof issue.webUrl === 'string'
          ? issue.webUrl
          : undefined,
    status: normalizeStatus(issue.status),
    priority: normalizePriority(issue.priority),
    project: project
      ? {
          id: String(project.id ?? ''),
          key: typeof project.key === 'string' ? project.key : undefined,
          name: String(project.name ?? project.key ?? 'Project')
        }
      : null,
    assignedAgent: assignedAgent
      ? {
          id: String(assignedAgent.id ?? ''),
          name: typeof assignedAgent.name === 'string' ? assignedAgent.name : undefined,
          profileKey:
            typeof assignedAgent.profileKey === 'string' ? assignedAgent.profileKey : undefined
        }
      : null,
    labels: Array.isArray(issue.labels)
      ? issue.labels.map((label) =>
          String(
            typeof label === 'object' && label
              ? ((label as { name?: unknown }).name ?? label)
              : label
          )
        )
      : [],
    updatedAt: typeof issue.updatedAt === 'string' ? issue.updatedAt : new Date().toISOString(),
    createdAt: typeof issue.createdAt === 'string' ? issue.createdAt : undefined,
    dueDate: typeof issue.dueDate === 'string' ? issue.dueDate : null
  }
}

async function forgeTool(tool: string, input: Record<string, unknown> = {}): Promise<unknown> {
  const baseUrl = getForgeBaseUrl()
  if (!baseUrl) {
    throw new Error('Forge is not configured. Set ORCA_FORGE_API_URL and ORCA_FORGE_API_TOKEN.')
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
  try {
    const res = await fetch(`${baseUrl}/api/mcp/${encodeURIComponent(tool)}`, {
      method: 'POST',
      headers: forgeHeaders(),
      body: JSON.stringify(input),
      signal: controller.signal
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Forge ${tool} request failed ${res.status}: ${body.slice(0, 200)}`)
    }
    const json = await res.json()
    if (json && typeof json === 'object' && 'data' in json) {
      return (json as { data: unknown }).data
    }
    return json
  } finally {
    clearTimeout(timeout)
  }
}

function issueArray(json: unknown): ForgeIssue[] {
  const raw = Array.isArray(json)
    ? json
    : json && typeof json === 'object' && Array.isArray((json as { issues?: unknown[] }).issues)
      ? (json as { issues: unknown[] }).issues
      : json && typeof json === 'object' && Array.isArray((json as { data?: unknown[] }).data)
        ? (json as { data: unknown[] }).data
        : []
  return raw.map(normalizeIssue).filter((issue): issue is ForgeIssue => issue !== null)
}

function statusArray(json: unknown): ForgeIssueStatus[] {
  const raw = Array.isArray(json)
    ? json
    : json && typeof json === 'object' && Array.isArray((json as { statuses?: unknown[] }).statuses)
      ? (json as { statuses: unknown[] }).statuses
      : json && typeof json === 'object' && Array.isArray((json as { data?: unknown[] }).data)
        ? (json as { data: unknown[] }).data
        : []
  return raw.map(normalizeStatus)
}

export async function getStatus(): Promise<ForgeConnectionStatus> {
  const baseUrl = getForgeBaseUrl()
  if (!baseUrl) {
    return { connected: false, baseUrl: null, error: 'Forge API URL is not configured' }
  }
  try {
    const json = await forgeTool('workspace.get')
    const workspace = json && typeof json === 'object' ? (json as Record<string, unknown>) : {}
    return {
      connected: true,
      baseUrl,
      workspaceName: typeof workspace.name === 'string' ? workspace.name : null
    }
  } catch (error) {
    return {
      connected: false,
      baseUrl,
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
    // Forge's MCP surface does not expose a "created by me" filter yet. Keep
    // that tab useful by showing the active queue instead of calling a fake API.
    input.statusCategories = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW']
  }

  const json = await forgeTool('issues.list', input)
  return issueArray(json)
}

export async function searchIssues(query: string, limit = 50): Promise<ForgeIssue[]> {
  const json = await forgeTool('issues.list', { query, limit, includeDone: true })
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
    const { statusId, ...patch } = updates
    if (Object.keys(patch).length > 0) {
      await forgeTool('issues.update', { id, ...patch })
    }
    if (statusId) {
      await forgeTool('issues.transition', { id, statusId })
    }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}
