#!/usr/bin/env node

import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolveForkReleaseVersion } from './axiom-release-versioning.mjs'

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
    includePrereleases: false,
    forceRebuild: false,
    bumpAxiomRevision: false,
    axiomRevision: ''
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--upstream-tag') {
      args.upstreamTag = argv[++i] ?? ''
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
    return githubJson(
      `https://api.github.com/repos/${upstreamRepo}/releases/tags/${encodeURIComponent(upstreamTag)}`
    )
  }

  const releases = await githubJson(
    `https://api.github.com/repos/${upstreamRepo}/releases?per_page=20`
  )
  if (!Array.isArray(releases)) {
    throw new Error(`GitHub releases response for ${upstreamRepo} was not an array`)
  }
  return (
    releases.find(
      (release) =>
        release &&
        release.draft !== true &&
        (includePrereleases || release.prerelease !== true) &&
        typeof release.tag_name === 'string' &&
        /^v\d/.test(release.tag_name)
    ) ?? null
  )
}

async function listForkReleaseTags(forkRepo) {
  const releases = await githubJson(`https://api.github.com/repos/${forkRepo}/releases?per_page=100`)
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

  setOutput('upstream_tag', upstreamTag)
  setOutput('upstream_name', release.name || upstreamTag)
  setOutput(
    'upstream_url',
    release.html_url || `https://github.com/${upstreamRepo}/releases/tag/${upstreamTag}`
  )
  setOutput('upstream_prerelease', release.prerelease ? 'true' : 'false')
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
