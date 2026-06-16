import Constants from 'expo-constants'
import { Platform } from 'react-native'

import type { InstalledMobileBuild } from './mobile-update-manifest'

export function getInstalledMobileBuild(): InstalledMobileBuild {
  const version = Constants.expoConfig?.version ?? '0.0.0'
  if (Platform.OS === 'android') {
    const versionCode = Constants.expoConfig?.android?.versionCode
    return {
      platform: 'android',
      version,
      versionCode: Number.isInteger(versionCode) ? Number(versionCode) : null,
      packageName: Constants.expoConfig?.android?.package ?? null
    }
  }

  if (Platform.OS === 'ios') {
    return {
      platform: 'ios',
      version,
      buildNumber: Constants.expoConfig?.ios?.buildNumber ?? null,
      bundleIdentifier: Constants.expoConfig?.ios?.bundleIdentifier ?? null
    }
  }

  return { platform: 'other', version }
}
