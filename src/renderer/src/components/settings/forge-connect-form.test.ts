import { describe, expect, it } from 'vitest'
import {
  buildForgeSaveConfigArgs,
  describeForgeConfig,
  getForgeConnectCanSave
} from './forge-connect-form'

describe('forge connect form helpers', () => {
  it('normalizes saved Forge URLs and omits blank API keys so existing secrets stay main-side', () => {
    expect(
      buildForgeSaveConfigArgs({
        baseUrlDraft: '  https://forge.example.com/// ',
        apiKeyDraft: '   '
      })
    ).toEqual({ baseUrl: 'https://forge.example.com' })
  })

  it('includes a trimmed API key only when the user entered one', () => {
    expect(
      buildForgeSaveConfigArgs({
        baseUrlDraft: 'https://forge.example.com',
        apiKeyDraft: '  forge_sk_test  '
      })
    ).toEqual({ baseUrl: 'https://forge.example.com', apiKey: 'forge_sk_test' })
  })

  it('does not allow saving without a Forge base URL', () => {
    expect(getForgeConnectCanSave({ baseUrlDraft: '   ', saving: false })).toBe(false)
    expect(
      getForgeConnectCanSave({ baseUrlDraft: 'https://forge.example.com', saving: true })
    ).toBe(false)
    expect(
      getForgeConnectCanSave({ baseUrlDraft: 'https://forge.example.com', saving: false })
    ).toBe(true)
  })

  it('describes config without exposing token material', () => {
    expect(
      describeForgeConfig({
        baseUrl: 'https://forge.example.com',
        hasToken: true,
        source: 'config'
      })
    ).toEqual({ label: 'Configured', detail: 'https://forge.example.com · API key saved' })

    expect(
      describeForgeConfig({ baseUrl: 'https://forge.example.com', hasToken: false, source: 'env' })
    ).toEqual({
      label: 'Env URL only',
      detail: 'https://forge.example.com · add an API key to enable private Forge workspaces'
    })

    expect(describeForgeConfig({ baseUrl: null, hasToken: true, source: 'none' })).toEqual({
      label: 'Needs URL',
      detail: 'API key is saved, but no Forge base URL is configured'
    })
  })
})
