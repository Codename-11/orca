declare const ORCA_UPDATE_OWNER: string | null | undefined
declare const ORCA_UPDATE_REPO: string | null | undefined
declare const ORCA_UPDATE_NUDGE_URL: string | null | undefined
declare const ORCA_UPDATE_CHANGELOG_URL: string | null | undefined
declare const ORCA_UPDATE_CHANGELOG_JSON_URL: string | null | undefined

function definedBuildConstant(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function readBuildConstant(name: string): string | null {
  switch (name) {
    case 'ORCA_UPDATE_OWNER':
      return typeof ORCA_UPDATE_OWNER !== 'undefined'
        ? definedBuildConstant(ORCA_UPDATE_OWNER)
        : null
    case 'ORCA_UPDATE_REPO':
      return typeof ORCA_UPDATE_REPO !== 'undefined' ? definedBuildConstant(ORCA_UPDATE_REPO) : null
    case 'ORCA_UPDATE_NUDGE_URL':
      return typeof ORCA_UPDATE_NUDGE_URL !== 'undefined'
        ? definedBuildConstant(ORCA_UPDATE_NUDGE_URL)
        : null
    case 'ORCA_UPDATE_CHANGELOG_URL':
      return typeof ORCA_UPDATE_CHANGELOG_URL !== 'undefined'
        ? definedBuildConstant(ORCA_UPDATE_CHANGELOG_URL)
        : null
    case 'ORCA_UPDATE_CHANGELOG_JSON_URL':
      return typeof ORCA_UPDATE_CHANGELOG_JSON_URL !== 'undefined'
        ? definedBuildConstant(ORCA_UPDATE_CHANGELOG_JSON_URL)
        : null
    default:
      return null
  }
}

function readEnv(name: string): string | null {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function getUpdateRepository(): { owner: string; repo: string } {
  return {
    owner: readBuildConstant('ORCA_UPDATE_OWNER') ?? readEnv('ORCA_UPDATE_OWNER') ?? 'stablyai',
    repo: readBuildConstant('ORCA_UPDATE_REPO') ?? readEnv('ORCA_UPDATE_REPO') ?? 'orca'
  }
}

export function getUpdateGitHubBaseUrl(): string {
  const { owner, repo } = getUpdateRepository()
  return `https://github.com/${owner}/${repo}`
}

export function getReleasesAtomUrl(): string {
  return `${getUpdateGitHubBaseUrl()}/releases.atom`
}

export function getReleaseDownloadBaseUrl(): string {
  return `${getUpdateGitHubBaseUrl()}/releases/download`
}

export function getReleaseDownloadUrl(tag: string): string {
  return `${getReleaseDownloadBaseUrl()}/${encodeURIComponent(tag)}`
}

export function getReleaseListingUrl(): string {
  return `${getUpdateGitHubBaseUrl()}/releases`
}

export function getReleaseTagForVersion(version: string): string {
  return version.includes('axiom.') || version.includes('-axiom.')
    ? `axiom-v${version}`
    : `v${version}`
}

export function getReleasePageUrlForVersion(version: string): string {
  return `${getReleaseListingUrl()}/tag/${encodeURIComponent(getReleaseTagForVersion(version))}`
}

export function getLatestReleaseDownloadUrl(): string {
  return `${getUpdateGitHubBaseUrl()}/releases/latest/download`
}

export function getReleaseTagHrefPattern(): RegExp {
  const { owner, repo } = getUpdateRepository()
  return new RegExp(
    `href="https:\\/\\/github\\.com\\/${escapeRegExp(owner)}\\/${escapeRegExp(repo)}\\/releases\\/tag\\/([^"]+)"`,
    'g'
  )
}

export function getNudgeUrl(): string | null {
  return (
    readBuildConstant('ORCA_UPDATE_NUDGE_URL') ??
    readEnv('ORCA_UPDATE_NUDGE_URL') ??
    'https://onorca.dev/whats-new/nudge.json'
  )
}

export function getChangelogPageUrl(): string {
  const configured =
    readBuildConstant('ORCA_UPDATE_CHANGELOG_URL') ?? readEnv('ORCA_UPDATE_CHANGELOG_URL')
  if (configured) {
    return configured
  }
  const { owner, repo } = getUpdateRepository()
  if (owner !== 'stablyai' || repo !== 'orca') {
    return getReleaseListingUrl()
  }
  return 'https://onorca.dev/changelog'
}

export function getChangelogJsonUrl(): string | null {
  const configured =
    readBuildConstant('ORCA_UPDATE_CHANGELOG_JSON_URL') ?? readEnv('ORCA_UPDATE_CHANGELOG_JSON_URL')
  if (configured) {
    return configured
  }
  const { owner, repo } = getUpdateRepository()
  if (owner !== 'stablyai' || repo !== 'orca') {
    return null
  }
  return 'https://onorca.dev/whats-new/changelog.json'
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
