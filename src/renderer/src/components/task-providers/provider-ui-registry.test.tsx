import { describe, expect, it } from 'vitest'
import { TASK_PROVIDERS } from '../../../../shared/task-providers'
import { TASK_PROVIDER_UI_OPTIONS, getTaskProviderUiOption } from './provider-ui-registry'

describe('task provider UI registry', () => {
  it('exposes metadata for every built-in task provider in picker order', () => {
    expect(TASK_PROVIDER_UI_OPTIONS.map((provider) => provider.id)).toEqual(TASK_PROVIDERS)
    expect(TASK_PROVIDER_UI_OPTIONS.map((provider) => provider.label)).toEqual([
      'GitHub',
      'GitLab',
      'Linear',
      'Jira',
      'Forge'
    ])
  })

  it('resolves icons and settings targets for every built-in provider', () => {
    for (const provider of TASK_PROVIDERS) {
      const option = getTaskProviderUiOption(provider)

      expect(option.Icon({ className: 'size-4' })).toBeTruthy()
      expect(option.settingsPane).toMatch(/^(tasks|integrations)$/)
      expect(option.settingsKeywords).toContain(provider)
      expect(option.onboardingTitle).toBeTruthy()
      expect(option.onboardingDescription).toBeTruthy()
      expect(option.onboardingActionLabel).toBeTruthy()
    }
  })

  it('captures settings/onboarding metadata and capability flags for Forge', () => {
    const forge = getTaskProviderUiOption('forge')

    expect(forge.settingsPane).toBe('integrations')
    expect(forge.settingsKeywords).toEqual(expect.arrayContaining(['forge', 'api key', 'base url']))
    expect(forge.onboardingTitle).toBe('Connect Forge')
    expect(forge.onboardingActionLabel).toBe('Open Integrations')
    expect(forge.capabilities).toEqual({
      supportsCreate: true,
      supportsDetailDrawer: true,
      supportsAgentFilters: true
    })
  })

  it('keeps Linear marked as detail/create capable without Forge agent filters', () => {
    const linear = getTaskProviderUiOption('linear')

    expect(linear.settingsPane).toBe('integrations')
    expect(linear.capabilities).toEqual({
      supportsCreate: true,
      supportsDetailDrawer: true,
      supportsAgentFilters: false
    })
  })
})
