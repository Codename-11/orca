#!/usr/bin/env node

import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { parseAxiomReleaseTag, resolveForkReleaseVersion } from './axiom-release-versioning.mjs'

const API_VERSION = '2022-11-28'

function envString(name, fallback = '') {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function githubHeaders() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

async function githubJson(url, ok404 = false) {
  const res = await fetch(url, { headers: githubHeaders() })
  if (res.status === 404 && ok404) {
    return null
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub request failed ${res.status} ${res.statusText}: ${body.slice(0, 300)}`)
  }
  return res.json()
}

function setOutput(name, value) {
  const line = `${name}=${String(value)}\n`
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, line)
  } else {
    console.log(line.trimEnd())
  }
}

function parseArgs(argv) {
  const args = {
    upstreamTag: '',
    axiomTag: '',
    includePrereleases: false,
    forceRebuild: false,
    bumpAxiomRevision: false,
    axiomRevision: ''
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--upstream-tag') {
      args.upstreamTag = argv[++i] ?? ''
    } else if (arg === '--axiom-tag') {
      args.axiomTag = argv[++i] ?? ''
    } else if (arg === '--include-prereleases') {
      args.includePrereleases = true
    } else if (arg === '--force-rebuild') {
      args.forceRebuild = true
    } else if (arg === '--bump-axiom-revision') {
      args.bumpAxiomRevision = true
    } else if (arg === '--axiom-revision') {
      args.axiomRevision = argv[++i] ?? ''
    }
  }
  return args
}

async function getCandidateRelease({ upstreamRepo, upstreamTag, includePrereleases }) {
  if (upstreamTag) {
    const release = await githubJson(
      `https://api.github.com/repos/${upstreamRepo}/releases/tags/${encodeURIComponent(upstreamTag)}`,
      true
    )
    if (release) {
      return release
    }
    const tagRef = await githubJson(
      `https://api.github.com/repos/${upstreamRepo}/git/ref/tags/${encodeURIComponent(upstreamTag)}`,
      true
    )
    if (!tagRef) {
      throw new Error(`Upstream tag not found in ${upstreamRepo}: ${upstreamTag}`)
    }
    return getSyntheticTagRelease(upstreamRepo, upstreamTag)
  }

  const tags = await githubJson(`https://api.github.com/repos/${upstreamRepo}/tags?per_page=100`)
  if (!Array.isArray(tags)) {
    throw new Error(`GitHub tags response for ${upstreamRepo} was not an array`)
  }
  const tag = newestSemverTag(
    tags
      .map((entry) => (typeof entry?.name === 'string' ? entry.name : ''))
      .filter((name) => /^v\d/.test(name)),
    { includePrereleases }
  )
  return tag ? getSyntheticTagRelease(upstreamRepo, tag) : null
}

function normalizeVersion(tag) {
  return String(tag ?? '')
    .trim()
    .replace(/^v/i, '')
}

function parseVersion(tag) {
  const match = normalizeVersion(tag).match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-.]+))?(?:\+([0-9A-Za-z-.]+))?$/
  )
  if (!match) {
    return null
  }
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4]?.split('.') ?? []
  }
}

function compareIdentifiers(left, right) {
  const leftNumeric = /^\d+$/.test(left)
  const rightNumeric = /^\d+$/.test(right)
  if (leftNumeric && rightNumeric) {
    return Number(left) - Number(right)
  }
  if (leftNumeric) {
    return -1
  }
  if (rightNumeric) {
    return 1
  }
  return left.localeCompare(right)
}

function compareVersions(left, right) {
  const leftVersion = parseVersion(left)
  const rightVersion = parseVersion(right)
  if (!leftVersion || !rightVersion) {
    return 0
  }
  for (let index = 0; index < leftVersion.core.length; index += 1) {
    const delta = leftVersion.core[index] - rightVersion.core[index]
    if (delta !== 0) {
      return delta
    }
  }
  const leftPrerelease = leftVersion.prerelease
  const rightPrerelease = rightVersion.prerelease
  if (leftPrerelease.length === 0 && rightPrerelease.length === 0) {
    return 0
  }
  if (leftPrerelease.length === 0) {
    return 1
  }
  if (rightPrerelease.length === 0) {
    return -1
  }
  for (let index = 0; index < Math.max(leftPrerelease.length, rightPrerelease.length); index += 1) {
    if (leftPrerelease[index] === undefined) {
      return -1
    }
    if (rightPrerelease[index] === undefined) {
      return 1
    }
    const delta = compareIdentifiers(leftPrerelease[index], rightPrerelease[index])
    if (delta !== 0) {
      return delta
    }
  }
  return 0
}

export function isPrereleaseTag(tag) {
  return (parseVersion(tag)?.prerelease.length ?? 0) > 0
}

export function isUpstreamPrereleaseRelease(release) {
  return Boolean(release?.prerelease) || isPrereleaseTag(release?.tag_name)
}

export function shouldSkipUpstreamPrerelease({ upstreamPrerelease, includePrereleases }) {
  return Boolean(upstreamPrerelease) && !includePrereleases
}

export function newestSemverTag(tags, { includePrereleases }) {
  return tags
    .filter((tag) => parseVersion(tag))
    .filter((tag) => includePrereleases || !isPrereleaseTag(tag))
    .sort((left, right) => compareVersions(right, left))[0]
}

function getSyntheticTagRelease(upstreamRepo, tag) {
  return {
    tag_name: tag,
    name: tag,
    html_url: `https://github.com/${upstreamRepo}/releases/tag/${tag}`,
    prerelease: normalizeVersion(tag).includes('-'),
    draft: false
  }
}

async function listForkReleaseTags(forkRepo) {
  const releases = await githubJson(
    `https://api.github.com/repos/${forkRepo}/releases?per_page=100`
  )
  if (!Array.isArray(releases)) {
    throw new Error(`GitHub releases response for ${forkRepo} was not an array`)
  }
  return releases
    .map((release) => (typeof release?.tag_name === 'string' ? release.tag_name : ''))
    .filter(Boolean)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const upstreamRepo = envString('AXIOM_UPSTREAM_REPOSITORY', 'stablyai/orca')
  const forkRepo = envString('GITHUB_REPOSITORY')
  if (!forkRepo) {
    throw new Error('GITHUB_REPOSITORY must be set to the Axiom fork repository')
  }
  const includePrereleases =
    args.includePrereleases || envString('AXIOM_INCLUDE_PRERELEASES', '0') === '1'

  if (args.axiomTag) {
    const parsedTag = parseAxiomReleaseTag(args.axiomTag)
    if (!parsedTag) {
      throw new Error(`Invalid Axiom release tag: ${args.axiomTag}`)
    }
    const existingForkRelease = await githubJson(
      `https://api.github.com/repos/${forkRepo}/releases/tags/${encodeURIComponent(parsedTag.forkTag)}`,
      true
    )

    setOutput('source', 'axiom_tag')
    setOutput('upstream_tag', parsedTag.upstreamTag)
    setOutput('upstream_name', parsedTag.upstreamTag)
    setOutput(
      'upstream_url',
      `https://github.com/${upstreamRepo}/releases/tag/${parsedTag.upstreamTag}`
    )
    setOutput('upstream_prerelease', parsedTag.upstreamVersion.includes('-') ? 'true' : 'false')
    setOutput('fork_version', parsedTag.forkVersion)
    setOutput('fork_tag', parsedTag.forkTag)
    setOutput('axiom_revision', String(parsedTag.axiomRevision))
    setOutput('previous_axiom_revision', String(Math.max(0, parsedTag.axiomRevision - 1)))

    if (existingForkRelease && existingForkRelease.draft !== true && !args.forceRebuild) {
      setOutput('should_release', 'false')
      setOutput('reason', `fork_release_exists:${parsedTag.forkTag}`)
      return
    }

    setOutput('should_release', 'true')
    setOutput(
      'reason',
      existingForkRelease?.draft === true
        ? `fork_draft_release_exists:${parsedTag.forkTag}`
        : existingForkRelease && args.forceRebuild
          ? `forced_rebuild:${parsedTag.forkTag}`
          : `manual_axiom_tag:${parsedTag.forkTag}`
    )
    return
  }

  const release = await getCandidateRelease({
    upstreamRepo,
    upstreamTag: args.upstreamTag,
    includePrereleases
  })

  if (!release) {
    setOutput('should_release', 'false')
    setOutput('reason', 'no_upstream_release')
    return
  }

  const upstreamTag = release.tag_name
  const upstreamPrerelease = isUpstreamPrereleaseRelease(release)
  if (
    shouldSkipUpstreamPrerelease({
      upstreamPrerelease,
      includePrereleases
    })
  ) {
    setOutput('source', 'upstream_tag')
    setOutput('upstream_tag', upstreamTag)
    setOutput('upstream_name', release.name || upstreamTag)
    setOutput(
      'upstream_url',
      release.html_url || `https://github.com/${upstreamRepo}/releases/tag/${upstreamTag}`
    )
    setOutput('upstream_prerelease', 'true')
    setOutput('should_release', 'false')
    setOutput('reason', `upstream_prerelease_skipped:${upstreamTag}`)
    return
  }

  const existingTags = await listForkReleaseTags(forkRepo)
  const forkRelease = resolveForkReleaseVersion({
    upstreamTag,
    existingTags,
    requestedRevision: args.axiomRevision,
    bumpRevision: args.bumpAxiomRevision
  })
  const existingForkRelease = await githubJson(
    `https://api.github.com/repos/${forkRepo}/releases/tags/${encodeURIComponent(forkRelease.forkTag)}`,
    true
  )

  setOutput('source', 'upstream_tag')
  setOutput('upstream_tag', upstreamTag)
  setOutput('upstream_name', release.name || upstreamTag)
  setOutput(
    'upstream_url',
    release.html_url || `https://github.com/${upstreamRepo}/releases/tag/${upstreamTag}`
  )
  setOutput('upstream_prerelease', upstreamPrerelease ? 'true' : 'false')
  setOutput('fork_version', forkRelease.forkVersion)
  setOutput('fork_tag', forkRelease.forkTag)
  setOutput('axiom_revision', String(forkRelease.axiomRevision))
  setOutput('previous_axiom_revision', String(forkRelease.previousRevision))

  if (existingForkRelease && existingForkRelease.draft !== true && !args.forceRebuild) {
    setOutput('should_release', 'false')
    setOutput('reason', `fork_release_exists:${forkRelease.forkTag}`)
    return
  }

  setOutput('should_release', 'true')
  setOutput(
    'reason',
    existingForkRelease?.draft === true
      ? `fork_draft_release_exists:${forkRelease.forkTag}`
      : existingForkRelease && args.forceRebuild
        ? `forced_rebuild:${forkRelease.forkTag}`
        : forkRelease.previousRevision > 0 && args.bumpAxiomRevision
          ? `axiom_revision_bump:${forkRelease.forkTag}`
          : `new_upstream_release:${upstreamTag}->${forkRelease.forkTag}`
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
