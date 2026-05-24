## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26373206045
- Upstream ref/tag: v1.4.27
- Intended Axiom version/tag: 1.4.27-axiom.1 / axiom-v1.4.27-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.27-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.test.ts`

## Captured git status
```
R  config/patches/@xterm__addon-ligatures@0.11.0-beta.216.patch -> config/patches/@xterm__addon-ligatures@0.11.0-beta.220.patch
D  config/patches/@xterm__addon-webgl@0.20.0-beta.215.patch
A  config/patches/@xterm__addon-webgl@0.20.0-beta.219.patch
UU package.json
M  pnpm-lock.yaml
M  src/renderer/src/components/WorktreeJumpPalette.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanCard.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
A  src/renderer/src/components/sidebar/WorktreeTitleInlineRename.test.tsx
A  src/renderer/src/components/sidebar/WorktreeTitleInlineRename.tsx
UU src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.test.ts
A  src/renderer/src/lib/local-preflight-context.test.ts
M  src/renderer/src/lib/local-preflight-context.ts
M  src/renderer/src/lib/pane-manager/pane-lifecycle.ts
M  src/renderer/src/lib/worktree-palette-search.test.ts
M  src/renderer/src/lib/worktree-palette-search.ts
M  src/shared/keybindings.test.ts
M  src/shared/keybindings.ts
M  src/shared/window-shortcut-policy.test.ts
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

