import { describe, expect, it } from 'vitest'
import type { PersistedState } from './types'
import {
  applyProfileImport,
  createProfileExportEnvelope,
  parseProfileImportPayload,
  previewProfileImportPayload,
  sanitizeProfileExportData
} from './profile-portability'

function buildState(overrides: Partial<PersistedState> = {}): PersistedState {
  return {
    schemaVersion: 3,
    repos: [{ id: 'repo-1', path: '/work/app', displayName: 'App' }],
    sparsePresetsByRepo: {
      'repo-1': [{ id: 'preset-1', repoId: 'repo-1', name: 'Core', paths: ['src'] }]
    },
    worktreeMeta: { 'repo-1::main': { displayName: 'Main', status: 'in-progress' } },
    worktreeLineageById: {},
    settings: {
      workspaceDir: '/workspaces',
      opencodeSessionCookie: 'secret-cookie',
      codexManagedAccounts: [
        { id: 'codex-1', email: 'user@example.com', managedHomePath: '/secret/codex' }
      ],
      activeCodexManagedAccountId: 'codex-1',
      claudeManagedAccounts: [
        { id: 'claude-1', email: 'user@example.com', managedAuthPath: '/secret/claude' }
      ],
      activeClaudeManagedAccountId: 'claude-1'
    },
    ui: {
      groupBy: 'repo',
      browserKagiSessionLink: 'https://kagi.com/private/[REDACTED]'
    },
    githubCache: { pr: {}, issue: {} },
    workspaceSession: { activeRepoId: 'repo-1' },
    sshTargets: [{ id: 'ssh-1', label: 'Devbox', host: 'devbox.local' }],
    sshRemotePtyLeases: [],
    migrationUnsupportedPtyEntries: [],
    legacyPaneKeyAliasEntries: [],
    automations: [{ id: 'automation-1', name: 'Daily scan' }],
    automationRuns: [{ id: 'run-1', automationId: 'automation-1' }],
    onboarding: { completed: true, checklist: {} },
    ...overrides
  } as unknown as PersistedState
}

describe('profile portability', () => {
  it('exports profile data without local auth material or private browser links', () => {
    const data = sanitizeProfileExportData(buildState())

    expect(data.settings).toMatchObject({
      opencodeSessionCookie: '',
      codexManagedAccounts: [],
      activeCodexManagedAccountId: null,
      claudeManagedAccounts: [],
      activeClaudeManagedAccountId: null
    })
    expect(data.ui).toMatchObject({ browserKagiSessionLink: null })
    expect(data.repos).toHaveLength(1)
    expect(data.workspaceSession).toMatchObject({ activeRepoId: 'repo-1' })
  })

  it('wraps exports in a versioned envelope with excluded-secret disclosure', () => {
    const envelope = createProfileExportEnvelope(buildState(), {
      appName: 'Axiom Orca',
      appVersion: '1.4.18-rc.0.axiom.1'
    })

    expect(envelope.format).toBe('orca-profile-export')
    expect(envelope.version).toBe(1)
    expect(envelope.source).toMatchObject({ appName: 'Axiom Orca' })
    expect(envelope.excludedSecrets).toContain('settings.opencodeSessionCookie')
  })

  it('previews raw upstream orca-data.json payloads as importable profiles', () => {
    const preview = previewProfileImportPayload(buildState())

    expect(preview).toMatchObject({
      valid: true,
      format: 'raw-persisted-state',
      counts: {
        repos: 1,
        sparsePresetsByRepo: 1,
        worktreeMeta: 1,
        sshTargets: 1,
        automations: 1,
        automationRuns: 1
      }
    })
  })

  it('rejects unknown files during preview', () => {
    const preview = previewProfileImportPayload({ hello: 'world' })

    expect(preview.valid).toBe(false)
    expect(preview.error).toContain('not an Orca profile export')
  })

  it('applies selected export sections over the current profile', () => {
    const current = buildState({
      repos: [],
      worktreeMeta: {},
      workspaceSession: { activeRepoId: null } as unknown as PersistedState['workspaceSession']
    })
    const source = createProfileExportEnvelope(buildState())
    const next = applyProfileImport(current, source, ['repos', 'worktreeMeta'])

    expect(next.repos).toHaveLength(1)
    expect(next.worktreeMeta).toHaveProperty('repo-1::main')
    expect(next.workspaceSession).toMatchObject({ activeRepoId: null })
  })

  it('parses exported envelopes and keeps them sanitized', () => {
    const envelope = createProfileExportEnvelope(buildState())
    const parsed = parseProfileImportPayload(JSON.parse(JSON.stringify(envelope)))

    expect(parsed?.data.settings).toMatchObject({ opencodeSessionCookie: '' })
    expect(parsed?.data.ui).toMatchObject({ browserKagiSessionLink: null })
  })
})
