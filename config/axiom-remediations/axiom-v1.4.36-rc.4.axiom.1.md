## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26679079994
- Upstream ref/tag: v1.4.36-rc.4
- Intended Axiom version/tag: 1.4.36-rc.4.axiom.1 / axiom-v1.4.36-rc.4.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.36-rc.4.axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/settings/GeneralPane.tsx`

## Captured git status
```
M  .github/workflows/homebrew-bump.yml
M  .github/workflows/release-cut.yml
M  Casks/orca.rb
A  Casks/orca@rc.rb
A  DEVELOPING.md
M  config/scripts/package-electron-runtime-contract.test.mjs
M  config/scripts/publish-complete-draft-releases.mjs
M  config/scripts/publish-complete-draft-releases.test.mjs
A  docs/remote-web-paste-activity-fixes.md
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
M  mobile/src/terminal/TerminalWebView.tsx
M  mobile/src/terminal/terminal-gesture-input.test.ts
M  mobile/src/terminal/terminal-gesture-input.ts
M  mobile/src/terminal/terminal-webview-scroll-routing.test.ts
UU package.json
M  src/main/agent-hooks/first-work-branch-rename.ts
M  src/main/daemon/daemon-health.test.ts
M  src/main/daemon/daemon-main.test.ts
M  src/main/daemon/daemon-pty-adapter.test.ts
M  src/main/daemon/daemon-pty-adapter.ts
M  src/main/daemon/daemon-pty-provider.test.ts
M  src/main/daemon/daemon-server.test.ts
M  src/main/daemon/daemon-server.ts
M  src/main/daemon/daemon-spawner.test.ts
M  src/main/daemon/production-launcher.test.ts
M  src/main/daemon/pty-subprocess.test.ts
M  src/main/daemon/pty-subprocess.ts
M  src/main/daemon/reattach-snapshot.test.ts
M  src/main/daemon/session.test.ts
M  src/main/daemon/session.ts
M  src/main/daemon/terminal-host-startup.test.ts
M  src/main/daemon/terminal-host.test.ts
M  src/main/daemon/terminal-host.ts
M  src/main/daemon/types.ts
M  src/main/git/remote.test.ts
M  src/main/git/remote.ts
M  src/main/index.ts
M  src/main/ipc/filesystem.test.ts
M  src/main/ipc/filesystem.ts
M  src/main/ipc/workspace-ports.test.ts
M  src/main/ipc/workspace-ports.ts
M  src/main/providers/ssh-git-provider.test.ts
M  src/main/providers/ssh-git-provider.ts
M  src/main/providers/types.ts
A  src/main/rate-limits/codex-fetcher-auth-errors.test.ts
M  src/main/rate-limits/codex-fetcher.ts
M  src/main/runtime/orca-runtime-git.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/clipboard.test.ts
M  src/main/runtime/rpc/methods/clipboard.ts
M  src/main/runtime/rpc/methods/git.test.ts
M  src/main/runtime/rpc/methods/git.ts
M  src/main/runtime/runtime-rpc.ts
M  src/main/startup/single-instance-lock.test.ts
M  src/main/startup/single-instance-lock.ts
M  src/main/text-generation/commit-message-text-generation.test.ts
M  src/main/text-generation/commit-message-text-generation.ts
M  src/main/window/attach-main-window-services.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/relay/agent-exec-handler.test.ts
M  src/relay/agent-exec-handler.ts
M  src/relay/git-handler.test.ts
M  src/relay/git-handler.ts
M  src/renderer/src/App.tsx
M  src/renderer/src/assets/main.css
M  src/renderer/src/assets/markdown-preview.css
M  src/renderer/src/assets/rich-markdown-editor.css
M  src/renderer/src/components/GitHubItemDialog.tsx
M  src/renderer/src/components/NewWorkspaceComposerCard.tsx
M  src/renderer/src/components/PullRequestPage.tsx
M  src/renderer/src/components/QuickOpen.tsx
M  src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/Terminal.tsx
M  src/renderer/src/components/WorktreeJumpPalette.tsx
M  src/renderer/src/components/agent/AgentCombobox.tsx
M  src/renderer/src/components/automations/CreateFromPicker.tsx
M  src/renderer/src/components/automations/WorkspaceCombobox.tsx
M  src/renderer/src/components/browser-pane/BrowserAddressBar.tsx
M  src/renderer/src/components/crash-report/CrashReportDialog.tsx
M  src/renderer/src/components/diff-comments/DiffCommentCard.tsx
M  src/renderer/src/components/diff-comments/DiffCommentPopover.tsx
M  src/renderer/src/components/diff-comments/useDiffCommentDecorator.tsx
M  src/renderer/src/components/editor/CodeBlockCopyButton.tsx
M  src/renderer/src/components/editor/CombinedDiffViewer.tsx
M  src/renderer/src/components/editor/DiffSectionItem.tsx
M  src/renderer/src/components/editor/DiffViewer.tsx
M  src/renderer/src/components/editor/EditorPanel.tsx
M  src/renderer/src/components/editor/EditorPanelShell.tsx
M  src/renderer/src/components/editor/IpynbViewer.tsx
M  src/renderer/src/components/editor/MarkdownPreview.tsx
M  src/renderer/src/components/editor/MonacoEditor.tsx
M  src/renderer/src/components/editor/RichMarkdownCodeBlock.tsx
M  src/renderer/src/components/editor/RichMarkdownEditor.tsx
M  src/renderer/src/components/editor/UntitledFileRenameDialog.tsx
M  src/renderer/src/components/editor/drag-selection-guard.ts
M  src/renderer/src/components/editor/rich-markdown-annotation-highlight.ts
A  src/renderer/src/components/editor/rich-markdown-auto-focus.test.ts
M  src/renderer/src/components/editor/rich-markdown-auto-focus.ts
A  src/renderer/src/components/editor/rich-markdown-review-note-layout.test.ts
A  src/renderer/src/components/editor/rich-markdown-review-note-layout.ts
M  src/renderer/src/components/editor/setup-contextual-copy.ts
M  src/renderer/src/components/feature-wall/agents-orchestration/OrchestrationPage.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalIconContextMenu.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.tsx
M  src/renderer/src/components/new-workspace/SmartWorkspaceNameField.tsx
M  src/renderer/src/components/onboarding/OnboardingInlineCommandTerminal.tsx
M  src/renderer/src/components/repo/RepoCombobox.tsx
M  src/renderer/src/components/right-sidebar/ChecksPanel.tsx
M  src/renderer/src/components/right-sidebar/FileExplorer.test.tsx
M  src/renderer/src/components/right-sidebar/FileExplorer.tsx
M  src/renderer/src/components/right-sidebar/FileExplorerRow.tsx
M  src/renderer/src/components/right-sidebar/FileExplorerVirtualRows.tsx
A  src/renderer/src/components/right-sidebar/FileExplorerVirtualRowsAddProject.test.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/checks-panel-content.tsx
A  src/renderer/src/components/right-sidebar/file-explorer-add-project-action.test.ts
A  src/renderer/src/components/right-sidebar/file-explorer-add-project-action.ts
M  src/renderer/src/components/right-sidebar/source-control-dropdown-items.test.ts
M  src/renderer/src/components/right-sidebar/source-control-dropdown-items.ts
M  src/renderer/src/components/right-sidebar/source-control-primary-action.ts
M  src/renderer/src/components/right-sidebar/useFileExplorerAutoReveal.ts
M  src/renderer/src/components/right-sidebar/useFileExplorerInlineInput.ts
M  src/renderer/src/components/right-sidebar/useFileExplorerReveal.ts
M  src/renderer/src/components/right-sidebar/useFileExplorerRowDrag.ts
M  src/renderer/src/components/settings/AccountsPane.tsx
UU src/renderer/src/components/settings/GeneralPane.tsx
M  src/renderer/src/components/settings/KeybindingsFileActions.tsx
M  src/renderer/src/components/settings/McpConfigSection.tsx
M  src/renderer/src/components/settings/MobilePane.tsx
M  src/renderer/src/components/settings/RepositoryPane.tsx
M  src/renderer/src/components/settings/Settings.tsx
M  src/renderer/src/components/settings/SshTargetCard.tsx
M  src/renderer/src/components/settings/VoicePane.tsx
M  src/renderer/src/components/settings/accounts-search.ts
A  src/renderer/src/components/settings/codex-account-auth-warning.test.ts
A  src/renderer/src/components/settings/codex-account-auth-warning.ts
M  src/renderer/src/components/shared/useDaemonActions.tsx
A  src/renderer/src/components/sidebar/AddProjectFromFolderDialog.test.tsx
A  src/renderer/src/components/sidebar/AddProjectFromFolderDialog.tsx
M  src/renderer/src/components/sidebar/AddRepoCreateStep.tsx
M  src/renderer/src/components/sidebar/AddRepoDialog.tsx
M  src/renderer/src/components/sidebar/AddRepoSetupStep.tsx
M  src/renderer/src/components/sidebar/RemoteFileBrowser.tsx
M  src/renderer/src/components/sidebar/SidebarFilter.tsx
M  src/renderer/src/components/sidebar/SidebarWorkspaceOptionsMenu.tsx
M  src/renderer/src/components/sidebar/SshDisconnectedDialog.tsx
M  src/renderer/src/components/sidebar/SshTargetRow.tsx
M  src/renderer/src/components/sidebar/WorktreeList.tsx
M  src/renderer/src/components/sidebar/index.tsx
A  src/renderer/src/components/sidebar/sidebar-project-drop.test.ts
A  src/renderer/src/components/sidebar/sidebar-project-drop.ts
A  src/renderer/src/components/sidebar/useSidebarProjectDrop.ts
M  src/renderer/src/components/sidebar/visible-worktrees.test.ts
M  src/renderer/src/components/sidebar/worktree-agent-activity-summary.ts
A  src/renderer/src/components/sidebar/worktree-section-activity.test.ts
A  src/renderer/src/components/sidebar/worktree-section-activity.ts
M  src/renderer/src/components/sparse/SparseCheckoutPresetSelect.tsx
M  src/renderer/src/components/stats/ShareUsageButton.tsx
M  src/renderer/src/components/status-bar/ResourceUsageStatusSegment.tsx
M  src/renderer/src/components/status-bar/SshStatusSegment.tsx
M  src/renderer/src/components/status-bar/StatusBar.tsx
M  src/renderer/src/components/status-bar/tooltip.test.ts
M  src/renderer/src/components/status-bar/tooltip.tsx
M  src/renderer/src/components/tab-bar/SortableTab.tsx
M  src/renderer/src/components/tab-bar/TabDragPreview.tsx
M  src/renderer/src/components/tab-bar/tab-title-tooltip.test.tsx
M  src/renderer/src/components/tab-group/useTabDragSplit.ts
M  src/renderer/src/components/tab-group/useTabGroupWorkspaceModel.ts
M  src/renderer/src/components/terminal-pane/TerminalPane.tsx
A  src/renderer/src/components/terminal-pane/expand-collapse.test.ts
M  src/renderer/src/components/terminal-pane/expand-collapse.ts
M  src/renderer/src/components/ui/popover.tsx
M  src/renderer/src/hooks/useComposerState.ts
M  src/renderer/src/hooks/useInstalledAgentSkills.ts
M  src/renderer/src/hooks/useSettingsNavigationMetadata.test.ts
M  src/renderer/src/hooks/useSettingsNavigationMetadata.ts
A  src/renderer/src/lib/agent-title-decoration.test.ts
A  src/renderer/src/lib/agent-title-decoration.ts
M  src/renderer/src/lib/document-theme.test.ts
M  src/renderer/src/lib/document-theme.ts
M  src/renderer/src/lib/launch-agent-in-new-tab.test.ts
M  src/renderer/src/lib/launch-agent-in-new-tab.ts
M  src/renderer/src/lib/markdown-review-notes.test.ts
M  src/renderer/src/lib/markdown-review-notes.ts
M  src/renderer/src/lib/pane-manager/pane-drag-reorder.ts
M  src/renderer/src/lib/pane-manager/pane-manager.ts
M  src/renderer/src/lib/pane-manager/pane-tree-ops.ts
A  src/renderer/src/lib/pane-manager/pane-tree-reparent-frame.test.ts
A  src/renderer/src/lib/tab-agent.test.ts
A  src/renderer/src/lib/tab-agent.ts
M  src/renderer/src/lib/tui-agent-startup.test.ts
A  src/renderer/src/lib/use-tab-agent.test.ts
A  src/renderer/src/lib/use-tab-agent.ts
M  src/renderer/src/lib/windows-terminal-capabilities.ts
M  src/renderer/src/lib/worktree-activation.test.ts
M  src/renderer/src/lib/worktree-activation.ts
M  src/renderer/src/lib/worktree-activity-state.test.ts
M  src/renderer/src/lib/worktree-activity-state.ts
M  src/renderer/src/lib/worktree-status.test.ts
M  src/renderer/src/lib/worktree-status.ts
M  src/renderer/src/runtime/runtime-git-client.test.ts
M  src/renderer/src/runtime/runtime-git-client.ts
M  src/renderer/src/runtime/sync-runtime-graph.test.ts
M  src/renderer/src/runtime/sync-runtime-graph.ts
M  src/renderer/src/runtime/web-session-tabs-sync.test.ts
M  src/renderer/src/runtime/web-session-tabs-sync.ts
M  src/renderer/src/store/slices/agent-status.test.ts
M  src/renderer/src/store/slices/agent-status.ts
M  src/renderer/src/store/slices/editor.test.ts
M  src/renderer/src/store/slices/editor.ts
M  src/renderer/src/store/slices/terminals.ts
M  src/renderer/src/store/slices/ui.ts
M  src/renderer/src/web/web-preload-api.test.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/agent-detection.ts
M  src/shared/agent-kind.test.ts
M  src/shared/agent-kind.ts
A  src/shared/codex-auth-errors.ts
A  src/shared/native-file-drop.test.ts
A  src/shared/native-file-drop.ts
M  src/shared/runtime-types.ts
M  src/shared/types.ts
M  src/shared/workspace-session-schema.test.ts
M  src/shared/workspace-session-schema.ts
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

