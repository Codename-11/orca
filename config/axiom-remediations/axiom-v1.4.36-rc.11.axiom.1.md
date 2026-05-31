## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26710422634
- Upstream ref/tag: v1.4.36-rc.11
- Intended Axiom version/tag: 1.4.36-rc.11.axiom.1 / axiom-v1.4.36-rc.11.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.36-rc.11.axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `mobile/app/h/[hostId]/tasks.tsx`
- `package.json`

## Captured git status
```
M  config/electron-builder.config.cjs
M  config/packaged-runtime-node-modules.cjs
M  config/scripts/check-styled-scrollbars.test.mjs
M  config/scripts/electron-builder-config.test.mjs
M  config/scripts/styled-scrollbars/styled-scrollbar-jsx-check.mjs
D  docs/reference/memory-leak-audit-pass-2.md
D  docs/reference/memory-leak-audit.md
M  mobile/app/h/[hostId]/index.tsx
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
UU mobile/app/h/[hostId]/tasks.tsx
M  mobile/app/pair-confirm.tsx
M  mobile/app/pair-scan.tsx
M  mobile/app/terminal-settings.tsx
M  mobile/app/troubleshoot.tsx
M  mobile/packages/expo-two-way-audio/android/src/main/java/expo/modules/twowayaudio/AudioEngine.kt
M  mobile/src/components/PickerModal.tsx
A  mobile/src/diagnostics/diagnostic-fetch-timeout.test.ts
A  mobile/src/diagnostics/diagnostic-fetch-timeout.ts
A  mobile/src/hooks/mobile-dictation-pending-audio-budget.test.ts
A  mobile/src/hooks/mobile-dictation-pending-audio-budget.ts
M  mobile/src/hooks/use-mobile-dictation-source.test.ts
M  mobile/src/hooks/use-mobile-dictation.ts
M  mobile/src/session/mobile-diff-lines.test.ts
M  mobile/src/session/mobile-diff-lines.ts
A  mobile/src/session/mobile-session-create-warning-state.test.ts
A  mobile/src/session/mobile-session-create-warning-state.ts
M  mobile/src/tasks/github-pr-file-diff.test.ts
M  mobile/src/tasks/github-pr-file-diff.ts
A  mobile/src/tasks/mobile-task-copy-feedback-timer.test.ts
A  mobile/src/tasks/mobile-task-copy-feedback-timer.ts
A  mobile/src/terminal/terminal-auto-restore-fit-state.test.ts
A  mobile/src/terminal/terminal-auto-restore-fit-state.ts
M  mobile/src/terminal/terminal-live-input.test.ts
M  mobile/src/terminal/terminal-live-input.ts
A  mobile/src/transport/pairing-connection-attempt.test.ts
A  mobile/src/transport/pairing-connection-attempt.ts
M  mobile/src/transport/rpc-client.test.ts
M  mobile/src/transport/rpc-client.ts
UU package.json
M  src/main/automations/hermes-cron-output.test.ts
M  src/main/automations/hermes-cron-output.ts
M  src/main/azure-devops/client.ts
M  src/main/browser/agent-browser-bridge.test.ts
M  src/main/cli/cli-installer.test.ts
M  src/main/cli/cli-installer.ts
M  src/main/codex/hook-service.test.ts
M  src/main/codex/hook-service.ts
M  src/main/daemon/daemon-server.ts
M  src/main/git/hosted-remote-url.test.ts
M  src/main/git/hosted-remote-url.ts
M  src/main/git/remove-worktree.test.ts
A  src/main/git/worktree-list-paths.test.ts
M  src/main/git/worktree.test.ts
M  src/main/git/worktree.ts
M  src/main/github/client-work-items.test.ts
M  src/main/github/client.test.ts
M  src/main/github/client.ts
M  src/main/github/gh-utils.test.ts
M  src/main/github/gh-utils.ts
M  src/main/gitlab/client-work-items.test.ts
M  src/main/gitlab/client.ts
M  src/main/ipc/filesystem-auth.test.ts
M  src/main/ipc/filesystem-auth.ts
M  src/main/ipc/filesystem-import.test.ts
A  src/main/ipc/filesystem-list-files-git-fallback-real.test.ts
M  src/main/ipc/filesystem-list-files.test.ts
M  src/main/ipc/filesystem-list-files.ts
M  src/main/ipc/filesystem-mutations.ts
M  src/main/ipc/pty.test.ts
M  src/main/ipc/pty.ts
M  src/main/network/macos-system-resolver-health.test.ts
M  src/main/network/macos-system-resolver-health.ts
M  src/main/persistence.test.ts
M  src/main/persistence.ts
M  src/main/pty/overlay-mirror.test.ts
M  src/main/rate-limits/service.test.ts
M  src/main/rate-limits/service.ts
M  src/main/repo-worktrees.test.ts
M  src/main/repo-worktrees.ts
M  src/main/runtime/fetch-remote-cache.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/client-ui.ts
M  src/main/runtime/rpc/methods/file-watch-event-batcher.test.ts
M  src/main/runtime/rpc/methods/file-watch-event-batcher.ts
M  src/main/runtime/rpc/methods/files.test.ts
M  src/main/runtime/rpc/methods/files.ts
A  src/main/source-control/forge-provider.test.ts
A  src/main/source-control/forge-provider.ts
M  src/main/source-control/hosted-review-azure-devops.integration.test.ts
M  src/main/source-control/hosted-review-creation.test.ts
M  src/main/source-control/hosted-review-creation.ts
M  src/main/source-control/hosted-review.test.ts
M  src/main/source-control/hosted-review.ts
M  src/main/ssh/ssh-config-parser.test.ts
M  src/main/ssh/ssh-config-parser.ts
M  src/main/terminal-history.test.ts
M  src/main/terminal-history.ts
A  src/relay/external-automations-handler-log-path.test.ts
M  src/relay/external-automations-handler.ts
M  src/relay/fs-handler-git-fallback.ts
M  src/relay/fs-handler-list-files-ignored.test.ts
M  src/relay/git-handler-utils.ts
A  src/relay/git-handler-worktree-clean.test.ts
M  src/relay/git-handler-worktree-ops.test.ts
M  src/relay/git-handler-worktree-ops.ts
A  src/relay/git-handler-worktree-paths.test.ts
M  src/relay/git-handler.test.ts
M  src/relay/git-handler.ts
M  src/renderer/src/components/GitHubItemDialog.tsx
M  src/renderer/src/components/LinearIssueTextEditor.tsx
M  src/renderer/src/components/PullRequestPage.tsx
M  src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/automations/AutomationEditorDialog.tsx
M  src/renderer/src/components/automations/CreateFromPicker.tsx
M  src/renderer/src/components/automations/automation-run-output-snapshot.test.ts
M  src/renderer/src/components/automations/automation-run-output-snapshot.ts
M  src/renderer/src/components/crash-report/CrashReportDialog.tsx
A  src/renderer/src/components/diff-comments/diff-comment-zone-mouse-events.test.ts
A  src/renderer/src/components/diff-comments/diff-comment-zone-mouse-events.ts
M  src/renderer/src/components/diff-comments/useDiffCommentDecorator.tsx
M  src/renderer/src/components/editor/CombinedDiffViewer.tsx
M  src/renderer/src/components/editor/EditorPanel.tsx
M  src/renderer/src/components/editor/csv-parse.test.ts
M  src/renderer/src/components/editor/csv-parse.ts
M  src/renderer/src/components/editor/markdown-frontmatter.test.ts
M  src/renderer/src/components/editor/markdown-frontmatter.ts
M  src/renderer/src/components/editor/markdown-preview-search.test.ts
M  src/renderer/src/components/editor/markdown-preview-search.ts
M  src/renderer/src/components/editor/setup-contextual-copy.test.ts
M  src/renderer/src/components/editor/setup-contextual-copy.ts
M  src/renderer/src/components/editor/useLocalImageSrc.test.ts
M  src/renderer/src/components/editor/useLocalImageSrc.ts
A  src/renderer/src/components/linear-issue-text-save-plan.test.ts
A  src/renderer/src/components/linear-issue-text-save-plan.ts
A  src/renderer/src/components/onboarding/OnboardingInlineCommandTerminal.test.ts
M  src/renderer/src/components/onboarding/OnboardingInlineCommandTerminal.tsx
A  src/renderer/src/components/onboarding/use-onboarding-flow.test.ts
M  src/renderer/src/components/onboarding/use-onboarding-flow.ts
A  src/renderer/src/components/quick-open-file-list.test.ts
M  src/renderer/src/components/quick-open-file-list.ts
M  src/renderer/src/components/right-sidebar/HostedReviewActions.tsx
M  src/renderer/src/components/right-sidebar/PortsPanel.test.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/commit-failure-dialog-state.test.ts
M  src/renderer/src/components/right-sidebar/commit-failure-dialog-state.ts
M  src/renderer/src/components/right-sidebar/commit-failure-summary.test.ts
M  src/renderer/src/components/right-sidebar/commit-failure-summary.ts
M  src/renderer/src/components/right-sidebar/file-explorer-paths.test.ts
M  src/renderer/src/components/right-sidebar/right-panel-comment-composer.tsx
A  src/renderer/src/components/right-sidebar/right-panel-comment-focus-timers.test.ts
A  src/renderer/src/components/right-sidebar/right-panel-comment-focus-timers.ts
A  src/renderer/src/components/settings/BrowserHomePageSetting.tsx
A  src/renderer/src/components/settings/BrowserPane.test.ts
M  src/renderer/src/components/settings/BrowserPane.tsx
A  src/renderer/src/components/settings/KagiSessionLinkForm.test.ts
M  src/renderer/src/components/settings/KagiSessionLinkForm.tsx
M  src/renderer/src/components/settings/MobilePane.tsx
M  src/renderer/src/components/settings/RuntimePairingUrlGenerator.tsx
M  src/renderer/src/components/settings/SettingsFormControls.tsx
M  src/renderer/src/components/settings/SshPane.tsx
A  src/renderer/src/components/settings/browser-home-page-draft-state.ts
M  src/renderer/src/components/settings/ssh-target-draft.test.ts
M  src/renderer/src/components/settings/ssh-target-draft.ts
M  src/renderer/src/components/sidebar/DeleteWorktreeDialog.tsx
M  src/renderer/src/components/sidebar/RemoteFileBrowser.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanDrawer.tsx
A  src/renderer/src/components/sidebar/WorkspaceKanbanDrawerHeader.test.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanDrawerHeader.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanLaneGrid.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanSettingsMenu.tsx
M  src/renderer/src/components/sidebar/prompt-cache-countdown-clock.test.ts
M  src/renderer/src/components/sidebar/prompt-cache-countdown-clock.ts
M  src/renderer/src/components/status-bar/ResourceUsageStatusSegment.tsx
M  src/renderer/src/components/tab-bar/TabBar.tsx
M  src/renderer/src/components/tab-bar/TabBar.windows-shell-launch.test.ts
A  src/renderer/src/components/terminal-pane/MobileDriverOverlay.test.tsx
M  src/renderer/src/components/terminal-pane/MobileDriverOverlay.tsx
M  src/renderer/src/components/terminal-pane/parse-osc7.test.ts
M  src/renderer/src/components/terminal-pane/parse-osc7.ts
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
A  src/renderer/src/components/terminal-pane/terminal-file-url-target.test.ts
M  src/renderer/src/components/terminal-pane/terminal-link-handlers.test.ts
M  src/renderer/src/components/terminal-pane/terminal-osc-link-routing.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts
M  src/renderer/src/lib/automation-session-reuse.test.ts
M  src/renderer/src/lib/automation-session-reuse.ts
M  src/renderer/src/lib/gitlab-links.test.ts
M  src/renderer/src/lib/gitlab-links.ts
M  src/renderer/src/lib/pane-manager/pane-terminal-foreground-render-settle.ts
M  src/renderer/src/lib/pane-manager/pane-terminal-output-scheduler.test.ts
M  src/renderer/src/lib/pane-manager/pane-terminal-output-scheduler.ts
M  src/renderer/src/lib/path.test.ts
M  src/renderer/src/lib/path.ts
M  src/renderer/src/lib/smart-github-submit.test.ts
M  src/renderer/src/lib/smart-github-submit.ts
M  src/renderer/src/lib/terminal-links.test.ts
M  src/renderer/src/lib/terminal-links.ts
M  src/renderer/src/lib/windows-terminal-capabilities.test.ts
M  src/renderer/src/lib/windows-terminal-capabilities.ts
M  src/renderer/src/lib/workspace-port-actions.ts
A  src/renderer/src/store/selectors.test.ts
M  src/renderer/src/store/selectors.ts
M  src/renderer/src/store/slices/github.test.ts
M  src/renderer/src/store/slices/github.ts
M  src/renderer/src/store/slices/ui.test.ts
M  src/renderer/src/store/slices/ui.ts
M  src/shared/automation-schedules.test.ts
M  src/shared/automation-schedules.ts
M  src/shared/constants.ts
A  src/shared/github-pr-merge-methods.test.ts
A  src/shared/github-pr-merge-methods.ts
M  src/shared/gitlab-pipeline-checks.test.ts
M  src/shared/gitlab-pipeline-checks.ts
M  src/shared/hosted-review-github.test.ts
M  src/shared/hosted-review-github.ts
M  src/shared/quick-open-filter.test.ts
M  src/shared/quick-open-filter.ts
M  src/shared/types.ts
M  src/shared/workspace-statuses.test.ts
M  src/shared/workspace-statuses.ts
M  tests/e2e/terminal-output-scheduler.spec.ts
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

