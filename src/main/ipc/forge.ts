import { ipcMain } from 'electron'
import type {
  ForgeConfigSettings,
  ForgeIssueCreate,
  ForgeIssueListOptions,
  ForgeIssueUpdate,
  ForgeListFilter,
  ForgeSaveConfigArgs
} from '../../shared/types'
import {
  createComment,
  createIssue,
  getStatus,
  listAssignableAgents,
  listComments,
  listIssues,
  listStatuses,
  searchIssues,
  updateIssue
} from '../forge/issues'
import { listProjects } from '../forge/projects'
import { listLabels } from '../forge/labels'
import { clearForgeConfig, resolveForgeConfig, saveForgeConfig } from '../forge/config'

const VALID_FILTERS = new Set<ForgeListFilter>(['active', 'assigned', 'created', 'all', 'done'])

function normalizeListOptions(args?: { assignedAgentId?: unknown }): ForgeIssueListOptions {
  if (!Object.prototype.hasOwnProperty.call(args ?? {}, 'assignedAgentId')) {
    return {}
  }
  return typeof args?.assignedAgentId === 'string' && args.assignedAgentId.trim()
    ? { assignedAgentId: args.assignedAgentId.trim() }
    : { assignedAgentId: null }
}

function clampLimit(value: unknown, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  return Math.min(Math.max(1, n), 100)
}

function publicConfig(): ForgeConfigSettings {
  const resolved = resolveForgeConfig()
  return {
    baseUrl: resolved.baseUrl,
    hasToken: resolved.hasToken,
    source: resolved.baseUrlSource
  }
}

export function registerForgeHandlers(): void {
  // ── Read ──────────────────────────────────────────────────────────
  ipcMain.handle('forge:status', async () => getStatus())
  ipcMain.handle('forge:getConfig', () => publicConfig())
  ipcMain.handle('forge:listStatuses', async () => listStatuses())
  ipcMain.handle('forge:listProjects', async () => listProjects())
  ipcMain.handle('forge:listLabels', async () => listLabels())
  ipcMain.handle('forge:listAgents', async () => listAssignableAgents())

  ipcMain.handle(
    'forge:listIssues',
    async (
      _event,
      args?: { filter?: ForgeListFilter; limit?: number; assignedAgentId?: string | null }
    ) => {
      const filter = VALID_FILTERS.has(args?.filter as ForgeListFilter)
        ? (args!.filter as ForgeListFilter)
        : 'active'
      return listIssues(filter, clampLimit(args?.limit, 50), normalizeListOptions(args))
    }
  )

  ipcMain.handle(
    'forge:searchIssues',
    async (_event, args: { query: string; limit?: number; assignedAgentId?: string | null }) => {
      if (typeof args?.query !== 'string') {
        return []
      }
      return searchIssues(args.query, clampLimit(args.limit, 50), normalizeListOptions(args))
    }
  )

  ipcMain.handle('forge:listComments', async (_event, args: { issueId: string }) => {
    if (typeof args?.issueId !== 'string' || !args.issueId.trim()) {
      return []
    }
    return listComments(args.issueId.trim())
  })

  // ── Write ─────────────────────────────────────────────────────────
  ipcMain.handle(
    'forge:updateIssue',
    async (_event, args: { id: string; updates: ForgeIssueUpdate }) => {
      if (typeof args?.id !== 'string' || !args.id.trim()) {
        return { ok: false, error: 'Issue ID is required' }
      }
      if (!args.updates || typeof args.updates !== 'object') {
        return { ok: false, error: 'Updates object is required' }
      }
      return updateIssue(args.id.trim(), args.updates)
    }
  )

  ipcMain.handle('forge:createIssue', async (_event, args: { input: ForgeIssueCreate }) => {
    if (!args?.input || typeof args.input !== 'object') {
      return { ok: false, error: 'Issue input is required' }
    }
    return createIssue(args.input)
  })

  ipcMain.handle('forge:createComment', async (_event, args: { issueId: string; body: string }) => {
    if (typeof args?.issueId !== 'string' || !args.issueId.trim()) {
      return { ok: false, error: 'Issue ID is required' }
    }
    if (typeof args?.body !== 'string') {
      return { ok: false, error: 'Comment body is required' }
    }
    return createComment(args.issueId.trim(), args.body)
  })

  // ── Config ────────────────────────────────────────────────────────
  ipcMain.handle('forge:saveConfig', async (_event, args: ForgeSaveConfigArgs) => {
    if (!args || typeof args !== 'object' || typeof args.baseUrl !== 'string') {
      return { ok: false as const, error: 'baseUrl is required' }
    }
    try {
      saveForgeConfig({ baseUrl: args.baseUrl, apiKey: args.apiKey ?? undefined })
      return { ok: true as const, config: publicConfig() }
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  ipcMain.handle('forge:clearConfig', () => {
    clearForgeConfig()
    return { ok: true as const, config: publicConfig() }
  })
}
