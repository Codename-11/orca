## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26707707502
- Upstream ref/tag: v1.4.36-rc.10
- Intended Axiom version/tag: 1.4.36-rc.10.axiom.1 / axiom-v1.4.36-rc.10.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.36-rc.10.axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/store/slices/store-session-cascades.test.ts`
- `src/renderer/src/store/slices/tabs.test.ts`

## Captured git status
```
M  config/electron-builder.config.cjs
M  config/scripts/electron-builder-config.test.mjs
UU package.json
M  pnpm-lock.yaml
A  src/main/cli/appimage-cli-wrapper.ts
M  src/main/cli/cli-installer.test.ts
M  src/main/cli/cli-installer.ts
M  src/main/cli/packaged-cli-assets.test.ts
M  src/main/github/gh-utils.test.ts
M  src/main/github/gh-utils.ts
M  src/main/github/pr-start-point.test.ts
M  src/main/github/pr-start-point.ts
M  src/main/gitlab/client-mr.test.ts
M  src/main/gitlab/client.ts
M  src/main/gitlab/issues.test.ts
M  src/main/gitlab/issues.ts
A  src/main/gitlab/merge-request-creation.test.ts
A  src/main/gitlab/merge-request-creation.ts
M  src/main/gitlab/work-item-details.ts
M  src/main/index.ts
M  src/main/ipc/gitlab.ts
M  src/main/ipc/worktree-remote.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/ipc/worktrees.ts
M  src/main/persistence.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/client-ui.ts
M  src/main/runtime/rpc/methods/gitlab.test.ts
M  src/main/runtime/rpc/methods/gitlab.ts
M  src/main/runtime/rpc/methods/worktree.test.ts
M  src/main/runtime/runtime-rpc.test.ts
M  src/main/runtime/runtime-rpc.ts
M  src/main/source-control/hosted-review-creation.test.ts
M  src/main/source-control/hosted-review-creation.ts
M  src/main/startup/single-instance-lock.test.ts
M  src/main/startup/single-instance-lock.ts
A  src/main/startup/startup-diagnostics.test.ts
A  src/main/startup/startup-diagnostics.ts
M  src/preload/api-types.ts
M  src/preload/gitlab.ts
M  src/relay/git-exec-validator.test.ts
M  src/relay/git-exec-validator.ts
M  src/renderer/src/assets/main.css
M  src/renderer/src/components/GitLabItemDialog.tsx
M  src/renderer/src/components/agent/AgentCombobox.tsx
M  src/renderer/src/components/automations/CreateFromPicker.tsx
M  src/renderer/src/components/automations/WorkspaceCombobox.tsx
A  src/renderer/src/components/gitlab/gitlab-rate-limit-display.tsx
M  src/renderer/src/components/new-workspace/SmartWorkspaceNameField.tsx
M  src/renderer/src/components/repo/RepoCombobox.tsx
M  src/renderer/src/components/right-sidebar/ChecksPanel.tsx
M  src/renderer/src/components/right-sidebar/CreatePullRequestDialog.tsx
R  src/renderer/src/components/right-sidebar/PRActions.tsx -> src/renderer/src/components/right-sidebar/HostedReviewActions.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/checks-panel-content.tsx
M  src/renderer/src/components/right-sidebar/source-control-dropdown-items.test.ts
M  src/renderer/src/components/right-sidebar/source-control-dropdown-items.ts
M  src/renderer/src/components/right-sidebar/source-control-primary-action.test.ts
M  src/renderer/src/components/right-sidebar/source-control-primary-action.ts
M  src/renderer/src/components/settings/ExperimentalPane.test.tsx
M  src/renderer/src/components/settings/ExperimentalPane.tsx
M  src/renderer/src/components/settings/GitPane.tsx
M  src/renderer/src/components/settings/experimental-search.ts
M  src/renderer/src/components/settings/git-search.ts
M  src/renderer/src/components/sidebar/CommentMarkdown.test.tsx
M  src/renderer/src/components/sidebar/CommentMarkdown.tsx
M  src/renderer/src/components/sidebar/DeleteWorktreeDialog.test.tsx
M  src/renderer/src/components/sidebar/DeleteWorktreeDialog.tsx
M  src/renderer/src/components/sidebar/SidebarWorkspaceOptionsMenu.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanCard.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanDrawer.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanDrawerHeader.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanLaneGrid.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanSettingsMenu.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanStatusLane.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.pr-display.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.quick-actions.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
M  src/renderer/src/components/sidebar/WorktreeCardAgents.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCardAgents.tsx
M  src/renderer/src/components/sidebar/delete-worktree-flow.test.ts
M  src/renderer/src/components/sidebar/delete-worktree-flow.ts
A  src/renderer/src/components/sidebar/delete-worktree-parallel-flow.test.ts
D  src/renderer/src/components/sidebar/workspace-kanban-details-hover.test.ts
D  src/renderer/src/components/sidebar/workspace-kanban-details-hover.ts
M  src/renderer/src/components/sidebar/worktree-card-compact-agents.tsx
A  src/renderer/src/components/sidebar/worktree-list-imported-rows.test.ts
M  src/renderer/src/components/sidebar/worktree-list-scroll-adjustment.test.ts
A  src/renderer/src/components/sidebar/worktree-list-sticky-headers.test.ts
M  src/renderer/src/components/sidebar/worktree-list-virtual-rows.ts
M  src/renderer/src/hooks/composer-branch-selection.test.ts
M  src/renderer/src/hooks/composer-branch-selection.ts
M  src/renderer/src/hooks/useComposerState.ts
A  src/renderer/src/lib/launch-work-item-direct.test.ts
M  src/renderer/src/lib/launch-work-item-direct.ts
M  src/renderer/src/store/slices/store-cascades.test.ts
UU src/renderer/src/store/slices/store-session-cascades.test.ts
UU src/renderer/src/store/slices/tabs.test.ts
M  src/renderer/src/store/slices/ui.test.ts
M  src/renderer/src/store/slices/ui.ts
M  src/renderer/src/store/slices/worktree-helpers.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/web/web-preload-api.test.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/composer-branch-selection.ts
M  src/shared/constants.ts
M  src/shared/gitlab-types.ts
A  src/shared/hosted-review-gitlab.test.ts
A  src/shared/hosted-review-gitlab.ts
M  src/shared/types.ts
M  src/shared/workspace-statuses.ts
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

