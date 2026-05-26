import type {
  ForgeIssue,
  ForgeIssuePriority,
  ForgeIssueSort
} from '../../../src/shared/forge-types'

export const DEFAULT_FORGE_SORT: ForgeIssueSort = { key: 'updated', direction: 'desc' }

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
