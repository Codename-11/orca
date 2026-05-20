#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const API_VERSION = '2022-11-28'
const ISSUE_LABEL = 'axiom-upstream-sync'
const ISSUE_TITLE = '[Axiom Orca] Upstream sync blocked'

function envString(name, fallback = '') {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function githubHeaders() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN is required for sync failure notification')
  }
  return {
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': API_VERSION,
    Authorization: `Bearer ${token}`
  }
}

async function githubJson(url, options = {}) {
  const res = await fetch(url, { headers: githubHeaders(), ...options })
  if (res.status === 404 && options.ok404) {
    return null
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub request failed ${res.status} ${res.statusText}: ${body.slice(0, 300)}`)
  }
  if (res.status === 204) {
    return null
  }
  return res.json()
}

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: 'utf8', stdio: 'pipe' }).trim()
  } catch {
    return ''
  }
}

function splitLines(output) {
  return output
    ? output
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : []
}

function getRunUrl() {
  const server = envString('GITHUB_SERVER_URL', 'https://github.com')
  const repo = envString('GITHUB_REPOSITORY')
  const runId = envString('GITHUB_RUN_ID')
  return repo && runId ? `${server}/${repo}/actions/runs/${runId}` : ''
}

function getConflictFiles() {
  return splitLines(run('git', ['diff', '--name-only', '--diff-filter=U']))
}

function getStatusLines() {
  return splitLines(run('git', ['status', '--short'])).slice(0, 40)
}

function issueBody() {
  const conflicts = getConflictFiles()
  const status = getStatusLines()
  const upstreamTag = envString('AXIOM_UPSTREAM_TAG', envString('UPSTREAM_TAG', 'unknown'))
  const upstreamRef = envString('AXIOM_UPSTREAM_REF', upstreamTag)
  const forkTag = envString('AXIOM_FORK_TAG', envString('FORK_TAG', 'unknown'))
  const forkVersion = envString('AXIOM_FORK_VERSION', envString('FORK_VERSION', 'unknown'))
  const deployBranch = envString('AXIOM_DEPLOY_BRANCH', 'axiom/deploy')
  const failedStep = envString('AXIOM_FAILED_STEP', 'Axiom upstream sync workflow')
  const runUrl = getRunUrl()
  const conflictBlock =
    conflicts.length > 0 ? conflicts.map((file) => `- ${file}`).join('\n') : '- none reported'
  const statusBlock = status.length > 0 ? status.join('\n') : 'No git status output captured.'

  return (
    `Axiom Orca upstream sync is blocked and no release was published.\n\n` +
    `## Failure\n` +
    `- Failed step: ${failedStep}\n` +
    `- Upstream ref/tag: ${upstreamRef}\n` +
    `- Fork branch: ${deployBranch}\n` +
    `- Intended fork tag: ${forkTag}\n` +
    `- Intended app version: ${forkVersion}\n` +
    `- Run URL: ${runUrl || 'unknown'}\n\n` +
    `## Conflicted files\n${conflictBlock}\n\n` +
    `## Git status\n\`\`\`\n${statusBlock}\n\`\`\`\n\n` +
    `## Resolution\n` +
    `Resolve the upstream merge on \`${deployBranch}\`, preserve Axiom identity/update settings and Forge provider changes, then rerun the workflow. The workflow must remain silent on success and must not tag or publish until guards and tests pass.\n`
  )
}

async function ensureLabel(repo) {
  const url = `https://api.github.com/repos/${repo}/labels/${encodeURIComponent(ISSUE_LABEL)}`
  const existing = await githubJson(url, { ok404: true })
  if (existing) {
    return
  }
  await githubJson(`https://api.github.com/repos/${repo}/labels`, {
    method: 'POST',
    body: JSON.stringify({
      name: ISSUE_LABEL,
      color: 'B60205',
      description: 'Axiom Orca upstream sync and release automation failures'
    })
  })
}

async function findOpenIssue(repo) {
  const issues = await githubJson(
    `https://api.github.com/repos/${repo}/issues?state=open&labels=${encodeURIComponent(ISSUE_LABEL)}&per_page=20`
  )
  return Array.isArray(issues)
    ? issues.find(
        (issue) => issue?.pull_request === undefined && issue?.title?.startsWith(ISSUE_TITLE)
      )
    : null
}

async function upsertIssue() {
  const repo = envString('GITHUB_REPOSITORY')
  if (!repo) {
    throw new Error('GITHUB_REPOSITORY is required for sync failure notification')
  }
  await ensureLabel(repo)
  const existing = await findOpenIssue(repo)
  const body = issueBody()
  if (existing) {
    await githubJson(`https://api.github.com/repos/${repo}/issues/${existing.number}`, {
      method: 'PATCH',
      body: JSON.stringify({ body, labels: [ISSUE_LABEL] })
    })
    console.log(`Updated Axiom upstream sync issue #${existing.number}`)
    return
  }
  const created = await githubJson(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    body: JSON.stringify({ title: ISSUE_TITLE, body, labels: [ISSUE_LABEL] })
  })
  console.log(`Created Axiom upstream sync issue #${created.number}`)
}

async function postDiscordIfConfigured() {
  const webhook = envString('AXIOM_SYNC_DISCORD_WEBHOOK')
  if (!webhook) {
    return
  }
  const runUrl = getRunUrl()
  const upstreamTag = envString('AXIOM_UPSTREAM_TAG', 'unknown')
  const forkTag = envString('AXIOM_FORK_TAG', 'unknown')
  const conflicts = getConflictFiles()
  const content = [
    `Axiom Orca upstream sync blocked: ${upstreamTag} -> ${forkTag}`,
    runUrl,
    conflicts.length > 0 ? `Conflicts: ${conflicts.join(', ')}` : 'No conflicted files captured.'
  ]
    .filter(Boolean)
    .join('\n')
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  })
}

async function main() {
  await upsertIssue()
  await postDiscordIfConfigured()
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
