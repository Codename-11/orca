declare const ORCA_APP_NAME: string | null
declare const ORCA_APP_USER_MODEL_ID: string | null

const DEFAULT_APP_NAME = 'Orca'
const DEFAULT_APP_USER_MODEL_ID = 'com.stablyai.orca'

export type AppBuildInfo = {
  name: string
  version: string
  appUserModelId: string
}

export type AppIdentityInput = {
  appName?: string | null
  appUserModelId?: string | null
}

function clean(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function readConfiguredBuildConstants(): AppIdentityInput {
  return {
    appName: typeof ORCA_APP_NAME !== 'undefined' ? ORCA_APP_NAME : null,
    appUserModelId: typeof ORCA_APP_USER_MODEL_ID !== 'undefined' ? ORCA_APP_USER_MODEL_ID : null
  }
}

export function resolveConfiguredAppIdentity(
  input: AppIdentityInput = readConfiguredBuildConstants()
): {
  name: string
  appUserModelId: string
} {
  return {
    name: clean(input.appName) ?? DEFAULT_APP_NAME,
    appUserModelId: clean(input.appUserModelId) ?? DEFAULT_APP_USER_MODEL_ID
  }
}

export function buildAppInfo(version: string, input?: AppIdentityInput): AppBuildInfo {
  return {
    ...resolveConfiguredAppIdentity(input),
    version
  }
}
