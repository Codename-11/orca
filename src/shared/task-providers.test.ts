import { describe, expect, it } from 'vitest'
import {
  TASK_PROVIDERS,
  filterAvailableTaskProviders,
  normalizeTaskProviderSettings,
  normalizeVisibleTaskProviders,
  restoreAvailableDefaultTaskProvider,
  resolveVisibleTaskProvider,
  toggleVisibleTaskProvider
} from './task-providers'

describe('task providers', () => {
  it('normalizes provider lists while preserving supported order', () => {
    expect(normalizeVisibleTaskProviders(['gitlab', 'unknown', 'gitlab', 'linear'])).toEqual([
      'gitlab',
      'linear'
    ])
  })

  it('falls back to all providers when none are visible', () => {
    expect(normalizeVisibleTaskProviders([])).toEqual(['github', 'gitlab', 'linear', 'jira', 'forge'])
  })

  it('restores a valid saved default when provider settings drifted', () => {
    expect(
      normalizeTaskProviderSettings({
        visibleTaskProviders: ['linear'],
        defaultTaskSource: 'github'
      })
    ).toEqual({
      defaultTaskSource: 'github',
      visibleTaskProviders: ['github', 'linear']
    })
  })

  it('normalizes invalid saved defaults to the first visible provider', () => {
    expect(
      normalizeTaskProviderSettings({
        visibleTaskProviders: ['gitlab'],
        defaultTaskSource: 'bitbucket'
      })
    ).toEqual({
      defaultTaskSource: 'gitlab',
      visibleTaskProviders: ['gitlab']
    })
  })

  it('resolves hidden preferred providers to the first visible provider', () => {
    expect(resolveVisibleTaskProvider('github', ['linear'])).toBe('linear')
  })

  it('filters runtime-unavailable providers without changing preference normalization', () => {
    expect(
      filterAvailableTaskProviders(['github', 'gitlab', 'linear', 'forge'], {
        gitlabInstalled: false,
        linearConnected: true,
        forgeConnected: false
      })
    ).toEqual(['github', 'linear'])
  })

  it('keeps Forge available unless it is explicitly disconnected', () => {
    expect(
      filterAvailableTaskProviders(['forge'], {
        gitlabInstalled: false,
        linearConnected: false
      })
    ).toEqual(['forge'])
  })

  it('keeps an available saved default visible when provider visibility drifted', () => {
    expect(
      restoreAvailableDefaultTaskProvider(
        ['linear'],
        {
          gitlabInstalled: false,
          linearConnected: true
        },
        'github'
      )
    ).toEqual(['github', 'linear'])
  })

  it('preserves intentionally narrowed providers when the saved default matches them', () => {
    expect(
      restoreAvailableDefaultTaskProvider(
        ['linear'],
        {
          gitlabInstalled: false,
          linearConnected: true
        },
        'linear'
      )
    ).toEqual(['linear'])
  })

  it('does not restore an unavailable saved default', () => {
    expect(
      restoreAvailableDefaultTaskProvider(
        ['linear'],
        {
          gitlabInstalled: false,
          linearConnected: true
        },
        'gitlab'
      )
    ).toEqual(['linear'])
  })

  it('ignores invalid saved defaults while restoring visible providers', () => {
    expect(
      restoreAvailableDefaultTaskProvider(
        ['gitlab'],
        {
          gitlabInstalled: false,
          linearConnected: true
        },
        'bitbucket'
      )
    ).toEqual(['github'])
  })

  it('falls back to GitHub when every preferred provider is unavailable', () => {
    expect(
      filterAvailableTaskProviders(['gitlab', 'linear', 'forge'], {
        gitlabInstalled: false,
        linearConnected: false,
        forgeConnected: false
      })
    ).toEqual(['github'])
  })

  it('serializes task-source toggles with canonical provider IDs and order', () => {
    expect(toggleVisibleTaskProvider(['github', 'linear'], 'forge')).toEqual([
      'github',
      'linear',
      'forge'
    ])
    expect(toggleVisibleTaskProvider(['github', 'linear', 'forge'], 'linear')).toEqual([
      'github',
      'forge'
    ])
    expect(toggleVisibleTaskProvider(['forge'], 'forge')).toEqual(['forge'])
  })

  it('uses the shared provider order when adding a hidden provider', () => {
    expect(toggleVisibleTaskProvider(['forge'], 'gitlab')).toEqual(['gitlab', 'forge'])
    expect(toggleVisibleTaskProvider(['linear'], 'github')).toEqual(['github', 'linear'])
    expect(toggleVisibleTaskProvider(['github'], 'forge')).toEqual(
      TASK_PROVIDERS.filter((provider) => provider === 'github' || provider === 'forge')
    )
  })
})
