import { describe, expect, it } from 'vitest'
import { buildAppInfo, resolveConfiguredAppIdentity } from './app-build-identity'

describe('app build identity', () => {
  it('defaults to upstream Orca identity', () => {
    expect(resolveConfiguredAppIdentity({})).toEqual({
      name: 'Orca',
      appUserModelId: 'com.stablyai.orca'
    })
  })

  it('uses Axiom compile-time identity when provided', () => {
    expect(
      resolveConfiguredAppIdentity({
        appName: 'Axiom Orca',
        appUserModelId: 'com.axiomlabs.orca'
      })
    ).toEqual({
      name: 'Axiom Orca',
      appUserModelId: 'com.axiomlabs.orca'
    })
  })

  it('returns a renderer-safe app info payload', () => {
    expect(buildAppInfo('1.4.9-axiom.1', { appName: 'Axiom Orca' })).toEqual({
      name: 'Axiom Orca',
      version: '1.4.9-axiom.1',
      appUserModelId: 'com.stablyai.orca'
    })
  })
})
