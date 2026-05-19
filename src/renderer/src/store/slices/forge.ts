/* eslint-disable max-lines -- Why: Forge connection, config, issue/statuses/
   projects/labels/agents caches, and mutations form one coherent store
   boundary so cache invalidation after mutations stays consistent across
   surfaces. Mirrors the Linear slice's scope. */
/*
 * Why: Forge state (connection status, issue/statuses/projects/labels caches,
 * inflight dedup) lives in one slice so the TaskPage Forge tab and any other
 * surfaces that consume Forge data stay coherent during mutations and tab
 * switches. Mirrors the shape of the Linear slice without the workspace
 * selection complexity Forge doesn't have.
 */
import type { StateCreator } from 'zustand'
import type { AppState } from '../types'
import type {
  ForgeAgentSummary,
  ForgeComment,
  ForgeCommentCreateResult,
  ForgeConfigSettings,
  ForgeConnectionStatus,
  ForgeIssue,
  ForgeIssueCreate,
  ForgeIssueCreateResult,
  ForgeIssueStatus,
  ForgeIssueUpdate,
  ForgeLabel,
  ForgeListFilter,
  ForgeMutationResult,
  ForgeProjectSummary,
  ForgeSaveConfigArgs
} from '../../../../shared/types'
type ForgeCacheEntry<T> = { data: T; fetchedAt: number }
import {
  forgeClearConfig,
  forgeCreateComment,
  forgeCreateIssue,
  forgeGetConfig,
  forgeListAgents,
  forgeListComments,
  forgeListIssues,
  forgeListLabels,
  forgeListProjects,
  forgeListStatuses,
  forgeSaveConfig,
  forgeSearchIssues,
  forgeStatus,
  forgeUpdateIssue
} from '@/runtime/runtime-forge-client'

const LIST_CACHE_TTL = 60_000
const METADATA_CACHE_TTL = 10 * 60_000

function isFresh<T>(
  entry: ForgeCacheEntry<T> | undefined,
  ttl = LIST_CACHE_TTL
): entry is ForgeCacheEntry<T> {
  return entry !== undefined && Date.now() - entry.fetchedAt < ttl
}

function listKey(filter: ForgeListFilter, limit: number): string {
  return `list::${filter}::${limit}`
}

function searchKey(query: string, limit: number): string {
  return `search::${query}::${limit}`
}

const inflightListRequests = new Map<string, Promise<ForgeIssue[]>>()
const inflightSearchRequests = new Map<string, Promise<ForgeIssue[]>>()
let inflightStatusRequest: Promise<void> | null = null
let inflightStatusesRequest: Promise<ForgeIssueStatus[]> | null = null
let inflightProjectsRequest: Promise<ForgeProjectSummary[]> | null = null
let inflightLabelsRequest: Promise<ForgeLabel[]> | null = null
let inflightAgentsRequest: Promise<ForgeAgentSummary[]> | null = null
let inflightConfigRequest: Promise<ForgeConfigSettings> | null = null

type ForgeFetchOptions = { force?: boolean }

const EMPTY_FORGE_CONFIG: ForgeConfigSettings = {
  baseUrl: null,
  hasToken: false,
  source: 'none'
}

const DISCONNECTED_STATUS: ForgeConnectionStatus = {
  connected: false,
  baseUrl: null,
  error: undefined
}

export type ForgeSlice = {
  forgeStatus: ForgeConnectionStatus
  forgeStatusChecked: boolean
  forgeConfig: ForgeConfigSettings
  forgeConfigChecked: boolean
  forgeIssueListCache: Record<string, ForgeCacheEntry<ForgeIssue[]>>
  forgeIssueSearchCache: Record<string, ForgeCacheEntry<ForgeIssue[]>>
  forgeStatuses: ForgeIssueStatus[] | null
  forgeStatusesFetchedAt: number | null
  forgeProjects: ForgeProjectSummary[] | null
  forgeProjectsFetchedAt: number | null
  forgeLabels: ForgeLabel[] | null
  forgeLabelsFetchedAt: number | null
  forgeAgents: ForgeAgentSummary[] | null
  forgeAgentsFetchedAt: number | null

  refreshForgeConfig: (options?: ForgeFetchOptions) => Promise<ForgeConfigSettings>
  saveForgeConfig: (
    args: ForgeSaveConfigArgs
  ) => Promise<{ ok: true; config: ForgeConfigSettings } | { ok: false; error: string }>
  clearForgeConfig: () => Promise<ForgeConfigSettings>
  checkForgeConnection: (force?: boolean) => Promise<void>
  listForgeIssues: (
    filter?: ForgeListFilter,
    limit?: number,
    options?: ForgeFetchOptions
  ) => Promise<ForgeIssue[]>
  searchForgeIssues: (
    query: string,
    limit?: number,
    options?: ForgeFetchOptions
  ) => Promise<ForgeIssue[]>
  listForgeStatuses: (options?: ForgeFetchOptions) => Promise<ForgeIssueStatus[]>
  listForgeProjects: (options?: ForgeFetchOptions) => Promise<ForgeProjectSummary[]>
  listForgeLabels: (options?: ForgeFetchOptions) => Promise<ForgeLabel[]>
  listForgeAgents: (options?: ForgeFetchOptions) => Promise<ForgeAgentSummary[]>
  listForgeComments: (issueId: string) => Promise<ForgeComment[]>
  createForgeIssue: (input: ForgeIssueCreate) => Promise<ForgeIssueCreateResult>
  updateForgeIssue: (id: string, updates: ForgeIssueUpdate) => Promise<ForgeMutationResult>
  createForgeComment: (issueId: string, body: string) => Promise<ForgeCommentCreateResult>
  patchForgeIssue: (id: string, patch: Partial<ForgeIssue>) => void
  invalidateForgeIssueCaches: () => void
}

function applyPatchToCacheEntry(
  entry: ForgeCacheEntry<ForgeIssue[]> | undefined,
  id: string,
  patch: Partial<ForgeIssue>
): ForgeCacheEntry<ForgeIssue[]> | undefined {
  if (!entry) {
    return entry
  }
  let changed = false
  const next = entry.data.map((issue) => {
    if (issue.id !== id) {
      return issue
    }
    changed = true
    return { ...issue, ...patch }
  })
  return changed ? { data: next, fetchedAt: entry.fetchedAt } : entry
}

export const createForgeSlice: StateCreator<AppState, [], [], ForgeSlice> = (set, get) => ({
  forgeStatus: DISCONNECTED_STATUS,
  forgeStatusChecked: false,
  forgeConfig: EMPTY_FORGE_CONFIG,
  forgeConfigChecked: false,
  forgeIssueListCache: {},
  forgeIssueSearchCache: {},
  forgeStatuses: null,
  forgeStatusesFetchedAt: null,
  forgeProjects: null,
  forgeProjectsFetchedAt: null,
  forgeLabels: null,
  forgeLabelsFetchedAt: null,
  forgeAgents: null,
  forgeAgentsFetchedAt: null,

  refreshForgeConfig: async (options) => {
    if (inflightConfigRequest && !options?.force) {
      return inflightConfigRequest
    }
    inflightConfigRequest = forgeGetConfig(get().settings)
      .then((config) => {
        set({ forgeConfig: config, forgeConfigChecked: true })
        return config
      })
      .catch(() => {
        set({ forgeConfig: EMPTY_FORGE_CONFIG, forgeConfigChecked: true })
        return EMPTY_FORGE_CONFIG
      })
      .finally(() => {
        inflightConfigRequest = null
      })
    return inflightConfigRequest
  },

  saveForgeConfig: async (args) => {
    const result = await forgeSaveConfig(get().settings, args)
    if (result.ok) {
      set({ forgeConfig: result.config, forgeConfigChecked: true })
      // Why: connection state may flip from disconnected to connected once
      // credentials arrive — force a recheck so the UI updates immediately.
      void get().checkForgeConnection(true)
    }
    return result
  },

  clearForgeConfig: async () => {
    const result = await forgeClearConfig(get().settings)
    set({
      forgeConfig: result.config,
      forgeConfigChecked: true,
      forgeStatus: DISCONNECTED_STATUS,
      forgeStatusChecked: true,
      forgeIssueListCache: {},
      forgeIssueSearchCache: {},
      forgeStatuses: null,
      forgeStatusesFetchedAt: null,
      forgeProjects: null,
      forgeProjectsFetchedAt: null,
      forgeLabels: null,
      forgeLabelsFetchedAt: null,
      forgeAgents: null,
      forgeAgentsFetchedAt: null
    })
    inflightListRequests.clear()
    inflightSearchRequests.clear()
    return result.config
  },

  checkForgeConnection: async (force = false) => {
    if (inflightStatusRequest && !force) {
      return inflightStatusRequest
    }
    inflightStatusRequest = forgeStatus(get().settings)
      .then((status) => {
        set({ forgeStatus: status, forgeStatusChecked: true })
      })
      .catch((error) => {
        set({
          forgeStatus: {
            connected: false,
            baseUrl: null,
            error: error instanceof Error ? error.message : String(error)
          },
          forgeStatusChecked: true
        })
      })
      .finally(() => {
        inflightStatusRequest = null
      })
    return inflightStatusRequest
  },

  listForgeIssues: async (filter = 'active', limit = 50, options) => {
    const key = listKey(filter, limit)
    if (!options?.force) {
      const cached = get().forgeIssueListCache[key]
      if (isFresh(cached)) {
        return cached.data
      }
    }
    const existing = inflightListRequests.get(key)
    if (existing && !options?.force) {
      return existing
    }
    const promise = forgeListIssues(get().settings, filter, limit)
      .then((issues) => {
        set((s) => ({
          forgeIssueListCache: {
            ...s.forgeIssueListCache,
            [key]: { data: issues, fetchedAt: Date.now() }
          }
        }))
        return issues
      })
      .finally(() => {
        inflightListRequests.delete(key)
      })
    inflightListRequests.set(key, promise)
    return promise
  },

  searchForgeIssues: async (query, limit = 50, options) => {
    const trimmed = query.trim()
    if (!trimmed) {
      return []
    }
    const key = searchKey(trimmed, limit)
    if (!options?.force) {
      const cached = get().forgeIssueSearchCache[key]
      if (isFresh(cached)) {
        return cached.data
      }
    }
    const existing = inflightSearchRequests.get(key)
    if (existing && !options?.force) {
      return existing
    }
    const promise = forgeSearchIssues(get().settings, trimmed, limit)
      .then((issues) => {
        set((s) => ({
          forgeIssueSearchCache: {
            ...s.forgeIssueSearchCache,
            [key]: { data: issues, fetchedAt: Date.now() }
          }
        }))
        return issues
      })
      .finally(() => {
        inflightSearchRequests.delete(key)
      })
    inflightSearchRequests.set(key, promise)
    return promise
  },

  listForgeStatuses: async (options) => {
    const fetchedAt = get().forgeStatusesFetchedAt
    const cached = get().forgeStatuses
    if (!options?.force && cached && fetchedAt && Date.now() - fetchedAt < METADATA_CACHE_TTL) {
      return cached
    }
    if (inflightStatusesRequest && !options?.force) {
      return inflightStatusesRequest
    }
    inflightStatusesRequest = forgeListStatuses(get().settings)
      .then((statuses) => {
        set({ forgeStatuses: statuses, forgeStatusesFetchedAt: Date.now() })
        return statuses
      })
      .finally(() => {
        inflightStatusesRequest = null
      })
    return inflightStatusesRequest
  },

  listForgeProjects: async (options) => {
    const fetchedAt = get().forgeProjectsFetchedAt
    const cached = get().forgeProjects
    if (!options?.force && cached && fetchedAt && Date.now() - fetchedAt < METADATA_CACHE_TTL) {
      return cached
    }
    if (inflightProjectsRequest && !options?.force) {
      return inflightProjectsRequest
    }
    inflightProjectsRequest = forgeListProjects(get().settings)
      .then((projects) => {
        set({ forgeProjects: projects, forgeProjectsFetchedAt: Date.now() })
        return projects
      })
      .finally(() => {
        inflightProjectsRequest = null
      })
    return inflightProjectsRequest
  },

  listForgeLabels: async (options) => {
    const fetchedAt = get().forgeLabelsFetchedAt
    const cached = get().forgeLabels
    if (!options?.force && cached && fetchedAt && Date.now() - fetchedAt < METADATA_CACHE_TTL) {
      return cached
    }
    if (inflightLabelsRequest && !options?.force) {
      return inflightLabelsRequest
    }
    inflightLabelsRequest = forgeListLabels(get().settings)
      .then((labels) => {
        set({ forgeLabels: labels, forgeLabelsFetchedAt: Date.now() })
        return labels
      })
      .finally(() => {
        inflightLabelsRequest = null
      })
    return inflightLabelsRequest
  },

  listForgeAgents: async (options) => {
    const fetchedAt = get().forgeAgentsFetchedAt
    const cached = get().forgeAgents
    if (!options?.force && cached && fetchedAt && Date.now() - fetchedAt < METADATA_CACHE_TTL) {
      return cached
    }
    if (inflightAgentsRequest && !options?.force) {
      return inflightAgentsRequest
    }
    inflightAgentsRequest = forgeListAgents(get().settings)
      .then((agents) => {
        set({ forgeAgents: agents, forgeAgentsFetchedAt: Date.now() })
        return agents
      })
      .finally(() => {
        inflightAgentsRequest = null
      })
    return inflightAgentsRequest
  },

  listForgeComments: async (issueId) => {
    return forgeListComments(get().settings, issueId)
  },

  createForgeIssue: async (input) => {
    const result = await forgeCreateIssue(get().settings, input)
    if (result.ok) {
      // Why: optimistic invalidate; the new issue lands at refresh-time so
      // both list cache and search cache flush together.
      get().invalidateForgeIssueCaches()
    }
    return result
  },

  updateForgeIssue: async (id, updates) => {
    const result = await forgeUpdateIssue(get().settings, id, updates)
    if (result.ok) {
      get().invalidateForgeIssueCaches()
    }
    return result
  },

  createForgeComment: async (issueId, body) => {
    return forgeCreateComment(get().settings, issueId, body)
  },

  patchForgeIssue: (id, patch) => {
    set((s) => {
      const list: Record<string, ForgeCacheEntry<ForgeIssue[]>> = {}
      let listChanged = false
      for (const [key, entry] of Object.entries(s.forgeIssueListCache)) {
        const next = applyPatchToCacheEntry(entry, id, patch)
        if (next !== entry) {
          listChanged = true
        }
        list[key] = next ?? entry
      }
      const search: Record<string, ForgeCacheEntry<ForgeIssue[]>> = {}
      let searchChanged = false
      for (const [key, entry] of Object.entries(s.forgeIssueSearchCache)) {
        const next = applyPatchToCacheEntry(entry, id, patch)
        if (next !== entry) {
          searchChanged = true
        }
        search[key] = next ?? entry
      }
      if (!listChanged && !searchChanged) {
        return {}
      }
      return {
        forgeIssueListCache: listChanged ? list : s.forgeIssueListCache,
        forgeIssueSearchCache: searchChanged ? search : s.forgeIssueSearchCache
      }
    })
  },

  invalidateForgeIssueCaches: () => {
    inflightListRequests.clear()
    inflightSearchRequests.clear()
    set({ forgeIssueListCache: {}, forgeIssueSearchCache: {} })
  }
})
