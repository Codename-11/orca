## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26488145512
- Upstream ref/tag: v1.4.31-rc.0
- Intended Axiom version/tag: 1.4.31-rc.0.axiom.1 / axiom-v1.4.31-rc.0.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.31-rc.0.axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/main/updater.ts`

## Captured git status
```
M  config/scripts/ensure-native-runtime.mjs
A  config/scripts/ensure-native-runtime.test.mjs
M  config/scripts/rebuild-native-deps.mjs
A  config/scripts/verify-release-required-assets.test.mjs
A  docs/reference/keyboard-layout-shortcut-dispatch.md
M  mobile/src/hooks/use-mobile-dictation.ts
UU package.json
M  src/main/git/repo.test.ts
M  src/main/git/repo.ts
M  src/main/git/worktree.test.ts
M  src/main/git/worktree.ts
M  src/main/ipc/repos-remote.test.ts
M  src/main/ipc/worktree-remote.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/rate-limits/claude-pty.test.ts
M  src/main/rate-limits/claude-pty.ts
M  src/main/rate-limits/codex-fetcher.test.ts
M  src/main/rate-limits/codex-fetcher.ts
A  src/main/rate-limits/hidden-pty-cleanup.test.ts
A  src/main/rate-limits/hidden-pty-cleanup.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/updater-fallback.ts
A  src/main/updater-prerelease-feed-readiness.test.ts
M  src/main/updater-prerelease-feed.test.ts
M  src/main/updater-prerelease-feed.ts
M  src/main/updater.fallback.test.ts
M  src/main/updater.test.ts
UU src/main/updater.ts
M  src/renderer/src/App.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.test.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.tsx
M  src/renderer/src/components/right-sidebar/useFileExplorerKeys.ts
A  src/renderer/src/components/settings/AgentSkillSetupPanel.test.tsx
M  src/renderer/src/components/settings/AgentSkillSetupPanel.tsx
M  src/renderer/src/components/settings/GitPane.tsx
M  src/renderer/src/components/settings/git-search.ts
A  src/renderer/src/components/terminal-pane/terminal-file-link-hit-testing.ts
A  src/renderer/src/components/terminal-pane/terminal-file-open-routing.ts
M  src/renderer/src/components/terminal-pane/terminal-link-handlers.test.ts
M  src/renderer/src/components/terminal-pane/terminal-link-handlers.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts
A  src/renderer/src/components/terminal-pane/wrapped-terminal-link-ranges.ts
M  src/renderer/src/components/terminal-pane/xterm-bypass-policy.test.ts
M  src/renderer/src/components/terminal-pane/xterm-bypass-policy.ts
A  src/renderer/src/hooks/requestVirtualizedScrollAnchorRecord.ts
A  src/renderer/src/hooks/useVirtualizedScrollAnchor.listener-deps.test.ts
M  src/renderer/src/hooks/useVirtualizedScrollAnchor.test.ts
M  src/renderer/src/hooks/useVirtualizedScrollAnchor.ts
A  src/renderer/src/hooks/virtualizedScrollOffsetRestore.ts
A  src/renderer/src/lib/floating-workspace-shortcut-policy.ts
M  src/renderer/src/lib/floating-workspace-terminal-actions.test.ts
M  src/renderer/src/lib/floating-workspace-terminal-actions.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/shared/keybindings.test.ts
M  src/shared/keybindings.ts
M  src/shared/types.ts
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

