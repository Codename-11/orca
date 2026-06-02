## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26807618110
- Upstream ref/tag: v1.4.41
- Intended Axiom version/tag: 1.4.41-axiom.1 / axiom-v1.4.41-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.41-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/sidebar/SidebarNav.test.tsx`

## Captured git status
```
M  .github/CONTRIBUTING.md
M  .oxlintrc.json
D  DEVELOPING.md
M  README.md
M  config/patches/@xterm__addon-webgl@0.20.0-beta.219.patch
A  docs/linear-issues-load-more.md
M  docs/readme/README.es.md
M  docs/readme/README.ja.md
M  docs/readme/README.ko.md
M  docs/readme/README.zh-CN.md
M  docs/reference/README.md
M  docs/reference/feature-discovery-interaction-tracking.md
A  docs/reference/feature-education-retention-analytics.md
A  docs/reference/feature-education-state.md
A  docs/reference/new-user-parallel-work-telemetry.md
M  docs/reference/telemetry-availability.md
UU package.json
M  pnpm-lock.yaml
M  src/main/codex-accounts/runtime-home-service.test.ts
M  src/main/daemon/daemon-init.test.ts
M  src/main/daemon/daemon-init.ts
M  src/main/daemon/pty-subprocess.test.ts
M  src/main/daemon/pty-subprocess.ts
M  src/main/git/remove-worktree.test.ts
M  src/main/git/worktree.ts
M  src/main/github/client.test.ts
M  src/main/github/conflict-summary.ts
M  src/main/index.ts
M  src/main/ipc/linear.ts
M  src/main/ipc/preflight.test.ts
M  src/main/ipc/preflight.ts
M  src/main/ipc/pty.test.ts
M  src/main/ipc/pty.ts
M  src/main/linear/issues.test.ts
M  src/main/linear/issues.ts
A  src/main/linear/projects.test.ts
M  src/main/linear/projects.ts
M  src/main/menu/register-app-menu.test.ts
M  src/main/menu/register-app-menu.ts
M  src/main/persistence.test.ts
M  src/main/persistence.ts
A  src/main/runtime/orca-runtime-files-watch.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/dispatcher-feature-interactions.test.ts
M  src/main/runtime/rpc/dispatcher.ts
M  src/main/runtime/rpc/methods/client-ui.test.ts
M  src/main/runtime/rpc/methods/client-ui.ts
M  src/main/runtime/rpc/methods/computer.test.ts
M  src/main/runtime/rpc/methods/computer.ts
M  src/main/runtime/rpc/methods/index.ts
M  src/main/runtime/rpc/methods/linear.test.ts
M  src/main/runtime/rpc/methods/linear.ts
A  src/main/runtime/rpc/methods/skills.ts
M  src/main/runtime/rpc/methods/terminal.ts
M  src/main/runtime/rpc/schemas.test.ts
M  src/main/startup/configure-process.test.ts
M  src/main/startup/configure-process.ts
M  src/main/window/attach-main-window-services.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/relay/git-handler-branch-cleanup.test.ts
M  src/relay/git-handler-branch-cleanup.ts
M  src/relay/preflight-handler.ts
M  src/renderer/src/App.tsx
M  src/renderer/src/assets/main.css
M  src/renderer/src/components/GitHubItemDialog.tsx
M  src/renderer/src/components/NewWorkspaceComposerCard.tsx
M  src/renderer/src/components/NewWorkspaceComposerModal.tsx
M  src/renderer/src/components/PullRequestPage.tsx
M  src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/Terminal.tsx
M  src/renderer/src/components/automations/AutomationsPage.tsx
M  src/renderer/src/components/browser-pane/BrowserPane.tsx
M  src/renderer/src/components/confirmation-dialog.tsx
A  src/renderer/src/components/contextual-tours/ContextualTourArrow.tsx
A  src/renderer/src/components/contextual-tours/ContextualTourControl.test.ts
A  src/renderer/src/components/contextual-tours/ContextualTourControl.tsx
A  src/renderer/src/components/contextual-tours/ContextualTourOverlay.test.tsx
A  src/renderer/src/components/contextual-tours/ContextualTourOverlay.tsx
A  src/renderer/src/components/contextual-tours/ContextualTourOverlaySurface.tsx
A  src/renderer/src/components/contextual-tours/ContextualTourProgressDots.tsx
A  src/renderer/src/components/contextual-tours/contextual-tour-composer-events.ts
A  src/renderer/src/components/contextual-tours/contextual-tour-gate.test.ts
A  src/renderer/src/components/contextual-tours/contextual-tour-gate.ts
A  src/renderer/src/components/contextual-tours/contextual-tour-overlay-position.ts
A  src/renderer/src/components/contextual-tours/contextual-tour-panel-position.test.ts
A  src/renderer/src/components/contextual-tours/contextual-tour-panel-position.ts
A  src/renderer/src/components/contextual-tours/contextual-tour-step-actions.test.ts
A  src/renderer/src/components/contextual-tours/contextual-tour-step-actions.ts
A  src/renderer/src/components/contextual-tours/request-contextual-tour-when-ready.test.ts
A  src/renderer/src/components/contextual-tours/request-contextual-tour-when-ready.ts
A  src/renderer/src/components/contextual-tours/use-contextual-tour.test.ts
A  src/renderer/src/components/contextual-tours/use-contextual-tour.ts
A  src/renderer/src/components/contextual-tours/workspace-creation-tour-handoff.test.ts
A  src/renderer/src/components/contextual-tours/workspace-creation-tour-handoff.ts
M  src/renderer/src/components/diff-comments/DiffCommentPopover.tsx
M  src/renderer/src/components/editor/EditorContent.tsx
M  src/renderer/src/components/editor/MarkdownPreview.tsx
M  src/renderer/src/components/editor/ReviewNotesSendMenuContent.tsx
M  src/renderer/src/components/feature-tips/CliFeatureTipVisual.tsx
M  src/renderer/src/components/feature-tips/FeatureTipsModal.tsx
A  src/renderer/src/components/feature-wall/AddReposAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/AgentCapabilitiesSetupAction.test.ts
A  src/renderer/src/components/feature-wall/AgentCapabilitiesSetupAction.tsx
M  src/renderer/src/components/feature-wall/AgentsOrchestrationVisual.tsx
M  src/renderer/src/components/feature-wall/BrowserAnimatedVisual.tsx
M  src/renderer/src/components/feature-wall/BrowserUseSkillSetupCard.tsx
A  src/renderer/src/components/feature-wall/ComputerUseAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/FeatureWallSetupChecklist.tsx
A  src/renderer/src/components/feature-wall/FeatureWallSetupStepVisuals.tsx
A  src/renderer/src/components/feature-wall/FeatureWallSetupWorkflowActions.test.tsx
A  src/renderer/src/components/feature-wall/FeatureWallSetupWorkflowActions.tsx
A  src/renderer/src/components/feature-wall/SetupScriptAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/SetupStepPreview.tsx
M  src/renderer/src/components/feature-wall/TasksAnimatedVisual.tsx
M  src/renderer/src/components/feature-wall/WorkbenchAnimatedVisual.tsx
A  src/renderer/src/components/feature-wall/agent-capability-setup-status.ts
M  src/renderer/src/components/feature-wall/agents-orchestration/OrchestrationPage.tsx
M  src/renderer/src/components/feature-wall/feature-tour-preview-glyphs.tsx
A  src/renderer/src/components/feature-wall/feature-wall-setup-progress.test.ts
A  src/renderer/src/components/feature-wall/feature-wall-setup-progress.ts
M  src/renderer/src/components/feature-wall/use-feature-wall-task-source-presentation.ts
M  src/renderer/src/components/icons/JiraIcon.tsx
M  src/renderer/src/components/linear-project-view-surfaces.tsx
M  src/renderer/src/components/mobile/MobilePage.tsx
M  src/renderer/src/components/new-workspace/SmartWorkspaceNameField.tsx
M  src/renderer/src/components/onboarding/FeatureSetupInlineTerminal.tsx
M  src/renderer/src/components/onboarding/OnboardingFlow.test.tsx
M  src/renderer/src/components/onboarding/OnboardingFlow.tsx
M  src/renderer/src/components/onboarding/OnboardingInlineCommandTerminal.tsx
M  src/renderer/src/components/onboarding/RepoStep.test.tsx
M  src/renderer/src/components/onboarding/RepoStep.tsx
M  src/renderer/src/components/onboarding/use-onboarding-flow-persistence.ts
M  src/renderer/src/components/onboarding/use-onboarding-flow-types.ts
M  src/renderer/src/components/onboarding/use-onboarding-flow.test.ts
M  src/renderer/src/components/onboarding/use-onboarding-flow.ts
M  src/renderer/src/components/right-sidebar/ChecksPanel.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.commit-drafts.test.ts
A  src/renderer/src/components/right-sidebar/SourceControl.compare-summary.test.ts
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/checks-panel-content.test.tsx
M  src/renderer/src/components/right-sidebar/checks-panel-content.tsx
M  src/renderer/src/components/right-sidebar/right-panel-comment-composer.tsx
M  src/renderer/src/components/settings/AccountsPane.tsx
M  src/renderer/src/components/settings/AgentLocationSetting.tsx
M  src/renderer/src/components/settings/AgentsPane.tsx
M  src/renderer/src/components/settings/MobileSettingsPane.tsx
M  src/renderer/src/components/settings/OrchestrationSetupCard.tsx
M  src/renderer/src/components/settings/Settings.tsx
A  src/renderer/src/components/settings/SettingsSetupGuideCard.tsx
M  src/renderer/src/components/settings/TerminalPane.tsx
A  src/renderer/src/components/setup-guide/SetupGuideModal.tsx
A  src/renderer/src/components/setup-guide/SetupGuideProgressRing.tsx
A  src/renderer/src/components/setup-guide/SetupGuideTelemetryObserver.tsx
A  src/renderer/src/components/setup-guide/use-setup-guide-progress.test.ts
A  src/renderer/src/components/setup-guide/use-setup-guide-progress.ts
A  src/renderer/src/components/setup-guide/use-setup-guide-telemetry.test.ts
A  src/renderer/src/components/setup-guide/use-setup-guide-telemetry.ts
M  src/renderer/src/components/sidebar/ProjectAddedDialog.test.tsx
M  src/renderer/src/components/sidebar/ProjectAddedDialog.tsx
A  src/renderer/src/components/sidebar/SetupGuideSidebarEntry.tsx
M  src/renderer/src/components/sidebar/SetupScriptPromptCard.tsx
M  src/renderer/src/components/sidebar/SetupScriptPromptCardViews.tsx
UU src/renderer/src/components/sidebar/SidebarNav.test.tsx
M  src/renderer/src/components/sidebar/SidebarNav.tsx
M  src/renderer/src/components/sidebar/SidebarToolbar.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanDrawer.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanLaneGrid.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanSettingsMenu.tsx
M  src/renderer/src/components/sidebar/WorkspaceKanbanStatusLane.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.quick-actions.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
M  src/renderer/src/components/sidebar/WorktreeCardAgents.test.tsx
M  src/renderer/src/components/sidebar/WorktreeContextMenu.tsx
M  src/renderer/src/components/sidebar/WorktreeList.tsx
M  src/renderer/src/components/sidebar/use-workspace-kanban-outside-dismiss.test.ts
M  src/renderer/src/components/sidebar/use-workspace-kanban-outside-dismiss.ts
M  src/renderer/src/components/sidebar/worktree-card-compact-agents.tsx
M  src/renderer/src/components/tab-bar/TabBarCreateEntry.tsx
M  src/renderer/src/components/tab-group/TabGroupPanel.tsx
M  src/renderer/src/components/task-page-cache-selectors.test.ts
M  src/renderer/src/components/task-page-cache-selectors.ts
M  src/renderer/src/components/terminal-pane/TerminalErrorToast.test.ts
M  src/renderer/src/components/terminal-pane/TerminalErrorToast.tsx
M  src/renderer/src/components/terminal-pane/TerminalPane.tsx
M  src/renderer/src/components/terminal-pane/keyboard-handlers.ts
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-context-menu.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts
M  src/renderer/src/components/terminal-quick-commands/TerminalQuickCommandDialog.tsx
M  src/renderer/src/components/ui/toggle-group.tsx
M  src/renderer/src/constants/terminal.ts
M  src/renderer/src/hooks/useComposerState.ts
M  src/renderer/src/hooks/useIpcEvents.test.ts
M  src/renderer/src/hooks/useIpcEvents.ts
M  src/renderer/src/lazy-modal-mount-state.ts
M  src/renderer/src/lib/active-agent-note-send.test.ts
M  src/renderer/src/lib/active-agent-note-send.ts
M  src/renderer/src/lib/agent-catalog.tsx
M  src/renderer/src/lib/agent-picker-search.test.ts
A  src/renderer/src/lib/feature-education-telemetry.test.ts
A  src/renderer/src/lib/feature-education-telemetry.ts
A  src/renderer/src/lib/setup-script-status.ts
M  src/renderer/src/runtime/runtime-linear-client.test.ts
M  src/renderer/src/runtime/runtime-linear-client.ts
M  src/renderer/src/runtime/web-runtime-session.test.ts
M  src/renderer/src/runtime/web-runtime-session.ts
M  src/renderer/src/store/slices/linear-invalidation.test.ts
M  src/renderer/src/store/slices/linear.test.ts
M  src/renderer/src/store/slices/linear.ts
M  src/renderer/src/store/slices/settings.ts
M  src/renderer/src/store/slices/tabs.test.ts
M  src/renderer/src/store/slices/tabs.ts
M  src/renderer/src/store/slices/ui.test.ts
M  src/renderer/src/store/slices/ui.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/web/web-preload-api.test.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/agent-process-recognition.test.ts
M  src/shared/agent-process-recognition.ts
M  src/shared/constants.ts
A  src/shared/contextual-tours.test.ts
A  src/shared/contextual-tours.ts
A  src/shared/feature-education-telemetry.test.ts
A  src/shared/feature-education-telemetry.ts
M  src/shared/feature-interactions.test.ts
M  src/shared/feature-interactions.ts
A  src/shared/feature-wall-setup-steps.ts
A  src/shared/git-branch-cleanup.test.ts
M  src/shared/git-branch-cleanup.ts
M  src/shared/keybindings.test.ts
M  src/shared/keybindings.ts
A  src/shared/linear-issue-list-limits.ts
M  src/shared/onboarding-tour-telemetry-events.test.ts
A  src/shared/telemetry-events-feature-education.test.ts
M  src/shared/telemetry-events.ts
M  src/shared/tui-agent-config.ts
M  src/shared/tui-agent-startup.test.ts
M  src/shared/types.ts
M  tests/e2e/helpers/e2e-completed-onboarding-profile.ts
M  tests/e2e/onboarding.spec.ts
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

