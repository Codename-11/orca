/*
 * Why: Forge's MCP surface does not guarantee a stable order, and the list,
 * board, and mobile views must agree on ordering. This module is the single
 * source of truth so every surface sorts identically and defaults to the
 * freshest work (most-recently updated) without the user choosing.
 */
import {
  DEFAULT_FORGE_SORT,
  type ForgeIssue,
  type ForgeIssuePriority,
  type ForgeIssueSort
} from './forge-types'

/** Higher rank sorts first under a descending priority sort. */
const PRIORITY_RANK: Record<ForgeIssuePriority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  NONE: 0
}

function timeValue(value: string | undefined | null): number {
  if (!value) {
    return 0
  }
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function compareByKey(a: ForgeIssue, b: ForgeIssue, key: ForgeIssueSort['key']): number {
  switch (key) {
    case 'created':
      return timeValue(a.createdAt) - timeValue(b.createdAt)
    case 'priority':
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    case 'identifier':
      return a.identifier.localeCompare(b.identifier, undefined, { numeric: true })
    case 'title':
      return a.title.localeCompare(b.title)
    case 'updated':
    default:
      return timeValue(a.updatedAt) - timeValue(b.updatedAt)
  }
}

/**
 * Returns a new array sorted by the requested key/direction. Ties break by
 * most-recent update then id so the order is fully deterministic — important
 * because both the renderer cache and the board grouping reuse this.
 */
export function sortForgeIssues(
  issues: readonly ForgeIssue[],
  sort: ForgeIssueSort = DEFAULT_FORGE_SORT
): ForgeIssue[] {
  const direction = sort.direction === 'asc' ? 1 : -1
  return [...issues].sort((a, b) => {
    const primary = compareByKey(a, b, sort.key)
    if (primary !== 0) {
      return primary * direction
    }
    const updatedTie = timeValue(b.updatedAt) - timeValue(a.updatedAt)
    if (updatedTie !== 0) {
      return updatedTie
    }
    return a.id.localeCompare(b.id)
  })
}
