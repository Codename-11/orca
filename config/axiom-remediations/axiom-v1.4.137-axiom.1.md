## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/29200291557
- Upstream ref/tag: v1.4.137
- Intended Axiom version/tag: 1.4.137-axiom.1 / axiom-v1.4.137-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.137-axiom.1`
- Classification: `auto_remediate` — Fork identity/update-feed files need policy-guided agent remediation: mobile/app.json

## Conflicted files
- `mobile/app.json`
- `mobile/app/h/[hostId]/tasks.tsx`
- `mobile/app/index.tsx`
- `mobile/app/settings.tsx`
- `mobile/pnpm-lock.yaml`
- `package.json`
- `src/cli/args.ts`
- `src/main/runtime/rpc/methods/terminal.ts`
- `src/renderer/src/lib/launch-agent-background-session.ts`

## Captured git status
```
M  .npmrc
M  README.md
M  config/patches/@xterm__addon-webgl@0.20.0-beta.286.patch
M  config/reliability-gates.jsonc
M  config/scripts/audit-localization-coverage.mjs
M  config/scripts/localize-renderer-strings.mjs
M  config/scripts/orca-cli-skill-guidance.test.mjs
M  config/scripts/orchestration-skill-guidance.test.mjs
M  config/scripts/styled-scrollbars/styled-scrollbar-jsx-check.mjs
M  config/scripts/verify-localization-catalog.mjs
M  config/tsconfig.cli.json
M  config/tsconfig.tc.web.json
M  docs/assets/readme-downloads.svg
A  docs/claude-scoped-oauth-usage-limits.md
M  docs/readme/README.es.md
M  docs/readme/README.ja.md
M  docs/readme/README.ko.md
M  docs/readme/README.pt.md
M  docs/readme/README.zh-CN.md
A  docs/reference/plans/2026-07-10-ssh-repo-host-reconciliation.md
M  docs/reference/terminal-query-authority.md
UU mobile/app.json
M  mobile/app/h/[hostId]/index.tsx
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
M  mobile/app/h/[hostId]/session/mobile-session-route-types.ts
UU mobile/app/h/[hostId]/tasks.tsx
UU mobile/app/index.tsx
UU mobile/app/settings.tsx
M  mobile/package.json
UU mobile/pnpm-lock.yaml
M  mobile/src/components/BottomDrawer.tsx
A  mobile/src/components/MobileSearchField.tsx
A  mobile/src/hooks/mobile-dictation-audio-chunk.ts
A  mobile/src/hooks/mobile-dictation-desktop-start.test.ts
A  mobile/src/hooks/mobile-dictation-desktop-start.ts
A  mobile/src/hooks/mobile-dictation-foreground-keep-awake.ts
A  mobile/src/hooks/mobile-dictation-keep-awake.test.ts
A  mobile/src/hooks/mobile-dictation-keep-awake.ts
A  mobile/src/hooks/mobile-dictation-session-state.ts
M  mobile/src/hooks/use-mobile-dictation-source.test.ts
M  mobile/src/hooks/use-mobile-dictation.ts
M  mobile/src/session/TerminalPaneView.tsx
M  mobile/src/session/ai-vault-resume-launch.test.ts
M  mobile/src/session/mobile-session-route-helpers.ts
M  mobile/src/session/mobile-terminal-records.test.ts
M  mobile/src/session/mobile-terminal-records.ts
A  mobile/src/session/use-live-worktree-name.test.ts
M  mobile/src/session/use-live-worktree-name.ts
M  mobile/src/session/use-mobile-terminal-paste.ts
M  mobile/src/source-control/MobileSourceControlBranchCard.tsx
M  mobile/src/source-control/MobileSourceControlContent.tsx
M  mobile/src/source-control/mobile-source-control-styles.ts
M  mobile/src/source-control/use-mobile-source-control-loaders.ts
M  mobile/src/source-control/use-mobile-source-control-state.ts
M  mobile/src/terminal/TerminalWebView.tsx
A  mobile/src/terminal/mobile-terminal-query-reply.test.ts
A  mobile/src/terminal/mobile-terminal-query-reply.ts
M  mobile/src/terminal/terminal-foreground-recovery.test.ts
M  mobile/src/terminal/terminal-foreground-recovery.ts
M  mobile/src/terminal/terminal-viewport-refit.test.ts
M  mobile/src/terminal/terminal-viewport-refit.ts
M  mobile/src/terminal/terminal-webview-contract.ts
M  mobile/src/terminal/terminal-webview-engine-error.test.ts
M  mobile/src/terminal/terminal-webview-engine.test.ts
M  mobile/src/terminal/terminal-webview-html.ts
M  mobile/src/terminal/terminal-webview-messages.ts
A  mobile/src/terminal/terminal-webview-query-reply-injected.ts
A  mobile/src/terminal/terminal-webview-query-reply-routing.test.ts
A  mobile/src/terminal/terminal-webview-query-reply-routing.ts
A  mobile/src/terminal/terminal-webview-query-reply.test.ts
M  mobile/src/terminal/terminal-webview-text-zoom.test.ts
A  mobile/src/terminal/terminal-webview-theme-injected.ts
A  mobile/src/terminal/terminal-webview-webgl-recovery-injected.ts
M  mobile/src/transport/client-context.test.ts
M  mobile/src/transport/client-context.tsx
A  mobile/src/transport/host-client-open-registry.ts
A  mobile/src/transport/host-credential-cleanup.test.ts
A  mobile/src/transport/host-credential-cleanup.ts
A  mobile/src/transport/host-removal-lifecycle.test.ts
A  mobile/src/transport/host-removal-lifecycle.ts
A  mobile/src/transport/host-store.test.ts
M  mobile/src/transport/host-store.ts
A  mobile/src/transport/rpc-client-runtime-events.test.ts
M  mobile/src/transport/rpc-client.ts
M  mobile/src/transport/rpc-response-shape.test.ts
M  mobile/tsconfig.json
UU package.json
M  pnpm-lock.yaml
M  skills/orca-cli/SKILL.md
M  skills/orchestration/SKILL.md
A  src/cli/agent-context.test.ts
A  src/cli/agent-context.ts
M  src/cli/args.test.ts
UU src/cli/args.ts
A  src/cli/command-suggestion.test.ts
A  src/cli/command-suggestion.ts
M  src/cli/dispatch.ts
A  src/cli/format-recovery.test.ts
M  src/cli/format.ts
A  src/cli/handlers/introspection.ts
M  src/cli/handlers/terminal.ts
M  src/cli/help.ts
M  src/cli/index.test.ts
M  src/cli/index.ts
A  src/cli/registry-parity.test.ts
A  src/cli/registry-parity.ts
M  src/cli/runtime/envelope-schema.test.ts
M  src/cli/runtime/types.ts
M  src/cli/specs/core.ts
M  src/cli/specs/index.ts
A  src/cli/specs/introspection.ts
A  src/cli/vocabulary-policy.test.ts
A  src/cli/vocabulary-policy.ts
M  src/main/agent-hooks/first-work-branch-rename.ts
A  src/main/agent-hooks/server.claude-interactive-question.test.ts
M  src/main/agent-hooks/server.test.ts
M  src/main/agent-hooks/server.ts
A  src/main/ai-vault/local-log-tail-reader.test.ts
A  src/main/ai-vault/local-log-tail-reader.ts
A  src/main/ai-vault/session-scanner-codex-title-index.test.ts
M  src/main/ai-vault/session-scanner-codex-title-index.ts
A  src/main/ai-vault/session-scanner-kimi-index-cache.test.ts
A  src/main/ai-vault/session-scanner-kimi-index-cache.ts
M  src/main/ai-vault/session-scanner-kimi-parser.test.ts
M  src/main/ai-vault/session-scanner-kimi-paths.ts
M  src/main/automations/service.test.ts
M  src/main/automations/service.ts
M  src/main/claude/hook-service.test.ts
M  src/main/claude/hook-settings.ts
M  src/main/cli/cli-installer.test.ts
M  src/main/cli/cli-installer.ts
M  src/main/codex-accounts/runtime-home-service.test.ts
M  src/main/codex-accounts/service.test.ts
A  src/main/crash-reporting/crash-feedback-diagnostic-bundle.ts
A  src/main/crash-reporting/crash-report-copy-text.test.ts
A  src/main/crash-reporting/crash-report-copy-text.ts
M  src/main/crash-reporting/crash-report-store.test.ts
M  src/main/crash-reporting/crash-report-store.ts
A  src/main/crash-reporting/durable-crash-breadcrumb.test.ts
A  src/main/crash-reporting/durable-crash-breadcrumb.ts
M  src/main/crash-reporting/process-gone-classification.test.ts
M  src/main/crash-reporting/process-gone-classification.ts
M  src/main/crash-reporting/process-gone-dedupe.test.ts
M  src/main/crash-reporting/process-gone-dedupe.ts
M  src/main/crash-reporting/process-gone-diagnostics.test.ts
M  src/main/crash-reporting/process-gone-diagnostics.ts
A  src/main/crash-reporting/process-gone-recorder.test.ts
A  src/main/crash-reporting/process-gone-recorder.ts
M  src/main/daemon/daemon-errors.ts
A  src/main/daemon/daemon-foreground-confirmation-protocol.test.ts
A  src/main/daemon/daemon-foreground-process-protocol.ts
M  src/main/daemon/daemon-pty-adapter.test.ts
M  src/main/daemon/daemon-pty-adapter.ts
M  src/main/daemon/daemon-pty-router.test.ts
M  src/main/daemon/daemon-pty-router.ts
M  src/main/daemon/daemon-server.test.ts
M  src/main/daemon/daemon-server.ts
M  src/main/daemon/degraded-daemon-pty-provider.test.ts
M  src/main/daemon/degraded-daemon-pty-provider.ts
M  src/main/daemon/pty-subprocess-foreground-scan-cadence.test.ts
M  src/main/daemon/pty-subprocess.test.ts
M  src/main/daemon/pty-subprocess.ts
M  src/main/daemon/session.ts
M  src/main/daemon/shell-ready.ts
A  src/main/daemon/terminal-host-create-contract.ts
M  src/main/daemon/terminal-host.test.ts
M  src/main/daemon/terminal-host.ts
M  src/main/daemon/types.ts
M  src/main/emulator/serve-sim-state-watcher.test.ts
M  src/main/emulator/serve-sim-state-watcher.ts
M  src/main/git/check-ignored-paths.test.ts
M  src/main/git/check-ignored-paths.ts
M  src/main/git/checkout.ts
M  src/main/git/remote.ts
M  src/main/git/remove-worktree.test.ts
A  src/main/git/repo-default-base-timeout.test.ts
M  src/main/git/repo.ts
M  src/main/git/runner.ts
A  src/main/git/status-submodule-path-cache.test.ts
M  src/main/git/status.ts
M  src/main/git/worktree.test.ts
M  src/main/git/worktree.ts
M  src/main/github/client.test.ts
M  src/main/github/client.ts
M  src/main/github/issues.test.ts
M  src/main/github/issues.ts
M  src/main/github/pr-refresh-coordinator.test.ts
M  src/main/github/pr-refresh-coordinator.ts
M  src/main/github/work-item-details.test.ts
M  src/main/github/work-item-details.ts
M  src/main/index.ts
A  src/main/ipc/bounded-warning-dedupe.test.ts
A  src/main/ipc/bounded-warning-dedupe.ts
M  src/main/ipc/crash-reporting.test.ts
M  src/main/ipc/crash-reporting.ts
M  src/main/ipc/feedback.test.ts
M  src/main/ipc/feedback.ts
M  src/main/ipc/filesystem.test.ts
M  src/main/ipc/filesystem.ts
M  src/main/ipc/github.test.ts
M  src/main/ipc/github.ts
A  src/main/ipc/local-log-tail.test.ts
A  src/main/ipc/local-log-tail.ts
A  src/main/ipc/native-chat-subscribe-lifecycle.test.ts
M  src/main/ipc/native-chat.test.ts
M  src/main/ipc/native-chat.ts
M  src/main/ipc/pty.test.ts
M  src/main/ipc/pty.ts
M  src/main/ipc/repos-remote.test.ts
M  src/main/ipc/repos.ts
M  src/main/ipc/runtime.ts
M  src/main/ipc/ssh.test.ts
M  src/main/ipc/ssh.ts
M  src/main/ipc/ui.test.ts
M  src/main/ipc/ui.ts
M  src/main/ipc/worktree-base-directory-watch-targets.ts
M  src/main/ipc/worktree-logic.ts
A  src/main/ipc/worktree-path-comparison.ts
A  src/main/ipc/worktree-path-deduplication.test.ts
M  src/main/ipc/worktree-remote.ts
M  src/main/ipc/worktrees-windows.test.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/ipc/worktrees.ts
M  src/main/memory/hydrate-local-pty-registry.test.ts
M  src/main/memory/hydrate-local-pty-registry.ts
M  src/main/observability/tracer.test.ts
M  src/main/observability/tracer.ts
M  src/main/persistence.test.ts
M  src/main/persistence.ts
M  src/main/pi/agent-status-extension-source.test.ts
M  src/main/providers/agent-foreground-process.test.ts
M  src/main/providers/agent-foreground-process.ts
M  src/main/providers/local-pty-provider.test.ts
M  src/main/providers/local-pty-provider.ts
M  src/main/providers/local-pty-utils.test.ts
M  src/main/providers/local-pty-utils.ts
M  src/main/providers/ssh-git-provider.test.ts
M  src/main/providers/ssh-git-provider.ts
M  src/main/providers/types.ts
M  src/main/providers/windows-agent-foreground-process.ts
A  src/main/providers/windows-conpty-process-membership.test.ts
A  src/main/providers/windows-conpty-process-membership.ts
M  src/main/providers/windows-foreground-process-rows.ts
M  src/main/providers/windows-shell-args.test.ts
M  src/main/providers/windows-shell-args.ts
M  src/main/rate-limits/claude-fetcher.test.ts
M  src/main/rate-limits/claude-fetcher.ts
M  src/main/rate-limits/codex-auth-presence.test.ts
M  src/main/rate-limits/codex-auth-presence.ts
M  src/main/rate-limits/codex-fetcher-auth-errors.test.ts
... omitted 507 additional status records to keep remediation payloads within GitHub limits.
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

