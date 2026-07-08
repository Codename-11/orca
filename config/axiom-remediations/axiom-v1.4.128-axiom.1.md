## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/28943147356
- Upstream ref/tag: v1.4.128
- Intended Axiom version/tag: 1.4.128-axiom.1 / axiom-v1.4.128-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.128-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/main/daemon/headless-emulator.ts`
- `src/main/ipc/pty.ts`
- `src/renderer/src/components/terminal-pane/pty-connection.ts`
- `src/renderer/src/components/terminal-pane/pty-dispatcher.ts`
- `src/renderer/src/components/terminal-pane/pty-transport-types.ts`
- `src/renderer/src/runtime/remote-runtime-terminal-multiplexer.ts`
- `tests/e2e/artificial-opencode-hidden-pressure-scenario.ts`
- `tests/e2e/ssh-docker-relay-perf.spec.ts`

## Captured git status
```
A  .github/workflows/daemon-relocation-spike.yml
M  .github/workflows/pr.yml
A  .github/workflows/win-update-e2e.yml
A  .github/workflows/win-update-survival-e2e.yml
M  AGENTS.md
M  README.md
M  config/electron-builder.config.cjs
A  config/max-lines-baseline.txt
A  config/nsis/daemon-host-uninstall.nsh
M  config/reliability-gates.jsonc
A  config/scripts/check-max-lines-ratchet.mjs
A  config/scripts/check-max-lines-ratchet.test.mjs
A  config/scripts/serve-headless-fresh-profile-pairing.mjs
M  docs/assets/readme-downloads.svg
M  docs/readme/README.es.md
M  docs/readme/README.ja.md
M  docs/readme/README.ko.md
M  docs/readme/README.pt.md
M  docs/readme/README.zh-CN.md
A  docs/reference/ssh-typing-latency-under-relay-load.md
M  mobile/app.json
M  mobile/app/_layout.tsx
M  mobile/src/files/MobileFileExplorerPanel.test.ts
M  mobile/src/files/MobileFileExplorerPanel.tsx
A  mobile/src/files/file-list-fallback.test.ts
A  mobile/src/files/file-list-fallback.ts
M  mobile/src/notifications/mobile-notifications.test.ts
M  mobile/src/notifications/mobile-notifications.ts
UU package.json
M  src/main/agent-hooks/remote-hook-service-installers.test.ts
M  src/main/agent-hooks/remote-managed-hook-installers.ts
M  src/main/agent-hooks/server.test.ts
M  src/main/agent-hooks/server.ts
M  src/main/ai-vault/remote-session-scanner-sources.ts
M  src/main/ai-vault/session-scanner-accumulator.ts
M  src/main/ai-vault/session-scanner-agent-parser.ts
M  src/main/ai-vault/session-scanner-codex-workers.test.ts
M  src/main/ai-vault/session-scanner-graph-parsers.ts
M  src/main/ai-vault/session-scanner-incremental-fixtures.ts
M  src/main/ai-vault/session-scanner-opencode-sqlite-coexistence.test.ts
M  src/main/ai-vault/session-scanner-parse-cache.ts
M  src/main/ai-vault/session-scanner-source-discovery.ts
M  src/main/ai-vault/session-scanner-test-fixtures.ts
M  src/main/ai-vault/session-scanner-types.ts
M  src/main/ai-vault/session-scanner-values.test.ts
M  src/main/ai-vault/session-scanner-values.ts
M  src/main/ai-vault/session-scanner.test.ts
M  src/main/codex-accounts/runtime-home-service.test.ts
M  src/main/codex-accounts/runtime-home-service.ts
M  src/main/codex/codex-session-bridge.test.ts
M  src/main/codex/codex-session-bridge.ts
A  src/main/codex/codex-session-source-home.test.ts
A  src/main/codex/codex-session-source-home.ts
M  src/main/daemon/daemon-entry.test.ts
M  src/main/daemon/daemon-entry.ts
A  src/main/daemon/daemon-file-log.test.ts
A  src/main/daemon/daemon-file-log.ts
A  src/main/daemon/daemon-host-relocation.test.ts
A  src/main/daemon/daemon-host-relocation.ts
M  src/main/daemon/daemon-init.test.ts
M  src/main/daemon/daemon-init.ts
M  src/main/daemon/daemon-main.ts
M  src/main/daemon/daemon-pty-adapter.ts
M  src/main/daemon/daemon-server.ts
UU src/main/daemon/headless-emulator.ts
A  src/main/daemon/repro-7329-remote-snapshot-corruption.test.ts
M  src/main/daemon/types.ts
M  src/main/droid/hook-service.ts
M  src/main/github/client.test.ts
A  src/main/github/conflict-summary-cache.ts
A  src/main/github/conflict-summary.test.ts
M  src/main/github/conflict-summary.ts
M  src/main/github/pr-refresh-coordinator.test.ts
M  src/main/github/pr-refresh-coordinator.ts
A  src/main/github/rate-limit.test.ts
M  src/main/github/rate-limit.ts
M  src/main/index.ts
M  src/main/ipc/filesystem-auth.test.ts
M  src/main/ipc/filesystem-auth.ts
M  src/main/ipc/pty.test.ts
UU src/main/ipc/pty.ts
M  src/main/ipc/ssh-browse.test.ts
M  src/main/ipc/ssh-browse.ts
M  src/main/ipc/ssh.ts
M  src/main/ipc/worktrees.ts
M  src/main/localhost-worktree-label-proxy.test.ts
M  src/main/localhost-worktree-label-proxy.ts
M  src/main/native-chat/transcript-read-cache.test.ts
M  src/main/native-chat/transcript-read-cache.ts
M  src/main/observability/bundle.test.ts
M  src/main/observability/bundle.ts
M  src/main/observability/index.ts
A  src/main/observability/logs-directory.ts
M  src/main/persistence.ts
A  src/main/pi/legacy-omp-overlay-migration.ts
M  src/main/pi/titlebar-extension-service.test.ts
M  src/main/pi/titlebar-extension-service.ts
M  src/main/providers/ssh-filesystem-provider-stream.test.ts
D  src/main/pty/terminal-cwd-realpath.test.ts
D  src/main/pty/terminal-cwd-realpath.ts
M  src/main/runtime/mobile-presence-lock.test.ts
M  src/main/runtime/orca-runtime-terminal-cwd.test.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/terminal.ts
A  src/main/runtime/rpc/terminal-multiplex-escape-tail.test.ts
M  src/main/ssh/relay-protocol.test.ts
M  src/main/ssh/relay-protocol.ts
M  src/main/ssh/ssh-connection-store.test.ts
M  src/main/ssh/ssh-connection-store.ts
M  src/main/ssh/ssh-filesystem-stream-reader.ts
M  src/main/ssh/ssh-port-forward.test.ts
M  src/main/ssh/system-ssh-port-forward-provider.ts
M  src/main/system-fonts.test.ts
M  src/main/system-fonts.ts
A  src/main/system-resume-broadcast.test.ts
A  src/main/system-resume-broadcast.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/relay/dispatcher.test.ts
M  src/relay/dispatcher.ts
M  src/relay/fs-handler-file-read.ts
M  src/relay/fs-handler-stream.test.ts
M  src/relay/fs-handler.ts
A  src/relay/fs-stream-pty-echo-backpressure.integration.test.ts
M  src/relay/fs-stream-registry.ts
M  src/relay/protocol.ts
M  src/relay/pty-handler.test.ts
M  src/relay/pty-handler.ts
M  src/relay/pty-shell-utils.test.ts
M  src/relay/pty-shell-utils.ts
M  src/relay/relay.ts
M  src/renderer/src/assets/main.css
M  src/renderer/src/components/CodexRestartChip.tsx
M  src/renderer/src/components/GitHubItemDialog.tsx
M  src/renderer/src/components/PullRequestPage.tsx
M  src/renderer/src/components/Terminal.tsx
A  src/renderer/src/components/codex-restart-chip-inputs.test.ts
A  src/renderer/src/components/codex-restart-chip-inputs.ts
M  src/renderer/src/components/github-item-dialog-source-boundary.test.ts
M  src/renderer/src/components/mobile/mobile-platform-copy.ts
A  src/renderer/src/components/native-chat/native-chat-composer-scope-cache.test.ts
A  src/renderer/src/components/native-chat/native-chat-composer-scope-cache.ts
M  src/renderer/src/components/native-chat/native-chat-draft-cache.test.ts
M  src/renderer/src/components/native-chat/native-chat-draft-cache.ts
M  src/renderer/src/components/native-chat/native-chat-pending.test.ts
M  src/renderer/src/components/native-chat/native-chat-pending.ts
M  src/renderer/src/components/native-chat/use-native-chat-composer-attachments.ts
M  src/renderer/src/components/native-chat/use-native-chat-toggle-shortcut.ts
M  src/renderer/src/components/pull-request-page-host-boundary.test.ts
M  src/renderer/src/components/right-sidebar/AiVaultSessionVirtualList.tsx
M  src/renderer/src/components/right-sidebar/checks-panel-content.test.tsx
M  src/renderer/src/components/right-sidebar/checks-panel-content.tsx
M  src/renderer/src/components/settings/AgentsPane.tsx
M  src/renderer/src/components/settings/AppearanceInterfaceSection.tsx
M  src/renderer/src/components/settings/AppearancePane.test.tsx
M  src/renderer/src/components/settings/AppearancePane.tsx
M  src/renderer/src/components/settings/MobileSettingsPane.tsx
M  src/renderer/src/components/settings/Settings.tsx
A  src/renderer/src/components/settings/SettingsConstants.test.ts
M  src/renderer/src/components/settings/SettingsConstants.ts
M  src/renderer/src/components/settings/SettingsFormControls.font-autocomplete.test.tsx
M  src/renderer/src/components/settings/SettingsFormControls.tsx
M  src/renderer/src/components/settings/SshPane.tsx
M  src/renderer/src/components/settings/TerminalAppearanceSection.tsx
A  src/renderer/src/components/settings/codex-session-source-home-control.test.tsx
A  src/renderer/src/components/settings/codex-session-source-home-control.tsx
M  src/renderer/src/components/settings/settings-form-option-filter.test.ts
M  src/renderer/src/components/settings/settings-form-option-filter.ts
M  src/renderer/src/components/sidebar/WorktreeCard.test.ts
M  src/renderer/src/components/sidebar/smart-attention.ts
D  src/renderer/src/components/sidebar/worktree-card-status.ts
M  src/renderer/src/components/sidebar/worktree-title-derived-agent-rows.ts
M  src/renderer/src/components/status-bar/workspace-space-presentation.ts
M  src/renderer/src/components/tab-bar/BrowserTab.test.tsx
M  src/renderer/src/components/tab-bar/BrowserTab.tsx
M  src/renderer/src/components/tab-bar/EditorFileTab.test.tsx
M  src/renderer/src/components/tab-bar/EditorFileTabContextMenu.test.tsx
M  src/renderer/src/components/tab-bar/EditorFileTabContextMenu.tsx
M  src/renderer/src/components/tab-bar/SortableTab.rename-shortcut.test.tsx
M  src/renderer/src/components/tab-bar/SortableTabContextMenu.test.tsx
M  src/renderer/src/components/tab-bar/SortableTabContextMenu.tsx
M  src/renderer/src/components/tab-bar/TabBar.context-menu.test.ts
M  src/renderer/src/components/tab-bar/TabBar.tsx
M  src/renderer/src/components/tab-bar/TabBar.windows-shell-launch.test.ts
M  src/renderer/src/components/tab-bar/TabWorkspaceLayoutMenuSection.tsx
A  src/renderer/src/components/tab-bar/TerminalTabSplitMenuSection.tsx
A  src/renderer/src/components/tab-bar/tab-agent-types-by-tab-id.test.ts
A  src/renderer/src/components/tab-bar/tab-agent-types-by-tab-id.ts
M  src/renderer/src/components/tab-group/TabGroupPanel.tsx
M  src/renderer/src/components/tab-group/TabGroupSplitLayout.tsx
M  src/renderer/src/components/terminal-pane/cache-timer-seeding.ts
M  src/renderer/src/components/terminal-pane/native-chat-leaf-title-agent.ts
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
UU src/renderer/src/components/terminal-pane/pty-connection.ts
UU src/renderer/src/components/terminal-pane/pty-dispatcher.ts
UU src/renderer/src/components/terminal-pane/pty-transport-types.ts
M  src/renderer/src/components/terminal-pane/pty-transport.test.ts
M  src/renderer/src/components/terminal-pane/pty-transport.ts
M  src/renderer/src/components/terminal-pane/remote-runtime-pty-batching.ts
A  src/renderer/src/components/terminal-pane/remote-runtime-pty-query-reply-immediate.test.ts
A  src/renderer/src/components/terminal-pane/remote-runtime-pty-snapshot-escape-tail.test.ts
M  src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.ts
M  src/renderer/src/components/terminal-pane/replay-guard.test.ts
M  src/renderer/src/components/terminal-pane/replay-guard.ts
A  src/renderer/src/components/terminal-pane/ssh-pane-connect-gate.test.ts
A  src/renderer/src/components/terminal-pane/ssh-pane-connect-gate.ts
A  src/renderer/src/components/terminal-pane/terminal-ime-candidate-key-release-guard.test.ts
A  src/renderer/src/components/terminal-pane/terminal-ime-candidate-key-release-guard.ts
A  src/renderer/src/components/terminal-pane/terminal-ime-composition-tracker.test.ts
M  src/renderer/src/components/terminal-pane/terminal-ime-composition-tracker.ts
M  src/renderer/src/components/terminal-pane/terminal-visibility-resume.test.ts
M  src/renderer/src/components/terminal-pane/terminal-visibility-resume.ts
M  src/renderer/src/components/terminal-pane/use-notification-dispatch.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-global-effects.test.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts
M  src/renderer/src/components/terminal-pane/use-terminal-window-wake-recovery.ts
A  src/renderer/src/components/terminal-pane/xterm-bypass-event-fixture.ts
M  src/renderer/src/components/terminal-pane/xterm-bypass-policy-non-mac.test.ts
M  src/renderer/src/components/terminal-pane/xterm-bypass-policy.test.ts
M  src/renderer/src/components/terminal-pane/xterm-bypass-policy.ts
M  src/renderer/src/components/terminal/active-terminal-repair.test.ts
M  src/renderer/src/components/terminal/active-terminal-repair.ts
M  src/renderer/src/hooks/metadata-request-cache.test.ts
M  src/renderer/src/hooks/metadata-request-cache.ts
M  src/renderer/src/hooks/runtime-client-events-sync.test.ts
M  src/renderer/src/hooks/runtime-client-events-sync.ts
A  src/renderer/src/hooks/ssh-reconnect-pane-retry.test.ts
A  src/renderer/src/hooks/ssh-reconnect-pane-retry.ts
M  src/renderer/src/hooks/useComposerState-host-context-boundaries.test.ts
M  src/renderer/src/hooks/useComposerState.ts
M  src/renderer/src/hooks/useGitHubSlugMetadata.test.tsx
M  src/renderer/src/hooks/useGitHubSlugMetadata.ts
M  src/renderer/src/hooks/useIpcEvents.ts
A  src/renderer/src/hooks/useIssueMetadata.test.tsx
M  src/renderer/src/hooks/useIssueMetadata.ts
M  src/renderer/src/i18n/locales/en.json
M  src/renderer/src/i18n/locales/es.json
M  src/renderer/src/i18n/locales/ja.json
M  src/renderer/src/i18n/locales/ko.json
M  src/renderer/src/i18n/locales/zh.json
M  src/renderer/src/lib/active-agent-note-target.ts
M  src/renderer/src/lib/agent-ready-wait.ts
M  src/renderer/src/lib/agent-send-title-status.ts
M  src/renderer/src/lib/agent-startup-delayed-delivery.ts
A  src/renderer/src/lib/agent-startup-delivery-guards.ts
M  src/renderer/src/lib/agent-status-terminal-title.ts
M  src/renderer/src/lib/agent-status.ts
M  src/renderer/src/lib/ai-vault-resume-command.test.ts
M  src/renderer/src/lib/ai-vault-resume-command.ts
... omitted 87 additional status records to keep remediation payloads within GitHub limits.
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

