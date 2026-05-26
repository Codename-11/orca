#!/usr/bin/env node

import { pathToFileURL } from 'node:url'

const API_VERSION = '2022-11-28'
const DISCORD_CONTENT_LIMIT = 1900
const DISCORD_FIELD_LIMIT = 1000
const DISCORD_DESCRIPTION_LIMIT = 3900
const AXIOM_CYAN = 0x26b3fc

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

function truncate(value, maxLength) {
  const normalized = String(value ?? '').trim()
  if (normalized.length <= maxLength) {
    return normalized
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 12)).trimEnd()}…`
}

export function extractMarkdownSection(markdown, heading) {
  const lines = String(markdown ?? '').split(/\r?\n/)
  const startIndex = lines.findIndex((line) => line.trim() === `## ${heading}`)
  if (startIndex === -1) {
    return ''
  }

  const section = []
  for (const line of lines.slice(startIndex + 1)) {
    if (/^##\s+/.test(line.trim())) {
      break
    }
    section.push(line)
  }

  return section.join('\n').trim()
}

function withoutPlaceholders(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) {
    return ''
  }
  if (
    /_No upstream release notes were provided\._/i.test(trimmed) ||
    /_No agent-generated Axiom patch notes were provided/i.test(trimmed) ||
    /_No additional fork-local commits in this range\._/i.test(trimmed)
  ) {
    return ''
  }
  return trimmed
}

function compactNotes(value, maxLength = DISCORD_FIELD_LIMIT) {
  return truncate(
    String(value ?? '')
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n'),
    maxLength
  )
}

function assetSummary(assets = []) {
  const interestingAssets = assets
    .filter((asset) => /\.(exe|dmg|AppImage|deb|rpm|zip|apk|yml)$/i.test(asset.name ?? ''))
    .slice(0, 5)
    .map((asset) => `- [${asset.name}](${asset.browser_download_url})`)

  return interestingAssets.join('\n')
}

export function buildDiscordPayload({ release, forkVersion, forkTag, upstreamTag, repository }) {
  const body = release.body ?? ''
  const releaseUrl = release.html_url ?? `https://github.com/${repository}/releases/tag/${forkTag}`
  const upstreamUrl = `https://github.com/stablyai/orca/releases/tag/${upstreamTag}`
  const title = release.name || `Axiom Orca ${forkVersion}`
  const upstreamNotes = withoutPlaceholders(extractMarkdownSection(body, 'Upstream Orca'))
  const patchNotes = withoutPlaceholders(extractMarkdownSection(body, 'Axiom patch notes'))
  const forkDelta = withoutPlaceholders(extractMarkdownSection(body, 'Axiom commit fallback'))
  const downloads = assetSummary(release.assets)
  const handoff = [
    `Repo: ${repository}`,
    `Release tag: ${forkTag}`,
    `Release URL: ${releaseUrl}`,
    `Latest manifest: https://github.com/${repository}/releases/latest/download/latest.yml`,
    `Check: gh release view ${forkTag} --repo ${repository} --json tagName,isDraft,isPrerelease,publishedAt,assets,url`
  ].join('\n')

  const fields = [
    {
      name: 'Release',
      value: [`Axiom: \`${forkVersion}\``, `Upstream: [${upstreamTag}](${upstreamUrl})`].join('\n'),
      inline: false
    }
  ]

  if (patchNotes) {
    fields.push({ name: 'Axiom notes', value: compactNotes(patchNotes), inline: false })
  }

  if (upstreamNotes) {
    fields.push({ name: 'Upstream notes', value: compactNotes(upstreamNotes), inline: false })
  }

  if (forkDelta) {
    fields.push({ name: 'Fork delta', value: compactNotes(forkDelta), inline: false })
  }

  if (downloads) {
    fields.push({
      name: 'Downloads',
      value: truncate(downloads, DISCORD_FIELD_LIMIT),
      inline: false
    })
  }

  fields.push(
    {
      name: 'Action',
      value:
        'Required: `no`\nUse this as release confirmation. If updater behavior looks wrong, verify the latest manifest and release assets before escalating.',
      inline: false
    },
    {
      name: 'Agent handoff',
      value: truncate(handoff, DISCORD_FIELD_LIMIT),
      inline: false
    }
  )

  return {
    content: truncate(`🚀 ${title} is live: ${releaseUrl}`, DISCORD_CONTENT_LIMIT),
    embeds: [
      {
        title,
        url: releaseUrl,
        description: truncate(
          'Stable Axiom Orca release published from the fork release feed. Pre-releases are intentionally not announced here.',
          DISCORD_DESCRIPTION_LIMIT
        ),
        color: AXIOM_CYAN,
        fields,
        footer: {
          text: 'Axiom release automation · main mirrors upstream, axiom/deploy ships fork builds'
        }
      }
    ],
    allowed_mentions: { parse: [] }
  }
}

async function fetchRelease(repository, tag) {
  const response = await fetch(
    `https://api.github.com/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`,
    { headers: githubHeaders() }
  )
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `Failed to fetch release ${tag}: ${response.status} ${response.statusText} ${body.slice(0, 300)}`
    )
  }
  return response.json()
}

async function postDiscord(webhook, payload) {
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `Discord release notification failed ${response.status} ${response.statusText}: ${body.slice(0, 300)}`
    )
  }
}

async function main() {
  const webhook = envString(
    'AXIOM_RELEASE_DISCORD_WEBHOOK',
    envString('AXIOM_SYNC_DISCORD_WEBHOOK')
  )
  if (!webhook) {
    console.log(
      'No Discord release webhook configured; skipping stable release notes notification.'
    )
    return
  }

  const repository = envString('GITHUB_REPOSITORY')
  const forkTag = envString('AXIOM_FORK_TAG')
  const forkVersion = envString('AXIOM_FORK_VERSION')
  const upstreamTag = envString('AXIOM_UPSTREAM_TAG')

  if (!repository || !forkTag || !forkVersion || !upstreamTag) {
    throw new Error(
      'GITHUB_REPOSITORY, AXIOM_FORK_TAG, AXIOM_FORK_VERSION, and AXIOM_UPSTREAM_TAG are required'
    )
  }

  const release = await fetchRelease(repository, forkTag)
  if (release.prerelease) {
    console.log(`Skipping Discord release notes for prerelease ${forkTag}.`)
    return
  }
  if (release.draft) {
    console.log(`Skipping Discord release notes for draft release ${forkTag}.`)
    return
  }

  const payload = buildDiscordPayload({ release, forkVersion, forkTag, upstreamTag, repository })
  await postDiscord(webhook, payload)
  console.log(`Posted Discord release notes for ${forkTag}.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
