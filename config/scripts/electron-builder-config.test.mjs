import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)

function loadElectronBuilderConfig(env = {}) {
  const configPath = require.resolve('../electron-builder.config.cjs')
  const previousEnv = {}
  for (const key of Object.keys(env)) {
    previousEnv[key] = process.env[key]
    process.env[key] = env[key]
  }
  delete require.cache[configPath]
  try {
    return require('../electron-builder.config.cjs')
  } finally {
    delete require.cache[configPath]
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
}

const electronBuilderConfig = loadElectronBuilderConfig()

describe('electron-builder config', () => {
  it('uses the multi-size icon source for Linux packages', () => {
    expect(electronBuilderConfig.linux.icon).toBe('resources/build/icon.icns')
  })

  it('builds RPMs without changing existing Linux artifact names', () => {
    expect(electronBuilderConfig.linux.target).toEqual(['AppImage', 'deb', 'rpm'])
    expect(electronBuilderConfig.appImage.artifactName).toBe('orca-linux.${ext}')
    expect(electronBuilderConfig.deb.artifactName).toBe('orca-ide_${version}_${arch}.${ext}')
    expect(electronBuilderConfig.rpm).toMatchObject({
      packageName: 'orca-ide',
      artifactName: 'orca-ide-${version}.${arch}.${ext}'
    })
  })

  it('keeps electron-builder native rebuilds on by default', () => {
    expect(electronBuilderConfig.npmRebuild).toBe(true)
  })

  it('lets Windows release CI skip electron-builder all-module rebuilds', () => {
    const config = loadElectronBuilderConfig({ ORCA_SKIP_ELECTRON_BUILDER_REBUILD: '1' })

    expect(config.npmRebuild).toBe(false)
  })
})
