#!/usr/bin/env node

import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

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
  const args = { upstreamTag: '', includePrereleases: false }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--upstream-tag') {
      args.upstreamTag = argv[++i] ?? ''
    } else if (arg === '--include-prereleases') {
      args.includePrereleases = true
    }
  }
  return args
}

async function getCandidateRelease({ upstreamRepo, upstreamTag, includePrereleases }) {
  if (upstreamTag) {
    return githubJson(`https://api.github.com/repos/${upstreamRepo}/releases/tags/${encodeURIComponent(upstreamTag)}`)
  }

  const releases = await githubJson(`https://api.github.com/repos/${upstreamRepo}/releases?per_page=20`)
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
    await setOutput('should_release', 'false')
    await setOutput('reason', 'no_upstream_release')
    return
  }

  const tag = release.tag_name
  const existing = await githubJson(
    `https://api.github.com/repos/${forkRepo}/releases/tags/${encodeURIComponent(tag)}`,
    true
  )

  await setOutput('upstream_tag', tag)
  await setOutput('upstream_name', release.name || tag)
  await setOutput('upstream_url', release.html_url || `https://github.com/${upstreamRepo}/releases/tag/${tag}`)
  await setOutput('upstream_prerelease', release.prerelease ? 'true' : 'false')

  if (existing && existing.draft !== true) {
    await setOutput('should_release', 'false')
    await setOutput('reason', `fork_release_exists:${tag}`)
    return
  }

  await setOutput('should_release', 'true')
  await setOutput(
    'reason',
    existing?.draft === true ? `fork_draft_release_exists:${tag}` : `new_upstream_release:${tag}`
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
