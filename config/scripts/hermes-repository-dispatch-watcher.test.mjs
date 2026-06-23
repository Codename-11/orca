import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  buildDispatches,
  buildFailureNotification,
  newestSemverTag,
  parseArgs,
  runWatcher
} from './hermes-repository-dispatch-watcher.mjs'

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 204 ? 'No Content' : 'OK',
    json: async () => body,
    text: async () => JSON.stringify(body)
  }
}

function createFetchMock({ tags = [], mainSha = 'new-sha' } = {}) {
  const calls = []
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options })
    if (url.includes('/tags?')) {
      return response(tags.map((name) => ({ name })))
    }
    if (url.includes('/git/ref/heads/main')) {
      return response({ object: { sha: mainSha } })
    }
    if (url.includes('/dispatches')) {
      return response('', 204)
    }
    throw new Error(`Unexpected URL: ${url}`)
  }
  return { fetchImpl, calls }
}

describe('Hermes repository dispatch watcher', () => {
  it('selects newest semver tags with optional prerelease support', () => {
    const tags = ['v1.4.12', 'v1.4.13-rc.2', 'not-a-version', 'v1.4.13']

    expect(newestSemverTag(tags, { includePrereleases: true })).toBe('v1.4.13')
    expect(newestSemverTag(['v1.4.12', 'v1.4.13-rc.2'], { includePrereleases: true })).toBe(
      'v1.4.13-rc.2'
    )
    expect(newestSemverTag(['v1.4.12', 'v1.4.13-rc.2'], { includePrereleases: false })).toBe(
      'v1.4.12'
    )
  })

  it('builds release and main repository_dispatch payloads from state changes', () => {
    expect(
      buildDispatches({
        current: {
          upstreamBranch: 'main',
          releaseTag: 'v1.4.14',
          mainSha: 'new-sha'
        },
        previous: {
          releaseTag: 'v1.4.13',
          mainSha: 'old-sha'
        },
        watchRelease: true,
        watchMain: true,
        releaseEventType: 'upstream_release',
        mainEventType: 'upstream_main',
        source: 'hermes_watcher'
      })
    ).toEqual([
      {
        kind: 'release',
        eventType: 'upstream_release',
        payload: {
          upstream_tag: 'v1.4.14',
          previous_upstream_tag: 'v1.4.13',
          source: 'hermes_watcher'
        }
      },
      {
        kind: 'main',
        eventType: 'upstream_main',
        payload: {
          ref: 'refs/heads/main',
          sha: 'new-sha',
          previous_sha: 'old-sha',
          source: 'hermes_watcher'
        }
      }
    ])
  })

  it('bootstraps missing state by dispatching the current upstream surfaces once', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'orca-watcher-'))
    const stateFile = join(dir, 'state.json')
    const { fetchImpl, calls } = createFetchMock({ tags: ['v1.4.13'], mainSha: 'sha-1' })

    const result = await runWatcher({
      upstreamRepo: 'stablyai/orca',
      targetRepo: 'Codename-11/orca',
      stateFile,
      upstreamBranch: 'main',
      includePrereleases: true,
      releaseEventType: 'upstream_release',
      mainEventType: 'upstream_main',
      source: 'hermes_watcher',
      watchRelease: true,
      watchMain: true,
      bootstrapDispatch: true,
      token: 'test-token',
      fetchImpl
    })

    expect(result.bootstrapped).toBe(true)
    expect(result.dispatches.map((dispatch) => dispatch.kind)).toEqual(['release', 'main'])
    expect(calls.filter((call) => call.url.includes('/dispatches'))).toHaveLength(2)
    expect(JSON.parse(readFileSync(stateFile, 'utf8'))).toMatchObject({
      upstreamRepo: 'stablyai/orca',
      upstreamBranch: 'main',
      releaseTag: 'v1.4.13',
      mainSha: 'sha-1'
    })
  })

  it('can bootstrap missing state silently when explicitly requested', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'orca-watcher-'))
    const stateFile = join(dir, 'state.json')
    const { fetchImpl, calls } = createFetchMock({ tags: ['v1.4.13'], mainSha: 'sha-1' })

    const result = await runWatcher({
      upstreamRepo: 'stablyai/orca',
      targetRepo: 'Codename-11/orca',
      stateFile,
      upstreamBranch: 'main',
      includePrereleases: true,
      releaseEventType: 'upstream_release',
      mainEventType: 'upstream_main',
      source: 'hermes_watcher',
      watchRelease: true,
      watchMain: true,
      bootstrapDispatch: false,
      token: 'test-token',
      fetchImpl
    })

    expect(result.bootstrapped).toBe(true)
    expect(result.dispatches).toEqual([])
    expect(calls.some((call) => call.url.includes('/dispatches'))).toBe(false)
    expect(JSON.parse(readFileSync(stateFile, 'utf8'))).toMatchObject({
      releaseTag: 'v1.4.13',
      mainSha: 'sha-1'
    })
  })

  it('dispatches only changed surfaces and updates state after success', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'orca-watcher-'))
    const stateFile = join(dir, 'state.json')
    const { fetchImpl, calls } = createFetchMock({ tags: ['v1.4.14', 'v1.4.13'], mainSha: 'sha-2' })

    const result = await runWatcher({
      upstreamRepo: 'stablyai/orca',
      targetRepo: 'Codename-11/orca',
      stateFile,
      upstreamBranch: 'main',
      includePrereleases: true,
      releaseEventType: 'upstream_release',
      mainEventType: 'upstream_main',
      source: 'hermes_watcher',
      watchRelease: true,
      watchMain: true,
      token: 'test-token',
      previousState: {
        releaseTag: 'v1.4.13',
        mainSha: 'sha-2'
      },
      fetchImpl
    })

    expect(result.dispatches).toEqual([
      {
        kind: 'release',
        eventType: 'upstream_release',
        payload: {
          upstream_tag: 'v1.4.14',
          previous_upstream_tag: 'v1.4.13',
          source: 'hermes_watcher'
        }
      }
    ])

    const dispatchCall = calls.find((call) => call.url.includes('/dispatches'))
    expect(dispatchCall).toBeTruthy()
    expect(JSON.parse(dispatchCall.options.body)).toEqual({
      event_type: 'upstream_release',
      client_payload: {
        upstream_tag: 'v1.4.14',
        previous_upstream_tag: 'v1.4.13',
        source: 'hermes_watcher'
      }
    })
    expect(JSON.parse(readFileSync(stateFile, 'utf8'))).toMatchObject({
      releaseTag: 'v1.4.14',
      mainSha: 'sha-2'
    })
  })

  it('records a new latest stable release until the quiet window elapses', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'orca-watcher-'))
    const stateFile = join(dir, 'state.json')
    const { fetchImpl, calls } = createFetchMock({ tags: ['v1.4.15', 'v1.4.14'], mainSha: 'sha-2' })

    const result = await runWatcher({
      upstreamRepo: 'stablyai/orca',
      targetRepo: 'Codename-11/orca',
      stateFile,
      upstreamBranch: 'main',
      includePrereleases: false,
      releaseEventType: 'upstream_release',
      mainEventType: 'upstream_main',
      source: 'hermes_watcher',
      watchRelease: true,
      watchMain: false,
      batchLatestStable: true,
      releaseMinAgeHours: 24,
      token: 'test-token',
      now: '2026-06-22T12:00:00.000Z',
      previousState: {
        releaseTag: 'v1.4.14',
        dispatchedReleaseTag: 'v1.4.14',
        mainSha: 'sha-2'
      },
      fetchImpl
    })

    expect(result.dispatches).toEqual([])
    expect(result.releasePolicy).toMatchObject({
      latestStableTag: 'v1.4.15',
      previousDispatchedTag: 'v1.4.14',
      skippedReason: 'release_min_age',
      candidate: {
        tag: 'v1.4.15',
        eligible: false,
        firstSeenAt: '2026-06-22T12:00:00.000Z',
        minAgeHours: 24
      }
    })
    expect(calls.some((call) => call.url.includes('/dispatches'))).toBe(false)
    expect(JSON.parse(readFileSync(stateFile, 'utf8'))).toMatchObject({
      releaseTag: 'v1.4.15',
      dispatchedReleaseTag: 'v1.4.14',
      pendingReleaseTag: 'v1.4.15',
      pendingReleaseFirstSeenAt: '2026-06-22T12:00:00.000Z'
    })
  })

  it('dispatches only the newest stable tag after batching skips older pending tags', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'orca-watcher-'))
    const stateFile = join(dir, 'state.json')
    const { fetchImpl, calls } = createFetchMock({
      tags: ['v1.4.16', 'v1.4.15', 'v1.4.14'],
      mainSha: 'sha-2'
    })

    const result = await runWatcher({
      upstreamRepo: 'stablyai/orca',
      targetRepo: 'Codename-11/orca',
      stateFile,
      upstreamBranch: 'main',
      includePrereleases: false,
      releaseEventType: 'upstream_release',
      mainEventType: 'upstream_main',
      source: 'hermes_watcher',
      watchRelease: true,
      watchMain: false,
      batchLatestStable: true,
      releaseMinAgeHours: 24,
      token: 'test-token',
      now: '2026-06-23T12:00:00.000Z',
      previousState: {
        releaseTag: 'v1.4.16',
        dispatchedReleaseTag: 'v1.4.14',
        pendingReleaseTag: 'v1.4.16',
        pendingReleaseFirstSeenAt: '2026-06-22T11:00:00.000Z',
        mainSha: 'sha-2'
      },
      fetchImpl
    })

    expect(result.dispatches).toEqual([
      {
        kind: 'release',
        eventType: 'upstream_release',
        payload: {
          upstream_tag: 'v1.4.16',
          previous_upstream_tag: 'v1.4.14',
          source: 'hermes_watcher'
        }
      }
    ])
    expect(calls.filter((call) => call.url.includes('/dispatches'))).toHaveLength(1)
    expect(JSON.parse(readFileSync(stateFile, 'utf8'))).toMatchObject({
      releaseTag: 'v1.4.16',
      dispatchedReleaseTag: 'v1.4.16',
      pendingReleaseTag: '',
      pendingReleaseFirstSeenAt: ''
    })
  })

  it('can hold an eligible batched release outside the configured UTC release window', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'orca-watcher-'))
    const stateFile = join(dir, 'state.json')
    const { fetchImpl, calls } = createFetchMock({ tags: ['v1.4.15', 'v1.4.14'], mainSha: 'sha-2' })

    const result = await runWatcher({
      upstreamRepo: 'stablyai/orca',
      targetRepo: 'Codename-11/orca',
      stateFile,
      upstreamBranch: 'main',
      includePrereleases: false,
      releaseEventType: 'upstream_release',
      mainEventType: 'upstream_main',
      source: 'hermes_watcher',
      watchRelease: true,
      watchMain: false,
      batchLatestStable: true,
      releaseMinAgeHours: 1,
      releaseWindow: '16:00-18:00',
      token: 'test-token',
      now: '2026-06-22T12:00:00.000Z',
      previousState: {
        releaseTag: 'v1.4.15',
        dispatchedReleaseTag: 'v1.4.14',
        pendingReleaseTag: 'v1.4.15',
        pendingReleaseFirstSeenAt: '2026-06-22T09:00:00.000Z',
        mainSha: 'sha-2'
      },
      fetchImpl
    })

    expect(result.dispatches).toEqual([])
    expect(result.releasePolicy).toMatchObject({
      skippedReason: 'outside_release_window',
      candidate: {
        tag: 'v1.4.15',
        eligible: false,
        releaseWindow: '16:00-18:00',
        withinReleaseWindow: false
      }
    })
    expect(calls.some((call) => call.url.includes('/dispatches'))).toBe(false)
  })

  it('supports reusable watcher configuration through args', () => {
    expect(parseArgs([])).toMatchObject({ includePrereleases: false })
    expect(parseArgs(['--include-prereleases'])).toMatchObject({ includePrereleases: true })

    expect(
      parseArgs([
        '--upstream-repo',
        'owner/source',
        '--target-repo',
        'owner/fork',
        '--state-file',
        '/tmp/state.json',
        '--stable-only',
        '--main-only',
        '--release-min-age-hours',
        '24',
        '--release-window',
        '16:00-18:00',
        '--release-event-type',
        'source_release',
        '--main-event-type',
        'source_main'
      ])
    ).toMatchObject({
      upstreamRepo: 'owner/source',
      targetRepo: 'owner/fork',
      stateFile: '/tmp/state.json',
      includePrereleases: false,
      watchRelease: false,
      watchMain: true,
      batchLatestStable: true,
      releaseMinAgeHours: 24,
      releaseWindow: '16:00-18:00',
      releaseEventType: 'source_release',
      mainEventType: 'source_main'
    })
  })

  it('formats actionable Discord-ready handoff output on watcher failures', () => {
    const message = buildFailureNotification(
      new Error('GitHub dispatch failed: Bearer ghp_secret'),
      {
        upstreamRepo: 'stablyai/orca',
        targetRepo: 'Codename-11/orca',
        stateFile: '/home/bailey/.hermes/state/orca-upstream-watcher.json'
      }
    )

    expect(message).toContain('🚨 **Dev Automation: Orca Upstream Dispatch Watcher**')
    expect(message).toContain('**Action**')
    expect(message).toContain('- Required: `yes`')
    expect(message).toContain('**Agent handoff**')
    expect(message).toContain('cd /home/bailey/orca')
    expect(message).toContain('node config/scripts/hermes-repository-dispatch-watcher.mjs')
    expect(message).toContain('Bearer [REDACTED]')
    expect(message).not.toContain('ghp_secret')
  })
})
