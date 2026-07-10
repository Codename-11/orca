## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/29079328272
- Upstream ref/tag: v1.4.132
- Intended Axiom version/tag: 1.4.132-axiom.1 / axiom-v1.4.132-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.132-axiom.1`
- Classification: `auto_remediate` — Fork identity/update-feed files need policy-guided agent remediation: mobile/app.json

## Conflicted files
- `mobile/app.json`
- `package.json`
- `src/main/runtime/orca-runtime.ts`
- `src/main/runtime/rpc/terminal-multiplex.test.ts`
- `src/renderer/src/components/Terminal.tsx`
- `src/renderer/src/components/terminal-pane/TerminalPaneOverlayLayer.tsx`
- `src/renderer/src/components/terminal-pane/pty-dispatcher.ts`
- `src/renderer/src/lib/launch-agent-background-session.ts`
- `src/shared/agent-detection.ts`

## Captured git status
```
M  .github/workflows/computer-e2e.yml
M  .github/workflows/release-cut.yml
A  .github/workflows/windows-signing-rehearsal.yml
M  .gitignore
M  README.md
A  build-plugins/plain-node-entry-guard.ts
M  config/electron-builder.config.cjs
M  config/reliability-gates.jsonc
M  config/scripts/build-native-for-platform.mjs
A  config/scripts/build-notification-status-macos.mjs
M  config/scripts/build-relay.mjs
M  config/scripts/computer-e2e-workflow.test.mjs
A  config/scripts/daemon-boot-smoke.mjs
M  config/scripts/electron-builder-config.test.mjs
M  config/scripts/package-electron-runtime-contract.test.mjs
M  config/scripts/run-electron-vite-dev.mjs
A  config/scripts/verify-packaged-daemon-entry.cjs
A  config/scripts/verify-packaged-daemon-entry.test.mjs
M  config/tsconfig.cli.json
M  config/tsconfig.node.json
M  docs/STYLEGUIDE.md
A  docs/agent-status-over-wsl.md
M  docs/assets/readme-downloads.svg
A  docs/assets/wechat-qr-backup.jpg
A  docs/issue-7649-vscode-wsl-launch.md
A  docs/kill-all-sessions-also-kills-empty-terminals.md
D  docs/new-worktree-sidebar-reveal.md
M  docs/readme/README.es.md
M  docs/readme/README.ja.md
M  docs/readme/README.ko.md
M  docs/readme/README.pt.md
M  docs/readme/README.zh-CN.md
A  docs/source-control-push-failure-ai-recovery.md
M  electron.vite.config.ts
UU mobile/app.json
M  mobile/app/_layout.tsx
A  mobile/app/connection-log.tsx
M  mobile/app/h/[hostId]/history/[worktreeId].tsx
M  mobile/app/h/[hostId]/index.tsx
M  mobile/app/h/[hostId]/pr/[worktreeId].tsx
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
M  mobile/app/h/[hostId]/session/mobile-session-command-input-styles.ts
M  mobile/app/h/[hostId]/source-control/[worktreeId].tsx
M  mobile/app/index.tsx
M  mobile/app/troubleshoot.tsx
A  mobile/mock-source-control-hub.html
M  mobile/src/components/MobileMarkdown.tsx
M  mobile/src/components/MobilePRSidebar.tsx
M  mobile/src/components/MobilePrComposeSheet.tsx
M  mobile/src/components/pr-sidebar/MobilePrViewPanel.tsx
M  mobile/src/components/pr-sidebar/PRActionsSection.tsx
M  mobile/src/components/pr-sidebar/PRCommentsSection.tsx
M  mobile/src/components/pr-sidebar/PRReviewersSection.tsx
M  mobile/src/components/pr-sidebar/PRSection.tsx
M  mobile/src/components/pr-sidebar/PRSidebarHeader.tsx
M  mobile/src/components/pr-sidebar/ReviewerPickerDrawer.tsx
M  mobile/src/components/pr-sidebar/mobile-pr-sidebar-styles.ts
M  mobile/src/components/pr-sidebar/pr-actions-styles.ts
M  mobile/src/components/pr-sidebar/pr-comment-composer-styles.ts
A  mobile/src/diagnostics/connection-diagnostics-report.test.ts
A  mobile/src/diagnostics/connection-diagnostics-report.ts
M  mobile/src/diagnostics/host-reachability.test.ts
M  mobile/src/diagnostics/host-reachability.ts
A  mobile/src/diagnostics/troubleshoot-common-issues.tsx
M  mobile/src/session/SessionDockColumn.tsx
M  mobile/src/session/github-pr-rpc.test.ts
M  mobile/src/session/github-pr-value-readers.ts
M  mobile/src/session/mobile-pr-sidebar-state.ts
M  mobile/src/session/mobile-session-startup-source.test.ts
M  mobile/src/session/pr-actions-engine.test.ts
M  mobile/src/session/pr-actions-engine.ts
M  mobile/src/session/session-panel-host.test.ts
M  mobile/src/session/session-panel-host.ts
M  mobile/src/session/use-mobile-pr-branch-context.ts
A  mobile/src/session/use-mobile-pr-sidebar-controller-probe.test.ts
M  mobile/src/session/use-mobile-pr-sidebar-controller.test.ts
M  mobile/src/session/use-mobile-pr-sidebar-controller.ts
A  mobile/src/source-control/MobileGitHistoryList.tsx
A  mobile/src/source-control/MobileSourceControlBranchCard.tsx
M  mobile/src/source-control/MobileSourceControlContent.tsx
M  mobile/src/source-control/MobileSourceControlHeader.tsx
M  mobile/src/source-control/MobileSourceControlPanel.tsx
A  mobile/src/source-control/MobileSourceControlPrChip.tsx
A  mobile/src/source-control/MobileSourceControlSegments.tsx
A  mobile/src/source-control/mobile-history-screen-state.test.ts
A  mobile/src/source-control/mobile-history-screen-state.ts
A  mobile/src/source-control/mobile-pr-chip-summary.test.ts
A  mobile/src/source-control/mobile-pr-chip-summary.ts
M  mobile/src/source-control/mobile-source-control-actions.test.ts
M  mobile/src/source-control/mobile-source-control-actions.ts
A  mobile/src/source-control/mobile-source-control-conflict-abort.test.ts
A  mobile/src/source-control/mobile-source-control-conflict-abort.ts
A  mobile/src/source-control/mobile-source-control-hub-styles.ts
A  mobile/src/source-control/mobile-source-control-hub-tab.test.ts
A  mobile/src/source-control/mobile-source-control-hub-tab.ts
M  mobile/src/source-control/mobile-source-control-styles.ts
M  mobile/src/source-control/use-mobile-source-control-runners.ts
M  mobile/src/source-control/use-mobile-source-control-state.ts
A  mobile/src/terminal/terminal-ios-dictation-write-back.test.ts
A  mobile/src/terminal/terminal-keyboard-dismiss.test.ts
A  mobile/src/terminal/terminal-keyboard-dismiss.ts
M  mobile/src/terminal/terminal-text-input-normalization.test.ts
M  mobile/src/terminal/terminal-text-input-normalization.ts
M  mobile/src/terminal/use-terminal-live-input-commit.test.ts
M  mobile/src/terminal/use-terminal-live-input-commit.ts
A  mobile/src/transport/client-context.test.ts
M  mobile/src/transport/client-context.tsx
A  mobile/src/transport/connection-health.test.ts
M  mobile/src/transport/connection-health.ts
A  mobile/src/transport/connection-log-buffer.test.ts
A  mobile/src/transport/connection-log-buffer.ts
M  mobile/src/transport/rpc-client.test.ts
M  mobile/src/transport/rpc-client.ts
A  mobile/src/worktree/worktree-activation-result.test.ts
A  mobile/src/worktree/worktree-activation-result.ts
M  mobile/vitest.config.ts
A  native/notification-status-macos/main.swift
UU package.json
D  previews/mobile-driver-overlay-preview.html
M  src/cli/handlers/agent-hooks.test.ts
M  src/cli/handlers/agent-hooks.ts
M  src/cli/index.test.ts
M  src/cli/index.ts
M  src/main/agent-hooks/remote-hook-service-installers.test.ts
M  src/main/agent-hooks/remote-managed-hook-installers.ts
A  src/main/agent-hooks/wsl-hook-fs-adapter.ts
A  src/main/agent-hooks/wsl-hook-relay-deps.ts
A  src/main/agent-hooks/wsl-hook-relay-launch.ts
A  src/main/agent-hooks/wsl-hook-relay-link.ts
A  src/main/agent-hooks/wsl-hook-relay-live.integration.test.ts
A  src/main/agent-hooks/wsl-hook-relay-manager.test.ts
A  src/main/agent-hooks/wsl-hook-relay-manager.ts
A  src/main/agent-hooks/wsl-hook-relay-recovery.test.ts
A  src/main/agent-hooks/wsl-hook-relay-recovery.ts
A  src/main/agent-hooks/wsl-hook-relay-sentinel.test.ts
A  src/main/agent-hooks/wsl-hook-relay-sentinel.ts
M  src/main/ai-vault/remote-session-scanner-sources.ts
M  src/main/ai-vault/remote-session-scanner-types.ts
M  src/main/ai-vault/remote-session-scanner.test.ts
M  src/main/ai-vault/remote-session-scanner.ts
A  src/main/ai-vault/runtime-session-scanner.test.ts
A  src/main/ai-vault/runtime-session-scanner.ts
A  src/main/ai-vault/session-list-results.ts
M  src/main/ai-vault/session-scanner-accumulator.ts
M  src/main/ai-vault/session-scanner-agent-parser.ts
A  src/main/ai-vault/session-scanner-gemini-parsers.ts
M  src/main/ai-vault/session-scanner-parse-cache.ts
M  src/main/ai-vault/session-scanner-primary-parsers.ts
A  src/main/ai-vault/session-scanner-recoverable-empty.test.ts
A  src/main/ai-vault/session-scanner-subagent-transcripts.ts
M  src/main/ai-vault/session-scanner-types.ts
A  src/main/browser/browser-cookie-import-test-database.ts
M  src/main/browser/browser-cookie-import.test.ts
M  src/main/browser/browser-cookie-import.ts
M  src/main/browser/browser-session-registry.persistence.test.ts
M  src/main/browser/browser-session-registry.test.ts
M  src/main/browser/browser-session-registry.ts
M  src/main/browser/browser-session-startup.test.ts
M  src/main/browser/browser-session-startup.ts
M  src/main/browser/cdp-ws-proxy.test.ts
M  src/main/browser/cdp-ws-proxy.ts
A  src/main/browser/chromium-cookie-path.ts
M  src/main/claude-usage/scanner-scan.test.ts
M  src/main/claude-usage/scanner.ts
M  src/main/claude-usage/store.ts
M  src/main/claude-usage/types.ts
M  src/main/codex-accounts/runtime-home-service.test.ts
M  src/main/codex-accounts/runtime-home-service.ts
M  src/main/codex-accounts/service.test.ts
M  src/main/codex-accounts/service.ts
A  src/main/codex-accounts/wsl-codex-command.test.ts
A  src/main/codex-accounts/wsl-codex-command.ts
M  src/main/codex-usage/scanner-paths.test.ts
M  src/main/codex-usage/scanner.test.ts
M  src/main/codex-usage/scanner.ts
M  src/main/codex-usage/store.test.ts
M  src/main/codex-usage/store.ts
M  src/main/codex-usage/types.ts
M  src/main/codex/codex-config-mirror.test.ts
M  src/main/codex/codex-config-mirror.ts
A  src/main/codex/codex-hook-identity.ts
A  src/main/codex/codex-wsl-hook-install-plan.test.ts
A  src/main/codex/codex-wsl-hook-install-plan.ts
A  src/main/codex/config-settings-promotion.test.ts
A  src/main/codex/config-settings-promotion.ts
M  src/main/codex/config-toml-trust.ts
A  src/main/codex/hook-service-wsl-runtime.test.ts
M  src/main/codex/hook-service.ts
A  src/main/codex/hook-trust-promotion.test.ts
A  src/main/codex/hook-trust-promotion.ts
M  src/main/daemon/daemon-entry.ts
M  src/main/daemon/daemon-init.test.ts
M  src/main/daemon/daemon-init.ts
M  src/main/daemon/hibernation-cold-restore-repro.test.ts
A  src/main/daemon/pty-subprocess-foreground-scan-cadence.test.ts
M  src/main/daemon/pty-subprocess.ts
M  src/main/daemon/repro-7329-remote-snapshot-corruption.test.ts
M  src/main/emulator/serve-sim-state-watcher.test.ts
M  src/main/external-editor-launch.test.ts
M  src/main/external-editor-launch.ts
M  src/main/git/remote.test.ts
M  src/main/git/runner-wsl-gh-fallback.test.ts
M  src/main/git/runner.ts
A  src/main/git/status-wsl-pathspecs.test.ts
M  src/main/git/status.ts
M  src/main/github/client.ts
M  src/main/gitlab/client-mr.test.ts
M  src/main/gitlab/client.ts
A  src/main/grok-accounts/status.test.ts
A  src/main/grok-accounts/status.ts
M  src/main/index.ts
M  src/main/ipc/ai-vault.test.ts
M  src/main/ipc/ai-vault.ts
M  src/main/ipc/app.test.ts
M  src/main/ipc/app.ts
M  src/main/ipc/filesystem-watcher.ts
M  src/main/ipc/filesystem.test.ts
M  src/main/ipc/filesystem.ts
A  src/main/ipc/grok-accounts.ts
M  src/main/ipc/linear.test.ts
M  src/main/ipc/linear.ts
A  src/main/ipc/notification-authorization-status.ts
M  src/main/ipc/notifications.test.ts
M  src/main/ipc/notifications.ts
A  src/main/ipc/orca-profile-auth-handlers.test.ts
A  src/main/ipc/orca-profile-org-members-handlers.test.ts
A  src/main/ipc/orca-profile-org-members-handlers.ts
A  src/main/ipc/orca-profiles.test.ts
A  src/main/ipc/orca-profiles.ts
A  src/main/ipc/parcel-watcher-process-entry.ts
A  src/main/ipc/parcel-watcher-process.test.ts
A  src/main/ipc/parcel-watcher-process.ts
A  src/main/ipc/preflight-command-exec.test.ts
M  src/main/ipc/preflight-command-exec.ts
M  src/main/ipc/preflight-wsl-agent-detection.test.ts
M  src/main/ipc/preflight-wsl-agent-detection.ts
M  src/main/ipc/preflight.test.ts
M  src/main/ipc/preflight.ts
M  src/main/ipc/pty.test.ts
M  src/main/ipc/pty.ts
M  src/main/ipc/rate-limits.test.ts
M  src/main/ipc/rate-limits.ts
M  src/main/ipc/register-core-handlers.test.ts
M  src/main/ipc/register-core-handlers.ts
M  src/main/ipc/repos.ts
M  src/main/ipc/shell.test.ts
M  src/main/ipc/ssh.test.ts
M  src/main/ipc/ssh.ts
A  src/main/ipc/tui-agent-detection-commands.test.ts
A  src/main/ipc/tui-agent-detection-commands.ts
... omitted 619 additional status records to keep remediation payloads within GitHub limits.
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

