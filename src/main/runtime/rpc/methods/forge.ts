import { z } from 'zod'
import { defineMethod, type RpcMethod } from '../core'
import { OptionalFiniteNumber, OptionalString } from '../schemas'
import type { ForgeConfigSettings, ForgeIssueListOptions } from '../../../../shared/types'
import {
  createComment,
  createIssue,
  getStatus,
  listAssignableAgents,
  listComments,
  listIssues,
  listStatuses,
  listWorkspaces,
  searchIssues,
  updateIssue
} from '../../../forge/issues'
import { listProjects } from '../../../forge/projects'
import { listLabels } from '../../../forge/labels'
import { clearForgeConfig, resolveForgeConfig, saveForgeConfig } from '../../../forge/config'

const VALID_FILTERS = ['active', 'assigned', 'created', 'all', 'done'] as const
const PRIORITIES = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

const SortSchema = z
  .object({
    key: z.enum(['updated', 'created', 'priority', 'identifier', 'title']),
    direction: z.enum(['asc', 'desc'])
  })
  .optional()

const NullableString = z.union([z.string(), z.null()]).optional()

const ListIssues = z
  .object({
    filter: z.enum(VALID_FILTERS).optional(),
    limit: OptionalFiniteNumber,
    assignedAgentId: NullableString,
    projectId: NullableString,
    workspaceId: NullableString,
    sort: SortSchema
  })
  .optional()

const SearchIssues = z.object({
  query: z.string(),
  limit: OptionalFiniteNumber,
  assignedAgentId: NullableString,
  projectId: NullableString,
  workspaceId: NullableString,
  sort: SortSchema
})

const CreateIssue = z.object({
  title: z.string(),
  description: OptionalString,
  projectId: NullableString,
  statusId: OptionalString,
  priority: z.enum(PRIORITIES).optional(),
  labelIds: z.array(z.string()).optional(),
  assignedAgentId: NullableString
})

const IssueUpdate = z.object({
  statusId: OptionalString,
  title: OptionalString,
  priority: z.enum(PRIORITIES).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  projectId: NullableString,
  labelIds: z.array(z.string()).optional(),
  removeLabelIds: z.array(z.string()).optional(),
  assignedAgentId: NullableString
})

const UpdateIssue = z.object({ id: z.string(), updates: IssueUpdate })
const ListComments = z.object({ issueId: z.string() })
const CreateComment = z.object({ issueId: z.string(), body: z.string() })
const SaveConfig = z.object({ baseUrl: z.string(), apiKey: z.union([z.string(), z.null()]).optional() })

function normalizeLimit(value: number | undefined): number {
  return Math.min(Math.max(1, Math.floor(value ?? 50)), 100)
}

// Why: only forward `assignedAgentId` when the caller actually sent it —
// presence (even as null, meaning "unassigned") is meaningful to the backend.
function normalizeListOptions(params: {
  assignedAgentId?: string | null
  projectId?: string | null
  workspaceId?: string | null
  sort?: ForgeIssueListOptions['sort']
} | null | undefined): ForgeIssueListOptions {
  const options: ForgeIssueListOptions = {}
  if (Object.prototype.hasOwnProperty.call(params ?? {}, 'assignedAgentId')) {
    options.assignedAgentId = params?.assignedAgentId ?? null
  }
  if (params?.projectId) {
    options.projectId = params.projectId
  }
  if (params?.workspaceId) {
    options.workspaceId = params.workspaceId
  }
  if (params?.sort) {
    options.sort = params.sort
  }
  return options
}

function publicConfig(): ForgeConfigSettings {
  const resolved = resolveForgeConfig()
  return { baseUrl: resolved.baseUrl, hasToken: resolved.hasToken, source: resolved.baseUrlSource }
}

export const FORGE_METHODS: RpcMethod[] = [
  defineMethod({ name: 'forge.status', params: null, handler: async () => getStatus() }),
  defineMethod({ name: 'forge.getConfig', params: null, handler: async () => publicConfig() }),
  defineMethod({
    name: 'forge.listStatuses',
    params: null,
    handler: async () => listStatuses()
  }),
  defineMethod({ name: 'forge.listProjects', params: null, handler: async () => listProjects() }),
  defineMethod({ name: 'forge.listLabels', params: null, handler: async () => listLabels() }),
  defineMethod({
    name: 'forge.listAgents',
    params: null,
    handler: async () => listAssignableAgents()
  }),
  defineMethod({
    name: 'forge.listWorkspaces',
    params: null,
    handler: async () => listWorkspaces()
  }),
  defineMethod({
    name: 'forge.listIssues',
    params: ListIssues,
    handler: async (params) =>
      listIssues(params?.filter ?? 'active', normalizeLimit(params?.limit), normalizeListOptions(params))
  }),
  defineMethod({
    name: 'forge.searchIssues',
    params: SearchIssues,
    handler: async (params) =>
      searchIssues(params.query, normalizeLimit(params.limit), normalizeListOptions(params))
  }),
  defineMethod({
    name: 'forge.listComments',
    params: ListComments,
    handler: async (params) => listComments(params.issueId)
  }),
  defineMethod({
    name: 'forge.createIssue',
    params: CreateIssue,
    handler: async (params) => createIssue(params)
  }),
  defineMethod({
    name: 'forge.updateIssue',
    params: UpdateIssue,
    handler: async (params) => updateIssue(params.id, params.updates)
  }),
  defineMethod({
    name: 'forge.createComment',
    params: CreateComment,
    handler: async (params) => createComment(params.issueId, params.body)
  }),
  defineMethod({
    name: 'forge.saveConfig',
    params: SaveConfig,
    handler: async (params) => {
      try {
        saveForgeConfig({ baseUrl: params.baseUrl, apiKey: params.apiKey ?? undefined })
        return { ok: true as const, config: publicConfig() }
      } catch (error) {
        return { ok: false as const, error: error instanceof Error ? error.message : String(error) }
      }
    }
  }),
  defineMethod({
    name: 'forge.clearConfig',
    params: null,
    handler: async () => {
      clearForgeConfig()
      return { ok: true as const, config: publicConfig() }
    }
  })
]
