/*
 * Why: cover the transport + DTO normalization that powers every higher-level
 * Forge operation. issues.test.ts then exercises the operations on top with a
 * mocked transport. Keeping these split prevents a single brittle fixture
 * from masking a regression in either layer.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: () => false,
    encryptString: (value: string) => Buffer.from(value),
    decryptString: (value: Buffer) => value.toString('utf-8')
  }
}))

// Why: resolve config from env only (mirroring the real trailing-slash trim)
// so a developer's actual ~/.orca/forge-config.json can't outrank the env the
// transport tests set — disk config otherwise breaks the "not configured" and
// exact-URL assertions.
vi.mock('./config', () => {
  const baseUrl = () => {
    const raw = process.env.FORGE_BASE_URL?.trim()
    return raw ? raw.replace(/\/+$/, '') : null
  }
  return {
    getForgeBaseUrl: baseUrl,
    getForgeToken: () => process.env.FORGE_API_TOKEN?.trim() || null,
    resolveForgeConfig: () => {
      const url = baseUrl()
      return {
        baseUrl: url,
        hasToken: Boolean(process.env.FORGE_API_TOKEN),
        baseUrlSource: url ? ('env' as const) : ('none' as const)
      }
    }
  }
})

import {
  agentArray,
  commentArray,
  issueArray,
  issueIdentifier,
  labelArray,
  normalizeComment,
  normalizeIssue,
  normalizeLabel,
  normalizePriority,
  normalizeStatus,
  projectArray,
  statusArray
} from './client'

const ORIGINAL_FETCH = globalThis.fetch

beforeEach(() => {
  process.env.FORGE_BASE_URL = ''
  process.env.FORGE_API_TOKEN = ''
  process.env.ORCA_FORGE_API_URL = ''
  process.env.ORCA_FORGE_API_TOKEN = ''
  process.env.FORGE_API_URL = ''
  process.env.FORGE_TOKEN = ''
})

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH
  vi.restoreAllMocks()
})

describe('normalizeStatus', () => {
  it('coerces missing category to TODO', () => {
    expect(normalizeStatus({})).toEqual({
      id: 'todo',
      name: 'TODO',
      category: 'TODO',
      color: undefined
    })
  })

  it('preserves color and uppercases the category', () => {
    expect(
      normalizeStatus({ id: 's1', name: 'In review', category: 'in_review', color: '#abc' })
    ).toEqual({
      id: 's1',
      name: 'In review',
      category: 'IN_REVIEW',
      color: '#abc'
    })
  })
})

describe('normalizePriority', () => {
  it.each(['LOW', 'medium', 'High', 'urgent'])('accepts canonical priority value %s', (input) => {
    expect(normalizePriority(input)).toBe(input.toUpperCase())
  })

  it('falls back to NONE for unknown values', () => {
    expect(normalizePriority('blocker')).toBe('NONE')
    expect(normalizePriority(null)).toBe('NONE')
  })
})

describe('issueIdentifier', () => {
  it('prefers the server-provided identifier when present', () => {
    expect(issueIdentifier({ identifier: 'AXI-7' })).toBe('AXI-7')
  })

  it('builds an identifier from project key + number when available', () => {
    expect(issueIdentifier({ project: { key: 'AXI' }, number: 42 })).toBe('AXI-42')
  })

  it('falls back to the bare id when no project key or number is available', () => {
    expect(issueIdentifier({ id: 'abc-123' })).toBe('abc-123')
  })

  it('uses the FORGE default key when only a number is present', () => {
    expect(issueIdentifier({ number: 9 })).toBe('FORGE-9')
  })
})

describe('normalizeIssue', () => {
  it('returns null for objects missing id or title', () => {
    expect(normalizeIssue({ id: '1' })).toBeNull()
    expect(normalizeIssue({ title: 'no id' })).toBeNull()
    expect(normalizeIssue(null)).toBeNull()
  })

  it('normalizes a full issue with project and labels', () => {
    const issue = normalizeIssue({
      id: 'iss_1',
      title: 'Wire Forge tab',
      identifier: 'AXI-12',
      url: 'https://forge.example/issue/AXI-12',
      status: { id: 'progress', name: 'In Progress', category: 'in_progress' },
      priority: 'high',
      project: { id: 'p1', key: 'AXI', name: 'Axiom Labs' },
      assignedAgent: { id: 'a1', name: 'Mizu', profileKey: 'mizu' },
      labels: [{ name: 'frontend' }, 'release-block'],
      updatedAt: '2026-05-19T11:00:00Z'
    })
    expect(issue).toEqual({
      id: 'iss_1',
      identifier: 'AXI-12',
      title: 'Wire Forge tab',
      description: undefined,
      url: 'https://forge.example/issue/AXI-12',
      status: { id: 'progress', name: 'In Progress', category: 'IN_PROGRESS', color: undefined },
      priority: 'HIGH',
      project: { id: 'p1', key: 'AXI', name: 'Axiom Labs' },
      assignedAgent: { id: 'a1', name: 'Mizu', profileKey: 'mizu' },
      labels: ['frontend', 'release-block'],
      updatedAt: '2026-05-19T11:00:00Z',
      createdAt: undefined,
      dueDate: null
    })
  })

  it('synthesizes identifier when only a number + project key are given', () => {
    expect(
      normalizeIssue({
        id: 'iss_2',
        title: 'Pending',
        number: 5,
        project: { id: 'p1', key: 'AXI' }
      })?.identifier
    ).toBe('AXI-5')
  })

  it('accepts webUrl as a fallback for url', () => {
    expect(
      normalizeIssue({ id: '3', title: 't', webUrl: 'https://forge.example/issue/3' })?.url
    ).toBe('https://forge.example/issue/3')
  })
})

describe('normalizeLabel and normalizeComment', () => {
  it('drops labels without an id', () => {
    expect(normalizeLabel({ name: 'no id' })).toBeNull()
  })

  it('keeps label metadata', () => {
    expect(normalizeLabel({ id: 'l1', name: 'bug', color: '#f00', description: 'crash' })).toEqual({
      id: 'l1',
      name: 'bug',
      color: '#f00',
      description: 'crash'
    })
  })

  it('drops comments without an id', () => {
    expect(normalizeComment({ body: 'hi' })).toBeNull()
  })

  it('accepts text as a body fallback', () => {
    const comment = normalizeComment({ id: 'c1', text: 'Hello', createdAt: '2026-01-01T00:00:00Z' })
    expect(comment?.body).toBe('Hello')
    expect(comment?.createdAt).toBe('2026-01-01T00:00:00Z')
  })
})

describe('array extractors', () => {
  it('issueArray handles direct array, {issues}, {data} and {results} shapes', () => {
    const issue = { id: 'a', title: 'T' }
    expect(issueArray([issue])).toHaveLength(1)
    expect(issueArray({ issues: [issue] })).toHaveLength(1)
    expect(issueArray({ data: [issue] })).toHaveLength(1)
    expect(issueArray({ results: [issue] })).toHaveLength(1)
    expect(issueArray('not an array')).toEqual([])
  })

  it('issueArray filters out invalid entries', () => {
    expect(issueArray([{ id: 'a', title: 'T' }, { id: 'b' }, null])).toHaveLength(1)
  })

  it('statusArray returns canonicalized entries', () => {
    expect(statusArray([{ id: 's', name: 'Done', category: 'done' }])).toEqual([
      { id: 's', name: 'Done', category: 'DONE', color: undefined }
    ])
  })

  it('projectArray, labelArray, commentArray, agentArray accept both bare and wrapped shapes', () => {
    expect(projectArray({ projects: [{ id: 'p', name: 'P' }] })).toHaveLength(1)
    expect(labelArray({ labels: [{ id: 'l', name: 'L' }] })).toHaveLength(1)
    expect(commentArray({ comments: [{ id: 'c', body: 'B' }] })).toHaveLength(1)
    expect(agentArray({ agents: [{ id: 'a' }] })).toHaveLength(1)
    expect(agentArray({ members: [{ id: 'm' }] })).toHaveLength(1)
  })
})

describe('forgeTool transport', () => {
  it('throws ForgeNotConfiguredError when base URL is missing', async () => {
    const { forgeTool, ForgeNotConfiguredError } = await import('./client')
    await expect(forgeTool('issues.list')).rejects.toBeInstanceOf(ForgeNotConfiguredError)
  })

  it('POSTs to /api/mcp/<tool> with bearer token from env and unwraps {data}', async () => {
    process.env.FORGE_BASE_URL = 'https://forge.example/'
    process.env.FORGE_API_TOKEN = 'tok-123'

    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => '',
      json: async () => ({ data: { issues: [{ id: 'i', title: 'T' }] } })
    }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const { forgeTool } = await import('./client')
    const result = await forgeTool('issues.list', { limit: 5 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://forge.example/api/mcp/issues.list')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ limit: 5 }))
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer tok-123')
    expect(headers['Content-Type']).toBe('application/json')
    expect(result).toEqual({ issues: [{ id: 'i', title: 'T' }] })
  })

  it('surfaces a useful error when the server returns non-2xx', async () => {
    process.env.FORGE_BASE_URL = 'https://forge.example'
    process.env.FORGE_API_TOKEN = 'tok-123'
    globalThis.fetch = (async () => ({
      ok: false,
      status: 500,
      text: async () => 'boom',
      json: async () => ({})
    })) as unknown as typeof fetch

    const { forgeTool } = await import('./client')
    await expect(forgeTool('issues.list')).rejects.toThrow(/500/)
  })
})
