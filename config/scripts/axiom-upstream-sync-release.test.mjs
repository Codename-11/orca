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
  isUpstreamPrereleaseRelease,
  newestSemverTag,
  shouldSkipUpstreamPrerelease
} from './axiom-check-upstream-release.mjs'
import { forkCommitBaseline, nearestPriorAxiomReleaseTag } from './axiom-generate-release-notes.mjs'
import { buildDiscordPayload, extractMarkdownSection } from './axiom-post-release-discord-notes.mjs'

import {
  getRequiredReleaseAssetNames,
  parseReleasePlatforms
} from './verify-release-required-assets.mjs'

import { extractRemediatedRelease } from './axiom-dispatch-remediated-release.mjs'
import { classifyMergeRemediation } from './axiom-request-merge-remediation.mjs'

const workflow = readFileSync('.github/workflows/axiom-upstream-sync-release.yml', 'utf8')
const remediationResumeWorkflow = readFileSync(
  '.github/workflows/axiom-remediated-release-resume.yml',
  'utf8'
)
const mirrorWorkflow = readFileSync('.github/workflows/axiom-upstream-main-sync.yml', 'utf8')
const checkScript = readFileSync('config/scripts/axiom-check-upstream-release.mjs', 'utf8')
const syncScript = readFileSync('config/scripts/axiom-sync-upstream-release.mjs', 'utf8')
const notifyScript = readFileSync('config/scripts/axiom-report-sync-failure.mjs', 'utf8')
const releaseNotifyScript = readFileSync(
  'config/scripts/axiom-post-release-discord-notes.mjs',
  'utf8'
)
const remediationScript = readFileSync('config/scripts/axiom-request-merge-remediation.mjs', 'utf8')
const remediationPolicy = readFileSync('config/axiom-merge-remediation-policy.json', 'utf8')
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
      'git push origin "+refs/remotes/upstream/${AXIOM_UPSTREAM_BRANCH}:refs/heads/${AXIOM_UPSTREAM_BRANCH}"'
    )
    expect(workflow).toContain('git push origin "HEAD:${AXIOM_DEPLOY_BRANCH}"')
    expect(workflow).not.toContain('git push origin "HEAD:refs/heads/main"')
    expect(workflow).toContain('tag: ${{ steps.check.outputs.fork_tag }}')
    expect(workflow).toContain('ref: ${{ needs.sync.outputs.tag }}')
  })

  it('uses repository_dispatch for upstream release tags instead of an interval timer', () => {
    expect(workflow).toContain('repository_dispatch:')
    expect(workflow).toContain('- upstream_release')
    expect(workflow).toContain('- upstream_tag')
    expect(workflow).toContain("vars.AXIOM_AUTO_RELEASES == 'true'")
    expect(workflow).toContain('github.event.client_payload.upstream_tag')
    expect(workflow).toContain('github.event.client_payload.tag')
    expect(workflow).toContain('github.event.client_payload.ref')
    expect(workflow).not.toContain('cron:')
  })

  it('tracks upstream prerelease cuts while keeping stable-only discovery available', () => {
    expect(newestSemverTag(['v1.4.22', 'v1.4.23-rc.1'], { includePrereleases: false })).toBe(
      'v1.4.22'
    )
    expect(newestSemverTag(['v1.4.22', 'v1.4.23-rc.1'], { includePrereleases: true })).toBe(
      'v1.4.23-rc.1'
    )
    expect(isUpstreamPrereleaseRelease({ tag_name: 'v1.4.23-rc.1', prerelease: false })).toBe(true)
    expect(isUpstreamPrereleaseRelease({ tag_name: 'v1.4.23', prerelease: true })).toBe(true)
    expect(isUpstreamPrereleaseRelease({ tag_name: 'v1.4.23', prerelease: false })).toBe(false)
    expect(
      shouldSkipUpstreamPrerelease({
        upstreamPrerelease: true,
        includePrereleases: false,
        explicitUpstreamTag: false
      })
    ).toBe(true)
    expect(
      shouldSkipUpstreamPrerelease({
        upstreamPrerelease: true,
        includePrereleases: false,
        explicitUpstreamTag: true
      })
    ).toBe(false)
    expect(
      shouldSkipUpstreamPrerelease({
        upstreamPrerelease: true,
        includePrereleases: true,
        explicitUpstreamTag: false
      })
    ).toBe(false)
    expect(checkScript).toContain('shouldSkipUpstreamPrerelease')
    expect(checkScript).toContain("source', 'axiom_tag'")
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
    ).toEqual([
      'latest.yml',
      'axiom-orca-windows-setup.exe',
      'axiom-orca-windows-setup.exe.blockmap',
      'app-release.apk'
    ])
    expect(workflow).toContain(
      "needs.sync.outputs.upstream_prerelease != 'true' || inputs.build_mobile"
    )
    expect(workflow).toContain(
      "(needs.mobile.result == 'success' || inputs.build_mobile) && 'win,android' || env.ORCA_RELEASE_PLATFORMS"
    )
  })

  it('mirrors upstream main commits through repository_dispatch without touching deploy releases', () => {
    expect(mirrorWorkflow).toContain('name: Axiom Upstream Main Mirror')
    expect(mirrorWorkflow).toContain('repository_dispatch:')
    expect(mirrorWorkflow).toContain('- upstream_main')
    expect(mirrorWorkflow).toContain('- upstream_push')
    expect(mirrorWorkflow).toContain('workflow_dispatch:')
    expect(mirrorWorkflow).toContain("vars.AXIOM_AUTO_MAIN_MIRROR == 'true'")
    expect(mirrorWorkflow).toContain('AXIOM_WORKFLOW_BRANCH: axiom/deploy')
    expect(mirrorWorkflow).toContain('ref: ${{ env.AXIOM_WORKFLOW_BRANCH }}')
    expect(mirrorWorkflow).toContain('github.event.client_payload.ref')
    expect(mirrorWorkflow).toContain(
      'git push origin "+refs/remotes/upstream/${AXIOM_UPSTREAM_BRANCH}:refs/heads/${AXIOM_UPSTREAM_BRANCH}"'
    )
    expect(mirrorWorkflow).toContain(
      'token: ${{ secrets.AXIOM_MIRROR_TOKEN || secrets.AXIOM_AUTOMATION_TOKEN || github.token }}'
    )
    expect(mirrorWorkflow).toContain('AXIOM_SYNC_FAILURE_SEVERITY: critical')
    expect(mirrorWorkflow).toContain('AXIOM_SYNC_FORGE_WEBHOOK')
    expect(mirrorWorkflow).toContain('Notify mirror failure')
    expect(mirrorWorkflow).not.toContain('cron:')
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

  it('chooses the fork commit range from the prior Axiom revision or upstream tag', () => {
    const tags = [
      'v1.4.17',
      'v1.4.18-rc.0',
      'axiom-v1.4.18-rc.0.axiom.1',
      'axiom-v1.4.18-rc.0.axiom.2',
      'axiom-v1.4.17-axiom.1'
    ]

    expect(
      nearestPriorAxiomReleaseTag({
        existingTags: tags,
        upstreamTag: 'v1.4.18-rc.0',
        forkTag: 'axiom-v1.4.18-rc.0.axiom.2'
      })
    ).toBe('axiom-v1.4.18-rc.0.axiom.1')
    expect(
      forkCommitBaseline({
        existingTags: tags,
        upstreamTag: 'v1.4.18-rc.0',
        forkTag: 'axiom-v1.4.18-rc.0.axiom.2'
      })
    ).toBe('axiom-v1.4.18-rc.0.axiom.1')
    expect(
      forkCommitBaseline({
        existingTags: tags,
        upstreamTag: 'v1.4.18-rc.0',
        forkTag: 'axiom-v1.4.18-rc.0.axiom.1',
        previousAxiomTag: 'axiom-v1.4.17-axiom.1'
      })
    ).toBe('axiom-v1.4.17-axiom.1')
    expect(
      forkCommitBaseline({
        existingTags: tags,
        upstreamTag: 'v1.4.18-rc.0',
        forkTag: 'axiom-v1.4.18-rc.0.axiom.1'
      })
    ).toBe('v1.4.18-rc.0')
  })

  it('combines upstream notes with optional Axiom deviation notes and commit fallback', () => {
    expect(notesScript).toContain('--deviation-notes')
    expect(notesScript).toContain('readOptionalMarkdown')
    expect(notesScript).toContain('## Axiom patch notes')
    expect(notesScript).toContain('## Axiom commit fallback')
    expect(notesScript).toContain('This section is generated from fork commits')
  })

  it('notifies durably only when sync/build/publish fails', () => {
    expect(workflow).toContain('issues: write')
    expect(workflow).toContain('Notify upstream sync failure')
    expect(workflow).toContain('Notify failed Axiom release')
    expect(workflow).toContain("if: failure() && steps.check.outputs.should_release == 'true'")
    expect(workflow).toContain('pull-requests: write')
    expect(workflow).toContain(
      'token: ${{ secrets.AXIOM_MIRROR_TOKEN || secrets.AXIOM_AUTOMATION_TOKEN || github.token }}'
    )
    expect(workflow).toContain('GH_TOKEN: ${{ secrets.AXIOM_AUTOMATION_TOKEN || github.token }}')
    expect(workflow).toContain('AXIOM_SYNC_FORGE_WEBHOOK')
    expect(workflow).toContain('AXIOM_SYNC_FAILURE_SEVERITY: noncritical')
    expect(workflow).toContain('AXIOM_SYNC_FAILURE_SEVERITY: critical')
    expect(notifyScript).toContain('ISSUE_LABEL')
    expect(notifyScript).toContain('axiom-upstream-sync')
    expect(notifyScript).toContain('Conflicted files')
    expect(notifyScript).toContain('AXIOM_SYNC_FORGE_WEBHOOK')
    expect(notifyScript).toContain('postDiscordIfCritical')
    expect(notifyScript).toContain("severity !== 'critical'")
    expect(notifyScript).toContain('**Action**')
    expect(notifyScript).toContain('**Agent handoff**')
    expect(notifyScript).toContain('Classify: informational / auto-retry likely / actionable.')
  })

  it('announces only stable published releases to Discord with release notes', () => {
    expect(workflow).toContain('Notify stable Axiom release')
    expect(workflow).toContain("needs.sync.outputs.upstream_prerelease != 'true'")
    expect(workflow).toContain("needs.publish.result == 'success'")
    expect(workflow).toContain('AXIOM_RELEASE_DISCORD_WEBHOOK')
    expect(workflow).toContain('node config/scripts/axiom-post-release-discord-notes.mjs')
    expect(workflow).toContain(
      'upstream_prerelease: ${{ steps.check.outputs.upstream_prerelease }}'
    )
    expect(workflow).toContain('publish_flags+=(--prerelease=false --latest)')
    expect(releaseNotifyScript).toContain('release.prerelease')
    expect(releaseNotifyScript).toContain('buildDiscordPayload')
    expect(releaseNotifyScript).toContain('Axiom notes')

    const releaseBody = [
      '# Axiom Orca v1.4.22',
      '',
      '## Upstream Orca',
      '',
      '- Upstream release: https://github.com/stablyai/orca/releases/tag/v1.4.22',
      '- Fixed workspace restore.',
      '',
      '## Axiom patch notes',
      '',
      '- Kept Axiom update feed isolation.',
      '',
      '## Axiom commit fallback',
      '',
      '- chore(release): align Axiom build (abc123)'
    ].join('\n')

    expect(extractMarkdownSection(releaseBody, 'Axiom patch notes')).toContain(
      'Kept Axiom update feed isolation'
    )

    const payload = buildDiscordPayload({
      repository: 'Codename-11/orca',
      forkTag: 'axiom-v1.4.22-axiom.1',
      forkVersion: '1.4.22-axiom.1',
      upstreamTag: 'v1.4.22',
      release: {
        name: 'Axiom Orca 1.4.22-axiom.1 (upstream v1.4.22)',
        body: releaseBody,
        html_url: 'https://github.com/Codename-11/orca/releases/tag/axiom-v1.4.22-axiom.1',
        assets: [
          {
            name: 'axiom-orca-windows-setup.exe',
            browser_download_url:
              'https://github.com/Codename-11/orca/releases/download/axiom-v1.4.22-axiom.1/axiom-orca-windows-setup.exe'
          }
        ]
      }
    })

    expect(payload.content).toContain('is live')
    expect(payload.embeds[0].fields.map((field) => field.name)).toContain('Axiom notes')
    expect(payload.embeds[0].fields.map((field) => field.name)).toContain('Upstream notes')
    expect(payload.embeds[0].fields.map((field) => field.name)).toContain('Downloads')
    expect(payload.embeds[0].fields.map((field) => field.name)).toContain('Action')
    expect(payload.embeds[0].fields.map((field) => field.name)).toContain('Agent handoff')
    expect(payload.embeds[0].fields.find((field) => field.name === 'Action')?.value).toContain(
      'Required: `no`'
    )
    expect(payload.embeds[0].fields.find((field) => field.name === 'Agent handoff')?.value).toContain(
      'gh release view axiom-v1.4.22-axiom.1'
    )
  })

  it('requests agent remediation for unsafe merge conflicts without publishing', () => {
    expect(workflow).toContain('Request Hermes merge remediation')
    expect(workflow).toContain('AXIOM_SYNC_REMEDIATION_WEBHOOK')
    expect(workflow).toContain('AXIOM_REMEDIATION_MODE')
    expect(workflow).toContain(
      "should_release: ${{ steps.check.outputs.should_release == 'true' && steps.merge.outputs.merge_result != 'agent_remediate' }}"
    )
    expect(workflow).toContain("if: steps.merge.outputs.merge_result == 'agent_remediate'")
    expect(syncScript).toContain("writeOutput('merge_result', 'agent_remediate')")
    expect(syncScript).toContain('release publishing is skipped for this run')
    expect(syncScript).toContain("writeOutput('merge_result', 'ready')")
    expect(remediationScript).toContain('classifyMergeRemediation')
    expect(remediationScript).toContain('X-Hub-Signature-256')
    expect(remediationScript).toContain('createHmac')
    expect(remediationScript).toContain("action: 'auto_remediate'")
    expect(remediationScript).toContain("action: 'review_required'")
    expect(remediationScript).toContain('createBotBranchAndPr')
    expect(remediationScript).toContain('config/axiom-remediations/')
    expect(remediationScript).toContain("runRequired('git', ['push', '--force-with-lease'")
    expect(remediationScript).toContain('pulls')
    expect(remediationScript).toContain('do not push directly')
    expect(remediationPolicy).toContain('protectedDeletionPaths')
    expect(remediationPolicy).toContain('src/**/forge/**')
    expect(remediationPolicy).toContain('config/electron-builder.config.cjs')
  })

  it('resumes release publishing after a remediation PR merges', () => {
    expect(remediationResumeWorkflow).toContain('name: Axiom Resume Remediated Release')
    expect(remediationResumeWorkflow).toContain('pull_request:')
    expect(remediationResumeWorkflow).toContain('types: [closed]')
    expect(remediationResumeWorkflow).toContain('actions: write')
    expect(remediationResumeWorkflow).toContain(
      "startsWith(github.event.pull_request.head.ref, 'bot/upstream-sync-')"
    )
    expect(remediationResumeWorkflow).toContain(
      'node config/scripts/axiom-dispatch-remediated-release.mjs'
    )

    const result = extractRemediatedRelease({
      pullRequest: {
        number: 10,
        merged: true,
        base: { ref: 'axiom/deploy' },
        head: { ref: 'bot/upstream-sync-axiom-v1.4.22-axiom.1' },
        body: [
          '## Summary',
          '- Upstream ref/tag: `v1.4.22`',
          '- Intended Axiom version/tag: `1.4.22-axiom.1 / axiom-v1.4.22-axiom.1`'
        ].join('\n')
      }
    })

    expect(result).toMatchObject({
      shouldDispatch: true,
      upstreamTag: 'v1.4.22',
      forkTag: 'axiom-v1.4.22-axiom.1',
      pullRequestNumber: 10
    })
    expect(
      extractRemediatedRelease({
        pullRequest: {
          merged: true,
          base: { ref: 'axiom/deploy' },
          head: { ref: 'feature/not-remediation' },
          body: ''
        }
      })
    ).toMatchObject({ shouldDispatch: false })
  })

  it('classifies regular code conflicts for agent PR remediation', () => {
    expect(
      classifyMergeRemediation({
        conflicts: ['src/renderer/src/components/TaskPage.tsx'],
        statusRecords: [
          { status: 'UU', path: 'src/renderer/src/components/TaskPage.tsx', deleted: false }
        ],
        policy: JSON.parse(remediationPolicy)
      })
    ).toMatchObject({ action: 'auto_remediate' })
  })

  it('routes fork identity file conflicts through policy-guided agent PR remediation', () => {
    expect(
      classifyMergeRemediation({
        conflicts: ['config/electron-builder.config.cjs'],
        statusRecords: [
          { status: 'UU', path: 'config/electron-builder.config.cjs', deleted: false }
        ],
        policy: JSON.parse(remediationPolicy)
      })
    ).toMatchObject({ action: 'auto_remediate', severity: 'noncritical' })
  })

  it('requires human review when upstream deletes protected Axiom files', () => {
    expect(
      classifyMergeRemediation({
        conflicts: ['src/renderer/src/components/forge/ForgeIssueDetailDrawer.tsx'],
        statusRecords: [
          {
            status: 'DU',
            path: 'src/renderer/src/components/forge/ForgeIssueDetailDrawer.tsx',
            deleted: true
          }
        ],
        policy: JSON.parse(remediationPolicy)
      })
    ).toMatchObject({ action: 'review_required' })
  })
})

describe('Axiom upstream sync script hardening', () => {
  it('classifies unsafe merge conflicts for remediation and verifies Axiom identity after upstream sync', () => {
    expect(syncScript).toContain('printConflictDiagnostics')
    expect(syncScript).toContain('assertAxiomIdentityFiles')
    expect(syncScript).toContain('Upstream merge conflicted')
    expect(syncScript).toContain('ORCA_NSIS_GUID')
    expect(syncScript).toContain('com.axiomlabs.orca.mobile')
    expect(syncScript).toContain('ORCA_UPDATE_OWNER')
    expect(syncScript).toContain('ORCA_UPDATE_REPO')
  })

  it('auto-resolves only the expected package.json version conflict before failing unsafe merges', () => {
    expect(syncScript).toContain('resolvePackageVersionConflict')
    expect(syncScript).toContain("conflicts.length === 1 && conflicts[0] === 'package.json'")
    expect(syncScript).toContain('versionConflictPattern')
    expect(syncScript).toContain("runInherited('git', ['add', 'package.json'])")
  })
})
