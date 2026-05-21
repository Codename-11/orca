## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26260199276
- Upstream ref/tag: v1.4.18-rc.4
- Intended Axiom version/tag: 1.4.18-rc.4.axiom.1 / axiom-v1.4.18-rc.4.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.18-rc.4.axiom.1`
- Classification: `auto_remediate` — Fork identity/update-feed files need policy-guided agent remediation: config/electron-builder.config.cjs

## Conflicted files
- `config/electron-builder.config.cjs`
- `package.json`
- `src/renderer/src/components/sidebar/SidebarNav.tsx`

## Captured git status
```
M  .github/workflows/release-cut.yml
UU config/electron-builder.config.cjs
A  config/scripts/electron-builder-config.test.mjs
UU package.json
M  skills/orca-cli/SKILL.md
M  src/cli/codex-command-classification.test.ts
M  src/cli/codex-command-classification.ts
M  src/cli/format.test.ts
M  src/cli/format.ts
M  src/cli/handlers/terminal.ts
M  src/cli/help.ts
M  src/cli/index.test.ts
M  src/cli/specs/core.ts
M  src/main/cli/wsl-cli-installer.test.ts
M  src/main/cli/wsl-cli-installer.ts
M  src/main/daemon/pty-subprocess.test.ts
M  src/main/daemon/pty-subprocess.ts
M  src/main/github/client-work-items.test.ts
M  src/main/github/client.ts
M  src/main/github/pr-refresh-coordinator.ts
M  src/main/hooks.test.ts
M  src/main/hooks.ts
M  src/main/ipc/pty.test.ts
M  src/main/ipc/pty.ts
M  src/main/ipc/remote-workspace.test.ts
M  src/main/ipc/remote-workspace.ts
M  src/main/ipc/ssh.test.ts
M  src/main/ipc/ssh.ts
M  src/main/ipc/workspace-space.test.ts
M  src/main/ipc/workspace-space.ts
M  src/main/ipc/worktree-remote.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/persistence.test.ts
M  src/main/persistence.ts
M  src/main/providers/local-pty-provider.test.ts
M  src/main/providers/local-pty-provider.ts
M  src/main/providers/provider-dispatch.test.ts
A  src/main/providers/ssh-pty-id.ts
M  src/main/providers/ssh-pty-provider.test.ts
M  src/main/providers/ssh-pty-provider.ts
M  src/main/providers/types.ts
A  src/main/pty/codex-home-wsl-env.test.ts
A  src/main/pty/codex-home-wsl-env.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/terminal.ts
M  src/main/runtime/rpc/terminal-multiplex.test.ts
M  src/main/runtime/rpc/terminal-subscribe-buffer.test.ts
M  src/main/ssh/ssh-relay-deploy.test.ts
M  src/main/ssh/ssh-relay-session-agent-hooks.integration.test.ts
M  src/main/ssh/ssh-relay-session.test.ts
M  src/main/ssh/ssh-relay-session.ts
M  src/main/startup/run-electron-vite-dev.test.ts
D  src/main/workspace-package-manager-cache-cleanup.test.ts
D  src/main/workspace-package-manager-cache-cleanup.ts
M  src/main/workspace-space-analysis.test.ts
M  src/main/workspace-space-analysis.ts
A  src/main/worktree-removal-safety.test.ts
M  src/main/worktree-removal-safety.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/relay/pty-handler.test.ts
M  src/relay/relay.ts
M  src/relay/subprocess.test.ts
M  src/renderer/src/assets/main.css
M  src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/Terminal.tsx
M  src/renderer/src/components/WorktreeJumpPalette.tsx
M  src/renderer/src/components/activity/ActivityTitlebarControls.tsx
A  src/renderer/src/components/activity/useActivityUnreadCount.ts
A  src/renderer/src/components/dashboard/DashboardAgentRow.test.tsx
M  src/renderer/src/components/dashboard/DashboardAgentRow.tsx
M  src/renderer/src/components/editor/CombinedDiffViewer.tsx
M  src/renderer/src/components/editor/DiffNotesSendMenu.tsx
M  src/renderer/src/components/editor/EditorPanelHeader.tsx
M  src/renderer/src/components/right-sidebar/PRActions.tsx
M  src/renderer/src/components/settings/AccountsPane.tsx
M  src/renderer/src/components/settings/InputPane.tsx
M  src/renderer/src/components/settings/RepositoryHooksSection.test.ts
M  src/renderer/src/components/settings/RepositoryHooksSection.tsx
A  src/renderer/src/components/settings/RepositoryPane.test.ts
M  src/renderer/src/components/settings/RepositoryPane.tsx
M  src/renderer/src/components/settings/Settings.tsx
M  src/renderer/src/components/settings/SshPane.tsx
M  src/renderer/src/components/settings/SshTargetForm.tsx
A  src/renderer/src/components/sidebar/DeleteWorktreeDialog.test.tsx
M  src/renderer/src/components/sidebar/DeleteWorktreeDialog.tsx
A  src/renderer/src/components/sidebar/DeleteWorktreeLineageNotice.tsx
M  src/renderer/src/components/sidebar/SetupScriptPromptCard.tsx
UU src/renderer/src/components/sidebar/SidebarNav.tsx
M  src/renderer/src/components/sidebar/delete-worktree-flow.test.ts
M  src/renderer/src/components/sidebar/delete-worktree-flow.ts
A  src/renderer/src/components/sidebar/workspace-delete-lineage.test.ts
A  src/renderer/src/components/sidebar/workspace-delete-lineage.ts
M  src/renderer/src/components/status-bar/SshStatusSegment.tsx
M  src/renderer/src/components/status-bar/StatusBar.tsx
M  src/renderer/src/components/status-bar/WorkspaceSpaceManagerPanel.tsx
A  src/renderer/src/components/status-bar/codex-restart-status-summary.test.ts
A  src/renderer/src/components/status-bar/codex-restart-status-summary.ts
M  src/renderer/src/components/terminal-pane/TerminalPane.tsx
M  src/renderer/src/components/terminal-pane/TerminalPaneOverlayLayer.tsx
M  src/renderer/src/hooks/useIpcEvents.test.ts
M  src/renderer/src/hooks/useIpcEvents.ts
M  src/renderer/src/hooks/usePrimarySelectionPaste.ts
M  src/renderer/src/lib/ensure-hooks-confirmed.test.ts
M  src/renderer/src/lib/ensure-hooks-confirmed.ts
M  src/renderer/src/lib/new-workspace.ts
M  src/renderer/src/lib/worktree-palette-search.test.ts
M  src/renderer/src/lib/worktree-palette-search.ts
M  src/renderer/src/store/slices/github.test.ts
M  src/renderer/src/store/slices/github.ts
M  src/renderer/src/store/slices/ssh.ts
M  src/renderer/src/store/slices/store-cascades.test.ts
M  src/renderer/src/store/slices/workspace-space.test.ts
M  src/renderer/src/store/slices/workspace-space.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/shared/constants.test.ts
M  src/shared/constants.ts
A  src/shared/hook-command-source-policy.test.ts
M  src/shared/hook-command-source-policy.ts
D  src/shared/package-manager-cache-cleanup.test.ts
D  src/shared/package-manager-cache-cleanup.ts
M  src/shared/runtime-types.ts
M  src/shared/ssh-types.ts
M  src/shared/types.ts
M  src/shared/work-items.ts
M  src/shared/workspace-space-types.ts
M  tests/e2e/droid-notification.spec.ts
M  tests/e2e/helpers/source-control-ai-generation.ts
M  tests/e2e/helpers/store.ts
M  tests/e2e/helpers/terminal.ts
M  tests/e2e/setup-script-import.spec.ts
M  tests/e2e/source-control-pr-generation-switch.spec.ts
M  tests/e2e/terminal-attention.spec.ts
M  tests/e2e/terminal-panes.spec.ts
M  tests/e2e/terminal-restart-persistence.spec.ts
M  tests/e2e/workspace-space-git-status.spec.ts
M  tests/e2e/worktree-lineage.spec.ts
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

