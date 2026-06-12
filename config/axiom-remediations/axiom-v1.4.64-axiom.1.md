## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/27395284880
- Upstream ref/tag: v1.4.64
- Intended Axiom version/tag: 1.4.64-axiom.1 / axiom-v1.4.64-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.64-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/settings/TasksPane.tsx`

## Captured git status
```
M  mobile/app.json
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
M  mobile/app/terminal-settings.tsx
M  mobile/src/components/CustomKeyModal.tsx
A  mobile/src/components/DragReorderList.tsx
M  mobile/src/components/MobileAgentIcon.tsx
A  mobile/src/components/TerminalShortcutSettings.tsx
A  mobile/src/components/drag-reorder-positions.test.ts
A  mobile/src/components/drag-reorder-positions.ts
M  mobile/src/session/mobile-session-startup-source.test.ts
M  mobile/src/tasks/mobile-agent-catalog.test.ts
M  mobile/src/tasks/mobile-tui-agents.ts
M  mobile/src/terminal/terminal-accessory-layout.test.ts
M  mobile/src/terminal/terminal-accessory-layout.ts
A  mobile/src/terminal/terminal-text-input-normalization.test.ts
A  mobile/src/terminal/terminal-text-input-normalization.ts
UU package.json
M  src/main/claude-accounts/runtime-auth-service.test.ts
M  src/main/claude-accounts/runtime-auth-service.ts
M  src/main/claude-accounts/service.test.ts
M  src/main/daemon/daemon-health-socket-cleanup.test.ts
M  src/main/daemon/daemon-health.test.ts
M  src/main/daemon/daemon-health.ts
M  src/main/daemon/daemon-init.test.ts
M  src/main/daemon/daemon-init.ts
M  src/main/daemon/daemon-server.test.ts
M  src/main/daemon/daemon-server.ts
M  src/main/daemon/pty-subprocess.test.ts
M  src/main/daemon/pty-subprocess.ts
A  src/main/daemon/slow-daemon-session-verification.test.ts
M  src/main/daemon/types.ts
M  src/main/git/remote.test.ts
M  src/main/github/issues.ts
M  src/main/github/project-view/mutations.ts
M  src/main/gitlab/gl-utils.test.ts
M  src/main/gitlab/gl-utils.ts
A  src/main/gitlab/project-ref-parser.test.ts
A  src/main/gitlab/project-ref-parser.ts
A  src/main/source-control/hosted-review-creation-gitlab-self-hosted.test.ts
M  src/main/speech/model-manager-download-error.test.ts
M  src/main/speech/model-manager-stream-cleanup.test.ts
M  src/main/speech/model-manager.test.ts
M  src/main/speech/model-manager.ts
M  src/main/startup/first-window-startup-services.test.ts
M  src/main/startup/first-window-startup-services.ts
M  src/renderer/src/App.tsx
M  src/renderer/src/assets/rich-markdown-editor.css
M  src/renderer/src/components/GitHubItemDialog.tsx
M  src/renderer/src/components/LinearIssueMarkdownDescriptionEditor.tsx
A  src/renderer/src/components/LinearIssueMarkdownToolbar.tsx
M  src/renderer/src/components/NewWorkspaceComposerCard.tsx
M  src/renderer/src/components/PullRequestPage.tsx
M  src/renderer/src/components/browser-pane/BrowserPane.tsx
M  src/renderer/src/components/editor/EditorViewToggle.tsx
M  src/renderer/src/components/editor/RichMarkdownCodeBlock.tsx
M  src/renderer/src/components/editor/markdown-rich-mode.ts
A  src/renderer/src/components/editor/rich-markdown-slash-command-catalog.tsx
A  src/renderer/src/components/editor/rich-markdown-slash-command-primitives.ts
M  src/renderer/src/components/editor/rich-markdown-slash-commands.tsx
M  src/renderer/src/components/feature-wall/AgentCapabilitiesSetupAction.tsx
M  src/renderer/src/components/feature-wall/BrowserAnimatedVisual.tsx
M  src/renderer/src/components/feature-wall/FeatureTourPreview.tsx
M  src/renderer/src/components/feature-wall/ReviewPRViewAnimatedVisual.tsx
M  src/renderer/src/components/feature-wall/TasksAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/feature-tour-preview-copy.ts
A  src/renderer/src/components/feature-wall/review-pr-view-animation.ts
M  src/renderer/src/components/github-pr-merge-state.test.ts
M  src/renderer/src/components/github-pr-merge-state.ts
A  src/renderer/src/components/github/CloseReasonDropdown.tsx
A  src/renderer/src/components/github/GitHubIssueCommentComposer.tsx
M  src/renderer/src/components/github/GitHubMarkdownComposer.tsx
A  src/renderer/src/components/github/GitHubWorkItemAssigneePopoverContent.tsx
A  src/renderer/src/components/github/GitHubWorkItemLabelPopoverContent.tsx
A  src/renderer/src/components/github/github-issue-close-reasons.tsx
A  src/renderer/src/components/github/github-issue-comment-helpers.ts
A  src/renderer/src/components/github/github-markdown-composer-preview-pane.tsx
A  src/renderer/src/components/github/github-markdown-composer-tabbar.tsx
M  src/renderer/src/components/github/github-rate-limit-display.tsx
A  src/renderer/src/components/github/github-work-item-assignee-filter.test.ts
A  src/renderer/src/components/github/github-work-item-assignee-filter.ts
A  src/renderer/src/components/github/github-work-item-label-filter.test.ts
A  src/renderer/src/components/github/github-work-item-label-filter.ts
A  src/renderer/src/components/github/use-image-input.ts
M  src/renderer/src/components/mobile/MobileHero.tsx
A  src/renderer/src/components/mobile/MobileHeroPairedDevices.tsx
M  src/renderer/src/components/mobile/mobile-platform-copy.ts
M  src/renderer/src/components/new-workspace/SmartWorkspaceNameField.tsx
A  src/renderer/src/components/new-workspace/smart-workspace-localized-options.test.ts
A  src/renderer/src/components/new-workspace/smart-workspace-localized-options.tsx
M  src/renderer/src/components/onboarding/FeatureSetupChecklist.tsx
M  src/renderer/src/components/onboarding/OnboardingFlow.tsx
M  src/renderer/src/components/onboarding/OnboardingSkipConfirmationDialog.tsx
M  src/renderer/src/components/onboarding/ThemeStep.tsx
A  src/renderer/src/components/onboarding/theme-chrome-preview.tsx
M  src/renderer/src/components/pet/pet-models.ts
M  src/renderer/src/components/right-sidebar/ChecksPanel.review-header.test.tsx
M  src/renderer/src/components/right-sidebar/ChecksPanel.tsx
M  src/renderer/src/components/right-sidebar/CommitArea.test.tsx
M  src/renderer/src/components/right-sidebar/HostedReviewActions.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
A  src/renderer/src/components/right-sidebar/SourceControlAgentActionDialog.test.tsx
M  src/renderer/src/components/right-sidebar/SourceControlAgentActionDialog.tsx
M  src/renderer/src/components/right-sidebar/SourceControlAgentActionDialogForm.test.tsx
M  src/renderer/src/components/right-sidebar/checks-panel-content.tsx
A  src/renderer/src/components/right-sidebar/checks-panel-review-creation.test.ts
A  src/renderer/src/components/right-sidebar/checks-panel-review-creation.ts
M  src/renderer/src/components/right-sidebar/pr-comments-list-selection.test.tsx
M  src/renderer/src/components/right-sidebar/pr-comments-list-selection.ts
M  src/renderer/src/components/right-sidebar/source-control-action-recipe-match.test.ts
M  src/renderer/src/components/right-sidebar/source-control-agent-action-dialog-result.ts
A  src/renderer/src/components/right-sidebar/use-hosted-review-actions.ts
A  src/renderer/src/components/right-sidebar/useSavedSourceControlAgentActionAutoStart.ts
M  src/renderer/src/components/right-sidebar/useSourceControlAgentActionDialog.ts
A  src/renderer/src/components/right-sidebar/useSourceControlAgentActionStart.ts
M  src/renderer/src/components/settings/AutoRenameBranchFromWorkSetting.tsx
M  src/renderer/src/components/settings/ComputerUsePane.tsx
M  src/renderer/src/components/settings/DeveloperPermissionsPane.tsx
M  src/renderer/src/components/settings/McpConfigSection.tsx
M  src/renderer/src/components/settings/RepositorySourceControlAiHostedReviewDefaults.tsx
M  src/renderer/src/components/settings/Settings.tsx
M  src/renderer/src/components/settings/SourceControlAiActionRecipeDefaults.tsx
M  src/renderer/src/components/settings/SshTargetCard.tsx
UU src/renderer/src/components/settings/TasksPane.tsx
M  src/renderer/src/components/settings/TerminalWindowSection.tsx
M  src/renderer/src/components/settings/auto-rename-branch-search.ts
A  src/renderer/src/components/settings/mcp-config-inspection.ts
M  src/renderer/src/components/settings/mobile-auto-restore-options.ts
M  src/renderer/src/components/sidebar/AddRepoCreateStep.test.tsx
M  src/renderer/src/components/sidebar/AddRepoCreateStep.tsx
M  src/renderer/src/components/sidebar/AddRepoDialog.tsx
M  src/renderer/src/components/sidebar/AddRepoDialogStepContent.test.tsx
M  src/renderer/src/components/sidebar/AddRepoDialogStepContent.tsx
M  src/renderer/src/components/sidebar/AddRepoStartSteps.test.tsx
M  src/renderer/src/components/sidebar/FolderWorkspaceComposerDialog.tsx
M  src/renderer/src/components/sidebar/SidebarWorkspaceOptionsMenu.tsx
M  src/renderer/src/components/sidebar/SshDisconnectedDialog.tsx
M  src/renderer/src/components/sidebar/add-repo-local-start-actions.ts
M  src/renderer/src/components/sidebar/folder-workspace-composer-submit.test.ts
M  src/renderer/src/components/sidebar/folder-workspace-composer-submit.ts
M  src/renderer/src/components/sidebar/useCreateProjectDefaults.test.ts
M  src/renderer/src/components/sidebar/useCreateProjectDefaults.ts
M  src/renderer/src/components/sidebar/useCreateRepo.default-checkout.test.ts
M  src/renderer/src/components/sidebar/useCreateRepo.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.ts
A  src/renderer/src/components/stats/ClaudeUsageDetails.tsx
M  src/renderer/src/components/stats/ClaudeUsagePane.tsx
A  src/renderer/src/components/stats/CodexUsageDetails.tsx
M  src/renderer/src/components/stats/CodexUsagePane.tsx
A  src/renderer/src/components/stats/OpenCodeUsageDetails.tsx
M  src/renderer/src/components/stats/OpenCodeUsagePane.tsx
M  src/renderer/src/components/stats/StatsPane.tsx
A  src/renderer/src/components/stats/UsageBreakdownSection.tsx
A  src/renderer/src/components/stats/UsageSessionsTable.tsx
M  src/renderer/src/components/tab-bar/SortableTabContextMenu.tsx
M  src/renderer/src/components/terminal-pane/MobileDriverOverlay.test.tsx
M  src/renderer/src/components/terminal-pane/MobileDriverOverlay.tsx
M  src/renderer/src/components/terminal-pane/TerminalPane.tsx
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
A  src/renderer/src/components/terminal-pane/terminal-fit-restore.test.ts
A  src/renderer/src/components/terminal-pane/terminal-fit-restore.ts
M  src/renderer/src/i18n/locales/en.json
M  src/renderer/src/i18n/locales/es.json
M  src/renderer/src/i18n/locales/ja.json
M  src/renderer/src/i18n/locales/ko.json
M  src/renderer/src/i18n/locales/zh.json
A  src/renderer/src/i18n/no-top-level-translate.test.ts
M  src/renderer/src/lib/folder-workspace-path-status.ts
M  src/renderer/src/lib/pane-manager/mobile-driver-state.test.ts
M  src/renderer/src/lib/pane-manager/mobile-driver-state.ts
A  src/renderer/src/lib/resume-sleeping-agent-session.test.ts
M  src/renderer/src/lib/resume-sleeping-agent-session.ts
M  src/renderer/src/main.tsx
A  src/renderer/src/store/slices/agent-status-quit-capture.test.ts
M  src/renderer/src/store/slices/agent-status.ts
M  src/renderer/src/store/slices/editor.test.ts
M  src/renderer/src/store/slices/editor.ts
A  src/renderer/src/store/slices/worktree-helpers.test.ts
M  src/renderer/src/store/slices/worktree-helpers.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/web/main.tsx
M  src/shared/agent-session-resume.ts
M  src/shared/git-remote-error.test.ts
M  src/shared/git-remote-error.ts
M  src/shared/types.ts
A  tests/e2e/agent-session-quit-resume.spec.ts
A  tests/e2e/daemon-slow-health-check-preservation.spec.ts
A  tests/e2e/daemon-slow-init-pty-gate.spec.ts
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

