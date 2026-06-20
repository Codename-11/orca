## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/27866137516
- Upstream ref/tag: v1.4.87
- Intended Axiom version/tag: 1.4.87-axiom.1 / axiom-v1.4.87-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.87-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `tests/e2e/terminal-raw-emoji-table-scroll-restore.spec.ts`

## Captured git status
```
UU package.json
M  src/renderer/src/components/sidebar/WorktreeCard.pr-display.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
M  src/renderer/src/components/sidebar/WorktreeCardStatusSlot.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCardStatusSlot.tsx
M  src/renderer/src/components/sidebar/WorktreeContextMenu.test.ts
M  src/renderer/src/components/sidebar/WorktreeContextMenu.tsx
M  tests/e2e/terminal-column-probes.ts
M  tests/e2e/terminal-long-table-scroll-restore.spec.ts
A  tests/e2e/terminal-node-command.ts
M  tests/e2e/terminal-opencode-emoji-table-rendering.spec.ts
M  tests/e2e/terminal-pty-readiness.ts
UU tests/e2e/terminal-raw-emoji-table-scroll-restore.spec.ts
```

## Axiom safety notes
- Bot branch PR only; do not push conflict remediation directly to `axiom/deploy`.
- Preserve side-by-side identity, updater feed, fork semver, profile portability, and Forge provider/task-registry additions.
- Protected-file deletion or fork identity/update-feed changes require explicit review before merge.

## Verification checklist
- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm run typecheck`
- [ ] `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs`
- [ ] `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml`
- [ ] `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json`
- [ ] `git diff --check`

