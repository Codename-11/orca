/* eslint-disable max-lines -- Why: one file per source module (issues.ts) keeps
   the mocked-transport setup shared across every operation's cases; splitting
   would duplicate the fixture and risk the layers drifting apart. */
/*
 * Why: exercise the issue-operation surface (listIssues, searchIssues,
 * updateIssue, createIssue, comments, listWorkspaces) via a mocked transport so
 * the tool names and payload shapes don't drift from Forge's MCP contract.
 */
import type * as Client from './client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: () => false,
    encryptString: (value: string) => Buffer.from(value),
    decryptString: (value: Buffer) => value.toString('utf-8')
  }
}))

// Why: resolve config from env only so the suite is hermetic — a real
// ~/.orca/forge-config.json on a developer machine must not outrank the
// env vars these tests set (disk config otherwise wins and flips results).
vi.mock('./config', () => {
  const resolve = () => {
    const baseUrl = process.env.FORGE_BASE_URL?.trim() || null
    return {
      baseUrl,
      hasToken: Boolean(process.env.FORGE_API_TOKEN),
      baseUrlSource: baseUrl ? ('env' as const) : ('none' as const)
    }
  }
  return {
    resolveForgeConfig: resolve,
    getForgeBaseUrl: () => resolve().baseUrl,
    getForgeToken: () => process.env.FORGE_API_TOKEN ?? null
  }
})

type ToolCall = { tool: string; input: Record<string, unknown> }

function setupTransport(responder: (call: ToolCall) => unknown): ToolCall[] {
  const calls: ToolCall[] = []
  vi.doMock('./client', async () => {
    const actual = await vi.importActual<typeof Client>('./client')
    return {
      ...actual,
      forgeTool: async (tool: string, input: Record<string, unknown> = {}) => {
        const call = { tool, input }
        calls.push(call)
        return responder(call)
      }
    }
  })
  return calls
}

beforeEach(() => {
  vi.resetModules()
  process.env.FORGE_BASE_URL = 'https://forge.example'
  process.env.FORGE_API_TOKEN = 'tok'
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.doUnmock('./client')
})

describe('getStatus', () => {
  it('returns sanitized workspace and auth metadata', async () => {
    const calls = setupTransport(() => ({ name: 'Axiom Forge', slug: 'axiom' }))
    const { getStatus } = await import('./issues')
    const status = await getStatus()
    expect(status).toMatchObject({
      connected: true,
      baseUrl: 'https://forge.example',
      hasToken: true,
      configSource: 'env',
      workspaceName: 'Axiom Forge',
      workspaceSlug: 'axiom'
    })
    expect(calls).toEqual([{ tool: 'workspace.get', input: {} }])
  })

  it('reports configuration state without exposing token values', async () => {
    delete process.env.FORGE_BASE_URL
    delete process.env.FORGE_API_TOKEN
    const calls = setupTransport(() => ({ name: 'unused' }))
    const { getStatus } = await import('./issues')
    const status = await getStatus()
    expect(status).toEqual({
      connected: false,
      baseUrl: null,
      hasToken: false,
      configSource: 'none',
      error: 'Forge API URL is not configured'
    })
    expect(JSON.stringify(status)).not.toContain('tok')
    expect(calls).toHaveLength(0)
  })
})

describe('listIssues', () => {
  it('calls issues.assigned for the assigned filter', async () => {
    const calls = setupTransport(() => ({ issues: [] }))
    const { listIssues } = await import('./issues')
    await listIssues('assigned', 20)
    expect(calls).toHaveLength(1)
    expect(calls[0].tool).toBe('issues.assigned')
    expect(calls[0].input).toMatchObject({ limit: 20, includeDone: false })
  })

  it('calls issues.list with includeDone for the all filter', async () => {
    const calls = setupTransport(() => ({ issues: [] }))
    const { listIssues } = await import('./issues')
    await listIssues('all', 50)
    expect(calls[0].tool).toBe('issues.list')
    expect(calls[0].input).toMatchObject({ limit: 50, includeDone: true })
  })

  it('defaults to ordering by most-recently updated', async () => {
    const calls = setupTransport(() => ({ issues: [] }))
    const { listIssues } = await import('./issues')
    await listIssues('all', 50)
    expect(calls[0].input).toMatchObject({ orderBy: 'updatedAt', order: 'desc' })
  })

  it('forwards an explicit sort and project filter to issues.list', async () => {
    const calls = setupTransport(() => ({ issues: [] }))
    const { listIssues } = await import('./issues')
    await listIssues('active', 30, {
      projectId: 'proj-1',
      sort: { key: 'priority', direction: 'asc' }
    })
    expect(calls[0].input).toMatchObject({
      projectId: 'proj-1',
      orderBy: 'priority',
      order: 'asc'
    })
  })

  it('sends createdByViewer for the created filter', async () => {
    const calls = setupTransport(() => ({ issues: [] }))
    const { listIssues } = await import('./issues')
    await listIssues('created', 50)
    expect(calls[0].tool).toBe('issues.list')
    expect(calls[0].input).toMatchObject({ createdByViewer: true, includeDone: true })
  })

  it('drops issues outside the requested project as a server fallback', async () => {
    setupTransport(() => ({
      issues: [
        { id: 'a', title: 'In project', project: { id: 'proj-1' } },
        { id: 'b', title: 'Other project', project: { id: 'proj-2' } }
      ]
    }))
    const { listIssues } = await import('./issues')
    const result = await listIssues('all', 50, { projectId: 'proj-1' })
    expect(result.map((i) => i.id)).toEqual(['a'])
  })

  it('returns issues sorted most-recently updated first by default', async () => {
    setupTransport(() => ({
      issues: [
        { id: 'old', title: 'Old', updatedAt: '2024-01-01T00:00:00.000Z' },
        { id: 'new', title: 'New', updatedAt: '2024-09-01T00:00:00.000Z' }
      ]
    }))
    const { listIssues } = await import('./issues')
    const result = await listIssues('all', 50)
    expect(result.map((i) => i.id)).toEqual(['new', 'old'])
  })

  it('scopes the active filter to non-done categories', async () => {
    const calls = setupTransport(() => ({ issues: [] }))
    const { listIssues } = await import('./issues')
    await listIssues('active', 10)
    expect(calls[0].tool).toBe('issues.list')
    expect(calls[0].input.statusCategories).toEqual(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW'])
  })

  it('scopes the done filter to DONE only', async () => {
    const calls = setupTransport(() => ({ issues: [] }))
    const { listIssues } = await import('./issues')
    await listIssues('done')
    expect(calls[0].input.statusCategories).toEqual(['DONE'])
    expect(calls[0].input.includeDone).toBe(true)
  })

  it('filters issues by a specific Forge agent through issues.list', async () => {
    const calls = setupTransport(() => ({ issues: [] }))
    const { listIssues } = await import('./issues')
    await listIssues('active', 25, { assignedAgentId: 'agent-victor' })
    expect(calls[0].tool).toBe('issues.list')
    expect(calls[0].input).toMatchObject({
      limit: 25,
      assignedAgentId: 'agent-victor',
      statusCategories: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW']
    })
  })

  it('filters for unassigned Forge issues with assignedAgentId=null', async () => {
    const calls = setupTransport(() => ({ issues: [] }))
    const { listIssues } = await import('./issues')
    await listIssues('all', 25, { assignedAgentId: null })
    expect(calls[0].tool).toBe('issues.list')
    expect(calls[0].input).toMatchObject({ limit: 25, assignedAgentId: null, includeDone: true })
  })
})

describe('searchIssues', () => {
  it('returns empty array for blank queries without hitting the server', async () => {
    const calls = setupTransport(() => ({ issues: [{ id: '1', title: 'T' }] }))
    const { searchIssues } = await import('./issues')
    expect(await searchIssues('   ')).toEqual([])
    expect(calls).toHaveLength(0)
  })

  it('forwards trimmed query, limit, and agent filter options', async () => {
    const calls = setupTransport(() => ({ issues: [{ id: '1', title: 'T' }] }))
    const { searchIssues } = await import('./issues')
    await searchIssues('  forge ', 25, { assignedAgentId: 'agent-victor' })
    expect(calls[0].tool).toBe('issues.list')
    expect(calls[0].input).toMatchObject({
      query: 'forge',
      limit: 25,
      includeDone: true,
      assignedAgentId: 'agent-victor'
    })
  })
})

describe('listWorkspaces', () => {
  it('returns workspaces from workspaces.list when available', async () => {
    setupTransport(() => ({ workspaces: [{ id: 'w1', name: 'One' }, { id: 'w2', name: 'Two' }] }))
    const { listWorkspaces } = await import('./issues')
    const workspaces = await listWorkspaces()
    expect(workspaces.map((w) => w.id)).toEqual(['w1', 'w2'])
  })

  it('falls back to the single connected workspace', async () => {
    const calls = setupTransport((call) => {
      if (call.tool === 'workspaces.list') {
        throw new Error('not supported')
      }
      return { id: 'w-solo', name: 'Solo', slug: 'solo' }
    })
    const { listWorkspaces } = await import('./issues')
    const workspaces = await listWorkspaces()
    expect(workspaces).toEqual([{ id: 'w-solo', name: 'Solo', slug: 'solo' }])
    expect(calls.map((c) => c.tool)).toEqual(['workspaces.list', 'workspace.get'])
  })
})

describe('updateIssue', () => {
  it('splits status transitions from other patches', async () => {
    const calls = setupTransport(() => null)
    const { updateIssue } = await import('./issues')
    const result = await updateIssue('iss_1', { statusId: 's2', title: 'New title' })
    expect(result.ok).toBe(true)
    expect(calls).toHaveLength(2)
    expect(calls[0]).toEqual({ tool: 'issues.update', input: { id: 'iss_1', title: 'New title' } })
    expect(calls[1]).toEqual({ tool: 'issues.transition', input: { id: 'iss_1', statusId: 's2' } })
  })

  it('uses issues.setLabels with add and remove label deltas', async () => {
    const calls = setupTransport(() => null)
    const { updateIssue } = await import('./issues')
    await updateIssue('iss_1', { labelIds: ['label-add'], removeLabelIds: ['label-remove'] })
    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual({
      tool: 'issues.setLabels',
      input: { issueId: 'iss_1', add: ['label-add'], remove: ['label-remove'] }
    })
  })

  it('uses issues.assign with agentId=null when assignedAgentId is null', async () => {
    const calls = setupTransport(() => null)
    const { updateIssue } = await import('./issues')
    await updateIssue('iss_1', { assignedAgentId: null })
    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual({ tool: 'issues.assign', input: { issueId: 'iss_1', agentId: null } })
  })

  it('uses issues.assign when assignedAgentId is a value', async () => {
    const calls = setupTransport(() => null)
    const { updateIssue } = await import('./issues')
    await updateIssue('iss_1', { assignedAgentId: 'agent-a' })
    expect(calls[0]).toEqual({
      tool: 'issues.assign',
      input: { issueId: 'iss_1', agentId: 'agent-a' }
    })
  })

  it('returns ok:false with the error message when a tool throws', async () => {
    setupTransport(() => {
      throw new Error('Forge issues.update request failed 400: bad shape')
    })
    const { updateIssue } = await import('./issues')
    const result = await updateIssue('iss_1', { title: 'X' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/400/)
    }
  })
})

describe('createIssue', () => {
  it('rejects empty titles without hitting the server', async () => {
    const calls = setupTransport(() => null)
    const { createIssue } = await import('./issues')
    const result = await createIssue({ title: '   ' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/title/i)
    }
    expect(calls).toHaveLength(0)
  })

  it('returns the normalized issue on success', async () => {
    const calls = setupTransport(() => ({
      id: 'iss_new',
      title: 'Brand new',
      project: { id: 'p1', key: 'AXI' },
      number: 99,
      status: { id: 's', name: 'Todo', category: 'todo' }
    }))
    const { createIssue } = await import('./issues')
    const result = await createIssue({
      title: 'Brand new',
      projectId: 'p1',
      priority: 'HIGH',
      labelIds: ['l1']
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.issue.identifier).toBe('AXI-99')
      expect(result.issue.title).toBe('Brand new')
    }
    expect(calls[0].input).toMatchObject({
      title: 'Brand new',
      projectId: 'p1',
      priority: 'HIGH'
    })
    expect(calls[1]).toEqual({
      tool: 'issues.setLabels',
      input: { issueId: 'iss_new', add: ['l1'] }
    })
  })
})

describe('comments', () => {
  it('listComments forwards the issueId', async () => {
    const calls = setupTransport(() => ({ comments: [{ id: 'c1', body: 'hi' }] }))
    const { listComments } = await import('./issues')
    const comments = await listComments('iss_1')
    expect(calls[0]).toEqual({ tool: 'comments.list', input: { issueId: 'iss_1' } })
    expect(comments).toHaveLength(1)
  })

  it('createComment rejects empty bodies', async () => {
    const calls = setupTransport(() => null)
    const { createComment } = await import('./issues')
    const result = await createComment('iss_1', '   ')
    expect(result.ok).toBe(false)
    expect(calls).toHaveLength(0)
  })

  it('createComment returns the normalized comment on success', async () => {
    const calls = setupTransport(() => ({ id: 'c1', body: 'hello' }))
    const { createComment } = await import('./issues')
    const result = await createComment('iss_1', '  hello  ')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.comment.body).toBe('hello')
    }
    expect(calls[0]).toEqual({
      tool: 'comments.create',
      input: { issueId: 'iss_1', body: 'hello' }
    })
  })
})
