import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync('.github/workflows/axiom-upstream-sync-release.yml', 'utf8')
const syncScript = readFileSync('config/scripts/axiom-sync-upstream-release.mjs', 'utf8')

describe('Axiom upstream sync release workflow', () => {
  it('keeps fork builds isolated to the deploy branch and fork identity', () => {
    expect(workflow).toContain('AXIOM_DEPLOY_BRANCH: axiom/deploy')
    expect(workflow).toContain('AXIOM_UPSTREAM_BRANCH: main')
    expect(workflow).toContain('ORCA_APP_ID: com.axiomlabs.orca')
    expect(workflow).toContain('ORCA_APP_USER_MODEL_ID: com.axiomlabs.orca')
    expect(workflow).toContain('ORCA_PRODUCT_NAME: Axiom Orca')
    expect(workflow).toContain('ORCA_PACKAGE_NAME: axiom-orca')
    expect(workflow).toContain('ORCA_NSIS_GUID: b6c06723-a52f-5004-ad9f-f39666f5e928')
    expect(workflow).toContain('ORCA_UPDATE_OWNER: ${{ github.repository_owner }}')
    expect(workflow).toContain('ORCA_UPDATE_REPO: ${{ github.event.repository.name }}')
  })

  it('updates main only from upstream/main and releases from axiom/deploy/tagged commits', () => {
    expect(workflow).toContain(
      'git push origin "refs/remotes/upstream/${AXIOM_UPSTREAM_BRANCH}:refs/heads/${AXIOM_UPSTREAM_BRANCH}"'
    )
    expect(workflow).toContain('git push origin "HEAD:${AXIOM_DEPLOY_BRANCH}"')
    expect(workflow).not.toContain('git push origin "HEAD:refs/heads/main"')
    expect(workflow).toContain('ref: ${{ needs.sync.outputs.tag }}')
  })
})

describe('Axiom upstream sync script hardening', () => {
  it('fails loudly on merge conflicts and verifies Axiom identity after upstream sync', () => {
    expect(syncScript).toContain('printConflictDiagnostics')
    expect(syncScript).toContain('assertAxiomIdentityFiles')
    expect(syncScript).toContain('Upstream merge conflicted')
    expect(syncScript).toContain('b6c06723-a52f-5004-ad9f-f39666f5e928')
    expect(syncScript).toContain('com.axiomlabs.orca.mobile')
  })
})
