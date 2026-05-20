import { describe, expect, it } from 'vitest'

import {
  ALL_FORGE_AGENTS_FILTER,
  UNASSIGNED_FORGE_AGENT_FILTER,
  getForgeAgentFilterLabel,
  getForgeAgentFilterOptions
} from './forge-agent-filter'
import type { ForgeAgentSummary } from '../../../../shared/types'

const agents: ForgeAgentSummary[] = [
  { id: 'agent-victor', name: 'Victor', profileKey: 'victor' },
  { id: 'agent-mizu', name: 'Mizu', profileKey: 'mizu' }
]

describe('forge agent filters', () => {
  it('maps all agents to no server-side agent constraint', () => {
    expect(getForgeAgentFilterOptions(ALL_FORGE_AGENTS_FILTER)).toEqual({})
  })

  it('maps unassigned to assignedAgentId=null', () => {
    expect(getForgeAgentFilterOptions(UNASSIGNED_FORGE_AGENT_FILTER)).toEqual({
      assignedAgentId: null
    })
  })

  it('maps a concrete agent id to assignedAgentId', () => {
    expect(getForgeAgentFilterOptions('agent-victor')).toEqual({
      assignedAgentId: 'agent-victor'
    })
  })

  it('renders stable labels for all, unassigned, known and unknown agents', () => {
    expect(getForgeAgentFilterLabel(ALL_FORGE_AGENTS_FILTER, agents)).toBe('All agents')
    expect(getForgeAgentFilterLabel(UNASSIGNED_FORGE_AGENT_FILTER, agents)).toBe('Unassigned')
    expect(getForgeAgentFilterLabel('agent-victor', agents)).toBe('Victor')
    expect(getForgeAgentFilterLabel('agent-unknown', agents)).toBe('Unknown agent')
  })
})
