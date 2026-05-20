import type { ForgeAgentSummary, ForgeIssueListOptions } from '../../../../shared/types'

export const ALL_FORGE_AGENTS_FILTER = 'all-agents'
export const UNASSIGNED_FORGE_AGENT_FILTER = 'unassigned'

export type ForgeAgentFilterValue =
  | typeof ALL_FORGE_AGENTS_FILTER
  | typeof UNASSIGNED_FORGE_AGENT_FILTER
  | string

export function getForgeAgentFilterOptions(value: ForgeAgentFilterValue): ForgeIssueListOptions {
  if (value === ALL_FORGE_AGENTS_FILTER) {
    return {}
  }
  if (value === UNASSIGNED_FORGE_AGENT_FILTER) {
    return { assignedAgentId: null }
  }
  return { assignedAgentId: value }
}

export function getForgeAgentFilterLabel(
  value: ForgeAgentFilterValue,
  agents: ForgeAgentSummary[]
): string {
  if (value === ALL_FORGE_AGENTS_FILTER) {
    return 'All agents'
  }
  if (value === UNASSIGNED_FORGE_AGENT_FILTER) {
    return 'Unassigned'
  }
  return agents.find((agent) => agent.id === value)?.name ?? 'Unknown agent'
}
