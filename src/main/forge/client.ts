/*
 * Why: Forge transport + DTO normalization in one module. High-level
 * operations live in ./issues.ts, ./projects.ts, ./labels.ts so the API
 * surface can be tested without exposing HTTP internals. Tokens never leave
 * the main process — the config module resolves them from secure storage
 * or environment.
 */
import type {
  ForgeAgentSummary,
  ForgeComment,
  ForgeIssue,
  ForgeIssuePriority,
  ForgeIssueStatus,
  ForgeIssueStatusCategory,
  ForgeLabel,
  ForgeProjectSummary,
  ForgeWorkspaceSummary
} from '../../shared/types'
import { getForgeBaseUrl, getForgeToken } from './config'

const DEFAULT_TIMEOUT_MS = 15_000

function forgeHeaders(): HeadersInit {
  const token = getForgeToken()
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export class ForgeNotConfiguredError extends Error {
  constructor() {
    super('Forge is not configured. Set FORGE_BASE_URL and an API key in settings.')
    this.name = 'ForgeNotConfiguredError'
  }
}

export async function forgeTool(
  tool: string,
  input: Record<string, unknown> = {}
): Promise<unknown> {
  const baseUrl = getForgeBaseUrl()
  if (!baseUrl) {
    throw new ForgeNotConfiguredError()
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
    if (res.status === 204) {
      return null
    }
    const json = await res.json().catch(() => null)
    if (json && typeof json === 'object' && 'data' in json) {
      return (json as { data: unknown }).data
    }
    return json
  } finally {
    clearTimeout(timeout)
  }
}

export function normalizeStatus(value: unknown): ForgeIssueStatus {
  const obj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const category = String(obj.category ?? 'TODO').toUpperCase() as ForgeIssueStatusCategory
  return {
    id: String(obj.id ?? category.toLowerCase()),
    name: String(obj.name ?? obj.title ?? category),
    category,
    color: typeof obj.color === 'string' ? obj.color : undefined
  }
}

export function normalizePriority(value: unknown): ForgeIssuePriority {
  const priority = String(value ?? 'NONE').toUpperCase()
  if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH' || priority === 'URGENT') {
    return priority
  }
  return 'NONE'
}

export function normalizeAgent(value: unknown): ForgeAgentSummary | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const obj = value as Record<string, unknown>
  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id : null
  if (!id) {
    return null
  }
  return {
    id,
    name: typeof obj.name === 'string' ? obj.name : undefined,
    profileKey: typeof obj.profileKey === 'string' ? obj.profileKey : undefined
  }
}

export function normalizeWorkspace(value: unknown): ForgeWorkspaceSummary | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const obj = value as Record<string, unknown>
  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id : null
  if (!id) {
    return null
  }
  return {
    id,
    name: String(obj.name ?? obj.slug ?? id),
    slug: typeof obj.slug === 'string' ? obj.slug : undefined
  }
}

export function normalizeProject(value: unknown): ForgeProjectSummary | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const obj = value as Record<string, unknown>
  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id : null
  if (!id) {
    return null
  }
  return {
    id,
    key: typeof obj.key === 'string' ? obj.key : undefined,
    name: String(obj.name ?? obj.key ?? 'Project')
  }
}

export function issueIdentifier(issue: Record<string, unknown>): string {
  if (typeof issue.identifier === 'string' && issue.identifier.trim()) {
    return issue.identifier.trim()
  }
  const project =
    issue.project && typeof issue.project === 'object'
      ? (issue.project as Record<string, unknown>)
      : null
  const key = typeof project?.key === 'string' && project.key.trim() ? project.key : 'FORGE'
  const number = issue.number ?? issue.sequence ?? issue.issueNumber
  return number !== undefined && number !== null ? `${key}-${number}` : String(issue.id ?? 'FORGE')
}

export function normalizeIssue(value: unknown): ForgeIssue | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const issue = value as Record<string, unknown>
  const id = typeof issue.id === 'string' && issue.id.trim() ? issue.id : null
  const title = typeof issue.title === 'string' && issue.title.trim() ? issue.title : null
  if (!id || !title) {
    return null
  }
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
    project: normalizeProject(issue.project),
    assignedAgent: normalizeAgent(issue.assignedAgent),
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

export function normalizeLabel(value: unknown): ForgeLabel | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const obj = value as Record<string, unknown>
  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id : null
  if (!id) {
    return null
  }
  return {
    id,
    name: String(obj.name ?? id),
    color: typeof obj.color === 'string' ? obj.color : undefined,
    description: typeof obj.description === 'string' ? obj.description : undefined
  }
}

export function normalizeComment(value: unknown): ForgeComment | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const obj = value as Record<string, unknown>
  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id : null
  if (!id) {
    return null
  }
  const body =
    typeof obj.body === 'string' ? obj.body : typeof obj.text === 'string' ? obj.text : ''
  return {
    id,
    body,
    author: normalizeAgent(obj.author),
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined
  }
}

function arrayFrom<T>(json: unknown, keys: string[], mapper: (v: unknown) => T | null): T[] {
  let raw: unknown[] = []
  if (Array.isArray(json)) {
    raw = json
  } else if (json && typeof json === 'object') {
    const obj = json as Record<string, unknown>
    for (const key of keys) {
      const val = obj[key]
      if (Array.isArray(val)) {
        raw = val
        break
      }
    }
  }
  return raw.map(mapper).filter((v): v is T => v !== null)
}

export function issueArray(json: unknown): ForgeIssue[] {
  return arrayFrom(json, ['issues', 'data', 'results'], normalizeIssue)
}

export function statusArray(json: unknown): ForgeIssueStatus[] {
  const raw = Array.isArray(json)
    ? json
    : json && typeof json === 'object'
      ? ((json as Record<string, unknown>).statuses ?? (json as Record<string, unknown>).data ?? [])
      : []
  return Array.isArray(raw) ? raw.map(normalizeStatus) : []
}

export function projectArray(json: unknown): ForgeProjectSummary[] {
  return arrayFrom(json, ['projects', 'data', 'results'], normalizeProject)
}

export function labelArray(json: unknown): ForgeLabel[] {
  return arrayFrom(json, ['labels', 'data', 'results'], normalizeLabel)
}

export function commentArray(json: unknown): ForgeComment[] {
  return arrayFrom(json, ['comments', 'data', 'results'], normalizeComment)
}

export function agentArray(json: unknown): ForgeAgentSummary[] {
  return arrayFrom(json, ['agents', 'members', 'data', 'results'], normalizeAgent)
}

export function workspaceArray(json: unknown): ForgeWorkspaceSummary[] {
  return arrayFrom(json, ['workspaces', 'data', 'results'], normalizeWorkspace)
}
