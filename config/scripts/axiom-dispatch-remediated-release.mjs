import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

import { parseAxiomReleaseTag } from './axiom-release-versioning.mjs'

const API_VERSION = '2022-11-28'
const RELEASE_WORKFLOW = 'axiom-upstream-sync-release.yml'
const DEPLOY_BRANCH = 'axiom/deploy'
const BOT_BRANCH_PREFIX = 'bot/upstream-sync-'

function envString(name, fallback = '') {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function githubHeaders() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN is required to dispatch the remediated release')
  }
  return {
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': API_VERSION,
    Authorization: `Bearer ${token}`
  }
}

function readEvent() {
  const eventPath = envString('GITHUB_EVENT_PATH')
  if (!eventPath) {
    return null
  }
  return JSON.parse(readFileSync(eventPath, 'utf8'))
}

function matchLine(body, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = String(body ?? '').match(
    new RegExp(String.raw`^- ${escapedLabel}:\s*\`?([^\n\`]+)\`?`, 'm')
  )
  return match?.[1]?.trim() ?? ''
}

export function extractRemediatedRelease({ pullRequest }) {
  if (!pullRequest?.merged) {
    return { shouldDispatch: false, reason: 'pull_request_not_merged' }
  }

  const baseRef = pullRequest.base?.ref ?? ''
  if (baseRef !== DEPLOY_BRANCH) {
    return { shouldDispatch: false, reason: `unexpected_base:${baseRef || 'unknown'}` }
  }

  const headRef = pullRequest.head?.ref ?? ''
  if (!headRef.startsWith(BOT_BRANCH_PREFIX)) {
    return { shouldDispatch: false, reason: `non_remediation_branch:${headRef || 'unknown'}` }
  }

  const body = pullRequest.body ?? ''
  const tagFromBody = matchLine(body, 'Upstream ref/tag') || matchLine(body, 'Upstream tag')
  const forkTagFromBody =
    matchLine(body, 'Intended fork tag') ||
    matchLine(body, 'Intended Axiom version/tag').split('/').at(-1)?.trim() ||
    ''
  const branchSuffix = headRef.slice(BOT_BRANCH_PREFIX.length)
  const parsedBranchTag = parseAxiomReleaseTag(branchSuffix)
  const parsedBodyTag = parseAxiomReleaseTag(forkTagFromBody)
  const upstreamTag =
    tagFromBody || parsedBranchTag?.upstreamTag || parsedBodyTag?.upstreamTag || ''
  const forkTag = forkTagFromBody || parsedBranchTag?.forkTag || ''

  if (!upstreamTag || upstreamTag === 'unknown') {
    return { shouldDispatch: false, reason: 'missing_upstream_tag', headRef, forkTag }
  }

  return {
    shouldDispatch: true,
    reason: 'remediation_merged',
    upstreamTag,
    forkTag,
    headRef,
    pullRequestNumber: pullRequest.number
  }
}

async function dispatchRelease({ repository, upstreamTag }) {
  const response = await fetch(
    `https://api.github.com/repos/${repository}/actions/workflows/${RELEASE_WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: githubHeaders(),
      body: JSON.stringify({
        ref: DEPLOY_BRANCH,
        inputs: {
          upstream_tag: upstreamTag,
          dry_run: 'false',
          build_mobile: 'false',
          force_rebuild: 'false',
          bump_axiom_revision: 'false'
        }
      })
    }
  )

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `Failed to dispatch ${RELEASE_WORKFLOW}: ${response.status} ${response.statusText} ${body.slice(0, 300)}`
    )
  }
}

async function main() {
  const event = readEvent()
  const result = extractRemediatedRelease({ pullRequest: event?.pull_request })
  if (!result.shouldDispatch) {
    console.log(`Skipping remediated release dispatch: ${result.reason}`)
    return
  }

  const repository = envString('GITHUB_REPOSITORY')
  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required to dispatch the remediated release')
  }

  await dispatchRelease({ repository, upstreamTag: result.upstreamTag })
  console.log(
    `Dispatched ${RELEASE_WORKFLOW} for remediated upstream release ${result.upstreamTag} from PR #${result.pullRequestNumber ?? 'unknown'}.`
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
