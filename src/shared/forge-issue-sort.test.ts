import { describe, expect, it } from 'vitest'
import { sortForgeIssues } from './forge-issue-sort'
import type { ForgeIssue } from './forge-types'

function issue(overrides: Partial<ForgeIssue> & Pick<ForgeIssue, 'id'>): ForgeIssue {
  return {
    id: overrides.id,
    identifier: overrides.identifier ?? `FORGE-${overrides.id}`,
    title: overrides.title ?? `Issue ${overrides.id}`,
    status: overrides.status ?? { id: 'todo', name: 'Todo', category: 'TODO' },
    priority: overrides.priority ?? 'NONE',
    updatedAt: overrides.updatedAt ?? '2024-01-01T00:00:00.000Z',
    createdAt: overrides.createdAt,
    project: overrides.project,
    assignedAgent: overrides.assignedAgent,
    labels: overrides.labels ?? [],
    dueDate: overrides.dueDate ?? null,
    description: overrides.description,
    url: overrides.url
  }
}

describe('sortForgeIssues', () => {
  it('defaults to most-recently updated first', () => {
    const older = issue({ id: 'a', updatedAt: '2024-01-01T00:00:00.000Z' })
    const newer = issue({ id: 'b', updatedAt: '2024-03-01T00:00:00.000Z' })
    expect(sortForgeIssues([older, newer]).map((i) => i.id)).toEqual(['b', 'a'])
  })

  it('does not mutate the input array', () => {
    const input = [issue({ id: 'a', updatedAt: '2024-01-01T00:00:00.000Z' })]
    const snapshot = [...input]
    sortForgeIssues(input, { key: 'updated', direction: 'asc' })
    expect(input).toEqual(snapshot)
  })

  it('orders by priority descending (urgent first)', () => {
    const low = issue({ id: 'a', priority: 'LOW' })
    const urgent = issue({ id: 'b', priority: 'URGENT' })
    const none = issue({ id: 'c', priority: 'NONE' })
    expect(sortForgeIssues([low, urgent, none], { key: 'priority', direction: 'desc' }).map((i) => i.id)).toEqual([
      'b',
      'a',
      'c'
    ])
  })

  it('orders identifiers numerically, not lexically', () => {
    const two = issue({ id: 'a', identifier: 'FORGE-2' })
    const ten = issue({ id: 'b', identifier: 'FORGE-10' })
    expect(
      sortForgeIssues([ten, two], { key: 'identifier', direction: 'asc' }).map((i) => i.identifier)
    ).toEqual(['FORGE-2', 'FORGE-10'])
  })

  it('breaks ties deterministically by recency then id', () => {
    const a = issue({ id: 'a', priority: 'HIGH', updatedAt: '2024-01-01T00:00:00.000Z' })
    const b = issue({ id: 'b', priority: 'HIGH', updatedAt: '2024-05-01T00:00:00.000Z' })
    expect(sortForgeIssues([a, b], { key: 'priority', direction: 'desc' }).map((i) => i.id)).toEqual([
      'b',
      'a'
    ])
  })

  it('treats missing timestamps as oldest', () => {
    const withDate = issue({ id: 'a', createdAt: '2024-01-01T00:00:00.000Z' })
    const noDate = issue({ id: 'b', createdAt: undefined })
    expect(sortForgeIssues([noDate, withDate], { key: 'created', direction: 'desc' }).map((i) => i.id)).toEqual([
      'a',
      'b'
    ])
  })
})
