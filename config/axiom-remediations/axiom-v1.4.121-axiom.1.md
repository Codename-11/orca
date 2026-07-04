## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/28709051111
- Upstream ref/tag: v1.4.121
- Intended Axiom version/tag: 1.4.121-axiom.1 / axiom-v1.4.121-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.121-axiom.1`
- Classification: `auto_remediate` — Fork identity/update-feed files need policy-guided agent remediation: mobile/app.json

## Conflicted files
- `.github/workflows/release-cut.yml`
- `mobile/app.json`
- `package.json`
- `src/main/daemon/daemon-pty-adapter.ts`
- `src/main/daemon/headless-emulator.ts`
- `src/main/ipc/pty.ts`
- `src/main/persistence.ts`
- `src/main/runtime/orca-runtime.ts`
- `src/main/runtime/rpc/terminal-subscribe-buffer.test.ts`
- `src/main/runtime/runtime-rpc.ts`
- `src/main/window/attach-main-window-services.ts`
- `src/renderer/src/App.tsx`
- `src/renderer/src/components/terminal-pane/pty-connection.ts`
- `src/renderer/src/components/terminal-pane/pty-transport.ts`
- `src/shared/terminal-stream-protocol.ts`

## Captured git status
```
M  .github/workflows/mobile-android-release.yml
M  .github/workflows/mobile.yml
UU .github/workflows/release-cut.yml
M  .gitignore
M  README.md
M  config/scripts/create-draft-release.mjs
M  config/scripts/create-draft-release.test.mjs
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
M  docs/assets/wechat-qr.png
A  docs/claude-fable-weekly-usage-meter.md
M  docs/readme/README.es.md
M  docs/readme/README.ja.md
M  docs/readme/README.ko.md
M  docs/readme/README.zh-CN.md
M  mobile/.gitignore
M  mobile/.oxlintrc.json
UU mobile/app.json
M  mobile/app/h/[hostId]/files/preview/[worktreeId].tsx
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
M  mobile/app/h/[hostId]/session/mobile-session-command-input-styles.ts
M  mobile/package.json
M  mobile/pnpm-lock.yaml
A  mobile/scripts/build-terminal-webview-engine.mjs
M  mobile/scripts/prepare-android-release.mjs
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
A  mobile/src/mobile-release/prepare-android-release-script.test.ts
M  mobile/src/session/MobileTerminalLiveInputStatus.tsx
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
M  mobile/src/terminal/TerminalWebView.tsx
A  mobile/src/terminal/terminal-file-url-tap.ts
A  mobile/src/terminal/terminal-live-accessory-input.ts
A  mobile/src/terminal/terminal-live-accessory-raw-send-target.test.ts
A  mobile/src/terminal/terminal-live-accessory-raw-send-target.ts
A  mobile/src/terminal/terminal-live-control-send-order.test.ts
A  mobile/src/terminal/terminal-live-control-send-order.ts
A  mobile/src/terminal/terminal-live-hangul-mirror.test.ts
A  mobile/src/terminal/terminal-live-hangul-mirror.ts
A  mobile/src/terminal/terminal-live-input-affordance.test.ts
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
A  mobile/src/terminal/terminal-webview-contract.ts
A  mobile/src/terminal/terminal-webview-engine-error-state.tsx
A  mobile/src/terminal/terminal-webview-engine-error.test.ts
A  mobile/src/terminal/terminal-webview-engine.test.ts
A  mobile/src/terminal/terminal-webview-frame-styles.ts
M  mobile/src/terminal/terminal-webview-html.ts
A  mobile/src/terminal/terminal-webview-ready-watchdog.ts
M  mobile/src/terminal/terminal-webview-tap-routing.test.ts
M  mobile/src/terminal/terminal-webview-text-zoom.test.ts
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
M  src/main/agent-hooks/first-work-branch-rename.test.ts
M  src/main/agent-hooks/first-work-branch-rename.ts
M  src/main/agent-hooks/installer-utils.test.ts
M  src/main/agent-hooks/installer-utils.ts
M  src/main/antigravity/hook-service.test.ts
M  src/main/antigravity/hook-service.ts
M  src/main/automations/service-precheck.test.ts
M  src/main/automations/service.test.ts
M  src/main/browser/browser-guest-ui.test.ts
M  src/main/browser/browser-guest-ui.ts
M  src/main/browser/browser-session-registry.test.ts
M  src/main/browser/browser-session-registry.ts
A  src/main/browser/cdp-print-to-pdf.test.ts
A  src/main/browser/cdp-print-to-pdf.ts
A  src/main/browser/cdp-ws-proxy-focus-replay.test.ts
A  src/main/browser/cdp-ws-proxy-test-harness.ts
M  src/main/browser/cdp-ws-proxy.test.ts
M  src/main/browser/cdp-ws-proxy.ts
M  src/main/claude/hook-service.test.ts
M  src/main/claude/hook-service.ts
M  src/main/claude/hook-settings.ts
M  src/main/cli/appimage-cli-wrapper.ts
A  src/main/cli/linux-bare-orca-dispatcher.test.ts
A  src/main/cli/linux-bare-orca-dispatcher.ts
M  src/main/codex-accounts/service.test.ts
M  src/main/codex-accounts/service.ts
M  src/main/codex/codex-config-mirror.test.ts
M  src/main/codex/codex-config-mirror.ts
A  src/main/codex/codex-config-path-reference-rewrite.ts
M  src/main/codex/codex-home-paths.test.ts
M  src/main/codex/codex-home-paths.ts
A  src/main/codex/config-toml-line-scan.ts
M  src/main/codex/config-toml-trust.test.ts
M  src/main/codex/config-toml-trust.ts
M  src/main/codex/hook-service.ts
M  src/main/command-code/command-code-managed-script.ts
M  src/main/copilot/hook-service.ts
M  src/main/cursor/hook-service.test.ts
M  src/main/cursor/hook-service.ts
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
M  src/main/devin/hook-service.test.ts
M  src/main/devin/hook-service.ts
M  src/main/droid/hook-service.ts
M  src/main/emulator/backends/ios-emulator-backend.test.ts
M  src/main/emulator/backends/ios-emulator-backend.ts
M  src/main/emulator/serve-sim-execution.ts
A  src/main/emulator/serve-sim-runtime-materializer.test.ts
A  src/main/emulator/serve-sim-runtime-materializer.ts
M  src/main/emulator/simctl-simulator-devices.test.ts
M  src/main/emulator/simctl-simulator-devices.ts
M  src/main/gemini/hook-service.ts
M  src/main/git/git-username.ts
M  src/main/git/repo-username.test.ts
M  src/main/git/repo.ts
M  src/main/git/runner.test.ts
M  src/main/git/runner.ts
M  src/main/git/worktree.test.ts
M  src/main/git/worktree.ts
M  src/main/gitlab/client.ts
M  src/main/gitlab/gitlab-project-ref-resolution.ts
M  src/main/gitlab/gl-utils.test.ts
M  src/main/gitlab/issues.test.ts
M  src/main/gitlab/issues.ts
M  src/main/gitlab/project-ref-parser.test.ts
M  src/main/gitlab/project-ref-parser.ts
M  src/main/gitlab/work-item-details.ts
M  src/main/grok/hook-service.test.ts
M  src/main/grok/hook-service.ts
M  src/main/index.ts
M  src/main/ipc/ai-vault.ts
A  src/main/ipc/pty-spawn-timing.ts
M  src/main/ipc/pty.test.ts
UU src/main/ipc/pty.ts
M  src/main/ipc/repos-create.test.ts
M  src/main/ipc/repos-picker.test.ts
M  src/main/ipc/repos-remote.test.ts
M  src/main/ipc/repos-sparse-presets.test.ts
M  src/main/ipc/repos.ts
M  src/main/ipc/workspace-create-error-classifier.test.ts
A  src/main/ipc/worktree-base-directory-event-filter.test.ts
M  src/main/ipc/worktree-base-directory-event-filter.ts
M  src/main/ipc/worktree-base-directory-poller.test.ts
M  src/main/ipc/worktree-git-common-watch.ts
M  src/main/ipc/worktree-remote.ts
M  src/main/ipc/worktrees-windows.test.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/ipc/worktrees.ts
M  src/main/kimi/hook-service.test.ts
M  src/main/kimi/hook-service.ts
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
A  src/main/repo-git-username-enrichment.test.ts
A  src/main/repo-git-username-enrichment.ts
M  src/main/runtime/fit-override-integration.test.ts
M  src/main/runtime/mobile-presence-lock.test.ts
M  src/main/runtime/mobile-subscribe-integration.test.ts
M  src/main/runtime/orca-runtime-browser.test.ts
M  src/main/runtime/orca-runtime-browser.ts
M  src/main/runtime/orca-runtime-files.test.ts
M  src/main/runtime/orca-runtime-files.ts
A  src/main/runtime/orca-runtime-terminal-cwd.test.ts
M  src/main/runtime/orca-runtime.test.ts
UU src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/files.test.ts
M  src/main/runtime/rpc/methods/files.ts
M  src/main/runtime/rpc/methods/session-tabs-schemas.ts
M  src/main/runtime/rpc/methods/session-tabs.test.ts
... omitted 298 additional status records to keep remediation payloads within GitHub limits.
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

