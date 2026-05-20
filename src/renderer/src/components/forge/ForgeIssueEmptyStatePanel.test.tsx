import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ForgeIssueEmptyStatePanel } from './ForgeIssueEmptyStatePanel'
import type { ForgeIssueEmptyState } from './forge-empty-state'

const setupState: ForgeIssueEmptyState = {
  kind: 'setup',
  title: 'Connect Forge to manage tasks',
  description: 'Forge is configured without a usable API token.',
  primaryAction: 'Refresh connection'
}

const searchState: ForgeIssueEmptyState = {
  kind: 'search',
  title: 'No Forge issues match “token”',
  description: 'Clear the search or try different keywords to broaden the result set.',
  primaryAction: 'Clear search',
  secondaryAction: 'Refresh'
}

describe('ForgeIssueEmptyStatePanel', () => {
  it('renders setup guidance and the primary action', () => {
    const html = renderToStaticMarkup(
      <ForgeIssueEmptyStatePanel state={setupState} onAction={() => undefined} />
    )

    expect(html).toContain('Connect Forge to manage tasks')
    expect(html).toContain('Forge is configured without a usable API token.')
    expect(html).toContain('Refresh connection')
  })

  it('renders search recovery with clear-search and refresh actions', () => {
    const html = renderToStaticMarkup(
      <ForgeIssueEmptyStatePanel state={searchState} onAction={() => undefined} />
    )

    expect(html).toContain('No Forge issues match “token”')
    expect(html).toContain('Clear search')
    expect(html).toContain('Refresh')
  })
})
