import { execFileSync } from 'node:child_process'
import { createHmac } from 'node:crypto'
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

const API_VERSION = '2022-11-28'
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

function runRequired(command, args) {
  return execFileSync(command, args, { encoding: 'utf8', stdio: 'pipe' }).trim()
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
      severity: 'critical',
      reason: `Protected Axiom files were deleted: ${protectedDeletions.join(', ')}`,
      protectedDeletions
    }
  }

  const identityConflicts = conflicts.filter((file) =>
    matchesAnyPath(file, policy.protectedIdentityPaths)
  )
  if (identityConflicts.length) {
    return {
      action: 'auto_remediate',
      severity: 'noncritical',
      reason: `Fork identity/update-feed files need policy-guided agent remediation: ${identityConflicts.join(', ')}`,
      identityConflicts
    }
  }

  return {
    action: 'auto_remediate',
    severity: 'noncritical',
    reason: 'Conflicts are eligible for agent PR remediation.'
  }
}

function branchNameFor(policy) {
  const upstreamRef = envString('AXIOM_UPSTREAM_REF', envString('AXIOM_UPSTREAM_TAG', 'unknown'))
  const forkTag = envString('AXIOM_FORK_TAG')
  const branchSuffix = (forkTag || upstreamRef || 'manual').replace(/[^A-Za-z0-9._-]+/g, '-')
  return `${policy.branchPrefix ?? 'bot/upstream-sync-'}${branchSuffix}`
}

function buildPrompt({ classification, conflicts, statusRecords, policy, branchName, prUrl = '' }) {
  const upstreamRef = envString('AXIOM_UPSTREAM_REF', envString('AXIOM_UPSTREAM_TAG', 'unknown'))
  const forkTag = envString('AXIOM_FORK_TAG', 'unknown')
  const forkVersion = envString('AXIOM_FORK_VERSION', 'unknown')
  const deployBranch = envString('AXIOM_DEPLOY_BRANCH', policy.targetBranch ?? 'axiom/deploy')
  const checks = (policy.requiredChecks ?? []).map((check) => `- ${check}`).join('\n')
  const status = statusRecords.map((record) => `${record.status} ${record.path}`).join('\n')

  return `Resolve the Axiom Orca upstream merge conflict with an agent PR, not a direct push.

Context:
- Upstream ref/tag: ${upstreamRef}
- Intended fork tag: ${forkTag}
- Intended fork version: ${forkVersion}
- Target branch: ${deployBranch}
- Bot branch: ${branchName}
- Pull request: ${prUrl || 'will be created/updated by the remediation workflow'}
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
2. Resolve conflicts while preserving Axiom fork identity, updater feed, side-by-side installer identity, profile portability, and Forge provider changes.
3. Do not remove protected Axiom files unless they are intentionally superseded and the PR explains why.
4. Run the required checks:
${checks}
5. Push only ${branchName} and open/update a PR into ${deployBranch}; do not push directly to ${deployBranch}.
6. Auto-merge only after checks are green and fork invariant guards pass.`
}
function remediationBody({ classification, conflicts, statusRecords, policy, branchName }) {
  const upstreamRef = envString('AXIOM_UPSTREAM_REF', envString('AXIOM_UPSTREAM_TAG', 'unknown'))
  const forkTag = envString('AXIOM_FORK_TAG', 'unknown')
  const forkVersion = envString('AXIOM_FORK_VERSION', 'unknown')
  const deployBranch = envString('AXIOM_DEPLOY_BRANCH', policy.targetBranch ?? 'axiom/deploy')
  const checks = (policy.requiredChecks ?? []).map((check) => `- [ ] \`${check}\``).join('\n')
  const status = statusRecords.map((record) => `${record.status} ${record.path}`).join('\n')
  return `## Axiom Orca upstream sync remediation

- Original Actions run: ${getRunUrl() || 'unknown'}
- Upstream ref/tag: ${upstreamRef}
- Intended Axiom version/tag: ${forkVersion} / ${forkTag}
- Target branch: \`${deployBranch}\`
- Bot branch: \`${branchName}\`
- Classification: \`${classification.action}\` — ${classification.reason}

## Conflicted files
${conflicts.map((file) => `- \`${file}\``).join('\n') || '- none captured'}

## Captured git status
\`\`\`
${status || 'No status records captured.'}
\`\`\`

## Axiom safety notes
- Bot branch PR only; do not push conflict remediation directly to \`${deployBranch}\`.
- Preserve side-by-side identity, updater feed, fork semver, profile portability, and Forge provider/task-registry additions.
- Protected-file deletion or fork identity/update-feed changes require explicit review before merge.

## Verification checklist
${checks}
`
}

function writeRemediationMetadata({
  classification,
  conflicts,
  statusRecords,
  policy,
  branchName
}) {
  const forkTag = envString('AXIOM_FORK_TAG', branchName).replace(/[^A-Za-z0-9._-]+/g, '-')
  const path = `config/axiom-remediations/${forkTag}.md`
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(
    path,
    `${remediationBody({ classification, conflicts, statusRecords, policy, branchName })}\n`,
    'utf8'
  )
  return path
}

function githubHeaders() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN is required to create Axiom remediation PRs')
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

async function findOpenPullRequest(repo, branchName, targetBranch) {
  const owner = repo.split('/')[0]
  const pulls = await githubJson(
    `https://api.github.com/repos/${repo}/pulls?state=open&head=${encodeURIComponent(`${owner}:${branchName}`)}&base=${encodeURIComponent(targetBranch)}&per_page=10`
  )
  return Array.isArray(pulls) ? pulls[0] : null
}

async function createOrUpdatePullRequest({
  classification,
  conflicts,
  statusRecords,
  policy,
  branchName
}) {
  const repo = envString('GITHUB_REPOSITORY')
  if (!repo) {
    throw new Error('GITHUB_REPOSITORY is required to create Axiom remediation PRs')
  }
  const targetBranch = envString('AXIOM_DEPLOY_BRANCH', policy.targetBranch ?? 'axiom/deploy')
  const body = remediationBody({ classification, conflicts, statusRecords, policy, branchName })
  const title = `chore(axiom): remediate upstream sync ${envString('AXIOM_UPSTREAM_TAG', envString('AXIOM_UPSTREAM_REF', 'unknown'))}`
  const existing = await findOpenPullRequest(repo, branchName, targetBranch)
  if (existing) {
    await githubJson(`https://api.github.com/repos/${repo}/issues/${existing.number}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, body })
    })
    return existing.html_url
  }
  const created = await githubJson(`https://api.github.com/repos/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({ title, body, head: branchName, base: targetBranch, draft: false })
  })
  return created.html_url
}

async function createBotBranchAndPr({ classification, conflicts, statusRecords, policy }) {
  const branchName = branchNameFor(policy)
  const targetBranch = envString('AXIOM_DEPLOY_BRANCH', policy.targetBranch ?? 'axiom/deploy')

  // The failed merge left unmerged index entries. Start the PR branch from the
  // protected deploy branch and make a metadata commit that an agent can build on.
  run('git', ['merge', '--abort'])
  runRequired('git', ['fetch', 'origin', targetBranch, '--prune'])
  runRequired('git', ['checkout', '-B', branchName, `origin/${targetBranch}`])
  const metadataPath = writeRemediationMetadata({
    classification,
    conflicts,
    statusRecords,
    policy,
    branchName
  })
  runRequired('git', ['add', metadataPath])
  const changed = run('git', ['diff', '--cached', '--name-only'])
  if (changed) {
    runRequired('git', [
      'commit',
      '-m',
      `chore(axiom): request upstream sync remediation for ${envString('AXIOM_UPSTREAM_TAG', 'upstream')}`
    ])
  }
  runRequired('git', ['push', '--force-with-lease', 'origin', `HEAD:${branchName}`])
  const prUrl = await createOrUpdatePullRequest({
    classification,
    conflicts,
    statusRecords,
    policy,
    branchName
  })
  return { branchName, prUrl }
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
  let branchName = branchNameFor(policy)
  let prUrl = ''

  if (mode !== 'disabled' && classification.action === 'auto_remediate') {
    const created = await createBotBranchAndPr({ classification, conflicts, statusRecords, policy })
    branchName = created.branchName
    prUrl = created.prUrl
  }

  const prompt = buildPrompt({
    classification,
    conflicts,
    statusRecords,
    policy,
    branchName,
    prUrl
  })
  const payload = {
    source: 'axiom-orca-upstream-sync',
    mode,
    action: classification.action,
    severity: classification.severity ?? 'noncritical',
    reason: classification.reason,
    upstreamRef: envString('AXIOM_UPSTREAM_REF', envString('AXIOM_UPSTREAM_TAG', 'unknown')),
    forkTag: envString('AXIOM_FORK_TAG', 'unknown'),
    forkVersion: envString('AXIOM_FORK_VERSION', 'unknown'),
    branchName,
    prUrl,
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
      `## Axiom merge remediation webhook not configured\n\nCreated/updated remediation PR: ${prUrl || 'unavailable'}\n\nSet AXIOM_SYNC_REMEDIATION_WEBHOOK to let Hermes pick up the bot PR automatically.\n\n${prompt}`
    )
    console.log(
      'Axiom merge remediation webhook not configured; created PR and wrote step summary fallback.'
    )
    return
  }

  console.log(`Requested Axiom merge remediation via Hermes webhook for ${prUrl}.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
