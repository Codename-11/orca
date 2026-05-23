import { z } from 'zod'
import { defineMethod, type RpcMethod } from '../core'
import { OptionalFiniteNumber, OptionalString } from '../schemas'
import { createIssue, getStatus, listIssues, searchIssues } from '../../../forge/issues'

const VALID_FILTERS = ['active', 'assigned', 'created', 'all', 'done'] as const

const ListIssues = z
  .object({
    filter: z.enum(VALID_FILTERS).optional(),
    limit: OptionalFiniteNumber,
    assignedAgentId: z.union([z.string(), z.null()]).optional()
  })
  .optional()

const SearchIssues = z.object({
  query: z.string(),
  limit: OptionalFiniteNumber,
  assignedAgentId: z.union([z.string(), z.null()]).optional()
})

const CreateIssue = z.object({
  title: z.string(),
  description: OptionalString,
  projectId: z.union([z.string(), z.null()]).optional(),
  statusId: OptionalString,
  priority: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  labelIds: z.array(z.string()).optional(),
  assignedAgentId: z.union([z.string(), z.null()]).optional()
})

function normalizeLimit(value: number | undefined): number {
  return Math.min(Math.max(1, Math.floor(value ?? 50)), 100)
}

function normalizeListOptions(params: { assignedAgentId?: string | null } | null | undefined): {
  assignedAgentId?: string | null
} {
  if (!Object.prototype.hasOwnProperty.call(params ?? {}, 'assignedAgentId')) {
    return {}
  }
  return { assignedAgentId: params?.assignedAgentId ?? null }
}

export const FORGE_METHODS: RpcMethod[] = [
  defineMethod({
    name: 'forge.status',
    params: null,
    handler: async () => getStatus()
  }),
  defineMethod({
    name: 'forge.listIssues',
    params: ListIssues,
    handler: async (params) =>
      listIssues(
        params?.filter ?? 'active',
        normalizeLimit(params?.limit),
        normalizeListOptions(params)
      )
  }),
  defineMethod({
    name: 'forge.searchIssues',
    params: SearchIssues,
    handler: async (params) =>
      searchIssues(params.query, normalizeLimit(params.limit), normalizeListOptions(params))
  }),
  defineMethod({
    name: 'forge.createIssue',
    params: CreateIssue,
    handler: async (params) => createIssue(params)
  })
]
