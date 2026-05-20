import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  forkReleasePrefixForUpstreamTag,
  forkTagForVersion,
  forkVersionForRevision,
  maxAxiomRevision,
  parseAxiomReleaseTag,
  resolveForkReleaseVersion
} from './axiom-release-versioning.mjs'

import {
  getRequiredReleaseAssetNames,
  parseReleasePlatforms
} from './verify-release-required-assets.mjs'

const workflow = readFileSync('.github/workflows/axiom-upstream-sync-release.yml', 'utf8')
const checkScript = readFileSync('config/scripts/axiom-check-upstream-release.mjs', 'utf8')
const syncScript = readFileSync('config/scripts/axiom-sync-upstream-release.mjs', 'utf8')
const notifyScript = readFileSync('config/scripts/axiom-report-sync-failure.mjs', 'utf8')
const notesScript = readFileSync('config/scripts/axiom-generate-release-notes.mjs', 'utf8')

describe('Axiom release versioning', () => {
  it('derives fork-specific app versions and release tags from upstream tags', () => {
    expect(forkVersionForRevision('v1.4.10', 1)).toBe('1.4.10-axiom.1')
    expect(forkTagForVersion('1.4.10-axiom.1')).toBe('axiom-v1.4.10-axiom.1')
    expect(forkVersionForRevision('v1.4.10-rc.0', 2)).toBe('1.4.10-rc.0.axiom.2')
  })

  it('chooses the first missing Axiom revision unless manually bumped', () => {
    const existingTags = ['axiom-v1.4.10-axiom.1', 'axiom-v1.4.10-axiom.2']

    expect(forkReleasePrefixForUpstreamTag('v1.4.10')).toBe('axiom-v1.4.10-axiom.')
    expect(maxAxiomRevision(existingTags, 'v1.4.10')).toBe(2)
    expect(resolveForkReleaseVersion({ upstreamTag: 'v1.4.10', existingTags })).toMatchObject({
      axiomRevision: 2,
      forkVersion: '1.4.10-axiom.2',
      forkTag: 'axiom-v1.4.10-axiom.2',
      previousRevision: 2
    })
    expect(
      resolveForkReleaseVersion({ upstreamTag: 'v1.4.10', existingTags, bumpRevision: true })
    ).toMatchObject({
      axiomRevision: 3,
      forkVersion: '1.4.10-axiom.3',
      forkTag: 'axiom-v1.4.10-axiom.3'
    })
  })

  it('parses manually-created Axiom release tags back to upstream tags and fork revisions', () => {
    expect(parseAxiomReleaseTag('axiom-v1.4.13-axiom.2')).toEqual({
      upstreamTag: 'v1.4.13',
      upstreamVersion: '1.4.13',
      forkTag: 'axiom-v1.4.13-axiom.2',
      forkVersion: '1.4.13-axiom.2',
      axiomRevision: 2
    })
    expect(parseAxiomReleaseTag('axiom-v1.4.13-rc.2.axiom.3')).toEqual({
      upstreamTag: 'v1.4.13-rc.2',
      upstreamVersion: '1.4.13-rc.2',
      forkTag: 'axiom-v1.4.13-rc.2.axiom.3',
      forkVersion: '1.4.13-rc.2.axiom.3',
      axiomRevision: 3
    })
    expect(parseAxiomReleaseTag('v1.4.13')).toBeNull()
  })
})

describe('Axiom upstream sync release workflow', () => {
  it('keeps fork builds isolated to the deploy branch and fork identity', () => {
    expect(workflow).toContain('AXIOM_DEPLOY_BRANCH: axiom/deploy')
    expect(workflow).toContain('AXIOM_UPSTREAM_BRANCH: main')
    expect(workflow).toContain("AXIOM_INCLUDE_PRERELEASES: '1'")
    expect(workflow).toContain('ORCA_APP_ID: com.axiomlabs.orca')
    expect(workflow).toContain('ORCA_APP_USER_MODEL_ID: com.axiomlabs.orca')
    expect(workflow).toContain('ORCA_PRODUCT_NAME: Axiom Orca')
    expect(workflow).toContain('ORCA_PACKAGE_NAME: axiom-orca')
    expect(workflow).toContain('ORCA_NSIS_GUID: b6c06723-a52f-5004-ad9f-f39666f5e928')
    expect(workflow).toContain('ORCA_UPDATE_OWNER: ${{ github.repository_owner }}')
    expect(workflow).toContain('ORCA_UPDATE_REPO: ${{ github.event.repository.name }}')
  })

  it('updates main only from upstream/main and releases from axiom/deploy fork tags', () => {
    expect(workflow).toContain(
      'git push origin "refs/remotes/upstream/${AXIOM_UPSTREAM_BRANCH}:refs/heads/${AXIOM_UPSTREAM_BRANCH}"'
    )
    expect(workflow).toContain('git push origin "HEAD:${AXIOM_DEPLOY_BRANCH}"')
    expect(workflow).not.toContain('git push origin "HEAD:refs/heads/main"')
    expect(workflow).toContain('tag: ${{ steps.check.outputs.fork_tag }}')
    expect(workflow).toContain('ref: ${{ needs.sync.outputs.tag }}')
  })

  it('supports manually-created Axiom tags without reacting to arbitrary branch pushes', () => {
    expect(workflow).toContain('push:')
    expect(workflow).toContain("- 'axiom-v*'")
    expect(workflow).not.toContain('branches:')
    expect(workflow).toContain('axiom_tag:')
    expect(workflow).toContain('--axiom-tag')
    expect(workflow).toContain('node config/scripts/verify-axiom-release-version.mjs')
    expect(workflow).toContain("steps.check.outputs.source != 'axiom_tag'")
    expect(checkScript).toContain('parseAxiomReleaseTag')
    expect(checkScript).toContain('/tags?per_page=100')
    expect(checkScript).toContain("source', 'axiom_tag'")
  })

  it('verifies only intended Axiom platform assets for fork releases', () => {
    expect(parseReleasePlatforms('win,android')).toEqual(['win', 'android'])
    expect(
      getRequiredReleaseAssetNames('axiom-v1.4.13-axiom.1', {
        platforms: ['win', 'android'],
        artifactBasename: 'axiom-orca'
      })
    ).toEqual(['latest.yml', 'axiom-orca-windows-setup.exe', 'axiom-orca-windows-setup.exe.blockmap', 'app-release.apk'])
    expect(workflow).toContain("inputs.build_mobile && 'win,android' || env.ORCA_RELEASE_PLATFORMS")
  })

  it('supports Axiom-only revisions without clobbering upstream release tags', () => {
    expect(workflow).toContain('bump_axiom_revision:')
    expect(workflow).toContain('axiom_revision:')
    expect(workflow).toContain('--bump-axiom-revision')
    expect(workflow).toContain('--axiom-revision')
    expect(checkScript).toContain('fork_tag')
    expect(checkScript).toContain('resolveForkReleaseVersion')
    expect(syncScript).toContain("!args.forkTag.startsWith('axiom-v')")
  })

  it('runs verification tests without globally injected fork build env', () => {
    expect(workflow).toContain('env \\\n            -u GITHUB_REPOSITORY')
    expect(workflow).toContain('-u ORCA_UPDATE_OWNER')
    expect(workflow).toContain('-u ORCA_PUBLISH_REPOSITORY')
    expect(workflow).toContain('config/scripts/axiom-upstream-sync-release.test.mjs')
  })

  it('caps generated release notes below GitHub release body limits', () => {
    expect(notesScript).toContain('MAX_RELEASE_NOTES_BODY_LENGTH = 120_000')
    expect(notesScript).toContain('MAX_UPSTREAM_NOTES_LENGTH')
    expect(notesScript).toContain('MAX_FORK_DELTA_LENGTH')
    expect(notesScript).toContain('truncateMarkdown')
  })

  it('notifies durably only when sync/build/publish fails', () => {
    expect(workflow).toContain('issues: write')
    expect(workflow).toContain('Notify upstream sync failure')
    expect(workflow).toContain('Notify failed Axiom release')
    expect(workflow).toContain("if: failure() && steps.check.outputs.should_release == 'true'")
    expect(notifyScript).toContain('ISSUE_LABEL')
    expect(notifyScript).toContain('axiom-upstream-sync')
    expect(notifyScript).toContain('Conflicted files')
    expect(notifyScript).toContain('AXIOM_SYNC_DISCORD_WEBHOOK')
  })
})

describe('Axiom upstream sync script hardening', () => {
  it('fails loudly on merge conflicts and verifies Axiom identity after upstream sync', () => {
    expect(syncScript).toContain('printConflictDiagnostics')
    expect(syncScript).toContain('assertAxiomIdentityFiles')
    expect(syncScript).toContain('Upstream merge conflicted')
    expect(syncScript).toContain('ORCA_NSIS_GUID')
    expect(syncScript).toContain('com.axiomlabs.orca.mobile')
    expect(syncScript).toContain('ORCA_UPDATE_OWNER')
    expect(syncScript).toContain('ORCA_UPDATE_REPO')
  })
})
