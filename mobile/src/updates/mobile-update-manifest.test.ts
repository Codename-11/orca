import { describe, expect, it } from 'vitest'

import {
  evaluateMobileUpdate,
  formatAvailableMobileUpdate,
  parseMobileUpdateManifest,
  type MobileUpdateManifest
} from './mobile-update-manifest'

function manifest(overrides: Partial<MobileUpdateManifest> = {}): MobileUpdateManifest {
  return {
    schemaVersion: 1,
    generatedAt: '2026-06-16T00:00:00.000Z',
    release: {
      repository: 'Codename-11/orca',
      tag: 'axiom-v1.4.71-axiom.3',
      version: '1.4.71-axiom.3',
      sourceSha: 'new-sha',
      url: 'https://github.com/Codename-11/orca/releases/tag/axiom-v1.4.71-axiom.3'
    },
    platforms: {
      android: {
        packageName: 'com.axiomlabs.orca.mobile',
        version: '0.0.14',
        versionCode: 4,
        artifact: {
          name: 'app-release.apk',
          sizeBytes: 123,
          sha256: 'apk-sha',
          downloadUrl:
            'https://github.com/Codename-11/orca/releases/download/axiom-v1.4.71-axiom.3/app-release.apk'
        }
      },
      ios: {
        bundleIdentifier: 'com.stably.orca.mobile',
        version: '0.0.14',
        buildNumber: '3'
      }
    },
    ...overrides
  }
}

describe('parseMobileUpdateManifest', () => {
  it('accepts the generated manifest shape', () => {
    expect(parseMobileUpdateManifest(manifest())).toMatchObject({ schemaVersion: 1 })
  })

  it('rejects unrelated JSON', () => {
    expect(parseMobileUpdateManifest({ release: { tag: 'axiom-v1.4.71-axiom.3' } })).toBeNull()
  })
})

describe('evaluateMobileUpdate', () => {
  it('offers the Android APK when the release versionCode is newer', () => {
    const result = evaluateMobileUpdate(manifest(), {
      platform: 'android',
      version: '0.0.13',
      versionCode: 3,
      packageName: 'com.axiomlabs.orca.mobile'
    })

    expect(result).toMatchObject({
      kind: 'available',
      update: {
        platform: 'android',
        nativeBuild: '4',
        artifactSha256: 'apk-sha'
      }
    })
    expect(result.kind === 'available' ? formatAvailableMobileUpdate(result.update) : '').toBe(
      'v0.0.14 (4)'
    )
  })

  it('does not offer an update for SHA-only release movement without a newer versionCode', () => {
    const result = evaluateMobileUpdate(
      manifest({
        release: {
          repository: 'Codename-11/orca',
          tag: 'axiom-v1.4.72-axiom.1',
          version: '1.4.72-axiom.1',
          sourceSha: 'different-release-sha',
          url: 'https://github.com/Codename-11/orca/releases/tag/axiom-v1.4.72-axiom.1'
        },
        platforms: {
          android: {
            packageName: 'com.axiomlabs.orca.mobile',
            version: '0.0.14',
            versionCode: 4,
            artifact: {
              name: 'app-release.apk',
              sizeBytes: 456,
              sha256: 'different-apk-sha',
              downloadUrl:
                'https://github.com/Codename-11/orca/releases/download/axiom-v1.4.72-axiom.1/app-release.apk'
            }
          }
        }
      }),
      {
        platform: 'android',
        version: '0.0.14',
        versionCode: 4,
        packageName: 'com.axiomlabs.orca.mobile'
      }
    )

    expect(result).toEqual({
      kind: 'current',
      releaseTag: 'axiom-v1.4.72-axiom.1',
      sourceSha: 'different-release-sha'
    })
  })

  it('offers iOS updates by buildNumber when the manifest has an iOS target', () => {
    expect(
      evaluateMobileUpdate(manifest(), {
        platform: 'ios',
        version: '0.0.13',
        buildNumber: '2',
        bundleIdentifier: 'com.stably.orca.mobile'
      })
    ).toMatchObject({
      kind: 'available',
      update: {
        platform: 'ios',
        nativeBuild: '3'
      }
    })
  })
})
