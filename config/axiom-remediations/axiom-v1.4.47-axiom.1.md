## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26994681873
- Upstream ref/tag: v1.4.47
- Intended Axiom version/tag: 1.4.47-axiom.1 / axiom-v1.4.47-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.47-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/main/ipc/settings.test.ts`
- `src/main/persistence.test.ts`
- `src/renderer/src/components/settings/GeneralPane.tsx`
- `src/renderer/src/components/sidebar/SidebarNav.test.tsx`
- `src/renderer/src/components/sidebar/SidebarNav.tsx`
- `src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts`

## Captured git status
```
A  .github/workflows/golden-e2e-experiment.yml
M  README.md
M  config/scripts/latest-stable-release.test.mjs
M  docs/readme/README.es.md
M  docs/readme/README.ja.md
M  docs/readme/README.ko.md
M  docs/readme/README.zh-CN.md
A  notes/orca-serve-terminal-persistence.md
UU package.json
M  src/main/codex-accounts/service.test.ts
M  src/main/codex-accounts/service.ts
M  src/main/daemon/shell-ready.test.ts
M  src/main/daemon/shell-ready.ts
M  src/main/git/status-upstream-probe-churn.test.ts
M  src/main/git/status.ts
M  src/main/github/gh-utils.test.ts
M  src/main/github/gh-utils.ts
M  src/main/gitlab/gl-utils.test.ts
M  src/main/gitlab/gl-utils.ts
A  src/main/gitlab/project-ref-inflight.ts
M  src/main/index.ts
A  src/main/ipc/preflight-wsl-agent-detection.ts
M  src/main/ipc/preflight.test.ts
M  src/main/ipc/preflight.ts
M  src/main/ipc/pty.test.ts
M  src/main/ipc/pty.ts
M  src/main/ipc/repos.ts
UU src/main/ipc/settings.test.ts
M  src/main/ipc/settings.ts
M  src/main/ipc/shell.test.ts
M  src/main/menu/register-app-menu.test.ts
M  src/main/menu/register-app-menu.ts
UU src/main/persistence.test.ts
M  src/main/persistence.ts
M  src/main/project-groups/nested-repo-import.test.ts
M  src/main/project-groups/nested-repo-import.ts
M  src/main/providers/__tests__/shell-ready-framework-example.test.ts
M  src/main/providers/__tests__/shell-ready-framework/README.md
M  src/main/providers/__tests__/shell-ready-framework/shell-script-test.ts
M  src/main/providers/local-pty-provider.test.ts
M  src/main/providers/local-pty-provider.ts
M  src/main/providers/local-pty-shell-ready.test.ts
M  src/main/providers/local-pty-shell-ready.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/repo.test.ts
M  src/main/runtime/rpc/methods/repo.ts
M  src/main/runtime/rpc/methods/session-tabs.ts
M  src/main/shell-templates.ts
M  src/main/window/createMainWindow.test.ts
M  src/main/window/createMainWindow.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/relay/pty-shell-launch.test.ts
M  src/relay/pty-shell-launch.ts
M  src/renderer/src/assets/main.css
M  src/renderer/src/assets/terminal.css
M  src/renderer/src/components/Terminal.tsx
M  src/renderer/src/components/editor/EditorContent.tsx
M  src/renderer/src/components/editor/EditorPanel.tsx
M  src/renderer/src/components/editor/EditorPanelHeader.tsx
A  src/renderer/src/components/editor/EditorPanelMarkdownActionsMenu.tsx
M  src/renderer/src/components/editor/EditorPanelShell.tsx
M  src/renderer/src/components/editor/MarkdownPreview.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.test.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.tsx
M  src/renderer/src/components/mobile/mobile-platform-copy.ts
M  src/renderer/src/components/onboarding/RepoStep.test.tsx
M  src/renderer/src/components/onboarding/RepoStep.tsx
M  src/renderer/src/components/onboarding/use-onboarding-flow.ts
A  src/renderer/src/components/repo/NestedRepoChecklist.test.tsx
A  src/renderer/src/components/repo/NestedRepoChecklist.tsx
D  src/renderer/src/components/repo/NestedRepoTreePreview.tsx
M  src/renderer/src/components/right-sidebar/FileExplorer.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/source-control-split-open.test.ts
M  src/renderer/src/components/right-sidebar/source-control-split-open.ts
M  src/renderer/src/components/right-sidebar/useFileExplorerHandlers.test.ts
M  src/renderer/src/components/right-sidebar/useFileExplorerHandlers.ts
M  src/renderer/src/components/settings/AgentsPane.test.tsx
M  src/renderer/src/components/settings/AgentsPane.tsx
A  src/renderer/src/components/settings/AppearancePane.test.tsx
M  src/renderer/src/components/settings/AppearancePane.tsx
A  src/renderer/src/components/settings/GeneralCacheTimerSection.tsx
A  src/renderer/src/components/settings/GeneralEditorSettingsSection.tsx
A  src/renderer/src/components/settings/GeneralNetworkSettingsSection.tsx
UU src/renderer/src/components/settings/GeneralPane.tsx
A  src/renderer/src/components/settings/GeneralSupportSection.tsx
A  src/renderer/src/components/settings/GeneralUpdateSettingsSection.tsx
A  src/renderer/src/components/settings/GeneralWorkspaceSettingsSection.tsx
M  src/renderer/src/components/settings/MobileSettingsPane.tsx
A  src/renderer/src/components/settings/OpenInMenuSetting.test.ts
A  src/renderer/src/components/settings/OpenInMenuSetting.tsx
M  src/renderer/src/components/settings/RepositoryPane.tsx
A  src/renderer/src/components/settings/RepositoryPaneDraftInput.test.tsx
M  src/renderer/src/components/settings/appearance-search.ts
M  src/renderer/src/components/settings/general-search.ts
M  src/renderer/src/components/settings/terminal-search.test.ts
M  src/renderer/src/components/sidebar/AddRepoDialog.tsx
A  src/renderer/src/components/sidebar/AddRepoDialogStepContent.test.tsx
M  src/renderer/src/components/sidebar/AddRepoDialogStepContent.tsx
A  src/renderer/src/components/sidebar/AddRepoNestedImportStep.test.tsx
M  src/renderer/src/components/sidebar/AddRepoNestedImportStep.tsx
M  src/renderer/src/components/sidebar/AddRepoStepIndicator.tsx
M  src/renderer/src/components/sidebar/SidebarHeader.tsx
UU src/renderer/src/components/sidebar/SidebarNav.test.tsx
UU src/renderer/src/components/sidebar/SidebarNav.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
M  src/renderer/src/components/sidebar/WorktreeCardAgents.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCardAgents.tsx
M  src/renderer/src/components/sidebar/WorktreeList.tsx
M  src/renderer/src/components/sidebar/WorktreeOpenInMenu.test.tsx
M  src/renderer/src/components/sidebar/WorktreeOpenInMenu.tsx
M  src/renderer/src/components/sidebar/useAddRepoCloneFlow.ts
M  src/renderer/src/components/sidebar/useAddRepoNestedImportFlow.ts
M  src/renderer/src/components/sidebar/worktree-card-compact-agents.tsx
M  src/renderer/src/components/sidebar/worktree-list-groups.test.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.ts
M  src/renderer/src/components/sidebar/worktree-sidebar-drop-preview.test.ts
M  src/renderer/src/components/sidebar/worktree-sidebar-drop-preview.ts
M  src/renderer/src/components/tab-bar/EditorFileTab.test.tsx
M  src/renderer/src/components/tab-bar/EditorFileTab.tsx
M  src/renderer/src/components/tab-bar/TabBar.tsx
M  src/renderer/src/components/tab-bar/tab-title-tooltip.test.tsx
M  src/renderer/src/components/tab-group/TabGroupPanel.tsx
M  src/renderer/src/components/tab-group/useTabGroupWorkspaceModel.focus.test.ts
M  src/renderer/src/components/tab-group/useTabGroupWorkspaceModel.ts
M  src/renderer/src/components/terminal-pane/TerminalPane.tsx
M  src/renderer/src/components/terminal-pane/pty-connection-types.ts
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
M  src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.test.ts
M  src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.ts
A  src/renderer/src/components/terminal-pane/terminal-conpty-device-attributes.test.ts
A  src/renderer/src/components/terminal-pane/terminal-conpty-device-attributes.ts
M  src/renderer/src/components/terminal-pane/use-notification-dispatch.test.ts
M  src/renderer/src/components/terminal-pane/use-notification-dispatch.ts
UU src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts
M  src/renderer/src/hooks/agent-hook-completion-notifications.test.ts
M  src/renderer/src/hooks/agent-hook-completion-notifications.ts
A  src/renderer/src/lib/local-file-manager-label.ts
A  src/renderer/src/lib/nested-repo-selected-paths.test.ts
A  src/renderer/src/lib/nested-repo-selected-paths.ts
A  src/renderer/src/lib/open-in-app-catalog.tsx
D  src/renderer/src/lib/pane-manager/pane-terminal-cursor-suppression.ts
M  src/renderer/src/lib/pane-manager/pane-terminal-foreground-render-settle.ts
M  src/renderer/src/lib/pane-manager/pane-terminal-output-scheduler.test.ts
M  src/renderer/src/lib/pane-manager/pane-terminal-output-scheduler.ts
M  src/renderer/src/lib/pane-manager/windows-pty-compatibility.test.ts
M  src/renderer/src/lib/pane-manager/windows-pty-compatibility.ts
A  src/renderer/src/lib/repo-display-labels.test.ts
A  src/renderer/src/lib/repo-display-labels.ts
M  src/renderer/src/lib/workspace-session-browser-history.test.ts
M  src/renderer/src/lib/workspace-session-editor-drafts.test.ts
M  src/renderer/src/lib/workspace-session-liveness.test.ts
M  src/renderer/src/lib/workspace-session-patch.test.ts
M  src/renderer/src/lib/workspace-session-patch.ts
M  src/renderer/src/lib/workspace-session-relevant-fields.test.ts
M  src/renderer/src/lib/workspace-session.test.ts
M  src/renderer/src/lib/workspace-session.ts
M  src/renderer/src/runtime/web-session-tabs-sync.test.ts
M  src/renderer/src/runtime/web-session-tabs-sync.ts
M  src/renderer/src/store/slices/editor.test.ts
M  src/renderer/src/store/slices/editor.ts
M  src/renderer/src/store/slices/settings.test.ts
M  src/renderer/src/store/slices/settings.ts
M  src/renderer/src/store/slices/store-session-cascades.test.ts
M  src/renderer/src/store/slices/tabs.test.ts
M  src/renderer/src/store/slices/tabs.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/constants.ts
M  src/shared/open-in-applications.test.ts
M  src/shared/open-in-applications.ts
M  src/shared/types.ts
M  src/shared/workspace-session-schema.ts
A  tests/e2e/golden-core-flows.spec.ts
M  tests/e2e/helpers/orca-app.ts
A  tests/e2e/settings-display-name-ime.spec.ts
A  tests/e2e/terminal-codex-cursor-jitter-repro.spec.ts
A  tests/e2e/terminal-cursor-raster-probe.ts
A  tools/repro-macos-renderer-close-teardown.cjs
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

