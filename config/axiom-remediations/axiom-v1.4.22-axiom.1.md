## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26328359580
- Upstream ref/tag: v1.4.22
- Intended Axiom version/tag: 1.4.22-axiom.1 / axiom-v1.4.22-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.22-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/settings/GeneralPane.tsx`
- `src/renderer/src/components/sidebar/SidebarNav.test.tsx`
- `src/renderer/src/components/sidebar/SidebarNav.tsx`
- `src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts`

## Captured git status
```
M  README.md
M  docs/STYLEGUIDE.md
M  mobile/app/h/[hostId]/index.tsx
M  mobile/src/storage/preferences.ts
UU package.json
A  resources/notification-sounds/beep.mp3
A  resources/notification-sounds/blip.mp3
A  resources/notification-sounds/blop.mp3
A  resources/notification-sounds/bong.mp3
A  resources/notification-sounds/clack.mp3
A  resources/notification-sounds/ding.mp3
A  resources/notification-sounds/sonar.mp3
A  resources/notification-sounds/thump.mp3
A  resources/notification-sounds/two-tone.mp3
M  skills/orchestration/SKILL.md
M  src/main/agent-hooks/server.test.ts
M  src/main/agent-hooks/server.ts
M  src/main/codex-accounts/runtime-home-service.test.ts
M  src/main/codex-accounts/service.test.ts
M  src/main/index.ts
M  src/main/ipc/notifications.ts
M  src/main/ipc/repos-remote.test.ts
M  src/main/ipc/repos.ts
M  src/main/ipc/settings.ts
M  src/main/ipc/worktree-remote.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/ipc/worktrees.ts
M  src/main/menu/register-app-menu.test.ts
M  src/main/menu/register-app-menu.ts
M  src/main/persistence.test.ts
M  src/main/persistence.ts
M  src/main/providers/ssh-git-provider.test.ts
M  src/main/providers/ssh-git-provider.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/repo.ts
M  src/main/runtime/rpc/methods/worktree-schemas.ts
M  src/main/runtime/rpc/methods/worktree.ts
M  src/main/source-control/hosted-review-creation.test.ts
M  src/main/source-control/hosted-review-creation.ts
A  src/main/ssh/ssh-config-include-expander.ts
A  src/main/ssh/ssh-config-loader-regression.test.ts
A  src/main/ssh/ssh-config-loader.test.ts
A  src/main/ssh/ssh-config-parser-host-patterns.test.ts
M  src/main/ssh/ssh-config-parser.test.ts
M  src/main/ssh/ssh-config-parser.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/relay/agent-hook-integration.test.ts
M  src/relay/agent-hook-server.ts
M  src/renderer/src/assets/main.css
M  src/renderer/src/assets/mobile-page.css
M  src/renderer/src/assets/terminal.css
M  src/renderer/src/components/ShortcutKeyCombo.tsx
M  src/renderer/src/components/Terminal.tsx
M  src/renderer/src/components/dashboard/DashboardAgentRow.test.tsx
M  src/renderer/src/components/dashboard/DashboardAgentRow.tsx
A  src/renderer/src/components/dashboard/agent-row-lineage.ts
M  src/renderer/src/components/dashboard/useDashboardData.ts
M  src/renderer/src/components/editor/EditorContent.tsx
M  src/renderer/src/components/editor/EditorPanel.tsx
M  src/renderer/src/components/editor/EditorPanelShell.tsx
M  src/renderer/src/components/editor/MonacoEditor.tsx
A  src/renderer/src/components/editor/monaco-markdown-selection-annotation.test.ts
A  src/renderer/src/components/editor/monaco-markdown-selection-annotation.ts
M  src/renderer/src/components/github/github-rate-limit-display.tsx
M  src/renderer/src/components/mobile/MobileHero.tsx
M  src/renderer/src/components/mobile/MobilePage.tsx
M  src/renderer/src/components/mobile/slides/TerminalSlide.tsx
M  src/renderer/src/components/mobile/slides/WorktreeListSlide.tsx
A  src/renderer/src/components/onboarding/AgentFeatureSetupStep.test.tsx
A  src/renderer/src/components/onboarding/AgentFeatureSetupStep.tsx
A  src/renderer/src/components/onboarding/AgentStep.test.tsx
M  src/renderer/src/components/onboarding/AgentStep.tsx
M  src/renderer/src/components/onboarding/FeatureSetupChecklist.tsx
M  src/renderer/src/components/onboarding/NotificationStep.test.tsx
M  src/renderer/src/components/onboarding/NotificationStep.tsx
M  src/renderer/src/components/onboarding/OnboardingFlow.tsx
A  src/renderer/src/components/onboarding/ThemeStep.test.ts
M  src/renderer/src/components/onboarding/ThemeStep.tsx
M  src/renderer/src/components/onboarding/use-onboarding-flow-persistence.ts
M  src/renderer/src/components/onboarding/use-onboarding-flow-types.ts
M  src/renderer/src/components/onboarding/use-onboarding-flow.ts
M  src/renderer/src/components/right-sidebar/ChecksPanel.tsx
M  src/renderer/src/components/right-sidebar/CreatePullRequestDialog.tsx
A  src/renderer/src/components/right-sidebar/SourceControl.resolve-conflicts-prompt.test.ts
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/useCreatePullRequestDialogFields.ts
M  src/renderer/src/components/settings/AccountsPane.tsx
M  src/renderer/src/components/settings/AgentAwakeSetting.tsx
M  src/renderer/src/components/settings/AgentsPane.tsx
M  src/renderer/src/components/settings/AppearancePane.tsx
M  src/renderer/src/components/settings/BrowserPane.tsx
M  src/renderer/src/components/settings/BrowserUsePane.tsx
M  src/renderer/src/components/settings/CommitMessageAiPane.tsx
M  src/renderer/src/components/settings/ExperimentalPane.tsx
M  src/renderer/src/components/settings/FloatingWorkspacePane.tsx
UU src/renderer/src/components/settings/GeneralPane.tsx
M  src/renderer/src/components/settings/GitPane.tsx
M  src/renderer/src/components/settings/InputPane.tsx
M  src/renderer/src/components/settings/MobileSettingsPane.tsx
M  src/renderer/src/components/settings/NotificationsPane.test.tsx
M  src/renderer/src/components/settings/NotificationsPane.tsx
M  src/renderer/src/components/settings/OrchestrationPane.tsx
M  src/renderer/src/components/settings/PrivacyDiagnosticsSection.tsx
M  src/renderer/src/components/settings/PrivacyPane.tsx
M  src/renderer/src/components/settings/QuickCommandsPane.tsx
M  src/renderer/src/components/settings/RuntimeEnvironmentsPane.tsx
M  src/renderer/src/components/settings/SearchableSetting.tsx
M  src/renderer/src/components/settings/Settings.tsx
M  src/renderer/src/components/settings/SettingsFormControls.tsx
M  src/renderer/src/components/settings/SettingsSection.tsx
M  src/renderer/src/components/settings/SettingsSidebar.tsx
A  src/renderer/src/components/settings/SettingsToggleSwitchButton.tsx
M  src/renderer/src/components/settings/ShortcutsPane.tsx
M  src/renderer/src/components/settings/TasksPane.tsx
M  src/renderer/src/components/settings/TerminalPane.tsx
M  src/renderer/src/components/settings/TerminalThemeSections.tsx
M  src/renderer/src/components/settings/TerminalWindowSection.tsx
M  src/renderer/src/components/settings/VoicePane.tsx
M  src/renderer/src/components/sidebar/AddRepoCreateStep.tsx
M  src/renderer/src/components/sidebar/AddRepoDialog.tsx
A  src/renderer/src/components/sidebar/AddRepoSetupStep.test.ts
M  src/renderer/src/components/sidebar/AddRepoSetupStep.tsx
A  src/renderer/src/components/sidebar/ProjectAddedDialog.test.tsx
A  src/renderer/src/components/sidebar/ProjectAddedDialog.tsx
M  src/renderer/src/components/sidebar/SetupScriptPromptCard.tsx
UU src/renderer/src/components/sidebar/SidebarNav.test.tsx
UU src/renderer/src/components/sidebar/SidebarNav.tsx
M  src/renderer/src/components/sidebar/SidebarToolbar.tsx
M  src/renderer/src/components/sidebar/WorktreeCardAgents.tsx
M  src/renderer/src/components/sidebar/WorktreeList.tsx
A  src/renderer/src/components/sidebar/WorktreeVisibilityDialog.tsx
M  src/renderer/src/components/sidebar/index.tsx
A  src/renderer/src/components/sidebar/mobile-sidebar-onboarding-badge.test.ts
M  src/renderer/src/components/sidebar/mobile-sidebar-onboarding-badge.ts
M  src/renderer/src/components/sidebar/useWorktreeAgentRows.test.ts
M  src/renderer/src/components/sidebar/useWorktreeAgentRows.ts
M  src/renderer/src/components/terminal-pane/TerminalContextMenu.tsx
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
M  src/renderer/src/components/terminal-pane/pty-dispatcher-pi-routing.test.ts
M  src/renderer/src/components/terminal-pane/pty-transport-pi-coalesce.test.ts
M  src/renderer/src/components/terminal-pane/pty-transport-pi-spinner.test.ts
M  src/renderer/src/components/terminal-pane/pty-transport.test.ts
M  src/renderer/src/components/terminal-pane/pty-transport.ts
M  src/renderer/src/components/terminal-pane/use-notification-dispatch.ts
UU src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts
M  src/renderer/src/components/ui/button.tsx
A  src/renderer/src/components/ui/collapsible.tsx
M  src/renderer/src/components/ui/dropdown-menu.tsx
M  src/renderer/src/components/ui/label.tsx
M  src/renderer/src/hooks/useGlobalFileDrop.ts
M  src/renderer/src/hooks/useIpcEvents.ts
M  src/renderer/src/hooks/useShortcutLabel.ts
M  src/renderer/src/lib/desktop-notification-sound.ts
A  src/renderer/src/lib/pane-manager/pane-terminal-cursor-suppression.ts
A  src/renderer/src/lib/pane-manager/pane-terminal-foreground-render-settle.ts
M  src/renderer/src/lib/pane-manager/pane-terminal-output-scheduler.test.ts
M  src/renderer/src/lib/pane-manager/pane-terminal-output-scheduler.ts
A  src/renderer/src/lib/pane-manager/windows-pty-compatibility.test.ts
A  src/renderer/src/lib/pane-manager/windows-pty-compatibility.ts
M  src/renderer/src/lib/startup-ui-hydration.test.ts
M  src/renderer/src/lib/startup-ui-hydration.ts
M  src/renderer/src/lib/worktree-activation.ts
M  src/renderer/src/store/selectors.ts
M  src/renderer/src/store/slices/agent-status.ts
M  src/renderer/src/store/slices/repos.test.ts
M  src/renderer/src/store/slices/repos.ts
M  src/renderer/src/store/slices/settings.test.ts
M  src/renderer/src/store/slices/settings.ts
M  src/renderer/src/store/slices/ui.ts
M  src/renderer/src/store/slices/worktree-helpers.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/web/web-preload-api.test.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/agent-hook-listener.test.ts
M  src/shared/agent-hook-listener.ts
M  src/shared/agent-hook-relay.ts
M  src/shared/agent-status-types.ts
M  src/shared/constants.ts
M  src/shared/telemetry-events.ts
M  src/shared/types.ts
A  src/shared/worktree-ownership.test.ts
A  src/shared/worktree-ownership.ts
M  tests/e2e/helpers/source-control-ai-generation.ts
M  tests/e2e/onboarding.spec.ts
M  tests/e2e/source-control-create-pr.spec.ts
A  tests/e2e/terminal-codex-lag-stress.spec.ts
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

