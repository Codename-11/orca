#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const API_VERSION = '2022-11-28'
const DEFAULT_STATE_FILE = '~/.hermes/state/repository-dispatch-watcher.json'

function envString(name, fallback = '') {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function envFlag(name, fallback = false) {
  const value = envString(name)
  if (!value) {
    return fallback
  }
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

function expandHome(path) {
  if (!path.startsWith('~/')) {
    return path
  }
  const home = process.env.HOME || process.env.USERPROFILE
  if (!home) {
    throw new Error(`Cannot expand ${path}: HOME is not set`)
  }
  return resolve(home, path.slice(2))
}

function parseArgs(argv) {
  const args = {
    upstreamRepo: envString('WATCHER_UPSTREAM_REPOSITORY', 'stablyai/orca'),
    targetRepo: envString('WATCHER_TARGET_REPOSITORY', envString('GITHUB_REPOSITORY', '')),
    stateFile: envString('WATCHER_STATE_FILE', DEFAULT_STATE_FILE),
    upstreamBranch: envString('WATCHER_UPSTREAM_BRANCH', 'main'),
    includePrereleases: envFlag('WATCHER_INCLUDE_PRERELEASES', false),
    releaseEventType: envString('WATCHER_RELEASE_EVENT_TYPE', 'upstream_release'),
    mainEventType: envString('WATCHER_MAIN_EVENT_TYPE', 'upstream_main'),
    source: envString('WATCHER_SOURCE', 'hermes_watcher'),
    dryRun: false,
    json: false,
    verbose: false,
    useGhToken: envFlag('WATCHER_USE_GH_TOKEN', true),
    bootstrapDispatch: envFlag('WATCHER_BOOTSTRAP_DISPATCH', true),
    watchRelease: true,
    watchMain: true
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--upstream-repo') {
      args.upstreamRepo = argv[++i] ?? ''
    } else if (arg === '--target-repo') {
      args.targetRepo = argv[++i] ?? ''
    } else if (arg === '--state-file') {
      args.stateFile = argv[++i] ?? ''
    } else if (arg === '--upstream-branch') {
      args.upstreamBranch = argv[++i] ?? ''
    } else if (arg === '--release-event-type') {
      args.releaseEventType = argv[++i] ?? ''
    } else if (arg === '--main-event-type') {
      args.mainEventType = argv[++i] ?? ''
    } else if (arg === '--source') {
      args.source = argv[++i] ?? ''
    } else if (arg === '--include-prereleases') {
      args.includePrereleases = true
    } else if (arg === '--stable-only') {
      args.includePrereleases = false
    } else if (arg === '--dry-run') {
      args.dryRun = true
    } else if (arg === '--json') {
      args.json = true
    } else if (arg === '--verbose') {
      args.verbose = true
    } else if (arg === '--no-gh-token') {
      args.useGhToken = false
    } else if (arg === '--bootstrap-silent') {
      args.bootstrapDispatch = false
    } else if (arg === '--bootstrap-dispatch') {
      args.bootstrapDispatch = true
    } else if (arg === '--release-only') {
      args.watchRelease = true
      args.watchMain = false
    } else if (arg === '--main-only') {
      args.watchRelease = false
      args.watchMain = true
    }
  }

  return args
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

function newestSemverTag(tags, { includePrereleases }) {
  return tags
    .filter((tag) => parseVersion(tag))
    .filter((tag) => includePrereleases || parseVersion(tag).prerelease.length === 0)
    .sort((left, right) => compareVersions(right, left))[0]
}

function getGhToken({ useGhToken = true } = {}) {
  const token = envString('GH_TOKEN', envString('GITHUB_TOKEN'))
  if (token) {
    return token
  }
  if (!useGhToken) {
    return ''
  }
  try {
    return execFileSync('gh', ['auth', 'token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return ''
  }
}

function githubHeaders({ token = '' } = {}) {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

async function githubJson(url, { token = '', fetchImpl = fetch } = {}) {
  const res = await fetchImpl(url, { headers: githubHeaders({ token }) })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub request failed ${res.status} ${res.statusText}: ${body.slice(0, 300)}`)
  }
  return res.json()
}

async function githubPost(url, body, { token = '', fetchImpl = fetch } = {}) {
  if (!token) {
    throw new Error('GitHub token is required to dispatch repository events')
  }
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: {
      ...githubHeaders({ token }),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub dispatch failed ${res.status} ${res.statusText}: ${text.slice(0, 300)}`)
  }
}

async function getUpstreamSnapshot({
  upstreamRepo,
  upstreamBranch,
  includePrereleases,
  token,
  fetchImpl
}) {
  const [tags, branch] = await Promise.all([
    githubJson(`https://api.github.com/repos/${upstreamRepo}/tags?per_page=100`, {
      token,
      fetchImpl
    }),
    githubJson(
      `https://api.github.com/repos/${upstreamRepo}/git/ref/heads/${encodeURIComponent(upstreamBranch)}`,
      { token, fetchImpl }
    )
  ])

  if (!Array.isArray(tags)) {
    throw new Error(`GitHub tags response for ${upstreamRepo} was not an array`)
  }

  const releaseTag = newestSemverTag(
    tags
      .map((entry) => (typeof entry?.name === 'string' ? entry.name : ''))
      .filter((name) => /^v\d/.test(name)),
    { includePrereleases }
  )

  const mainSha = typeof branch?.object?.sha === 'string' ? branch.object.sha : ''
  if (!mainSha) {
    throw new Error(
      `GitHub branch ref response for ${upstreamRepo}/${upstreamBranch} did not include object.sha`
    )
  }

  return {
    upstreamRepo,
    upstreamBranch,
    releaseTag: releaseTag ?? '',
    mainSha
  }
}

function readState(stateFile) {
  const expanded = expandHome(stateFile)
  if (!existsSync(expanded)) {
    return null
  }
  return JSON.parse(readFileSync(expanded, 'utf8'))
}

function writeState(stateFile, state) {
  const expanded = expandHome(stateFile)
  mkdirSync(dirname(expanded), { recursive: true, mode: 0o700 })
  writeFileSync(expanded, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 })
}

function buildDispatches({
  current,
  previous,
  watchRelease,
  watchMain,
  releaseEventType,
  mainEventType,
  source
}) {
  if (!previous) {
    return []
  }

  const dispatches = []
  if (watchRelease && current.releaseTag && current.releaseTag !== previous.releaseTag) {
    dispatches.push({
      kind: 'release',
      eventType: releaseEventType,
      payload: {
        upstream_tag: current.releaseTag,
        previous_upstream_tag: previous.releaseTag ?? '',
        source
      }
    })
  }

  if (watchMain && current.mainSha && current.mainSha !== previous.mainSha) {
    dispatches.push({
      kind: 'main',
      eventType: mainEventType,
      payload: {
        ref: `refs/heads/${current.upstreamBranch}`,
        sha: current.mainSha,
        previous_sha: previous.mainSha ?? '',
        source
      }
    })
  }

  return dispatches
}

async function dispatchRepositoryEvent({ targetRepo, eventType, payload, token, fetchImpl }) {
  await githubPost(
    `https://api.github.com/repos/${targetRepo}/dispatches`,
    {
      event_type: eventType,
      client_payload: payload
    },
    { token, fetchImpl }
  )
}

async function runWatcher(options = {}) {
  const token = options.token ?? getGhToken({ useGhToken: options.useGhToken })
  const current = await getUpstreamSnapshot({
    upstreamRepo: options.upstreamRepo,
    upstreamBranch: options.upstreamBranch,
    includePrereleases: options.includePrereleases,
    token,
    fetchImpl: options.fetchImpl
  })
  const previous =
    options.previousState === undefined ? readState(options.stateFile) : options.previousState
  const comparisonState =
    previous ?? (options.bootstrapDispatch ? { releaseTag: '', mainSha: '' } : null)
  const dispatches = buildDispatches({
    current,
    previous: comparisonState,
    watchRelease: options.watchRelease,
    watchMain: options.watchMain,
    releaseEventType: options.releaseEventType,
    mainEventType: options.mainEventType,
    source: options.source
  })

  if (!options.dryRun) {
    if (previous || options.bootstrapDispatch) {
      for (const dispatch of dispatches) {
        await dispatchRepositoryEvent({
          targetRepo: options.targetRepo,
          eventType: dispatch.eventType,
          payload: dispatch.payload,
          token,
          fetchImpl: options.fetchImpl
        })
      }
    }
    writeState(options.stateFile, {
      ...current,
      updatedAt: new Date().toISOString()
    })
  }

  return {
    bootstrapped: !previous,
    current,
    previous,
    dispatches,
    dryRun: Boolean(options.dryRun)
  }
}

function redact(message) {
  return String(message).replace(/(Bearer\s+)[A-Za-z0-9._-]+/g, '$1[REDACTED]')
}

function buildFailureNotification(error, args) {
  const message = redact(error?.message ?? error)
  return [
    '🚨 **Dev Automation: Orca Upstream Dispatch Watcher**',
    'Status: `failure`',
    'Workflow: `Orca upstream repository dispatch`',
    `Repo: \`${args.targetRepo || 'unknown'}\``,
    `Upstream: \`${args.upstreamRepo || 'unknown'}\``,
    `Failure summary: ${message}`,
    '',
    '**Action**',
    '- Required: `yes`',
    '- Owner: `dev automation agent`',
    '- Next: inspect watcher auth/network/state, then rerun the watcher; if dispatch succeeded partially, verify the target GitHub Actions run before retrying.',
    '',
    '**Agent handoff**',
    '```text',
    `Repo: ${args.targetRepo || 'unknown'}`,
    `Upstream repo: ${args.upstreamRepo || 'unknown'}`,
    `State file: ${args.stateFile || 'unknown'}`,
    'Start here:',
    'cd /home/bailey/orca',
    `node config/scripts/hermes-repository-dispatch-watcher.mjs --upstream-repo ${args.upstreamRepo || '<upstream>'} --target-repo ${args.targetRepo || '<target>'} --state-file ${args.stateFile || '<state-file>'} --dry-run --verbose`,
    `gh run list --repo ${args.targetRepo || '<target>'} --limit 5`,
    'Classify: informational / auto-retry likely / actionable.',
    '```'
  ].join('\n')
}

async function main(args = parseArgs(process.argv.slice(2))) {
  if (!args.targetRepo) {
    throw new Error('WATCHER_TARGET_REPOSITORY or --target-repo must be set')
  }
  const result = await runWatcher(args)
  if (args.json || args.verbose || args.dryRun) {
    console.log(JSON.stringify(result, null, 2))
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2))
  main(args).catch((error) => {
    console.error(buildFailureNotification(error, args))
    process.exitCode = 1
  })
}

export {
  buildDispatches,
  buildFailureNotification,
  compareVersions,
  newestSemverTag,
  parseArgs,
  parseVersion,
  runWatcher
}
