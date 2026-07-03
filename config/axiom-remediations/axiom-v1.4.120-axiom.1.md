## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/28679306504
- Upstream ref/tag: v1.4.120
- Intended Axiom version/tag: 1.4.120-axiom.1 / axiom-v1.4.120-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.120-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/main/daemon/daemon-pty-adapter.ts`
- `src/main/daemon/headless-emulator.ts`
- `src/main/ipc/pty.ts`
- `src/main/persistence.ts`
- `src/main/runtime/orca-runtime.ts`
- `src/main/runtime/rpc/terminal-subscribe-buffer.test.ts`
- `src/main/runtime/runtime-rpc.ts`
- `src/renderer/src/components/terminal-pane/pty-connection.ts`
- `src/renderer/src/components/terminal-pane/pty-transport.ts`
- `src/shared/terminal-stream-protocol.ts`

## Captured git status
```
M  .github/workflows/mobile.yml
M  .github/workflows/release-cut.yml
M  README.md
M  config/scripts/package-electron-runtime-contract.test.mjs
A  config/scripts/repro-windows-apphang-terminal-activation.mjs
A  config/scripts/verify-windows-inner-signature.mjs
A  config/scripts/verify-windows-inner-signature.test.mjs
A  config/scripts/windows-apphang-repro/apphang-report-summary.mjs
A  config/scripts/windows-apphang-repro/electron-dev-session.mjs
A  config/scripts/windows-apphang-repro/repro-timing.mjs
A  config/scripts/windows-apphang-repro/terminal-activation-scenario.mjs
A  config/scripts/windows-apphang-repro/wsl-workspace-fixture.mjs
M  config/tsconfig.cli.json
M  docs/assets/readme-downloads.svg
A  docs/claude-fable-weekly-usage-meter.md
M  mobile/app.json
M  mobile/app/h/[hostId]/files/preview/[worktreeId].tsx
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
M  mobile/package.json
M  mobile/pnpm-lock.yaml
M  mobile/src/files/MobileFileMarkdownPreview.tsx
A  mobile/src/files/MobileFilePreviewBody.tsx
A  mobile/src/files/MobileFilePreviewEditableSource.tsx
A  mobile/src/files/MobileFilePreviewScreen.test.ts
M  mobile/src/files/MobileFilePreviewScreen.tsx
M  mobile/src/files/MobileFilePreviewSourceText.tsx
A  mobile/src/files/mobile-file-preview-editability.ts
A  mobile/src/files/mobile-file-preview-line-column.test.ts
A  mobile/src/files/mobile-file-preview-line-column.ts
M  mobile/src/files/mobile-file-preview-request.test.ts
M  mobile/src/files/mobile-file-preview-request.ts
A  mobile/src/files/mobile-file-preview-response.ts
M  mobile/src/files/mobile-file-preview-route.test.ts
M  mobile/src/files/mobile-file-preview-route.ts
A  mobile/src/files/mobile-file-preview-source.test.ts
A  mobile/src/files/mobile-file-preview-source.ts
M  mobile/src/files/mobile-file-preview-styles.ts
A  mobile/src/files/mobile-terminal-artifact-grant-refresh.ts
A  mobile/src/files/terminal-artifact-grant-error.ts
M  mobile/src/session/mobile-image-attachment.test.ts
M  mobile/src/session/mobile-image-attachment.ts
A  mobile/src/session/mobile-terminal-file-tap-open.test.ts
A  mobile/src/session/mobile-terminal-file-tap-open.ts
M  mobile/src/session/use-mobile-image-attachment.ts
A  mobile/src/session/use-mobile-terminal-paste.ts
A  mobile/src/session/use-terminal-live-input-mode-preference.test.ts
A  mobile/src/session/use-terminal-live-input-mode-preference.ts
M  mobile/src/storage/preferences.test.ts
M  mobile/src/storage/preferences.ts
A  mobile/src/terminal/terminal-file-url-tap.ts
A  mobile/src/terminal/terminal-live-accessory-input.ts
A  mobile/src/terminal/terminal-live-accessory-raw-send-target.test.ts
A  mobile/src/terminal/terminal-live-accessory-raw-send-target.ts
A  mobile/src/terminal/terminal-live-control-send-order.test.ts
A  mobile/src/terminal/terminal-live-control-send-order.ts
A  mobile/src/terminal/terminal-live-input-sender.ts
M  mobile/src/terminal/terminal-live-input.test.ts
M  mobile/src/terminal/terminal-live-input.ts
A  mobile/src/terminal/terminal-live-pending-flush-state.test.ts
A  mobile/src/terminal/terminal-live-pending-flush-state.ts
A  mobile/src/terminal/terminal-live-text-commit.test.ts
A  mobile/src/terminal/terminal-live-text-commit.ts
M  mobile/src/terminal/terminal-path-tap-injected.ts
M  mobile/src/terminal/terminal-path-tap.test.ts
M  mobile/src/terminal/terminal-path-tap.ts
A  mobile/src/terminal/terminal-send-rpc-response.test.ts
A  mobile/src/terminal/terminal-send-rpc-response.ts
M  mobile/src/terminal/terminal-webview-tap-routing.test.ts
M  mobile/src/terminal/terminal-webview-url-tap.test.ts
M  mobile/src/terminal/terminal-webview-url-tap.ts
A  mobile/src/terminal/use-terminal-live-accessory-input-commit.test.ts
A  mobile/src/terminal/use-terminal-live-accessory-input-commit.ts
A  mobile/src/terminal/use-terminal-live-input-commit.test.ts
A  mobile/src/terminal/use-terminal-live-input-commit.ts
A  mobile/src/terminal/use-terminal-live-pending-input-flush.ts
A  mobile/src/transport/rpc-client-terminal-binary-frame.test.ts
A  mobile/src/transport/rpc-client-terminal-binary-frame.ts
A  mobile/src/transport/rpc-client-terminal-reconnect.test.ts
M  mobile/src/transport/rpc-client.test.ts
M  mobile/src/transport/rpc-client.ts
M  mobile/src/transport/terminal-stream-protocol.ts
M  notes/windows-perf-progress.md
UU package.json
M  src/cli/handlers/emulator.test.ts
M  src/cli/handlers/emulator.ts
M  src/main/agent-hooks/installer-utils.test.ts
M  src/main/agent-hooks/installer-utils.ts
M  src/main/browser/cdp-ws-proxy.test.ts
M  src/main/browser/cdp-ws-proxy.ts
M  src/main/claude/hook-service.test.ts
M  src/main/claude/hook-settings.ts
M  src/main/codex-accounts/service.test.ts
M  src/main/codex-accounts/service.ts
M  src/main/codex/codex-config-mirror.test.ts
M  src/main/codex/codex-config-mirror.ts
A  src/main/codex/codex-config-path-reference-rewrite.ts
A  src/main/codex/config-toml-line-scan.ts
M  src/main/codex/config-toml-trust.ts
M  src/main/codex/hook-service.ts
M  src/main/daemon/daemon-entry.ts
M  src/main/daemon/daemon-pty-adapter.test.ts
UU src/main/daemon/daemon-pty-adapter.ts
M  src/main/daemon/daemon-pty-router.ts
M  src/main/daemon/degraded-daemon-pty-provider.ts
A  src/main/daemon/headless-emulator-unicode-width.test.ts
UU src/main/daemon/headless-emulator.ts
M  src/main/daemon/history-reader.ts
A  src/main/daemon/osc7-file-uri.test.ts
M  src/main/daemon/osc7-file-uri.ts
M  src/main/daemon/session.ts
M  src/main/daemon/terminal-host.ts
A  src/main/daemon/terminal-private-mode-tracker.ts
M  src/main/daemon/types.ts
A  src/main/daemon/windows-conpty-warmup.test.ts
A  src/main/daemon/windows-conpty-warmup.ts
M  src/main/emulator/backends/ios-emulator-backend.test.ts
M  src/main/emulator/backends/ios-emulator-backend.ts
M  src/main/emulator/simctl-simulator-devices.test.ts
M  src/main/emulator/simctl-simulator-devices.ts
M  src/main/ipc/ai-vault.ts
A  src/main/ipc/pty-spawn-timing.ts
M  src/main/ipc/pty.test.ts
UU src/main/ipc/pty.ts
A  src/main/ipc/worktree-base-directory-event-filter.test.ts
M  src/main/ipc/worktree-base-directory-event-filter.ts
M  src/main/ipc/worktree-base-directory-poller.test.ts
M  src/main/ipc/worktree-git-common-watch.ts
M  src/main/ipc/worktrees.ts
M  src/main/persistence.test.ts
UU src/main/persistence.ts
M  src/main/providers/local-pty-provider.ts
M  src/main/providers/local-pty-utils-windows-fallback.test.ts
M  src/main/providers/local-pty-utils.ts
A  src/main/providers/ssh-filesystem-provider-sftp.ts
A  src/main/providers/ssh-filesystem-provider-watch.ts
M  src/main/providers/ssh-filesystem-provider.test.ts
M  src/main/providers/ssh-filesystem-provider.ts
M  src/main/providers/ssh-pty-provider.ts
M  src/main/providers/types.ts
M  src/main/rate-limits/claude-fetcher.test.ts
M  src/main/rate-limits/claude-fetcher.ts
M  src/main/rate-limits/claude-pty.test.ts
M  src/main/rate-limits/claude-pty.ts
M  src/main/rate-limits/service.test.ts
M  src/main/rate-limits/service.ts
M  src/main/runtime/orca-runtime-files.test.ts
M  src/main/runtime/orca-runtime-files.ts
A  src/main/runtime/orca-runtime-terminal-cwd.test.ts
M  src/main/runtime/orca-runtime.test.ts
UU src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/files.test.ts
M  src/main/runtime/rpc/methods/files.ts
M  src/main/runtime/rpc/methods/session-tabs-schemas.ts
M  src/main/runtime/rpc/methods/session-tabs.test.ts
M  src/main/runtime/rpc/methods/session-tabs.ts
M  src/main/runtime/rpc/methods/terminal.ts
M  src/main/runtime/rpc/terminal-multiplex.test.ts
UU src/main/runtime/rpc/terminal-subscribe-buffer.test.ts
UU src/main/runtime/runtime-rpc.ts
M  src/main/runtime/scrollback-limits.ts
M  src/main/ssh/ssh-connection-utils.ts
M  src/main/ssh/ssh-connection.test.ts
M  src/main/ssh/ssh-connection.ts
M  src/main/ssh/ssh-relay-cross-version-isolation.test.ts
M  src/main/ssh/ssh-relay-deploy-helpers.test.ts
M  src/main/ssh/ssh-relay-deploy-helpers.ts
M  src/main/ssh/ssh-relay-deploy.test.ts
M  src/main/ssh/ssh-relay-deploy.ts
M  src/main/ssh/ssh-relay-native-deps-install.test.ts
M  src/main/ssh/ssh-relay-versioned-install.test.ts
M  src/main/ssh/ssh-relay-versioned-install.ts
M  src/main/ssh/ssh-remote-node-resolution.test.ts
M  src/main/ssh/ssh-remote-node-resolution.ts
A  src/main/ssh/ssh-session-limit-error.test.ts
A  src/main/ssh/ssh-session-limit-error.ts
M  src/main/startup/configure-process.test.ts
M  src/main/startup/configure-process.ts
M  src/main/window/attach-main-window-services.test.ts
M  src/main/window/attach-main-window-services.ts
M  src/main/worktree-removal-authority.test.ts
M  src/main/worktree-removal-safety.test.ts
M  src/main/worktree-removal-safety.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
A  src/relay/fs-handler-terminal-artifact.ts
M  src/relay/fs-handler.test.ts
M  src/relay/fs-handler.ts
M  src/relay/pty-handler.ts
M  src/renderer/src/components/LinearIssueMarkdownDescriptionEditor.tsx
M  src/renderer/src/components/Terminal.tsx
M  src/renderer/src/components/activity/ActivityPrototypePage.tsx
A  src/renderer/src/components/activity/ActivityThreadOptionsMenu.test.tsx
M  src/renderer/src/components/editor/RichMarkdownEditor.tsx
A  src/renderer/src/components/editor/rich-markdown-editor-config.test.ts
M  src/renderer/src/components/editor/rich-markdown-editor-config.ts
A  src/renderer/src/components/editor/rich-markdown-spellcheck.ts
M  src/renderer/src/components/github/GitHubMarkdownComposer.tsx
M  src/renderer/src/components/right-sidebar/FileExplorer.test.tsx
M  src/renderer/src/components/right-sidebar/FileExplorer.tsx
M  src/renderer/src/components/right-sidebar/FileExplorerRow.tsx
M  src/renderer/src/components/right-sidebar/FileExplorerVirtualRows.tsx
M  src/renderer/src/components/right-sidebar/FileExplorerVirtualRowsAddProject.test.tsx
A  src/renderer/src/components/right-sidebar/ai-vault-session-refresh.test.ts
M  src/renderer/src/components/right-sidebar/ai-vault-session-refresh.ts
M  src/renderer/src/components/right-sidebar/file-explorer-drag-scroll-marker.test.tsx
A  src/renderer/src/components/right-sidebar/git-status-push-signal-refresh.test.ts
A  src/renderer/src/components/right-sidebar/git-status-push-signal-refresh.ts
M  src/renderer/src/components/right-sidebar/useGitStatusPolling.test.ts
M  src/renderer/src/components/right-sidebar/useGitStatusPolling.ts
M  src/renderer/src/components/settings/GeneralEditorSettingsSection.tsx
M  src/renderer/src/components/settings/GeneralPane.test.ts
A  src/renderer/src/components/settings/RichMarkdownSpellcheckSetting.tsx
M  src/renderer/src/components/settings/WorkspaceDirectorySetting.tsx
M  src/renderer/src/components/settings/general-editor-search.ts
M  src/renderer/src/components/sidebar/WorktreeList.tsx
M  src/renderer/src/components/sidebar/WorktreeTitleInlineRename.begin-editing.test.tsx
M  src/renderer/src/components/sidebar/WorktreeTitleInlineRename.tsx
A  src/renderer/src/components/sidebar/project-group-header-dom.test.ts
A  src/renderer/src/components/sidebar/project-group-header-drag-commit.test.ts
A  src/renderer/src/components/sidebar/project-group-header-drag-commit.ts
A  src/renderer/src/components/sidebar/project-group-header-drag-contract.ts
A  src/renderer/src/components/sidebar/project-group-header-drag-start.ts
A  src/renderer/src/components/sidebar/project-group-header-drag.ts
A  src/renderer/src/components/sidebar/project-group-header-drop.test.ts
A  src/renderer/src/components/sidebar/project-group-header-drop.ts
M  src/renderer/src/components/sidebar/smart-sort.test.ts
M  src/renderer/src/components/sidebar/smart-sort.ts
M  src/renderer/src/components/sidebar/worktree-drag-preview-offsets.ts
A  src/renderer/src/components/sidebar/worktree-lineage-drag-drop.test.ts
A  src/renderer/src/components/sidebar/worktree-lineage-drag-drop.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.test.ts
M  src/renderer/src/components/sidebar/worktree-manual-order.test.ts
M  src/renderer/src/components/sidebar/worktree-sidebar-drag-autoscroll.test.ts
M  src/renderer/src/components/sidebar/worktree-sidebar-drag-autoscroll.ts
M  src/renderer/src/components/sidebar/worktree-sidebar-drop-preview.test.ts
M  src/renderer/src/components/sidebar/worktree-sidebar-drop-preview.ts
M  src/renderer/src/components/status-bar/StatusBar.tsx
A  src/renderer/src/components/status-bar/inline-usage-bars.test.tsx
M  src/renderer/src/components/status-bar/status-bar-provider-visibility.ts
M  src/renderer/src/components/status-bar/tooltip.test.ts
M  src/renderer/src/components/status-bar/tooltip.tsx
M  src/renderer/src/components/tab-bar/EditorFileTab.test.tsx
M  src/renderer/src/components/tab-bar/EditorFileTab.tsx
M  src/renderer/src/components/tab-bar/SortableTab.rename-shortcut.test.tsx
M  src/renderer/src/components/tab-bar/SortableTab.tsx
M  src/renderer/src/components/tab-group/useTabGroupWorkspaceModel.ts
M  src/renderer/src/components/terminal-pane/TerminalPaneHeaderOverlay.test.tsx
M  src/renderer/src/components/terminal-pane/TerminalPaneHeaderOverlay.tsx
M  src/renderer/src/components/terminal-pane/TerminalPaneOverlayLayer.tsx
M  src/renderer/src/components/terminal-pane/layout-serialization.ts
... omitted 92 additional status records to keep remediation payloads within GitHub limits.
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

