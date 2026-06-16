import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

import { forkTagForVersion, parseAxiomReleaseTag } from './axiom-release-versioning.mjs'

const API_VERSION = '2022-11-28'
const MAX_RELEASE_NOTES_BODY_LENGTH = 120_000
const MAX_UPSTREAM_NOTES_LENGTH = 70_000
const MAX_FORK_DELTA_LENGTH = 35_000

function truncateMarkdown(value, maxLength, label) {
  if (value.length <= maxLength) {
    return value
  }
  const omitted = value.length - maxLength
  return `${value.slice(0, maxLength).trimEnd()}\n\n_Trimmed ${omitted.toLocaleString('en-US')} characters from ${label} to stay under GitHub release body limits._`
}

function envString(name, fallback = '') {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function run(command, args) {
  return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
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
  const args = {
    tag: '',
    output: 'axiom-release-notes.md',
    deviationNotes: envString('AXIOM_RELEASE_DEVIATION_NOTES_FILE'),
    forkTag: envString('AXIOM_FORK_TAG'),
    forkVersion: envString('AXIOM_FORK_VERSION')
  }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--tag') {
      args.tag = argv[++i] ?? ''
    } else if (argv[i] === '--output') {
      args.output = argv[++i] ?? args.output
    } else if (argv[i] === '--deviation-notes') {
      args.deviationNotes = argv[++i] ?? args.deviationNotes
    } else if (argv[i] === '--fork-tag') {
      args.forkTag = argv[++i] ?? args.forkTag
    } else if (argv[i] === '--fork-version') {
      args.forkVersion = argv[++i] ?? args.forkVersion
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

function localTags() {
  try {
    return run('git', ['tag', '--list'])
      .split('\n')
      .map((tag) => tag.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

export function nearestPriorAxiomReleaseTag({ existingTags = [], upstreamTag, forkTag }) {
  const current = parseAxiomReleaseTag(forkTag)
  if (!current || current.upstreamTag !== upstreamTag) {
    return ''
  }

  return (
    existingTags
      .map((tag) => parseAxiomReleaseTag(tag))
      .filter(
        (parsed) =>
          parsed &&
          parsed.upstreamTag === upstreamTag &&
          parsed.axiomRevision < current.axiomRevision
      )
      .sort((a, b) => b.axiomRevision - a.axiomRevision)[0]?.forkTag ?? ''
  )
}

export function forkCommitBaseline({
  existingTags = [],
  upstreamTag,
  forkTag,
  previousAxiomTag = ''
}) {
  return (
    nearestPriorAxiomReleaseTag({ existingTags, upstreamTag, forkTag }) ||
    previousAxiomTag ||
    upstreamTag
  )
}

function refExists(ref) {
  if (!ref) {
    return false
  }
  try {
    run('git', ['rev-parse', '--verify', '--quiet', ref])
    return true
  } catch {
    return false
  }
}

function previousAxiomReleaseTag(ref = 'HEAD') {
  const describeRef = refExists(ref) ? `${ref}^` : 'HEAD^'
  try {
    return run('git', ['describe', '--tags', '--abbrev=0', '--match', 'axiom-v*', describeRef])
  } catch {
    return ''
  }
}

function resolveForkTag({ forkTag, forkVersion }) {
  if (forkTag) {
    return forkTag
  }
  if (forkVersion) {
    return forkTagForVersion(forkVersion)
  }
  try {
    return forkTagForVersion(JSON.parse(readFileSync('package.json', 'utf8')).version)
  } catch {
    return ''
  }
}

function resolveBaselineRef(ref) {
  if (!ref) {
    return ''
  }
  try {
    run('git', ['rev-parse', '--verify', '--quiet', ref])
    return ref
  } catch {
    const upstreamTagRef = `refs/remotes/upstream-tags/${ref}`
    try {
      run('git', ['rev-parse', '--verify', '--quiet', upstreamTagRef])
      return upstreamTagRef
    } catch {
      return ref
    }
  }
}

function commitList(range, excludedRefs = []) {
  try {
    return run('git', [
      'log',
      '--no-merges',
      '--pretty=format:- %s (%h)',
      range,
      ...excludedRefs.flatMap((ref) => (ref ? ['--not', ref] : []))
    ])
  } catch {
    return ''
  }
}

function readOptionalMarkdown(filePath) {
  if (!filePath) {
    return ''
  }
  try {
    return readFileSync(filePath, 'utf8').trim()
  } catch {
    return ''
  }
}

async function main() {
  const { tag, output, deviationNotes, forkTag, forkVersion } = parseArgs(process.argv.slice(2))
  if (!tag) {
    throw new Error(
      'Usage: node config/scripts/axiom-generate-release-notes.mjs <tag> [--output file] [--deviation-notes file] [--fork-tag tag] [--fork-version version]'
    )
  }

  const upstreamRepo = envString('AXIOM_UPSTREAM_REPOSITORY', 'stablyai/orca')
  const upstreamRelease = await fetchUpstreamRelease(upstreamRepo, tag)
  const resolvedForkTag = resolveForkTag({ forkTag, forkVersion })
  const previousAxiomTag = previousAxiomReleaseTag(resolvedForkTag)
  const baseline = forkCommitBaseline({
    existingTags: localTags(),
    upstreamTag: tag,
    forkTag: resolvedForkTag,
    previousAxiomTag
  })
  const rangeBase = resolveBaselineRef(baseline || previousReleaseTag(tag))
  const upstreamExclude = baseline && baseline !== tag ? resolveBaselineRef(tag) : ''
  const range = rangeBase ? `${rangeBase}..HEAD` : 'HEAD'
  const axiomCommits = commitList(range, [upstreamExclude])

  const upstreamBody = truncateMarkdown(
    upstreamRelease?.body?.trim() || '_No upstream release notes were provided._',
    MAX_UPSTREAM_NOTES_LENGTH,
    'upstream release notes'
  )
  const upstreamUrl =
    upstreamRelease?.html_url ?? `https://github.com/${upstreamRepo}/releases/tag/${tag}`
  const forkDelta = truncateMarkdown(
    axiomCommits || '_No additional fork-local commits in this range._',
    MAX_FORK_DELTA_LENGTH,
    'Axiom fork commit list'
  )
  const patchNotes = truncateMarkdown(
    readOptionalMarkdown(deviationNotes) ||
      '_No agent-generated Axiom patch notes were provided for this release._',
    MAX_FORK_DELTA_LENGTH,
    'Axiom patch notes'
  )

  const body = truncateMarkdown(
    [
      `# Axiom Orca ${tag}`,
      '',
      `This Axiom build is published from our fork release feed, not from upstream Orca's feed.`,
      '',
      `## Upstream Orca`,
      '',
      `- Upstream release: ${upstreamUrl}`,
      upstreamRelease?.name ? `- Upstream title: ${upstreamRelease.name}` : null,
      '',
      upstreamBody,
      '',
      `## Axiom patch notes`,
      '',
      patchNotes,
      '',
      `## Axiom commit fallback`,
      '',
      `This section is generated from fork commits when no richer patch/deviation notes are available.`,
      '',
      forkDelta,
      '',
      `## Maintenance notes`,
      '',
      `- main remains a clean mirror of ${upstreamRepo}.`,
      `- Axiom changes ship from the deploy branch and update against GitHub Releases in this repository.`
    ]
      .filter((line) => line !== null)
      .join('\n'),
    MAX_RELEASE_NOTES_BODY_LENGTH,
    'combined release notes'
  )

  writeFileSync(output, `${body}\n`)
  console.log(`Wrote ${output}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
