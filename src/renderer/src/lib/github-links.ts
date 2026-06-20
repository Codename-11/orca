import {
  buildGitHubRepoUrl,
  parseGitHubIssueOrPRLink,
  parseGitHubIssueOrPRNumber
} from '../../../shared/github-links'
import type { RepoSlug } from '../../../shared/github-links'
import { isWorkItemLinkQueryTooLarge } from './work-item-link-query-bounds'

export { buildGitHubRepoUrl, parseGitHubIssueOrPRLink, parseGitHubIssueOrPRNumber }
export type { RepoSlug }

export type GitHubLinkQuery = {
  query: string
  directNumber: number | null
  tooLarge?: boolean
}

/**
 * Normalizes link-picker input so both raw issue/PR numbers and full GitHub
 * URLs resolve to a usable query + direct-number lookup.
 */
export function normalizeGitHubLinkQuery(raw: string): GitHubLinkQuery {
  if (isWorkItemLinkQueryTooLarge(raw)) {
    return { query: '', directNumber: null, tooLarge: true }
  }
  const trimmed = raw.trim()
  if (!trimmed) {
    return { query: '', directNumber: null }
  }

  const direct = parseGitHubIssueOrPRNumber(trimmed)
  if (direct !== null && !trimmed.startsWith('http')) {
    return { query: trimmed, directNumber: direct }
  }

  const link = parseGitHubIssueOrPRLink(trimmed)
  if (!link) {
    return { query: trimmed, directNumber: null }
  }

  // Why: any GitHub-shaped issue/pull URL is accepted by number regardless of
  // slug, since fork checkouts can legitimately target upstream issues whose
  // slug differs from the origin remote.
  return {
    query: trimmed,
    directNumber: link.number
  }
}
