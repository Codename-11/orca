import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildMobileUpdateManifest } from './generate-mobile-update-manifest.mjs'

function appConfig(overrides = {}) {
  return {
    expo: {
      version: '0.0.15',
      android: {
        package: 'com.axiomlabs.orca.mobile',
        versionCode: 5
      },
      ios: {
        bundleIdentifier: 'com.stably.orca.mobile',
        buildNumber: '4'
      },
      ...overrides
    }
  }
}

describe('buildMobileUpdateManifest', () => {
  it('describes the mobile release with native build ids and APK verification metadata', () => {
    const dir = mkdtempSync(join(tmpdir(), 'orca-mobile-update-manifest-'))
    const apkPath = join(dir, 'app-release.apk')
    const apkBytes = 'signed apk bytes'
    writeFileSync(apkPath, apkBytes)

    const manifest = buildMobileUpdateManifest({
      appConfig: appConfig(),
      releaseTag: 'axiom-v1.4.71-axiom.3',
      releaseVersion: '1.4.71-axiom.3',
      repository: 'Codename-11/orca',
      sourceSha: 'abc123',
      generatedAt: '2026-06-16T00:00:00.000Z',
      apkPath
    })

    expect(manifest).toMatchObject({
      schemaVersion: 1,
      generatedAt: '2026-06-16T00:00:00.000Z',
      release: {
        repository: 'Codename-11/orca',
        tag: 'axiom-v1.4.71-axiom.3',
        version: '1.4.71-axiom.3',
        sourceSha: 'abc123',
        url: 'https://github.com/Codename-11/orca/releases/tag/axiom-v1.4.71-axiom.3'
      },
      platforms: {
        android: {
          packageName: 'com.axiomlabs.orca.mobile',
          version: '0.0.15',
          versionCode: 5,
          artifact: {
            name: 'app-release.apk',
            sizeBytes: apkBytes.length,
            sha256: createHash('sha256').update(apkBytes).digest('hex'),
            downloadUrl:
              'https://github.com/Codename-11/orca/releases/download/axiom-v1.4.71-axiom.3/app-release.apk'
          }
        },
        ios: {
          bundleIdentifier: 'com.stably.orca.mobile',
          version: '0.0.15',
          buildNumber: '4'
        }
      }
    })
  })

  it('rejects Android manifests without a positive native versionCode', () => {
    expect(() =>
      buildMobileUpdateManifest({
        appConfig: appConfig({ android: { package: 'com.axiomlabs.orca.mobile', versionCode: 0 } }),
        releaseTag: 'axiom-v1.4.71-axiom.3',
        releaseVersion: '1.4.71-axiom.3',
        repository: 'Codename-11/orca',
        sourceSha: 'abc123',
        generatedAt: '2026-06-16T00:00:00.000Z'
      })
    ).toThrow('expo.android.versionCode must be a positive integer')
  })

  it('reads the default app config from the repo root when run from mobile', () => {
    const dir = mkdtempSync(join(tmpdir(), 'orca-mobile-update-manifest-cli-'))
    const apkPath = join(dir, 'app-release.apk')
    const outputPath = join(dir, 'mobile-update.json')
    writeFileSync(apkPath, 'signed apk bytes')

    execFileSync(
      process.execPath,
      [
        join(process.cwd(), 'config/scripts/generate-mobile-update-manifest.mjs'),
        '--release-tag',
        'axiom-v1.4.72-axiom.1',
        '--release-version',
        '1.4.72-axiom.1',
        '--repository',
        'Codename-11/orca',
        '--source-sha',
        'abc123',
        '--apk',
        apkPath,
        '--output',
        outputPath,
        '--generated-at',
        '2026-06-16T00:00:00.000Z'
      ],
      { cwd: join(process.cwd(), 'mobile') }
    )

    const manifest = JSON.parse(readFileSync(outputPath, 'utf8'))
    expect(manifest.platforms.android).toMatchObject({
      packageName: 'com.axiomlabs.orca.mobile',
      versionCode: 5
    })
  })
})
