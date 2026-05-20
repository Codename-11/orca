import { describe, expect, it } from 'vitest'
import type { ForgeIssue } from '../../../shared/types'
import { forgeIssueOpenUrl, forgeIssueReference } from './forge-links'

const issue: ForgeIssue = {
  id: 'iss_1',
  identifier: 'AXI-42',
  title: 'Wire Forge links',
  url: 'https://forge.example/w/axi/issues/iss_1',
  status: { id: 'todo', name: 'Todo', category: 'TODO' },
  priority: 'HIGH',
  project: { id: 'p1', key: 'AXI', name: 'Axiom' },
  labels: [],
  updatedAt: '2026-05-20T00:00:00.000Z'
}

describe('forge-links', () => {
  it('uses server-provided http urls as canonical Open in Forge targets', () => {
    expect(forgeIssueOpenUrl(issue)).toBe('https://forge.example/w/axi/issues/iss_1')
  })

  it('rejects non-web fallbacks for browser opens', () => {
    expect(forgeIssueOpenUrl({ ...issue, url: 'forge:AXI-42' })).toBeNull()
  })

  it('uses the canonical url as the agent reference and falls back to the identifier', () => {
    expect(forgeIssueReference(issue)).toBe('https://forge.example/w/axi/issues/iss_1')
    expect(forgeIssueReference({ ...issue, url: undefined })).toBe('AXI-42')
  })
})
