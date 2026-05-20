import type { ForgeConnectionStatus } from '../../../../shared/types'

export type ForgeIssueEmptyStateKind = 'setup' | 'create' | 'filter' | 'search' | 'statuses'

export type ForgeIssueEmptyState = {
  kind: ForgeIssueEmptyStateKind
  title: string
  description: string
  primaryAction: 'New Forge issue' | 'Clear search' | 'Refresh' | 'Refresh connection'
  secondaryAction?: 'Refresh'
}

type GetForgeIssueEmptyStateArgs = {
  issueCount: number
  loading: boolean
  error: string | null
  connectionStatus: ForgeConnectionStatus | null
  searchQuery: string
  activePresetLabel: string
  statusCount: number
  viewMode?: 'list' | 'board'
}

export function getForgeIssueEmptyState({
  issueCount,
  loading,
  error,
  connectionStatus,
  searchQuery,
  activePresetLabel,
  statusCount,
  viewMode = 'list'
}: GetForgeIssueEmptyStateArgs): ForgeIssueEmptyState | null {
  if (loading || issueCount > 0) {
    return null
  }

  const trimmedSearch = searchQuery.trim()

  if (!connectionStatus?.connected) {
    const missingToken = connectionStatus?.hasToken === false
    return {
      kind: 'setup',
      title: 'Connect Forge to manage tasks',
      description: missingToken
        ? 'Forge is configured without a usable API token. Add a token in settings, then refresh this source.'
        : (connectionStatus?.error ??
          'Orca could not reach Forge. Check the base URL and saved credentials, then refresh this source.'),
      primaryAction: 'Refresh connection'
    }
  }

  if (viewMode === 'board' && statusCount === 0) {
    return {
      kind: 'statuses',
      title: 'No Forge statuses available',
      description: 'Orca connected to Forge, but could not load status columns for the board.',
      primaryAction: 'Refresh'
    }
  }

  if (error) {
    return null
  }

  if (trimmedSearch) {
    return {
      kind: 'search',
      title: `No Forge issues match “${trimmedSearch}”`,
      description: 'Clear the search or try different keywords to broaden the result set.',
      primaryAction: 'Clear search',
      secondaryAction: 'Refresh'
    }
  }

  if (activePresetLabel !== 'All') {
    return {
      kind: 'filter',
      title: `No ${activePresetLabel.toLowerCase()} Forge issues`,
      description: 'Try the All view, refresh Forge, or create a new issue for this workspace.',
      primaryAction: 'New Forge issue',
      secondaryAction: 'Refresh'
    }
  }

  return {
    kind: 'create',
    title: 'No Forge issues yet',
    description: 'Create the first Forge issue from Orca, then use it to start a workspace.',
    primaryAction: 'New Forge issue',
    secondaryAction: 'Refresh'
  }
}
