#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const API_VERSION = '2022-11-28'

function envString(name, fallback = '') {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function run(command, args) {
  return execFileSync(command, args, { encoding: 'utf8' }).trim()
}

function githubHeaders() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

async function fetchUpstreamRelease(upstreamRepo, tag) {
  const res = await fetch(
    `https://api.github.com/repos/${upstreamRepo}/releases/tags/${encodeURIComponent(tag)}`,
    {
      headers: githubHeaders()
    }
  )
  if (!res.ok) {
    return null
  }
  return res.json()
}

function parseArgs(argv) {
  const args = { tag: '', output: 'axiom-release-notes.md' }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--tag') {
      args.tag = argv[++i] ?? ''
    } else if (argv[i] === '--output') {
      args.output = argv[++i] ?? args.output
    } else if (!args.tag) {
      args.tag = argv[i]
    }
  }
  return args
}

function previousReleaseTag(tag) {
  try {
    return run('git', ['describe', '--tags', '--abbrev=0', `${tag}^`])
  } catch {
    return ''
  }
}

function commitList(range) {
  try {
    return run('git', ['log', '--no-merges', '--pretty=format:- %s (%h)', range])
  } catch {
    return ''
  }
}

async function main() {
  const { tag, output } = parseArgs(process.argv.slice(2))
  if (!tag) {
    throw new Error(
      'Usage: node config/scripts/axiom-generate-release-notes.mjs <tag> [--output file]'
    )
  }

  const upstreamRepo = envString('AXIOM_UPSTREAM_REPOSITORY', 'stablyai/orca')
  const upstreamRelease = await fetchUpstreamRelease(upstreamRepo, tag)
  const previousTag = previousReleaseTag(tag)
  const range = previousTag ? `${previousTag}..HEAD` : 'HEAD'
  const axiomCommits = commitList(range)

  const upstreamBody = upstreamRelease?.body?.trim()
  const upstreamUrl =
    upstreamRelease?.html_url ?? `https://github.com/${upstreamRepo}/releases/tag/${tag}`

  const body = [
    `# Axiom Orca ${tag}`,
    '',
    `This Axiom build is published from our fork release feed, not from upstream Orca's feed.`,
    '',
    `## Upstream Orca`,
    '',
    `- Upstream release: ${upstreamUrl}`,
    upstreamRelease?.name ? `- Upstream title: ${upstreamRelease.name}` : null,
    '',
    upstreamBody ? upstreamBody : '_No upstream release notes were provided._',
    '',
    `## Axiom fork delta`,
    '',
    axiomCommits || '_No additional fork-local commits in this range._',
    '',
    `## Maintenance notes`,
    '',
    `- main remains a clean mirror of ${upstreamRepo}.`,
    `- Axiom changes ship from the deploy branch and update against GitHub Releases in this repository.`
  ]
    .filter((line) => line !== null)
    .join('\n')

  writeFileSync(output, `${body}\n`)
  console.log(`Wrote ${output}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
