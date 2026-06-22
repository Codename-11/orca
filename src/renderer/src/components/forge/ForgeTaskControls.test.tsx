import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type {
  ForgeAgentSummary,
  ForgeConnectionStatus,
  ForgeProjectSummary,
  ForgeWorkspaceSummary
} from '../../../../shared/types'
import { DEFAULT_FORGE_SORT } from '../../../../shared/forge-types'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ForgeTaskControls, FORGE_PRESETS, FORGE_SORT_OPTIONS } from './ForgeTaskControls'

const workspaces: ForgeWorkspaceSummary[] = [
  { id: 'workspace-1', name: 'Axiom', slug: 'axiom' },
  { id: 'workspace-2', name: 'Hermes', slug: 'hermes' }
]

const agents: ForgeAgentSummary[] = [{ id: 'agent-1', name: 'Victor', profileKey: 'victor' }]

const projects: ForgeProjectSummary[] = [{ id: 'project-1', key: 'AXI', name: 'Axiom UI' }]

const connectionStatus: ForgeConnectionStatus = {
  connected: true,
  baseUrl: 'https://forge.example',
  hasToken: true,
  configSource: 'env',
  workspaceName: 'Axiom',
  workspaceSlug: 'axiom'
}

describe('ForgeTaskControls', () => {
  it('keeps Forge task filter and sort option metadata fork-owned', () => {
    expect(FORGE_PRESETS.map((preset) => preset.id)).toEqual([
      'active',
      'assigned',
      'created',
      'all',
      'done'
    ])
    expect(FORGE_SORT_OPTIONS.map((option) => option.id)).toEqual([
      'updated',
      'created',
      'priority',
      'identifier',
      'title'
    ])
  })

  it('renders the Forge-owned controls seam with connection context and primary actions', () => {
    const markup = renderToStaticMarkup(
      <TooltipProvider>
        <ForgeTaskControls
          workspaces={workspaces}
          selectedWorkspaceId="workspace-1"
          onWorkspaceChange={vi.fn()}
          searchInput="token"
          activePreset="active"
          activeAgentFilter="all-agents"
          activeProjectFilter={null}
          activeSort={DEFAULT_FORGE_SORT}
          agents={agents}
          projects={projects}
          connectionStatus={connectionStatus}
          loading={false}
          viewMode="board"
          onSearchInputChange={vi.fn()}
          onSearchSubmit={vi.fn()}
          onSearchClear={vi.fn()}
          onPresetChange={vi.fn()}
          onNewIssue={vi.fn()}
          onViewModeChange={vi.fn()}
          onRefresh={vi.fn()}
          onAgentFilterChange={vi.fn()}
          onProjectFilterChange={vi.fn()}
          onSortChange={vi.fn()}
        />
      </TooltipProvider>
    )

    expect(markup).toContain('New Forge issue')
    expect(markup).toContain('Refresh Forge issues')
    expect(markup).toContain('Search Forge issues...')
    expect(markup).toContain('Connected')
    expect(markup).toContain('https://forge.example')
    expect(markup).toContain('environment token')
    expect(markup).toContain('aria-label="Board view"')
  })
})
