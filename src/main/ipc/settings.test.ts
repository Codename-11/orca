import { describe, expect, it, vi, beforeEach } from 'vitest'

const { handleMock, previewGhosttyImportMock, showSaveDialogMock, showOpenDialogMock } = vi.hoisted(
  () => ({
    handleMock: vi.fn(),
    previewGhosttyImportMock: vi.fn(),
    showSaveDialogMock: vi.fn(),
    showOpenDialogMock: vi.fn()
  })
)

vi.mock('electron', () => ({
  app: { name: 'Axiom Orca', getVersion: () => '1.4.18-rc.0.axiom.1' },
  dialog: { showSaveDialog: showSaveDialogMock, showOpenDialog: showOpenDialogMock },
  ipcMain: { handle: handleMock },
  nativeTheme: { themeSource: 'system' }
}))

vi.mock('../ghostty/index', () => ({
  previewGhosttyImport: previewGhosttyImportMock
}))

import { registerSettingsHandlers } from './settings'

const store = {
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  getGitHubCache: vi.fn(),
  setGitHubCache: vi.fn(),
  exportProfileToFile: vi.fn(),
  createProfileExportEnvelope: vi.fn(),
  previewProfileImportFile: vi.fn(),
  importProfileFromFile: vi.fn()
}

describe('registerSettingsHandlers', () => {
  beforeEach(() => {
    handleMock.mockClear()
    previewGhosttyImportMock.mockClear()
    showSaveDialogMock.mockReset()
    showOpenDialogMock.mockReset()
    store.getSettings.mockReset()
    store.updateSettings.mockReset()
  })

  it('registers settings:previewGhosttyImport handler', () => {
    registerSettingsHandlers(store as never)
    const channels = handleMock.mock.calls.map((call) => call[0])
    expect(channels).toContain('settings:previewGhosttyImport')
    expect(channels).toContain('settings:exportProfile')
    expect(channels).toContain('settings:previewProfileImport')
    expect(channels).toContain('settings:importProfile')
  })

  it('settings:previewGhosttyImport returns preview result', async () => {
    const expected = { found: false, diff: {}, unsupportedKeys: [] }
    previewGhosttyImportMock.mockResolvedValue(expected)
    registerSettingsHandlers(store as never)

    const handler = handleMock.mock.calls.find(
      (call) => call[0] === 'settings:previewGhosttyImport'
    )?.[1] as (_event: unknown, args: unknown) => Promise<unknown>

    const result = await handler!(null, {})
    expect(result).toEqual(expected)
    expect(previewGhosttyImportMock).toHaveBeenCalledWith(store)
  })

  it('updates the agent awake service when the keep-awake setting changes', () => {
    const agentAwakeService = { setEnabled: vi.fn() }
    store.getSettings.mockReturnValue({ keepComputerAwakeWhileAgentsRun: false })
    store.updateSettings.mockReturnValue({ keepComputerAwakeWhileAgentsRun: true })
    registerSettingsHandlers(store as never, agentAwakeService as never)

    const handler = handleMock.mock.calls.find((call) => call[0] === 'settings:set')?.[1] as (
      _event: unknown,
      args: unknown
    ) => unknown

    handler(null, { keepComputerAwakeWhileAgentsRun: true })

    expect(agentAwakeService.setEnabled).toHaveBeenCalledWith(true)
  })

  it('does not notify the agent awake service for unrelated setting changes', () => {
    const agentAwakeService = { setEnabled: vi.fn() }
    store.getSettings.mockReturnValue({ keepComputerAwakeWhileAgentsRun: false })
    store.updateSettings.mockReturnValue({ keepComputerAwakeWhileAgentsRun: false })
    registerSettingsHandlers(store as never, agentAwakeService as never)

    const handler = handleMock.mock.calls.find((call) => call[0] === 'settings:set')?.[1] as (
      _event: unknown,
      args: unknown
    ) => unknown

    handler(null, { defaultTuiAgent: 'codex' })

    expect(agentAwakeService.setEnabled).not.toHaveBeenCalled()
  })

  it('does not accept floating workspace trust grants from renderer settings IPC', async () => {
    store.getSettings.mockReturnValue({ floatingTerminalTrustedCwds: [] })
    store.updateSettings.mockReturnValue({ floatingTerminalTrustedCwds: [] })
    registerSettingsHandlers(store as never)

    const handler = handleMock.mock.calls.find((call) => call[0] === 'settings:set')?.[1] as (
      _event: unknown,
      args: unknown
    ) => Promise<unknown>

    await handler(null, { floatingTerminalTrustedCwds: ['/tmp/notes'] })

    expect(store.updateSettings).toHaveBeenCalledWith({})
  })
})
