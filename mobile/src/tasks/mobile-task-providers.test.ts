import { describe, expect, it } from 'vitest'
import {
  filterAvailableTaskProviders,
  MOBILE_TASK_PROVIDERS,
  normalizeVisibleTaskProviders,
  resolveVisibleTaskProvider,
  toggleVisibleTaskProvider
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

  it('keeps Forge visible when support is unknown so the task screen can show setup state', () => {
    expect(
      filterAvailableTaskProviders(['forge'], {
        gitlabInstalled: false,
        linearConnected: false
      })
    ).toEqual(['forge'])
  })

  it('toggles visible task providers in canonical order without hiding the last provider', () => {
    expect(toggleVisibleTaskProvider(['github'], 'forge')).toEqual(['github', 'forge'])
    expect(toggleVisibleTaskProvider(['github', 'linear', 'forge'], 'linear')).toEqual([
      'github',
      'forge'
    ])
    expect(toggleVisibleTaskProvider(['forge'], 'forge')).toEqual(['forge'])
  })
})
