## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/27937867674
- Upstream ref/tag: v1.4.91
- Intended Axiom version/tag: 1.4.91-axiom.1 / axiom-v1.4.91-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.91-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/main/daemon/daemon-pty-adapter.ts`

## Captured git status
```
M  config/scripts/locale-key-overrides.mjs
UU package.json
A  src/cli/handlers/agent-hooks.test.ts
M  src/cli/handlers/agent-hooks.ts
M  src/main/daemon/daemon-pty-adapter.test.ts
UU src/main/daemon/daemon-pty-adapter.ts
M  src/main/daemon/daemon-server.ts
M  src/main/daemon/post-ready-flush-gate.test.ts
M  src/main/daemon/post-ready-flush-gate.ts
M  src/main/daemon/session.test.ts
M  src/main/daemon/session.ts
M  src/main/daemon/terminal-host.test.ts
M  src/main/daemon/terminal-host.ts
M  src/main/daemon/types.ts
M  src/main/external-editor-launch.test.ts
M  src/main/external-editor-launch.ts
M  src/main/git/remove-worktree.test.ts
M  src/main/git/runner.ts
M  src/main/git/worktree.ts
M  src/main/ipc/pty.test.ts
M  src/main/ipc/shell.test.ts
M  src/main/ipc/shell.ts
M  src/main/persistence.test.ts
M  src/main/persistence.ts
M  src/main/providers/local-pty-provider.test.ts
M  src/main/providers/local-pty-provider.ts
M  src/main/providers/local-pty-shell-ready.test.ts
M  src/main/providers/local-pty-shell-ready.ts
A  src/main/shell-ready-marker-scanner.ts
M  src/relay/git-handler-branch-cleanup.test.ts
M  src/relay/git-handler-branch-cleanup.ts
M  src/relay/git-handler-ops.ts
M  src/relay/git-handler.ts
M  src/renderer/src/components/sidebar/Sidebar.test.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanDrawer.task-status-sync.test.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanDrawer.tsx
M  src/renderer/src/components/sidebar/WorktreeList.lineage-child-card.test.ts
M  src/renderer/src/components/sidebar/WorktreeList.tsx
M  src/renderer/src/components/sidebar/index.tsx
A  src/renderer/src/components/sidebar/preserved-branch-toast.test.tsx
A  src/renderer/src/components/sidebar/preserved-branch-toast.tsx
M  src/renderer/src/components/sidebar/worktree-list-indentation.test.ts
M  src/renderer/src/components/sidebar/worktree-list-indentation.ts
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
M  src/renderer/src/hooks/useIpcEvents.ts
A  src/renderer/src/hooks/worktree-change-refresh-queue.test.ts
A  src/renderer/src/hooks/worktree-change-refresh-queue.ts
M  src/renderer/src/i18n/locales/en.json
M  src/renderer/src/i18n/locales/es.json
M  src/renderer/src/i18n/locales/ja.json
M  src/renderer/src/i18n/locales/ko.json
M  src/renderer/src/i18n/locales/zh.json
M  src/renderer/src/lib/agent-hibernation-planner.test.ts
M  src/renderer/src/lib/agent-hibernation-planner.ts
M  src/renderer/src/lib/resume-sleeping-agent-session.test.ts
M  src/renderer/src/lib/resume-sleeping-agent-session.ts
M  src/renderer/src/lib/worktree-activation-created-agent.test.ts
A  src/renderer/src/runtime/mobile-session-tab-close.ts
A  src/renderer/src/store/slices/agent-status-manual-sleep-capture.test.ts
M  src/renderer/src/store/slices/agent-status.ts
M  src/renderer/src/store/slices/store-cascades.test.ts
M  src/renderer/src/store/slices/tabs.test.ts
M  src/renderer/src/store/slices/terminals.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/shared/agent-session-resume.ts
M  src/shared/git-branch-cleanup.test.ts
M  src/shared/git-branch-cleanup.ts
M  src/shared/workspace-session-schema.test.ts
M  src/shared/workspace-session-sleeping-agents.ts
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

