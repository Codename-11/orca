import type { ForgeIssue } from '../../../shared/types'

export function forgeIssueOpenUrl(issue: Pick<ForgeIssue, 'url'>): string | null {
  if (!issue.url) {
    return null
  }
  try {
    const url = new URL(issue.url)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function forgeIssueReference(issue: Pick<ForgeIssue, 'identifier' | 'url'>): string {
  return forgeIssueOpenUrl(issue) ?? issue.identifier
}
