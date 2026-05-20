import { describe, expect, it } from 'vitest'
import {
  TASK_PROVIDERS,
  filterAvailableTaskProviders,
  normalizeVisibleTaskProviders,
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
    expect(normalizeVisibleTaskProviders([])).toEqual(['github', 'gitlab', 'linear', 'forge'])
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

  it('falls back to GitHub when every preferred provider is unavailable', () => {
    expect(
      filterAvailableTaskProviders(['gitlab', 'linear'], {
        gitlabInstalled: false,
        linearConnected: false
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
