import { describe, expect, it } from 'vitest'

import { getForgeIssueEmptyState } from './forge-empty-state'
import type { ForgeConnectionStatus } from '../../../../shared/types'

const connected: ForgeConnectionStatus = {
  connected: true,
  baseUrl: 'https://forge.example.test',
  hasToken: true,
  configSource: 'config',
  workspaceName: 'Axiom',
  workspaceSlug: 'axiom'
}

const disconnectedMissingToken: ForgeConnectionStatus = {
  connected: false,
  baseUrl: 'https://forge.example.test',
  hasToken: false,
  configSource: 'none',
  error: 'Missing Forge API token.'
}

describe('getForgeIssueEmptyState', () => {
  it('guides setup when Forge has no configured token', () => {
    expect(
      getForgeIssueEmptyState({
        issueCount: 0,
        loading: false,
        error: null,
        connectionStatus: disconnectedMissingToken,
        searchQuery: '',
        activePresetLabel: 'Active',
        statusCount: 3
      })
    ).toMatchObject({
      kind: 'setup',
      title: 'Connect Forge to manage tasks',
      primaryAction: 'Refresh connection'
    })
  })

  it('prioritizes connection setup over missing board statuses', () => {
    expect(
      getForgeIssueEmptyState({
        issueCount: 0,
        loading: false,
        error: 'Missing Forge API token.',
        connectionStatus: disconnectedMissingToken,
        searchQuery: '',
        activePresetLabel: 'Active',
        statusCount: 0,
        viewMode: 'board'
      })
    ).toMatchObject({
      kind: 'setup',
      title: 'Connect Forge to manage tasks'
    })
  })

  it('prompts issue creation when connected and no issues exist', () => {
    expect(
      getForgeIssueEmptyState({
        issueCount: 0,
        loading: false,
        error: null,
        connectionStatus: connected,
        searchQuery: '',
        activePresetLabel: 'All',
        statusCount: 3
      })
    ).toMatchObject({
      kind: 'create',
      title: 'No Forge issues yet',
      primaryAction: 'New Forge issue'
    })
  })

  it('offers to clear search when the query has no matches', () => {
    expect(
      getForgeIssueEmptyState({
        issueCount: 0,
        loading: false,
        error: null,
        connectionStatus: connected,
        searchQuery: 'oauth token',
        activePresetLabel: 'Active',
        statusCount: 3
      })
    ).toMatchObject({
      kind: 'search',
      title: 'No Forge issues match “oauth token”',
      primaryAction: 'Clear search'
    })
  })

  it('explains missing board statuses separately from empty issues', () => {
    expect(
      getForgeIssueEmptyState({
        issueCount: 0,
        loading: false,
        error: null,
        connectionStatus: connected,
        searchQuery: '',
        activePresetLabel: 'Active',
        statusCount: 0,
        viewMode: 'board'
      })
    ).toMatchObject({
      kind: 'statuses',
      title: 'No Forge statuses available',
      primaryAction: 'Refresh'
    })
  })

  it('does not render an empty state while loading or when issues are visible', () => {
    expect(
      getForgeIssueEmptyState({
        issueCount: 0,
        loading: true,
        error: null,
        connectionStatus: connected,
        searchQuery: '',
        activePresetLabel: 'Active',
        statusCount: 3
      })
    ).toBeNull()
    expect(
      getForgeIssueEmptyState({
        issueCount: 1,
        loading: false,
        error: null,
        connectionStatus: connected,
        searchQuery: '',
        activePresetLabel: 'Active',
        statusCount: 3
      })
    ).toBeNull()
  })
})
