export const AXIOM_RELEASES_URL = 'https://github.com/Codename-11/orca/releases'
export const MOBILE_UPDATE_MANIFEST_URL =
  'https://github.com/Codename-11/orca/releases/latest/download/mobile-update.json'
export const LATEST_ANDROID_APK_URL =
  'https://github.com/Codename-11/orca/releases/latest/download/app-release.apk'

export type MobileUpdateManifest = {
  schemaVersion: 1
  generatedAt: string
  release: {
    repository: string
    tag: string
    version: string
    sourceSha: string
    url: string
  }
  platforms: {
    android?: {
      packageName: string
      version: string
      versionCode: number
      artifact?: {
        name: string
        sizeBytes: number
        sha256: string
        downloadUrl: string
      }
    }
    ios?: {
      bundleIdentifier: string
      version: string
      buildNumber: string
      storeUrl?: string | null
    }
  }
}

export type InstalledMobileBuild =
  | {
      platform: 'android'
      version: string
      versionCode: number | null
      packageName?: string | null
    }
  | {
      platform: 'ios'
      version: string
      buildNumber: string | null
      bundleIdentifier?: string | null
    }
  | {
      platform: 'other'
      version: string
    }

export type AvailableMobileUpdate = {
  platform: 'android' | 'ios'
  version: string
  nativeBuild: string
  releaseTag: string
  releaseVersion: string
  releaseUrl: string
  downloadUrl: string
  artifactName?: string
  artifactSha256?: string
  sourceSha: string
}

export type MobileUpdateEvaluation =
  | { kind: 'available'; update: AvailableMobileUpdate }
  | { kind: 'current'; releaseTag: string; sourceSha: string }
  | { kind: 'unsupported-platform' }
  | { kind: 'manifest-missing-platform'; platform: 'android' | 'ios' }
  | { kind: 'unknown-installed-build'; platform: 'android' | 'ios' }

function positiveInteger(value: unknown): number | null {
  const numberValue = typeof value === 'string' && value.trim() ? Number(value) : value
  return Number.isInteger(numberValue) && Number(numberValue) > 0 ? Number(numberValue) : null
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

export function parseMobileUpdateManifest(value: unknown): MobileUpdateManifest | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const candidate = value as MobileUpdateManifest
  const release = candidate.release
  if (
    candidate.schemaVersion !== 1 ||
    !release ||
    !candidate.platforms ||
    typeof candidate.platforms !== 'object' ||
    stringValue(release.repository) == null ||
    stringValue(release.tag) == null ||
    stringValue(release.version) == null ||
    stringValue(release.sourceSha) == null ||
    stringValue(release.url) == null
  ) {
    return null
  }
  return candidate
}

export function evaluateMobileUpdate(
  manifest: MobileUpdateManifest,
  installed: InstalledMobileBuild
): MobileUpdateEvaluation {
  if (installed.platform === 'other') {
    return { kind: 'unsupported-platform' }
  }

  if (installed.platform === 'android') {
    const android = manifest.platforms.android
    if (!android) {
      return { kind: 'manifest-missing-platform', platform: 'android' }
    }
    if (installed.versionCode == null || installed.versionCode <= 0) {
      return { kind: 'unknown-installed-build', platform: 'android' }
    }
    if (android.versionCode <= installed.versionCode) {
      return {
        kind: 'current',
        releaseTag: manifest.release.tag,
        sourceSha: manifest.release.sourceSha
      }
    }

    return {
      kind: 'available',
      update: {
        platform: 'android',
        version: android.version,
        nativeBuild: String(android.versionCode),
        releaseTag: manifest.release.tag,
        releaseVersion: manifest.release.version,
        releaseUrl: manifest.release.url,
        downloadUrl: android.artifact?.downloadUrl ?? LATEST_ANDROID_APK_URL,
        artifactName: android.artifact?.name,
        artifactSha256: android.artifact?.sha256,
        sourceSha: manifest.release.sourceSha
      }
    }
  }

  const ios = manifest.platforms.ios
  if (!ios) {
    return { kind: 'manifest-missing-platform', platform: 'ios' }
  }
  const installedBuild = positiveInteger(installed.buildNumber)
  const manifestBuild = positiveInteger(ios.buildNumber)
  if (installedBuild == null || manifestBuild == null) {
    return { kind: 'unknown-installed-build', platform: 'ios' }
  }
  if (manifestBuild <= installedBuild) {
    return {
      kind: 'current',
      releaseTag: manifest.release.tag,
      sourceSha: manifest.release.sourceSha
    }
  }

  return {
    kind: 'available',
    update: {
      platform: 'ios',
      version: ios.version,
      nativeBuild: ios.buildNumber,
      releaseTag: manifest.release.tag,
      releaseVersion: manifest.release.version,
      releaseUrl: manifest.release.url,
      downloadUrl: ios.storeUrl ?? manifest.release.url,
      sourceSha: manifest.release.sourceSha
    }
  }
}

export function formatAvailableMobileUpdate(update: AvailableMobileUpdate): string {
  return `v${update.version} (${update.nativeBuild})`
}
