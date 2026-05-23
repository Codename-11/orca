## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26342492081
- Upstream ref/tag: v1.4.23-rc.0
- Intended Axiom version/tag: 1.4.23-rc.0.axiom.1 / axiom-v1.4.23-rc.0.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.23-rc.0.axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/settings/TerminalPane.ghostty.test.ts`
- `src/renderer/src/components/settings/TerminalPane.pwsh.test.ts`
- `src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.test.ts`

## Captured git status
```
M  config/vitest.config.ts
UU package.json
M  pnpm-lock.yaml
M  src/main/daemon/wsl-session-context.ts
D  src/main/feature-wall/first-agent-tour.test.ts
D  src/main/feature-wall/first-agent-tour.ts
M  src/main/index.ts
M  src/main/ipc/pty.test.ts
M  src/main/ipc/pty.ts
M  src/main/ipc/repos.ts
M  src/main/ipc/shell.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/ipc/worktrees.ts
M  src/main/memory/collector.ts
M  src/main/menu/register-app-menu.test.ts
M  src/main/menu/register-app-menu.ts
M  src/main/persistence.test.ts
M  src/main/persistence.ts
M  src/main/ports/workspace-port-ownership.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/client-ui.ts
M  src/main/runtime/rpc/methods/repo.ts
A  src/main/ssh/ssh-agent-identity-filter.test.ts
A  src/main/ssh/ssh-agent-identity-filter.ts
A  src/main/ssh/ssh-auth-resolution.ts
M  src/main/ssh/ssh-config-parser.test.ts
M  src/main/ssh/ssh-config-parser.ts
M  src/main/ssh/ssh-connection-utils.test.ts
M  src/main/ssh/ssh-connection-utils.ts
M  src/main/ssh/ssh-connection.test.ts
M  src/main/ssh/ssh-connection.ts
M  src/main/ssh/ssh-system-fallback.test.ts
M  src/main/ssh/ssh-system-fallback.ts
M  src/main/usage-worktree-metadata.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/renderer/src/App.tsx
M  src/renderer/src/assets/main.css
M  src/renderer/src/assets/mobile-page.css
D  src/renderer/src/components/AgentSkillInstalledIndicator.tsx
M  src/renderer/src/components/Landing.tsx
M  src/renderer/src/components/NewWorkspaceComposerCard.tsx
M  src/renderer/src/components/NewWorkspaceComposerModal.tsx
M  src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/WorktreeJumpPalette.tsx
A  src/renderer/src/components/feature-wall/AgentsOrchestrationVisual.tsx
A  src/renderer/src/components/feature-wall/AiCommitPrSettingsCard.tsx
A  src/renderer/src/components/feature-wall/BrowserAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/BrowserUseSkillSetupCard.tsx
A  src/renderer/src/components/feature-wall/EditorAnimatedVisual.tsx
D  src/renderer/src/components/feature-wall/FeatureTourNudge.tsx
A  src/renderer/src/components/feature-wall/FeatureTourPreview.tsx
A  src/renderer/src/components/feature-wall/FeatureWallBody.tsx
A  src/renderer/src/components/feature-wall/FeatureWallClickRing.tsx
A  src/renderer/src/components/feature-wall/FeatureWallContinueButton.tsx
M  src/renderer/src/components/feature-wall/FeatureWallModal.tsx
A  src/renderer/src/components/feature-wall/FeatureWallPreview.tsx
A  src/renderer/src/components/feature-wall/FeatureWallRail.tsx
D  src/renderer/src/components/feature-wall/FeatureWallTileCard.tsx
A  src/renderer/src/components/feature-wall/FeatureWallTourPanel.tsx
A  src/renderer/src/components/feature-wall/FeatureWallTourSurface.tsx
A  src/renderer/src/components/feature-wall/KeepAwakeCard.tsx
A  src/renderer/src/components/feature-wall/ReviewAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/ReviewNotesAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/ReviewPRViewAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/ReviewShipAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/TasksAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/WorkbenchAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/WorkspacesAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/agents-orchestration/NotificationsPage.tsx
A  src/renderer/src/components/feature-wall/agents-orchestration/OrchestrationPage.tsx
A  src/renderer/src/components/feature-wall/agents-orchestration/StatusesPage.tsx
A  src/renderer/src/components/feature-wall/agents-orchestration/UsageAccountsCard.tsx
A  src/renderer/src/components/feature-wall/agents-orchestration/UsagePage.tsx
A  src/renderer/src/components/feature-wall/agents-orchestration/orchestration-bubble-path.ts
A  src/renderer/src/components/feature-wall/agents-orchestration/orchestration-cards.tsx
A  src/renderer/src/components/feature-wall/agents-orchestration/orchestration-types.ts
A  src/renderer/src/components/feature-wall/feature-wall-active-step-copy.ts
A  src/renderer/src/components/feature-wall/feature-wall-completion-persistence.ts
A  src/renderer/src/components/feature-wall/feature-wall-completion-progress.ts
D  src/renderer/src/components/feature-wall/feature-wall-grid-navigation.test.ts
D  src/renderer/src/components/feature-wall/feature-wall-grid-navigation.ts
A  src/renderer/src/components/feature-wall/feature-wall-modal-helpers.ts
A  src/renderer/src/components/feature-wall/feature-wall-rail-navigation.test.ts
A  src/renderer/src/components/feature-wall/feature-wall-rail-navigation.ts
A  src/renderer/src/components/feature-wall/feature-wall-usage-tracking.test.ts
A  src/renderer/src/components/feature-wall/feature-wall-usage-tracking.ts
A  src/renderer/src/components/feature-wall/review-animated-visual-notes-styles.tsx
A  src/renderer/src/components/feature-wall/review-animated-visual-pr-view-styles.tsx
A  src/renderer/src/components/feature-wall/review-animated-visual-shared.tsx
A  src/renderer/src/components/feature-wall/review-animated-visual-ship-styles.tsx
A  src/renderer/src/components/feature-wall/review-notes-diff-rows.tsx
A  src/renderer/src/components/feature-wall/review-notes-terminal-phase.ts
A  src/renderer/src/components/feature-wall/use-feature-wall-completion.test.ts
A  src/renderer/src/components/feature-wall/use-feature-wall-completion.ts
A  src/renderer/src/components/feature-wall/use-feature-wall-task-source-presentation.ts
A  src/renderer/src/components/feature-wall/use-feature-wall-tour-telemetry.ts
A  src/renderer/src/components/feature-wall/use-persisted-feature-wall-completion.ts
M  src/renderer/src/components/floating-terminal/FloatingTerminalOrchestrationDialog.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.test.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalPanel.tsx
M  src/renderer/src/components/new-workspace/SmartWorkspaceNameField.tsx
A  src/renderer/src/components/notification-sound-options.ts
M  src/renderer/src/components/onboarding/FeatureSetupChecklist.tsx
M  src/renderer/src/components/onboarding/FeatureSetupInlineTerminal.tsx
M  src/renderer/src/components/onboarding/IntegrationsStep.tsx
M  src/renderer/src/components/onboarding/NotificationStep.tsx
M  src/renderer/src/components/onboarding/OnboardingFlow.tsx
M  src/renderer/src/components/onboarding/OnboardingInlineCommandTerminal.tsx
A  src/renderer/src/components/onboarding/OnboardingTourStep.tsx
M  src/renderer/src/components/onboarding/onboarding-feature-setup.test.ts
M  src/renderer/src/components/onboarding/onboarding-feature-setup.ts
M  src/renderer/src/components/onboarding/use-onboarding-flow-persistence.ts
M  src/renderer/src/components/onboarding/use-onboarding-flow-types.ts
M  src/renderer/src/components/onboarding/use-onboarding-flow.ts
M  src/renderer/src/components/repo/RepoCombobox.tsx
A  src/renderer/src/components/repo/repo-icon.tsx
M  src/renderer/src/components/settings/AgentSkillSetupPanel.tsx
M  src/renderer/src/components/settings/BrowserUsePane.tsx
M  src/renderer/src/components/settings/BrowserUseSkillStep.tsx
M  src/renderer/src/components/settings/CliSection.tsx
M  src/renderer/src/components/settings/ComputerUsePane.tsx
M  src/renderer/src/components/settings/ManageSessionsSection.tsx
M  src/renderer/src/components/settings/NotificationsPane.test.tsx
M  src/renderer/src/components/settings/NotificationsPane.tsx
M  src/renderer/src/components/settings/OrchestrationPane.tsx
A  src/renderer/src/components/settings/OrchestrationSetupCard.tsx
A  src/renderer/src/components/settings/RepositoryIconPicker.tsx
M  src/renderer/src/components/settings/RepositoryPane.tsx
M  src/renderer/src/components/settings/Settings.tsx
M  src/renderer/src/components/settings/SettingsSidebar.tsx
UU src/renderer/src/components/settings/TerminalPane.ghostty.test.ts
UU src/renderer/src/components/settings/TerminalPane.pwsh.test.ts
M  src/renderer/src/components/settings/browser-use-search.ts
M  src/renderer/src/components/settings/repository-settings-targets.ts
M  src/renderer/src/components/sidebar/DeleteWorktreeDialog.test.tsx
M  src/renderer/src/components/sidebar/DeleteWorktreeDialog.tsx
M  src/renderer/src/components/sidebar/SidebarFilter.tsx
M  src/renderer/src/components/sidebar/SidebarHeader.tsx
M  src/renderer/src/components/sidebar/SidebarWorkspaceOptionsMenu.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanStatusLane.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.pr-display.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.quick-actions.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
M  src/renderer/src/components/sidebar/WorktreeContextMenu.test.ts
M  src/renderer/src/components/sidebar/WorktreeContextMenu.tsx
M  src/renderer/src/components/sidebar/WorktreeList.tsx
M  src/renderer/src/components/sidebar/WorktreeVisibilityDialog.tsx
A  src/renderer/src/components/sidebar/delete-worktree-dialog-copy.ts
M  src/renderer/src/components/sidebar/delete-worktree-flow.ts
D  src/renderer/src/components/sidebar/mac-option-key-state.test.ts
D  src/renderer/src/components/sidebar/mac-option-key-state.ts
M  src/renderer/src/components/sidebar/repo-header-create-state.test.ts
M  src/renderer/src/components/sidebar/repo-header-create-state.ts
M  src/renderer/src/components/sidebar/use-workspace-kanban-create-worktree.ts
D  src/renderer/src/components/sidebar/worktree-card-quick-action.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.test.ts
M  src/renderer/src/components/sidebar/worktree-list-scroll-adjustment.test.ts
M  src/renderer/src/components/sidebar/worktree-list-virtual-rows.ts
M  src/renderer/src/components/status-bar/ResourceUsageStatusSegment.tsx
M  src/renderer/src/components/status-bar/mergeSnapshotAndSessions.ts
M  src/renderer/src/components/terminal-pane/TerminalPane.tsx
A  src/renderer/src/components/terminal-pane/hidden-terminal-output-state.ts
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
UU src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.test.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-global-effects.test.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-global-effects.ts
M  src/renderer/src/components/ui/repo-multi-combobox.tsx
M  src/renderer/src/hooks/useComposerState.ts
M  src/renderer/src/hooks/useIpcEvents.test.ts
M  src/renderer/src/hooks/useIpcEvents.ts
M  src/renderer/src/lib/agent-ready-wait.test.ts
A  src/renderer/src/lib/agent-skill-cli-prerequisite.test.ts
A  src/renderer/src/lib/agent-skill-cli-prerequisite.ts
A  src/renderer/src/lib/worktree-palette-create-action.test.ts
A  src/renderer/src/lib/worktree-palette-create-action.ts
M  src/renderer/src/store/slices/github.ts
M  src/renderer/src/store/slices/repos.ts
M  src/renderer/src/store/slices/ui.test.ts
M  src/renderer/src/store/slices/ui.ts
M  src/renderer/src/web/web-preload-api.ts
A  src/shared/agents-orchestration-steps.ts
M  src/shared/constants.ts
M  src/shared/feature-wall-tiles.ts
A  src/shared/feature-wall-workflows.ts
A  src/shared/repo-icon.test.ts
A  src/shared/repo-icon.ts
A  src/shared/review-steps.ts
M  src/shared/ssh-types.ts
M  src/shared/telemetry-events.test.ts
M  src/shared/telemetry-events.ts
A  src/shared/telemetry-feature-wall-events.test.ts
M  src/shared/types.ts
A  src/shared/workbench-steps.ts
M  src/shared/worktree-card-properties.ts
M  src/shared/worktree-id.test.ts
M  src/shared/worktree-id.ts
M  src/types/build-constants.d.ts
M  tests/e2e/feature-wall.spec.ts
M  tests/e2e/helpers/orca-app.ts
M  tests/e2e/helpers/orca-restart.ts
M  tests/e2e/onboarding.spec.ts
M  tests/e2e/settings-skill-detection.spec.ts
M  tests/e2e/terminal-codex-lag-stress.spec.ts
M  vite.web.config.ts
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

