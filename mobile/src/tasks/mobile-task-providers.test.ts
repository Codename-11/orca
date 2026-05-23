import { describe, expect, it } from 'vitest'
import {
  filterAvailableTaskProviders,
  MOBILE_TASK_PROVIDERS,
  normalizeVisibleTaskProviders,
  resolveVisibleTaskProvider
} from './mobile-task-providers'

describe('mobile task providers', () => {
  it('includes Forge in the default provider list', () => {
    expect(MOBILE_TASK_PROVIDERS).toEqual(['github', 'gitlab', 'linear', 'forge'])
    expect(normalizeVisibleTaskProviders(undefined)).toEqual([
      'github',
      'gitlab',
      'linear',
      'forge'
    ])
  })

  it('filters Forge by connection status without dropping the last visible provider', () => {
    expect(
      filterAvailableTaskProviders(['forge'], {
        gitlabInstalled: false,
        linearConnected: false,
        forgeConnected: true
      })
    ).toEqual(['forge'])

    expect(
      filterAvailableTaskProviders(['forge'], {
        gitlabInstalled: false,
        linearConnected: false,
        forgeConnected: false
      })
    ).toEqual(['github'])
  })

  it('resolves Forge when it is visible', () => {
    expect(resolveVisibleTaskProvider('forge', ['github', 'forge'])).toBe('forge')
  })
})
