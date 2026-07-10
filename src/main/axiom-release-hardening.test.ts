import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const CONFIG_PATH = resolve(process.cwd(), 'config/electron-builder.config.cjs')
const MOBILE_APP_PATH = resolve(process.cwd(), 'mobile/app.json')
const ENV_KEYS = [
  'ORCA_APP_ID',
  'ORCA_PRODUCT_NAME',
  'ORCA_PACKAGE_NAME',
  'ORCA_WINDOWS_EXECUTABLE_NAME',
  'ORCA_ARTIFACT_BASENAME',
  'ORCA_NSIS_GUID',
  'ORCA_PUBLISH_REPOSITORY',
  'ORCA_UPDATE_REPOSITORY',
  'GITHUB_REPOSITORY'
] as const

const originalEnv = new Map<string, string | undefined>()

type BuilderConfig = {
  appId: string
  productName: string
  extraMetadata?: { name?: string }
  win?: { executableName?: string }
  nsis?: { guid?: string; artifactName?: string; include?: string }
  dmg?: { artifactName?: string }
  appImage?: { artifactName?: string }
  deb?: { packageName?: string; artifactName?: string }
  publish?: { provider?: string; owner?: string; repo?: string }
  afterPack?: (context: {
    electronPlatformName: string
    appOutDir: string
    packager: { appInfo: { productFilename: string } }
  }) => Promise<void>
}

function loadBuilderConfig(): BuilderConfig {
  delete require.cache[CONFIG_PATH]
  return require(CONFIG_PATH) as BuilderConfig
}

function restoreEnv(): void {
  for (const key of ENV_KEYS) {
    const value = originalEnv.get(key)
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

describe('Axiom release hardening', () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) {
      originalEnv.set(key, process.env[key])
      delete process.env[key]
    }
  })

  afterEach(() => {
    restoreEnv()
    delete require.cache[CONFIG_PATH]
  })

  it('keeps upstream identity and artifact names by default', () => {
    const config = loadBuilderConfig()

    expect(config.appId).toBe('com.stablyai.orca')
    expect(config.productName).toBe('Orca')
    expect(config.extraMetadata?.name).toBe('orca')
    expect(config.win?.executableName).toBe('Orca')
    expect(config.nsis?.guid).toBeUndefined()
    expect(config.nsis?.artifactName).toBe('orca-windows-setup.${ext}')
    expect(config.dmg?.artifactName).toBe('orca-macos-${arch}.${ext}')
    expect(config.appImage?.artifactName).toBe('orca-linux.${ext}')
    expect(config.deb?.packageName).toBe('orca-ide')
    expect(config.publish).toMatchObject({ provider: 'github', owner: 'stablyai', repo: 'orca' })
  })

  it('isolates Axiom desktop builds from upstream app, installer, and release assets', () => {
    process.env.ORCA_APP_ID = 'com.axiomlabs.orca'
    process.env.ORCA_PRODUCT_NAME = 'Axiom Orca'
    process.env.ORCA_PACKAGE_NAME = 'axiom-orca'
    process.env.ORCA_WINDOWS_EXECUTABLE_NAME = 'Axiom Orca'
    process.env.ORCA_ARTIFACT_BASENAME = 'axiom-orca'
    process.env.ORCA_NSIS_GUID = 'b6c06723-a52f-5004-ad9f-f39666f5e928'
    process.env.ORCA_PUBLISH_REPOSITORY = 'Codename-11/orca'

    const config = loadBuilderConfig()

    expect(config.appId).toBe('com.axiomlabs.orca')
    expect(config.productName).toBe('Axiom Orca')
    expect(config.extraMetadata?.name).toBe('axiom-orca')
    expect(config.win?.executableName).toBe('Axiom Orca')
    expect(config.nsis).toMatchObject({
      guid: 'b6c06723-a52f-5004-ad9f-f39666f5e928',
      artifactName: 'axiom-orca-windows-setup.${ext}',
      include: 'resources/build/installer.nsh'
    })
    expect(config.dmg?.artifactName).toBe('axiom-orca-macos-${arch}.${ext}')
    expect(config.appImage?.artifactName).toBe('axiom-orca-linux.${ext}')
    expect(config.publish).toMatchObject({ owner: 'Codename-11', repo: 'orca' })
  })

  it('writes configured Windows runtime markers for the packaged CLI launcher', async () => {
    process.env.ORCA_PRODUCT_NAME = 'Axiom Orca'
    process.env.ORCA_PACKAGE_NAME = 'axiom-orca'
    process.env.ORCA_WINDOWS_EXECUTABLE_NAME = 'Axiom Orca'

    const config = loadBuilderConfig()
    const appOutDir = mkdtempSync(join(tmpdir(), 'orca-win-pack-'))
    try {
      const resourcesDir = join(appOutDir, 'resources')
      const unpackedMainDir = join(resourcesDir, 'app.asar.unpacked', 'out', 'main')
      mkdirSync(unpackedMainDir, { recursive: true })
      // Why: upstream now verifies the unpacked daemon layout during every
      // afterPack run, so the fork marker fixture must resemble a real package.
      writeFileSync(
        join(unpackedMainDir, 'daemon-entry.js'),
        'console.error("Usage: daemon-entry <socket>"); process.exit(1)\n',
        'utf8'
      )

      await config.afterPack?.({
        electronPlatformName: 'win32',
        appOutDir,
        packager: { appInfo: { productFilename: 'Axiom Orca' } }
      })

      expect(
        readFileSync(join(appOutDir, 'resources', 'orca-electron-executable.txt'), 'utf8')
      ).toBe('Axiom Orca.exe\n')
      expect(readFileSync(join(appOutDir, 'resources', 'orca-user-data-name.txt'), 'utf8')).toBe(
        'axiom-orca\n'
      )
    } finally {
      rmSync(appOutDir, { recursive: true, force: true })
    }
  })

  it('brands the fork Android app while keeping a fork-owned package for side-by-side installs', () => {
    const app = JSON.parse(readFileSync(MOBILE_APP_PATH, 'utf8')) as {
      expo?: { name?: string; android?: { package?: string } }
    }

    expect(app.expo?.name).toBe('Axiom Orca')
    expect(app.expo?.android?.package).toBe('com.axiomlabs.orca.mobile')
  })
})
