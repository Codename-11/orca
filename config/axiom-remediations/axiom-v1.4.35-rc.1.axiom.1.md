## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26614731756
- Upstream ref/tag: v1.4.35-rc.1
- Intended Axiom version/tag: 1.4.35-rc.1.axiom.1 / axiom-v1.4.35-rc.1.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.35-rc.1.axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/main/ipc/settings.test.ts`
- `src/main/ipc/settings.ts`
- `src/main/runtime/rpc/methods/client-ui.ts`

## Captured git status
```
A  config/scripts/marine-creatures-parity.test.mjs
A  docs/experimental-compact-worktree-cards.md
A  docs/refresh-github-issues-after-create.md
M  mobile/app/h/[hostId]/tasks.tsx
M  mobile/src/components/NewWorktreeModal.tsx
M  mobile/src/components/worktree-name-suggestion.ts
M  mobile/src/constants/marine-creatures.ts
M  mobile/src/tasks/mobile-tui-agents.ts
M  mobile/src/tasks/workspace-agent-selection.test.ts
M  mobile/src/tasks/workspace-agent-selection.ts
UU package.json
M  pnpm-lock.yaml
M  src/cli/runtime/transport.test.ts
M  src/cli/runtime/transport.ts
M  src/main/codex-accounts/runtime-home-service.test.ts
M  src/main/codex-accounts/service.test.ts
M  src/main/git/remove-worktree.test.ts
M  src/main/git/status.test.ts
M  src/main/git/status.ts
M  src/main/git/worktree.test.ts
M  src/main/git/worktree.ts
M  src/main/github/client-issue-source.test.ts
M  src/main/github/client.ts
M  src/main/index.ts
M  src/main/ipc/filesystem.test.ts
M  src/main/ipc/filesystem.ts
M  src/main/ipc/github.test.ts
M  src/main/ipc/github.ts
M  src/main/ipc/repos-remote.test.ts
M  src/main/ipc/repos.ts
UU src/main/ipc/settings.test.ts
UU src/main/ipc/settings.ts
M  src/main/ipc/worktree-remote.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/persistence.test.ts
M  src/main/persistence.ts
M  src/main/providers/ssh-git-provider-merge.test.ts
M  src/main/providers/ssh-git-provider.ts
M  src/main/providers/types.ts
M  src/main/runtime/orca-runtime-files.test.ts
M  src/main/runtime/orca-runtime-files.ts
M  src/main/runtime/orca-runtime-git.test.ts
M  src/main/runtime/orca-runtime-git.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/client-ui.test.ts
UU src/main/runtime/rpc/methods/client-ui.ts
M  src/main/runtime/rpc/methods/git.test.ts
M  src/main/runtime/rpc/methods/git.ts
M  src/main/runtime/rpc/methods/github.test.ts
M  src/main/runtime/rpc/methods/github.ts
A  src/main/runtime/rpc/methods/repo-badge-color.test.ts
M  src/main/runtime/rpc/methods/repo.ts
M  src/main/runtime/runtime-rpc.test.ts
M  src/main/runtime/runtime-rpc.ts
M  src/main/ssh/ssh-connection.test.ts
M  src/main/ssh/ssh-connection.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/relay/git-handler-worktree-ops.test.ts
M  src/relay/git-handler-worktree-ops.ts
M  src/relay/git-handler.test.ts
M  src/relay/git-handler.ts
M  src/renderer/src/App.tsx
M  src/renderer/src/components/GitHubItemDialog.tsx
M  src/renderer/src/components/NewWorkspaceComposerCard.tsx
M  src/renderer/src/components/NewWorkspaceComposerModal.tsx
M  src/renderer/src/components/PullRequestPage.tsx
M  src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/automations/AutomationEditorDialog.tsx
M  src/renderer/src/components/automations/AutomationsPage.tsx
M  src/renderer/src/components/feature-wall/AiCommitPrSettingsCard.tsx
M  src/renderer/src/components/feature-wall/use-feature-wall-completion.ts
M  src/renderer/src/components/floating-terminal/FloatingTerminalWindowControls.tsx
M  src/renderer/src/components/onboarding/OnboardingFlow.tsx
M  src/renderer/src/components/onboarding/RepoStep.tsx
M  src/renderer/src/components/onboarding/use-onboarding-flow.ts
A  src/renderer/src/components/pet/pet-overlay-visibility.test.ts
A  src/renderer/src/components/pet/pet-overlay-visibility.ts
M  src/renderer/src/components/repo/NestedRepoTreePreview.tsx
M  src/renderer/src/components/right-sidebar/ChecksPanel.tsx
M  src/renderer/src/components/right-sidebar/CommitArea.test.tsx
M  src/renderer/src/components/right-sidebar/FileExplorer.tsx
M  src/renderer/src/components/right-sidebar/FileExplorerRow.tsx
M  src/renderer/src/components/right-sidebar/PRActions.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.commit-drafts.test.ts
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/checks-panel-content.tsx
M  src/renderer/src/components/right-sidebar/file-explorer-types.ts
M  src/renderer/src/components/right-sidebar/source-control-dropdown-items.test.ts
M  src/renderer/src/components/right-sidebar/source-control-dropdown-items.ts
M  src/renderer/src/components/right-sidebar/useCreatePullRequestDialogFields.ts
A  src/renderer/src/components/right-sidebar/useFileExplorerHandlers.test.ts
M  src/renderer/src/components/right-sidebar/useFileExplorerHandlers.ts
M  src/renderer/src/components/right-sidebar/useFileExplorerTree.ts
M  src/renderer/src/components/right-sidebar/useGitStatusPolling.ts
M  src/renderer/src/components/settings/AgentsPane.test.tsx
M  src/renderer/src/components/settings/AgentsPane.tsx
M  src/renderer/src/components/settings/CommitMessageAiPane.tsx
A  src/renderer/src/components/settings/ExperimentalPane.test.tsx
M  src/renderer/src/components/settings/ExperimentalPane.tsx
M  src/renderer/src/components/settings/RepositoryIconPicker.tsx
M  src/renderer/src/components/settings/RepositoryPane.tsx
M  src/renderer/src/components/settings/RepositorySourceControlAiSection.tsx
M  src/renderer/src/components/settings/agents-search.ts
M  src/renderer/src/components/settings/experimental-search.ts
M  src/renderer/src/components/settings/repository-search.ts
M  src/renderer/src/components/sidebar/AddRepoDialog.tsx
M  src/renderer/src/components/sidebar/CacheTimer.tsx
M  src/renderer/src/components/sidebar/StatusIndicator.test.ts
M  src/renderer/src/components/sidebar/StatusIndicator.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.lineage.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.pr-display.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.quick-actions.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
M  src/renderer/src/components/sidebar/WorktreeList.lineage-child-card.test.ts
M  src/renderer/src/components/sidebar/WorktreeList.tsx
M  src/renderer/src/components/sidebar/WorktreeTitleInlineRename.test.tsx
M  src/renderer/src/components/sidebar/WorktreeTitleInlineRename.tsx
M  src/renderer/src/components/sidebar/project-header-color.test.ts
M  src/renderer/src/components/sidebar/project-header-color.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.test.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.ts
M  src/renderer/src/components/sidebar/worktree-list-scroll-adjustment.test.ts
M  src/renderer/src/components/sidebar/worktree-list-virtual-rows.ts
M  src/renderer/src/components/sidebar/worktree-name-suggestions.test.ts
M  src/renderer/src/components/sidebar/worktree-name-suggestions.ts
M  src/renderer/src/components/tab-bar/QuickLaunchButton.tsx
M  src/renderer/src/components/tab-bar/TabBar.context-menu.test.ts
M  src/renderer/src/components/tab-bar/TabBar.tsx
M  src/renderer/src/components/tab-bar/TabBar.windows-shell-launch.test.ts
M  src/renderer/src/components/task-page-cache-selectors.test.ts
M  src/renderer/src/components/task-page-cache-selectors.ts
A  src/renderer/src/components/ui/color-picker.test.tsx
A  src/renderer/src/components/ui/color-picker.tsx
M  src/renderer/src/hooks/useComposerState.ts
M  src/renderer/src/hooks/useEditorExternalWatch-targets.test.ts
M  src/renderer/src/hooks/useEditorExternalWatch.ts
M  src/renderer/src/lib/launch-work-item-direct.ts
M  src/renderer/src/lib/onboarding-folder-agent-startup.ts
A  src/renderer/src/lib/passive-macos-app-data-access.test.ts
A  src/renderer/src/lib/passive-macos-app-data-access.ts
A  src/renderer/src/lib/quick-workspace-agent-selection.test.ts
A  src/renderer/src/lib/quick-workspace-agent-selection.ts
M  src/renderer/src/runtime/runtime-git-client-merge.test.ts
M  src/renderer/src/runtime/runtime-git-client.ts
M  src/renderer/src/store/slices/github.test.ts
M  src/renderer/src/store/slices/github.ts
M  src/renderer/src/store/slices/repos.ts
M  src/renderer/src/store/slices/settings.ts
M  src/renderer/src/store/slices/store-session-cascades.test.ts
M  src/renderer/src/store/slices/terminals.ts
M  src/renderer/src/store/slices/worktree-helpers.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/web/web-preload-api.test.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/commit-message-agent-spec.test.ts
M  src/shared/commit-message-agent-spec.ts
M  src/shared/constants.test.ts
M  src/shared/constants.ts
M  src/shared/marine-creatures.ts
A  src/shared/repo-badge-color.test.ts
A  src/shared/repo-badge-color.ts
M  src/shared/source-control-ai.ts
M  src/shared/tui-agent-selection.test.ts
M  src/shared/tui-agent-selection.ts
M  src/shared/types.ts
M  tests/e2e/folder-setup.spec.ts
M  tests/e2e/tabs.spec.ts
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

