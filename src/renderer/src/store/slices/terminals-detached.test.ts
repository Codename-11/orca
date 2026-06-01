import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('sonner', () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }))
vi.mock('@/runtime/sync-runtime-graph', () => ({
  scheduleRuntimeGraphSync: vi.fn()
}))
vi.mock('@/components/terminal-pane/pty-transport', () => ({
  registerEagerPtyBuffer: vi.fn(),
  ensurePtyDispatcher: vi.fn()
}))

const mockApi = {
  pty: { kill: vi.fn().mockResolvedValue(undefined) },
  gh: { prForBranch: vi.fn().mockResolvedValue(null), issue: vi.fn().mockResolvedValue(null) },
  settings: { get: vi.fn().mockResolvedValue({}), set: vi.fn().mockResolvedValue(undefined) },
  cache: {
    getGitHub: vi.fn().mockResolvedValue(null),
    setGitHub: vi.fn().mockResolvedValue(undefined)
  },
  worktrees: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
    updateMeta: vi.fn().mockResolvedValue({})
  },
  repos: {
    list: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue({}),
    pickFolder: vi.fn().mockResolvedValue(null)
  },
  claudeUsage: {
    getScanState: vi.fn().mockResolvedValue({ enabled: false, isScanning: false }),
    setEnabled: vi.fn().mockResolvedValue({}),
    refresh: vi.fn().mockResolvedValue({}),
    getSummary: vi.fn().mockResolvedValue(null),
    getDaily: vi.fn().mockResolvedValue([]),
    getBreakdown: vi.fn().mockResolvedValue([]),
    getRecentSessions: vi.fn().mockResolvedValue([])
  },
  codexUsage: {
    getScanState: vi.fn().mockResolvedValue({ enabled: false, isScanning: false }),
    setEnabled: vi.fn().mockResolvedValue({}),
    refresh: vi.fn().mockResolvedValue({}),
    getSummary: vi.fn().mockResolvedValue(null),
    getDaily: vi.fn().mockResolvedValue([]),
    getBreakdown: vi.fn().mockResolvedValue([]),
    getRecentSessions: vi.fn().mockResolvedValue([])
  },
  openCodeUsage: {
    getScanState: vi.fn().mockResolvedValue({ enabled: false, isScanning: false }),
    setEnabled: vi.fn().mockResolvedValue({}),
    refresh: vi.fn().mockResolvedValue({}),
    getSummary: vi.fn().mockResolvedValue(null),
    getDaily: vi.fn().mockResolvedValue([]),
    getBreakdown: vi.fn().mockResolvedValue([]),
    getRecentSessions: vi.fn().mockResolvedValue([])
  }
}

// @ts-expect-error -- mocked browser preload API
globalThis.window = { api: mockApi }

import { createTestStore, makeTab, makeWorktree, seedStore } from './store-test-helpers'

describe('detached terminal tabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marks a terminal tab as detached without closing or killing its PTY', () => {
    const store = createTestStore()
    const worktreeId = 'repo1::/wt-1'
    seedStore(store, {
      worktreesByRepo: {
        repo1: [makeWorktree({ id: worktreeId, repoId: 'repo1', path: '/wt-1' })]
      },
      tabsByWorktree: {
        [worktreeId]: [makeTab({ id: 'tab-1', worktreeId, ptyId: 'pty-1' })]
      },
      activeTabId: 'tab-1',
      activeTabIdByWorktree: { [worktreeId]: 'tab-1' }
    })

    store.getState().detachTerminalTab({ tabId: 'tab-1', worktreeId, windowId: 'detached-1' })

    expect(store.getState().detachedTerminalTabsById['tab-1']).toEqual({
      tabId: 'tab-1',
      worktreeId,
      windowId: 'detached-1'
    })
    expect(store.getState().tabsByWorktree[worktreeId]?.[0]?.ptyId).toBe('pty-1')
    expect(mockApi.pty.kill).not.toHaveBeenCalled()
  })

  it('moves active focus to an attached sibling when detaching the active tab', () => {
    const store = createTestStore()
    const worktreeId = 'repo1::/wt-1'
    seedStore(store, {
      worktreesByRepo: {
        repo1: [makeWorktree({ id: worktreeId, repoId: 'repo1', path: '/wt-1' })]
      },
      tabsByWorktree: {
        [worktreeId]: [
          makeTab({ id: 'tab-1', worktreeId, ptyId: 'pty-1' }),
          makeTab({ id: 'tab-2', worktreeId, ptyId: 'pty-2' })
        ]
      },
      activeTabId: 'tab-1',
      activeTabIdByWorktree: { [worktreeId]: 'tab-1' }
    })

    store.getState().detachTerminalTab({ tabId: 'tab-1', worktreeId, windowId: 'detached-1' })

    expect(store.getState().activeTabId).toBe('tab-2')
    expect(store.getState().activeTabIdByWorktree[worktreeId]).toBe('tab-2')
  })

  it('reattaches a detached terminal tab when the detached window closes', () => {
    const store = createTestStore()
    const worktreeId = 'repo1::/wt-1'
    seedStore(store, {
      detachedTerminalTabsById: {
        'tab-1': { tabId: 'tab-1', worktreeId, windowId: 'detached-1' }
      }
    })

    store.getState().reattachTerminalTab('tab-1')

    expect(store.getState().detachedTerminalTabsById).toEqual({})
  })

  it('cleans detached state if the user explicitly closes the terminal tab', () => {
    const store = createTestStore()
    const worktreeId = 'repo1::/wt-1'
    seedStore(store, {
      tabsByWorktree: {
        [worktreeId]: [makeTab({ id: 'tab-1', worktreeId, ptyId: 'pty-1' })]
      },
      detachedTerminalTabsById: {
        'tab-1': { tabId: 'tab-1', worktreeId, windowId: 'detached-1' }
      }
    })

    store.getState().closeTab('tab-1')

    expect(store.getState().detachedTerminalTabsById).toEqual({})
  })
})
