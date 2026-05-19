import type { ForgeConfigSettings, ForgeSaveConfigArgs } from '../../../../shared/types'

export type ForgeConnectDraft = {
  baseUrlDraft: string
  apiKeyDraft: string
}

export type ForgeConfigDescription = {
  label: string
  detail: string
}

export function normalizeForgeBaseUrlDraft(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

export function buildForgeSaveConfigArgs(draft: ForgeConnectDraft): ForgeSaveConfigArgs {
  const args: ForgeSaveConfigArgs = {
    baseUrl: normalizeForgeBaseUrlDraft(draft.baseUrlDraft)
  }
  const apiKey = draft.apiKeyDraft.trim()
  if (apiKey) {
    args.apiKey = apiKey
  }
  return args
}

export function getForgeConnectCanSave(args: { baseUrlDraft: string; saving: boolean }): boolean {
  return !args.saving && normalizeForgeBaseUrlDraft(args.baseUrlDraft).length > 0
}

export function describeForgeConfig(config: ForgeConfigSettings): ForgeConfigDescription {
  if (!config.baseUrl) {
    if (config.hasToken) {
      return {
        label: 'Needs URL',
        detail: 'API key is saved, but no Forge base URL is configured'
      }
    }
    return {
      label: 'Not configured',
      detail: 'Add your Forge base URL and API key to enable Forge tasks'
    }
  }

  if (config.hasToken) {
    return {
      label: config.source === 'env' ? 'Configured from env' : 'Configured',
      detail: `${config.baseUrl} · API key saved`
    }
  }

  return {
    label: config.source === 'env' ? 'Env URL only' : 'URL only',
    detail: `${config.baseUrl} · add an API key to enable private Forge workspaces`
  }
}
