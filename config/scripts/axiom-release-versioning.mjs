export const AXIOM_RELEASE_TAG_PREFIX = 'axiom-v'
export const AXIOM_PRERELEASE_NAME = 'axiom'

export function normalizeUpstreamTag(upstreamTag) {
  const tag = String(upstreamTag ?? '').trim()
  if (!tag) {
    throw new Error('upstream tag is required')
  }
  return tag
}

export function upstreamVersionFromTag(upstreamTag) {
  return normalizeUpstreamTag(upstreamTag).replace(/^v/i, '')
}

export function forkVersionForRevision(upstreamTag, revision) {
  const version = upstreamVersionFromTag(upstreamTag)
  const numericRevision = Number.parseInt(String(revision), 10)
  if (!Number.isSafeInteger(numericRevision) || numericRevision < 1) {
    throw new Error(`Axiom revision must be a positive integer, got ${revision}`)
  }
  const [withoutBuild, buildMetadata] = version.split('+', 2)
  const forkPrerelease = withoutBuild.includes('-')
    ? `${withoutBuild}.${AXIOM_PRERELEASE_NAME}.${numericRevision}`
    : `${withoutBuild}-${AXIOM_PRERELEASE_NAME}.${numericRevision}`
  return buildMetadata ? `${forkPrerelease}+${buildMetadata}` : forkPrerelease
}

export function forkTagForVersion(forkVersion) {
  const version = String(forkVersion ?? '').trim()
  if (!version) {
    throw new Error('fork version is required')
  }
  return `${AXIOM_RELEASE_TAG_PREFIX}${version}`
}

export function forkReleasePrefixForUpstreamTag(upstreamTag) {
  return forkTagForVersion(forkVersionForRevision(upstreamTag, 1)).replace(/\.1(?:\+.*)?$/, '.')
}

export function parseAxiomRevisionFromTag(tag, upstreamTag) {
  const rawTag = String(tag ?? '')
  const prefix = forkReleasePrefixForUpstreamTag(upstreamTag)
  if (!rawTag.startsWith(prefix)) {
    return null
  }
  const suffix = rawTag.slice(prefix.length)
  const match = suffix.match(/^(\d+)(?:\+.*)?$/)
  if (!match) {
    return null
  }
  const revision = Number.parseInt(match[1], 10)
  return Number.isSafeInteger(revision) && revision > 0 ? revision : null
}

export function maxAxiomRevision(tags, upstreamTag) {
  return Math.max(0, ...Array.from(tags, (tag) => parseAxiomRevisionFromTag(tag, upstreamTag) ?? 0))
}

export function resolveForkReleaseVersion({
  upstreamTag,
  existingTags = [],
  requestedRevision,
  bumpRevision = false
}) {
  const highestRevision = maxAxiomRevision(existingTags, upstreamTag)
  const parsedRequestedRevision = requestedRevision
    ? Number.parseInt(String(requestedRevision), 10)
    : null
  const revision =
    parsedRequestedRevision ?? (bumpRevision ? highestRevision + 1 : highestRevision || 1)
  const forkVersion = forkVersionForRevision(upstreamTag, revision)
  return {
    upstreamTag: normalizeUpstreamTag(upstreamTag),
    upstreamVersion: upstreamVersionFromTag(upstreamTag),
    axiomRevision: revision,
    forkVersion,
    forkTag: forkTagForVersion(forkVersion),
    previousRevision: highestRevision
  }
}
