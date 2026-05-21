import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const ENV_KEYS = [
  'ORCA_UPDATE_OWNER',
  'ORCA_UPDATE_REPO',
  'ORCA_UPDATE_NUDGE_URL',
  'ORCA_UPDATE_CHANGELOG_URL',
  'ORCA_UPDATE_CHANGELOG_JSON_URL'
] as const

const originalEnv = new Map<string, string | undefined>()

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

describe('updater endpoint resolution', () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) {
      originalEnv.set(key, process.env[key])
      delete process.env[key]
    }
  })

  afterEach(() => {
    restoreEnv()
  })

  it('uses upstream release and changelog endpoints by default', async () => {
    const endpoints = await import('./updater-endpoints')

    expect(endpoints.getUpdateRepository()).toEqual({ owner: 'stablyai', repo: 'orca' })
    expect(endpoints.getReleasesAtomUrl()).toBe('https://github.com/stablyai/orca/releases.atom')
    expect(endpoints.getLatestReleaseDownloadUrl()).toBe(
      'https://github.com/stablyai/orca/releases/latest/download'
    )
    expect(endpoints.getReleaseDownloadUrl('v1.4.0')).toBe(
      'https://github.com/stablyai/orca/releases/download/v1.4.0'
    )
    expect(endpoints.getNudgeUrl()).toBe('https://onorca.dev/whats-new/nudge.json')
    expect(endpoints.getChangelogPageUrl()).toBe('https://onorca.dev/changelog')
    expect(endpoints.getChangelogJsonUrl()).toBe('https://onorca.dev/whats-new/changelog.json')
  })

  it('routes fork builds to fork-owned release and update metadata endpoints', async () => {
    process.env.ORCA_UPDATE_OWNER = 'Codename-11'
    process.env.ORCA_UPDATE_REPO = 'orca'
    process.env.ORCA_UPDATE_NUDGE_URL = 'https://updates.axiom-labs.dev/orca/nudge.json'
    process.env.ORCA_UPDATE_CHANGELOG_URL = 'https://updates.axiom-labs.dev/orca/changelog'
    process.env.ORCA_UPDATE_CHANGELOG_JSON_URL =
      'https://updates.axiom-labs.dev/orca/changelog.json'

    const endpoints = await import('./updater-endpoints')

    expect(endpoints.getUpdateRepository()).toEqual({ owner: 'Codename-11', repo: 'orca' })
    expect(endpoints.getReleasesAtomUrl()).toBe('https://github.com/Codename-11/orca/releases.atom')
    expect(endpoints.getLatestReleaseDownloadUrl()).toBe(
      'https://github.com/Codename-11/orca/releases/latest/download'
    )
    expect(endpoints.getReleaseDownloadUrl('axiom-v1.4.0-axiom.1')).toBe(
      'https://github.com/Codename-11/orca/releases/download/axiom-v1.4.0-axiom.1'
    )
    expect(endpoints.getNudgeUrl()).toBe('https://updates.axiom-labs.dev/orca/nudge.json')
    expect(endpoints.getChangelogPageUrl()).toBe('https://updates.axiom-labs.dev/orca/changelog')
    expect(endpoints.getChangelogJsonUrl()).toBe(
      'https://updates.axiom-labs.dev/orca/changelog.json'
    )
  })

  it('builds release notes URLs against the configured update repository', async () => {
    process.env.ORCA_UPDATE_OWNER = 'Codename-11'
    process.env.ORCA_UPDATE_REPO = 'orca'

    const endpoints = await import('./updater-endpoints')

    expect(endpoints.getReleasePageUrlForVersion('1.4.14-rc.0.axiom.1')).toBe(
      'https://github.com/Codename-11/orca/releases/tag/axiom-v1.4.14-rc.0.axiom.1'
    )
    expect(endpoints.getReleasePageUrlForVersion('1.4.14-axiom.2')).toBe(
      'https://github.com/Codename-11/orca/releases/tag/axiom-v1.4.14-axiom.2'
    )
    expect(endpoints.getReleaseListingUrl()).toBe('https://github.com/Codename-11/orca/releases')
    expect(endpoints.getChangelogPageUrl()).toBe('https://github.com/Codename-11/orca/releases')
    expect(endpoints.getChangelogJsonUrl()).toBeNull()
  })

  it('keeps upstream release notes URLs on upstream builds', async () => {
    const endpoints = await import('./updater-endpoints')

    expect(endpoints.getReleasePageUrlForVersion('1.4.14-rc.0')).toBe(
      'https://github.com/stablyai/orca/releases/tag/v1.4.14-rc.0'
    )
    expect(endpoints.getReleaseListingUrl()).toBe('https://github.com/stablyai/orca/releases')
  })

  it('matches release tags only from the configured update repository', async () => {
    process.env.ORCA_UPDATE_OWNER = 'Codename-11'
    process.env.ORCA_UPDATE_REPO = 'orca'

    const { getReleaseTagHrefPattern } = await import('./updater-endpoints')
    const atom = [
      '<link href="https://github.com/stablyai/orca/releases/tag/v1.4.0"/>',
      '<link href="https://github.com/Codename-11/orca/releases/tag/axiom-v1.4.0-axiom.1"/>'
    ].join('')

    expect(Array.from(atom.matchAll(getReleaseTagHrefPattern()), (match) => match[1])).toEqual([
      'axiom-v1.4.0-axiom.1'
    ])
  })
})
