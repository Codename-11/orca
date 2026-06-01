## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26782489136
- Upstream ref/tag: v1.4.39
- Intended Axiom version/tag: 1.4.39-axiom.1 / axiom-v1.4.39-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.39-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/hooks/useIpcEvents.test.ts`

## Captured git status
```
M  config/tsconfig.cli.json
D  docs/codex-account-auth-isolated-launch-homes.md
UU package.json
M  src/main/codex-accounts/runtime-home-service.test.ts
M  src/main/codex-accounts/runtime-home-service.ts
M  src/main/codex-accounts/service.test.ts
M  src/main/codex-accounts/service.ts
M  src/main/codex/codex-config-mirror.test.ts
M  src/main/codex/codex-config-mirror.ts
D  src/main/codex/codex-config-sync-state.ts
D  src/main/codex/codex-launch-home-paths.test.ts
D  src/main/codex/codex-launch-home-paths.ts
M  src/main/codex/config-toml-trust.ts
M  src/main/codex/hook-service.test.ts
M  src/main/codex/hook-service.ts
M  src/main/daemon/pty-subprocess.test.ts
M  src/main/index.ts
M  src/main/ipc/pty.test.ts
M  src/main/providers/local-pty-provider.test.ts
A  src/main/window/focus-existing-window.test.ts
A  src/main/window/focus-existing-window.ts
M  src/renderer/src/components/sidebar/ImportedWorktreesVisibilityLine.test.tsx
M  src/renderer/src/components/sidebar/ImportedWorktreesVisibilityLine.tsx
M  src/renderer/src/components/sidebar/imported-worktrees-card-actions.test.ts
M  src/renderer/src/components/sidebar/imported-worktrees-card-actions.ts
M  src/renderer/src/components/sidebar/worktree-list-imported-rows.test.ts
UU src/renderer/src/hooks/useIpcEvents.test.ts
A  src/shared/external-worktree-visibility.ts
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

