import { createHash } from 'crypto'
import path from 'path'
import type { AppIdentity } from '../../shared/app-identity'

const BASE_APP_NAME = 'Orca'
const BASE_APP_USER_MODEL_ID = 'com.stablyai.orca'
const MAX_LABEL_LENGTH = 80

export type DevInstanceIdentity = AppIdentity & {
  appUserModelId: string
}

function cleanEnvValue(value: string | undefined): string | null {
  const trimmed = value?.replace(/\s+/g, ' ').trim()
  if (!trimmed) {
    return null
  }
  return trimmed.length > MAX_LABEL_LENGTH
    ? `${trimmed.slice(0, MAX_LABEL_LENGTH - 3)}...`
    : trimmed
}

function cleanBuildValue(value: string | null | undefined): string | null {
  return cleanEnvValue(value ?? undefined)
}

function readBuildIdentityConstant(
  name: 'ORCA_APP_NAME' | 'ORCA_APP_USER_MODEL_ID'
): string | null {
  switch (name) {
    case 'ORCA_APP_NAME':
      return typeof ORCA_APP_NAME !== 'undefined'
        ? cleanBuildValue(ORCA_APP_NAME)
        : cleanBuildValue((globalThis as { ORCA_APP_NAME?: string | null }).ORCA_APP_NAME)
    case 'ORCA_APP_USER_MODEL_ID':
      return typeof ORCA_APP_USER_MODEL_ID !== 'undefined'
        ? cleanBuildValue(ORCA_APP_USER_MODEL_ID)
        : cleanBuildValue(
            (globalThis as { ORCA_APP_USER_MODEL_ID?: string | null }).ORCA_APP_USER_MODEL_ID
          )
  }
}

function lastPathSegment(value: string): string {
  const normalized = value.replace(/\\/g, '/')
  return normalized.split('/').filter(Boolean).at(-1) ?? value
}

function formatLabel(branch: string | null, worktreeName: string | null): string | null {
  if (branch && worktreeName) {
    if (branch === worktreeName || lastPathSegment(branch) === worktreeName) {
      return worktreeName
    }
    return `${worktreeName} @ ${branch}`
  }
  return branch ?? worktreeName
}

function createDevAppUserModelId(baseAppUserModelId: string, identityKey: string | null): string {
  if (!identityKey) {
    return baseAppUserModelId
  }
  const hash = createHash('sha1').update(identityKey).digest('hex').slice(0, 10)
  return `${baseAppUserModelId}.dev.${hash}`
}

export function getDevInstanceIdentity(
  isDev: boolean,
  env: NodeJS.ProcessEnv = process.env
): DevInstanceIdentity {
  const baseAppName =
    cleanEnvValue(env.ORCA_APP_NAME) ?? readBuildIdentityConstant('ORCA_APP_NAME') ?? BASE_APP_NAME
  const baseAppUserModelId =
    cleanEnvValue(env.ORCA_APP_USER_MODEL_ID) ??
    readBuildIdentityConstant('ORCA_APP_USER_MODEL_ID') ??
    BASE_APP_USER_MODEL_ID

  if (!isDev) {
    return {
      name: baseAppName,
      isDev: false,
      devLabel: null,
      devBranch: null,
      devWorktreeName: null,
      devRepoRoot: null,
      dockBadgeLabel: null,
      appUserModelId: baseAppUserModelId
    }
  }

  const repoRoot = cleanEnvValue(env.ORCA_DEV_REPO_ROOT)
  const branch = cleanEnvValue(env.ORCA_DEV_BRANCH)
  const worktreeName =
    cleanEnvValue(env.ORCA_DEV_WORKTREE_NAME) ??
    cleanEnvValue(path.basename(repoRoot ?? process.cwd()))
  const devLabel = cleanEnvValue(env.ORCA_DEV_INSTANCE_LABEL) ?? formatLabel(branch, worktreeName)
  const dockTitle =
    cleanEnvValue(env.ORCA_DEV_DOCK_TITLE) ?? `${baseAppName}: ${branch ?? devLabel ?? 'dev'}`

  return {
    name: dockTitle,
    isDev: true,
    devLabel,
    devBranch: branch,
    devWorktreeName: worktreeName,
    devRepoRoot: repoRoot,
    dockBadgeLabel: null,
    appUserModelId: createDevAppUserModelId(baseAppUserModelId, repoRoot ?? devLabel)
  }
}
