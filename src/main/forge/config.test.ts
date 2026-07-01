/*
 * Why: secure config storage is the boundary that decides whether the renderer
 * can reach Forge. Cover the env-var fallback, on-disk persistence (mocked
 * safeStorage), config + token clearing, and the resolveForgeConfig source
 * tag the IPC handler echoes back to the renderer.
 */
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import type * as Os from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let tempHome = ''

async function loadConfigModule() {
  vi.resetModules()
  vi.doMock('electron', () => ({
    safeStorage: {
      isEncryptionAvailable: () => true,
      encryptString: (value: string) => Buffer.from(value, 'utf-8'),
      decryptString: (value: Buffer) => value.toString('utf-8')
    }
  }))
  vi.doMock('os', async () => {
    const actual = await vi.importActual<typeof Os>('os')
    return { ...actual, homedir: () => tempHome }
  })
  return import('./config')
}

beforeEach(() => {
  tempHome = mkdtempSync(join(tmpdir(), 'orca-forge-config-'))
  delete process.env.FORGE_BASE_URL
  delete process.env.FORGE_API_URL
  delete process.env.ORCA_FORGE_API_URL
  delete process.env.FORGE_API_TOKEN
  delete process.env.ORCA_FORGE_API_TOKEN
  delete process.env.FORGE_TOKEN
})

afterEach(() => {
  if (tempHome) {
    rmSync(tempHome, { recursive: true, force: true })
  }
  vi.restoreAllMocks()
  vi.doUnmock('electron')
  vi.doUnmock('os')
})

describe('forge config — env fallback', () => {
  it('reports source=none when nothing is configured', async () => {
    const { resolveForgeConfig } = await loadConfigModule()
    expect(resolveForgeConfig()).toEqual({
      baseUrl: null,
      hasToken: false,
      baseUrlSource: 'none'
    })
  })

  it('reports source=env when only env vars are set', async () => {
    process.env.FORGE_BASE_URL = 'https://forge.example/'
    process.env.FORGE_API_TOKEN = 'tok'
    const { resolveForgeConfig } = await loadConfigModule()
    expect(resolveForgeConfig()).toEqual({
      baseUrl: 'https://forge.example',
      hasToken: true,
      baseUrlSource: 'env'
    })
  })

  it('strips trailing slashes from env-provided base URLs', async () => {
    process.env.FORGE_BASE_URL = 'https://forge.example///'
    const { getForgeBaseUrl } = await loadConfigModule()
    expect(getForgeBaseUrl()).toBe('https://forge.example')
  })
})

describe('forge config — disk persistence', () => {
  it('saveForgeConfig persists baseUrl + encrypted token and round-trips through resolve', async () => {
    const { saveForgeConfig, resolveForgeConfig, getForgeToken } = await loadConfigModule()
    saveForgeConfig({ baseUrl: 'https://forge.example/', apiKey: 'tok-disk' })

    const resolved = resolveForgeConfig()
    expect(resolved.baseUrl).toBe('https://forge.example')
    expect(resolved.hasToken).toBe(true)
    expect(resolved.baseUrlSource).toBe('config')
    expect(getForgeToken()).toBe('tok-disk')
  })

  it('config takes precedence over env', async () => {
    process.env.FORGE_BASE_URL = 'https://env.example'
    process.env.FORGE_API_TOKEN = 'env-token'
    const { saveForgeConfig, resolveForgeConfig } = await loadConfigModule()
    saveForgeConfig({ baseUrl: 'https://disk.example', apiKey: 'disk-token' })

    expect(resolveForgeConfig().baseUrl).toBe('https://disk.example')
    expect(resolveForgeConfig().baseUrlSource).toBe('config')
  })

  it('clearForgeConfig removes both the URL and the token', async () => {
    const { saveForgeConfig, clearForgeConfig, resolveForgeConfig } = await loadConfigModule()
    saveForgeConfig({ baseUrl: 'https://forge.example', apiKey: 'tok' })
    expect(resolveForgeConfig().baseUrlSource).toBe('config')

    clearForgeConfig()
    expect(resolveForgeConfig()).toEqual({
      baseUrl: null,
      hasToken: false,
      baseUrlSource: 'none'
    })
  })

  it('saveForgeConfig rejects empty base URL', async () => {
    const { saveForgeConfig } = await loadConfigModule()
    expect(() => saveForgeConfig({ baseUrl: '   ' })).toThrow(/required/i)
  })
})
