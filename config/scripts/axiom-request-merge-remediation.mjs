#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { createHmac } from 'node:crypto'
import { appendFileSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const POLICY_PATH = 'config/axiom-merge-remediation-policy.json'

function envString(name, fallback = '') {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
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
        .map((line) => line.trimEnd())
        .filter(Boolean)
    : []
}

function loadPolicy(path = POLICY_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/__DOUBLE_STAR__/g, '.*')
  return new RegExp(`^${escaped}$`)
}

function matchesAnyPath(file, patterns = []) {
  return patterns.some((pattern) => globToRegExp(pattern).test(file))
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

function getStatusRecords() {
  return splitLines(run('git', ['status', '--porcelain'])).map((line) => {
    const status = line.slice(0, 2)
    const path = line.slice(3).replace(/^"|"$/g, '')
    return { status, path, deleted: status.includes('D') }
  })
}

export function classifyMergeRemediation({ conflicts, statusRecords, policy }) {
  if (!conflicts.length) {
    return { action: 'none', reason: 'No conflicted files were captured for remediation.' }
  }

  const protectedDeletions = statusRecords
    .filter(
      (record) => record.deleted && matchesAnyPath(record.path, policy.protectedDeletionPaths)
    )
    .map((record) => record.path)
  if (protectedDeletions.length) {
    return {
      action: 'review_required',
      reason: `Protected Axiom files were deleted: ${protectedDeletions.join(', ')}`,
      protectedDeletions
    }
  }

  const identityConflicts = conflicts.filter((file) =>
    matchesAnyPath(file, policy.protectedIdentityPaths)
  )
  if (identityConflicts.length) {
    return {
      action: 'review_required',
      reason: `Fork identity/update-feed files conflicted: ${identityConflicts.join(', ')}`,
      identityConflicts
    }
  }

  return {
    action: 'auto_remediate',
    reason: 'Conflicts are eligible for agent PR remediation.'
  }
}

function buildPrompt({ classification, conflicts, statusRecords, policy }) {
  const upstreamRef = envString('AXIOM_UPSTREAM_REF', envString('AXIOM_UPSTREAM_TAG', 'unknown'))
  const forkTag = envString('AXIOM_FORK_TAG', 'unknown')
  const forkVersion = envString('AXIOM_FORK_VERSION', 'unknown')
  const deployBranch = envString('AXIOM_DEPLOY_BRANCH', policy.targetBranch ?? 'axiom/deploy')
  const branchSuffix = (forkTag || upstreamRef || 'manual').replace(/[^A-Za-z0-9._-]+/g, '-')
  const branchName = `${policy.branchPrefix ?? 'bot/upstream-sync-'}${branchSuffix}`
  const checks = (policy.requiredChecks ?? []).map((check) => `- ${check}`).join('\n')
  const status = statusRecords.map((record) => `${record.status} ${record.path}`).join('\n')

  return `Resolve the Axiom Orca upstream merge conflict with an agent PR, not a direct push.

Context:
- Upstream ref/tag: ${upstreamRef}
- Intended fork tag: ${forkTag}
- Intended fork version: ${forkVersion}
- Target branch: ${deployBranch}
- Bot branch: ${branchName}
- Actions run: ${getRunUrl() || 'unknown'}
- Remediation classification: ${classification.action} (${classification.reason})

Conflicted files:
${conflicts.map((file) => `- ${file}`).join('\n')}

Git status:
\`\`\`
${status || 'No status records captured.'}
\`\`\`

Instructions:
1. Checkout ${deployBranch}, create/update ${branchName}, and reproduce the upstream merge conflict.
2. Resolve conflicts while preserving Axiom fork identity, updater feed, side-by-side installer identity, and Forge provider changes.
3. Do not remove protected Axiom files unless they are intentionally superseded and the PR explains why.
4. Run the required checks:
${checks}
5. Open or update a PR from ${branchName} into ${deployBranch}. Do not push directly to ${deployBranch}.
6. Include the Actions run URL and conflict summary in the PR body.`
}

async function postWebhook(payload) {
  const webhook = envString('AXIOM_SYNC_REMEDIATION_WEBHOOK')
  if (!webhook) {
    return false
  }

  const body = JSON.stringify(payload)
  const secret = envString('AXIOM_SYNC_REMEDIATION_TOKEN')
  const headers = { 'Content-Type': 'application/json' }
  if (secret) {
    // Hermes webhook subscriptions validate GitHub-style HMAC signatures.
    headers['X-Hub-Signature-256'] =
      `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  }

  const res = await fetch(webhook, {
    method: 'POST',
    headers,
    body
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `Remediation webhook failed ${res.status} ${res.statusText}: ${body.slice(0, 300)}`
    )
  }
  return true
}

function writeStepSummary(message) {
  const summaryPath = envString('GITHUB_STEP_SUMMARY')
  if (summaryPath) {
    appendFileSync(summaryPath, `${message}\n`)
  }
}

export async function main() {
  const mode = envString('AXIOM_REMEDIATION_MODE', 'agent_pr')
  const policy = loadPolicy()
  const conflicts = getConflictFiles()
  const statusRecords = getStatusRecords()
  const classification = classifyMergeRemediation({ conflicts, statusRecords, policy })
  const prompt = buildPrompt({ classification, conflicts, statusRecords, policy })
  const payload = {
    source: 'axiom-orca-upstream-sync',
    mode,
    action: classification.action,
    reason: classification.reason,
    upstreamRef: envString('AXIOM_UPSTREAM_REF', envString('AXIOM_UPSTREAM_TAG', 'unknown')),
    forkTag: envString('AXIOM_FORK_TAG', 'unknown'),
    forkVersion: envString('AXIOM_FORK_VERSION', 'unknown'),
    runUrl: getRunUrl(),
    conflicts,
    status: statusRecords,
    prompt
  }

  if (mode === 'disabled' || classification.action !== 'auto_remediate') {
    writeStepSummary(`## Axiom merge remediation\n\n${classification.reason}\n`)
    console.log(`Axiom merge remediation skipped: ${classification.reason}`)
    return
  }

  const posted = await postWebhook(payload)
  if (!posted) {
    writeStepSummary(
      `## Axiom merge remediation webhook not configured\n\nSet AXIOM_SYNC_REMEDIATION_WEBHOOK to let Hermes create a bot PR automatically.\n\n${prompt}`
    )
    console.log('Axiom merge remediation webhook not configured; wrote step summary fallback.')
    return
  }

  console.log('Requested Axiom merge remediation via Hermes webhook.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
