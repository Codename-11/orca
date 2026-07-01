import { describe, expect, it } from 'vitest'
import { remediationBody } from './axiom-request-merge-remediation.mjs'

const policy = {
  targetBranch: 'axiom/deploy',
  requiredChecks: [
    'pnpm install --frozen-lockfile',
    'pnpm run typecheck',
    'pnpm exec vitest run --config config/vitest.config.ts config/scripts/axiom-upstream-sync-release.test.mjs'
  ]
}

const classification = {
  action: 'auto_remediate',
  reason: 'Conflicts are eligible for agent PR remediation.'
}

describe('remediationBody', () => {
  it('truncates very large git status output before creating a GitHub PR body', () => {
    const statusRecords = Array.from({ length: 2000 }, (_, index) => ({
      status: index % 3 === 0 ? 'A ' : 'M ',
      path: `src/very/deep/generated/path-${String(index).padStart(4, '0')}/with-a-long-file-name-that-would-inflate-the-pr-body.ts`,
      deleted: false
    }))

    const body = remediationBody({
      classification,
      conflicts: ['package.json', 'src/main/index.ts'],
      statusRecords,
      policy,
      branchName: 'bot/upstream-sync-axiom-v1.4.114-axiom.1'
    })

    expect(body.length).toBeLessThan(65_536)
    expect(body).toContain('omitted')
    expect(body).toContain('additional status records')
    expect(body).toContain('## Verification checklist')
  })
})
