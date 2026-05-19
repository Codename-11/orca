import { describe, expect, it } from 'vitest'
import { getDevInstanceIdentity } from './dev-instance-identity'

describe('dev-instance-identity', () => {
  it('keeps packaged identity stable', () => {
    expect(getDevInstanceIdentity(false, {})).toMatchObject({
      name: 'Orca',
      isDev: false,
      devLabel: null,
      dockBadgeLabel: null,
      appUserModelId: 'com.stablyai.orca'
    })
  })

  it('allows forked packaged builds to use their own runtime identity', () => {
    expect(
      getDevInstanceIdentity(false, {
        ORCA_APP_NAME: 'Axiom Orca',
        ORCA_APP_USER_MODEL_ID: 'com.axiomlabs.orca'
      })
    ).toMatchObject({
      name: 'Axiom Orca',
      isDev: false,
      devLabel: null,
      dockBadgeLabel: null,
      appUserModelId: 'com.axiomlabs.orca'
    })
  })

  it('derives a readable dev label from worktree and branch env', () => {
    const identity = getDevInstanceIdentity(true, {
      ORCA_DEV_REPO_ROOT: '/repo/worktrees/dev-indicator',
      ORCA_DEV_WORKTREE_NAME: 'dev-indicator',
      ORCA_DEV_BRANCH: 'nwparker/dev-indicator'
    })

    expect(identity).toMatchObject({
      isDev: true,
      devLabel: 'dev-indicator',
      devBranch: 'nwparker/dev-indicator',
      devWorktreeName: 'dev-indicator',
      devRepoRoot: '/repo/worktrees/dev-indicator'
    })
    expect(identity.name).toBe('Orca: nwparker/dev-indicator')
    expect(identity.dockBadgeLabel).toBeNull()
    expect(identity.appUserModelId).toMatch(/^com\.stablyai\.orca\.dev\.[a-f0-9]{10}$/)
  })

  it('includes the branch when it differs from the worktree basename', () => {
    const identity = getDevInstanceIdentity(true, {
      ORCA_DEV_REPO_ROOT: '/repo/worktrees/payment-ui',
      ORCA_DEV_WORKTREE_NAME: 'payment-ui',
      ORCA_DEV_BRANCH: 'feature/billing-shell'
    })

    expect(identity.devLabel).toBe('payment-ui @ feature/billing-shell')
    expect(identity.name).toBe('Orca: feature/billing-shell')
    expect(identity.dockBadgeLabel).toBeNull()
  })

  it('allows an explicit label override', () => {
    const identity = getDevInstanceIdentity(true, {
      ORCA_DEV_INSTANCE_LABEL: 'manual label',
      ORCA_DEV_WORKTREE_NAME: 'dev-indicator',
      ORCA_DEV_BRANCH: 'feature/other'
    })

    expect(identity.devLabel).toBe('manual label')
    expect(identity.name).toBe('Orca: feature/other')
    expect(identity.dockBadgeLabel).toBeNull()
  })

  it('derives dev app user model IDs from the fork base identity', () => {
    const identity = getDevInstanceIdentity(true, {
      ORCA_APP_NAME: 'Axiom Orca',
      ORCA_APP_USER_MODEL_ID: 'com.axiomlabs.orca',
      ORCA_DEV_REPO_ROOT: '/repo/worktrees/forge-provider',
      ORCA_DEV_WORKTREE_NAME: 'forge-provider',
      ORCA_DEV_BRANCH: 'feat/forge-provider'
    })

    expect(identity.name).toBe('Axiom Orca: feat/forge-provider')
    expect(identity.appUserModelId).toMatch(/^com\.axiomlabs\.orca\.dev\.[a-f0-9]{10}$/)
  })
})
