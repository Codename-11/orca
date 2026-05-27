## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26530563800
- Upstream ref/tag: v1.4.31-rc.2
- Intended Axiom version/tag: 1.4.31-rc.2.axiom.1 / axiom-v1.4.31-rc.2.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.31-rc.2.axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/main/updater-events.ts`
- `src/main/updater.ts`

## Captured git status
```
M  .github/CONTRIBUTING.md
M  .github/workflows/release-cut.yml
M  config/scripts/ensure-native-runtime.mjs
A  config/scripts/ensure-native-runtime.test.mjs
A  config/scripts/package-electron-runtime-contract.test.mjs
M  config/scripts/rebuild-native-deps.mjs
A  config/scripts/rebuild-native-deps.test.mjs
A  config/scripts/verify-release-required-assets.test.mjs
A  docs/reference/keyboard-layout-shortcut-dispatch.md
A  docs/reference/memory-leak-audit.md
M  mobile/app.json
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
M  mobile/src/hooks/use-mobile-dictation.ts
A  mobile/src/session/mobile-session-startup-source.test.ts
A  mobile/src/session/mobile-terminal-records.test.ts
A  mobile/src/session/mobile-terminal-records.ts
M  mobile/src/terminal/TerminalWebView.tsx
A  mobile/src/terminal/terminal-webview-scroll-routing.test.ts
M  native/computer-use-macos/Sources/OrcaComputerUseMacOS/main.swift
A  native/computer-use-macos/Sources/OrcaComputerUseMacOSCore/NumericArgumentParsing.swift
A  native/computer-use-macos/Tests/OrcaComputerUseMacOSTests/NumericArgumentParsingTests.swift
UU package.json
M  src/cli/args.test.ts
M  src/cli/args.ts
M  src/main/antigravity/hook-service.test.ts
M  src/main/antigravity/hook-service.ts
M  src/main/browser/browser-session-registry.persistence.test.ts
M  src/main/browser/browser-session-registry.test.ts
M  src/main/browser/browser-session-registry.ts
M  src/main/browser/cdp-ws-proxy.test.ts
M  src/main/browser/cdp-ws-proxy.ts
M  src/main/daemon/daemon-init.test.ts
M  src/main/daemon/daemon-init.ts
M  src/main/daemon/daemon-server.test.ts
M  src/main/daemon/daemon-server.ts
M  src/main/daemon/production-launcher.test.ts
M  src/main/daemon/production-launcher.ts
M  src/main/git/repo.test.ts
M  src/main/git/repo.ts
M  src/main/git/status.test.ts
M  src/main/git/status.ts
M  src/main/git/worktree.test.ts
M  src/main/git/worktree.ts
M  src/main/ipc/linear.ts
M  src/main/ipc/repos-remote.test.ts
M  src/main/ipc/worktree-remote.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/ipc/worktrees.ts
M  src/main/linear/issues.ts
M  src/main/linear/projects.ts
M  src/main/linear/teams.ts
M  src/main/providers/ssh-filesystem-provider.test.ts
M  src/main/providers/ssh-filesystem-provider.ts
M  src/main/providers/types.ts
M  src/main/rate-limits/claude-pty.test.ts
M  src/main/rate-limits/claude-pty.ts
M  src/main/rate-limits/codex-fetcher.test.ts
M  src/main/rate-limits/codex-fetcher.ts
A  src/main/rate-limits/hidden-pty-cleanup.test.ts
A  src/main/rate-limits/hidden-pty-cleanup.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/linear.test.ts
M  src/main/runtime/rpc/methods/linear.ts
M  src/main/speech/model-manager.test.ts
M  src/main/speech/model-manager.ts
M  src/main/speech/stt-service.test.ts
M  src/main/speech/stt-service.ts
M  src/main/ssh/ssh-connection.test.ts
M  src/main/ssh/ssh-connection.ts
UU src/main/updater-events.ts
M  src/main/updater-fallback.ts
A  src/main/updater-prerelease-feed-readiness.test.ts
M  src/main/updater-prerelease-feed.test.ts
M  src/main/updater-prerelease-feed.ts
M  src/main/updater.fallback.test.ts
M  src/main/updater.test.ts
UU src/main/updater.ts
M  src/main/window/attach-main-window-services.test.ts
M  src/main/window/attach-main-window-services.ts
A  src/main/worktree-orphan-gitdir-proof.ts
A  src/main/worktree-removal-authority.test.ts
M  src/main/worktree-removal-safety.test.ts
M  src/main/worktree-removal-safety.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/relay/fs-handler.test.ts
M  src/relay/fs-handler.ts
M  src/relay/git-handler-commit-diff-ops.ts
M  src/relay/git-handler-status-ops.ts
M  src/relay/git-handler-utils.test.ts
M  src/relay/git-handler-utils.ts
M  src/relay/git-handler.test.ts
M  src/relay/git-handler.ts
M  src/relay/git-status-output-parser.ts
M  src/renderer/src/App.tsx
A  src/renderer/src/components/LinearIssueTextEditor.tsx
M  src/renderer/src/components/LinearIssueWorkspace.tsx
M  src/renderer/src/components/LinearItemDrawer.tsx
M  src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/dashboard/DashboardAgentRow.test.tsx
M  src/renderer/src/components/dashboard/DashboardAgentRow.tsx
M  src/renderer/src/components/editor/PdfViewer.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.test.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/useFileExplorerKeys.ts
A  src/renderer/src/components/settings/AgentSkillSetupPanel.test.tsx
M  src/renderer/src/components/settings/AgentSkillSetupPanel.tsx
M  src/renderer/src/components/settings/GitPane.tsx
M  src/renderer/src/components/settings/git-search.ts
M  src/renderer/src/components/sidebar/delete-worktree-toast.test.ts
M  src/renderer/src/components/sidebar/delete-worktree-toast.ts
M  src/renderer/src/components/terminal-pane/pty-connection-types.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
A  src/renderer/src/components/terminal-pane/terminal-file-link-hit-testing.ts
A  src/renderer/src/components/terminal-pane/terminal-file-open-routing.ts
M  src/renderer/src/components/terminal-pane/terminal-link-handlers.test.ts
M  src/renderer/src/components/terminal-pane/terminal-link-handlers.ts
M  src/renderer/src/components/terminal-pane/terminal-quick-command-dispatch.test.ts
M  src/renderer/src/components/terminal-pane/terminal-quick-command-dispatch.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts
A  src/renderer/src/components/terminal-pane/wrapped-terminal-link-ranges.ts
M  src/renderer/src/components/terminal-pane/xterm-bypass-policy.test.ts
M  src/renderer/src/components/terminal-pane/xterm-bypass-policy.ts
M  src/renderer/src/components/ui/team-multi-combobox.tsx
A  src/renderer/src/hooks/requestVirtualizedScrollAnchorRecord.ts
A  src/renderer/src/hooks/useVirtualizedScrollAnchor.listener-deps.test.ts
M  src/renderer/src/hooks/useVirtualizedScrollAnchor.test.ts
M  src/renderer/src/hooks/useVirtualizedScrollAnchor.ts
A  src/renderer/src/hooks/virtualizedScrollOffsetRestore.ts
A  src/renderer/src/lib/floating-workspace-shortcut-policy.ts
M  src/renderer/src/lib/floating-workspace-terminal-actions.test.ts
M  src/renderer/src/lib/floating-workspace-terminal-actions.ts
M  src/renderer/src/lib/github-links.test.ts
M  src/renderer/src/lib/github-links.ts
M  src/renderer/src/lib/run-quick-command-in-new-tab.test.ts
M  src/renderer/src/lib/run-quick-command-in-new-tab.ts
M  src/renderer/src/runtime/runtime-linear-client.ts
M  src/renderer/src/runtime/sync-runtime-graph.test.ts
M  src/renderer/src/runtime/sync-runtime-graph.ts
M  src/renderer/src/store/slices/editor.ts
M  src/renderer/src/store/slices/store-cascades.test.ts
M  src/renderer/src/store/slices/terminals.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/shared/agent-hook-listener.test.ts
M  src/shared/agent-hook-listener.ts
A  src/shared/binary-buffer.ts
M  src/shared/git-status-types.ts
A  src/shared/git-uncommitted-line-stats.test.ts
A  src/shared/git-uncommitted-line-stats.ts
M  src/shared/keybindings.test.ts
M  src/shared/keybindings.ts
A  src/shared/linear-links.test.ts
A  src/shared/linear-links.ts
M  src/shared/runtime-types.ts
M  src/shared/terminal-quick-commands.test.ts
M  src/shared/terminal-quick-commands.ts
M  src/shared/types.ts
M  src/shared/worktree-ownership.ts
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

