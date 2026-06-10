## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/27258430438
- Upstream ref/tag: v1.4.56
- Intended Axiom version/tag: 1.4.56-axiom.1 / axiom-v1.4.56-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.56-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/TaskPage.tsx`

## Captured git status
```
M  config/scripts/verify-localization-catalog.mjs
M  mobile/app/h/[hostId]/files/[worktreeId].tsx
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
M  mobile/app/h/[hostId]/source-control/[worktreeId].tsx
A  mobile/issue-5049-unresponsive-session-findings.md
M  mobile/package.json
M  mobile/pnpm-lock.yaml
A  mobile/src/session/worktree-label.ts
M  mobile/src/transport/client-context.tsx
A  mobile/src/transport/connection-revival-triggers.test.ts
A  mobile/src/transport/connection-revival-triggers.ts
A  mobile/src/transport/rpc-client-live-recovery.test.ts
M  mobile/src/transport/rpc-client.test.ts
M  mobile/src/transport/rpc-client.ts
A  mobile/src/transport/socket-event-debug.ts
UU package.json
M  src/main/daemon/daemon-health-socket-cleanup.test.ts
M  src/main/daemon/daemon-health.test.ts
M  src/main/daemon/daemon-health.ts
M  src/main/daemon/daemon-init.test.ts
M  src/main/daemon/daemon-init.ts
M  src/main/daemon/daemon-server.test.ts
M  src/main/daemon/daemon-server.ts
M  src/main/daemon/pty-subprocess.test.ts
M  src/main/daemon/pty-subprocess.ts
M  src/main/daemon/types.ts
M  src/renderer/src/components/GitHubItemDialog.tsx
M  src/renderer/src/components/PullRequestPage.tsx
M  src/renderer/src/components/ShortcutKeyCombo.tsx
UU src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/UpdateCard.tsx
M  src/renderer/src/components/browser-pane/BrowserImportHintButton.tsx
M  src/renderer/src/components/browser-pane/BrowserPane.tsx
M  src/renderer/src/components/browser-pane/BrowserToolbarMenu.tsx
A  src/renderer/src/components/browser-pane/browser-toolbar-menu-dropdown.tsx
A  src/renderer/src/components/browser-pane/browser-toolbar-profile-dialogs.tsx
A  src/renderer/src/components/contextual-tours/contextual-tour-overlay-position.test.ts
M  src/renderer/src/components/contextual-tours/contextual-tour-overlay-position.ts
M  src/renderer/src/components/contextual-tours/contextual-tour-panel-position.test.ts
M  src/renderer/src/components/contextual-tours/contextual-tour-panel-position.ts
M  src/renderer/src/components/feature-tips/CmdJPaletteTipDialog.tsx
M  src/renderer/src/components/feature-wall/FeatureWallBrowserAction.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.test.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalWindowControls.tsx
M  src/renderer/src/components/right-sidebar/ChecksPanel.tsx
M  src/renderer/src/components/right-sidebar/CreatePullRequestDialog.tsx
A  src/renderer/src/components/right-sidebar/CreatePullRequestDialogForm.tsx
M  src/renderer/src/components/right-sidebar/CreatePullRequestGenerateButton.tsx
M  src/renderer/src/components/right-sidebar/PortsPanel.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.compare-summary.test.ts
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/SourceControlAgentActionDialog.tsx
M  src/renderer/src/components/right-sidebar/SourceControlAgentActionDialogForm.tsx
A  src/renderer/src/components/right-sidebar/create-pull-request-review-copy.ts
M  src/renderer/src/components/right-sidebar/source-control-agent-action-dialog-result.ts
M  src/renderer/src/components/right-sidebar/source-control-agent-action-dialog-support.ts
M  src/renderer/src/components/right-sidebar/source-control-dropdown-items.ts
A  src/renderer/src/components/right-sidebar/source-control-primary-action-in-flight.ts
A  src/renderer/src/components/right-sidebar/source-control-primary-action-titles.ts
A  src/renderer/src/components/right-sidebar/source-control-primary-action-types.ts
M  src/renderer/src/components/right-sidebar/source-control-primary-action.ts
M  src/renderer/src/components/right-sidebar/useSourceControlAgentActionDialog.ts
M  src/renderer/src/components/settings/AccountsPane.tsx
M  src/renderer/src/components/settings/BrowserProfileRow.tsx
M  src/renderer/src/components/settings/BrowserUseCookieImportStep.tsx
M  src/renderer/src/components/settings/RuntimeEnvironmentsPane.tsx
M  src/renderer/src/components/settings/SparsePresetSettingsSection.tsx
A  src/renderer/src/components/settings/sparse-preset-directory-preview.tsx
A  src/renderer/src/components/settings/sparse-preset-draft-editor.tsx
A  src/renderer/src/components/settings/sparse-preset-settings-row.tsx
M  src/renderer/src/components/shared/useDaemonActions.tsx
M  src/renderer/src/components/sidebar/AddRepoStartSteps.test.tsx
M  src/renderer/src/components/sidebar/AddRepoStartSteps.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
M  src/renderer/src/components/sidebar/WorktreeList.lineage-child-card.test.ts
A  src/renderer/src/components/sidebar/WorktreeList.lineage-child-real-card.test.tsx
M  src/renderer/src/components/sidebar/WorktreeList.tsx
M  src/renderer/src/components/stats/usage-overview-sections.tsx
M  src/renderer/src/components/status-bar/PortsStatusSegment.tsx
M  src/renderer/src/components/status-bar/ResourceUsageStatusSegment.tsx
M  src/renderer/src/components/status-bar/UpdateStatusSegment.tsx
M  src/renderer/src/components/status-bar/WorkspaceSpaceManagerPanel.tsx
M  src/renderer/src/components/tab-bar/tab-create-menu-options.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.test.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts
M  src/renderer/src/components/workspace-cleanup/WorkspaceCleanupDialog.tsx
M  src/renderer/src/hooks/useComposerState.ts
A  src/renderer/src/i18n/hosted-review-localized-copy.ts
M  src/renderer/src/i18n/locales/en.json
M  src/renderer/src/i18n/locales/ja.json
M  src/renderer/src/i18n/locales/ko.json
M  src/renderer/src/i18n/locales/zh.json
A  src/renderer/src/lib/work-item-lookup-text.test.ts
A  src/renderer/src/lib/work-item-lookup-text.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/web/web-preload-api.ts
A  tests/e2e/floating-workspace-reopen-webgl-recovery.spec.ts
M  tests/e2e/worktree.spec.ts
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

