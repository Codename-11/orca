## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26419704781
- Upstream ref/tag: v1.4.28-rc.4
- Intended Axiom version/tag: 1.4.28-rc.4.axiom.1 / axiom-v1.4.28-rc.4.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.28-rc.4.axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/settings/IntegrationsPane.tsx`
- `src/renderer/src/components/settings/Settings.tsx`

## Captured git status
```
M  config/electron-builder.config.cjs
M  config/tsconfig.cli.json
M  electron.vite.config.ts
UU package.json
M  src/cli/args.ts
M  src/cli/dispatch.ts
A  src/cli/handlers/agent-hooks.ts
M  src/cli/index.ts
A  src/cli/specs/agent-hooks.ts
M  src/cli/specs/index.ts
A  src/main/agent-hooks/managed-agent-hook-controls.ts
M  src/main/agent-hooks/remote-hook-service-installers.test.ts
M  src/main/agent-hooks/remote-managed-hook-installers.ts
M  src/main/claude/hook-service.test.ts
M  src/main/claude/hook-service.ts
A  src/main/claude/hook-settings.ts
M  src/main/cli/packaged-cli-assets.test.ts
M  src/main/codex-accounts/runtime-home-service.test.ts
M  src/main/codex-accounts/service.test.ts
M  src/main/codex/config-toml-trust.ts
M  src/main/codex/hook-service.test.ts
M  src/main/codex/hook-service.ts
M  src/main/crash-reporting/process-gone-classification.test.ts
M  src/main/crash-reporting/process-gone-classification.ts
A  src/main/file-explorer-rename-collision.ts
M  src/main/index.ts
M  src/main/ipc/agent-hooks.ts
A  src/main/ipc/app.test.ts
M  src/main/ipc/app.ts
M  src/main/ipc/filesystem-mutations.test.ts
M  src/main/ipc/filesystem-mutations.ts
M  src/main/ipc/pty.test.ts
M  src/main/ipc/pty.ts
M  src/main/ipc/register-core-handlers.test.ts
M  src/main/ipc/register-core-handlers.ts
M  src/main/ipc/settings.ts
M  src/main/runtime/orca-runtime-files.test.ts
M  src/main/runtime/orca-runtime-files.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/client-ui.ts
M  src/main/ssh/ssh-relay-session.ts
M  src/renderer/src/assets/main.css
M  src/renderer/src/components/Terminal.tsx
M  src/renderer/src/components/WorktreeJumpPalette.tsx
A  src/renderer/src/components/cmd-j/palette-results.test.ts
A  src/renderer/src/components/cmd-j/palette-results.ts
A  src/renderer/src/components/cmd-j/quick-action-context.test.ts
A  src/renderer/src/components/cmd-j/quick-action-context.ts
A  src/renderer/src/components/cmd-j/quick-actions.ts
M  src/renderer/src/components/dashboard/DashboardAgentRow.test.tsx
M  src/renderer/src/components/dashboard/DashboardAgentRow.tsx
M  src/renderer/src/components/feature-wall/FeatureWallTourPanel.tsx
M  src/renderer/src/components/feature-wall/FeatureWallTourSurface.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalWindowControls.tsx
M  src/renderer/src/components/onboarding/NotificationStep.test.tsx
M  src/renderer/src/components/onboarding/NotificationStep.tsx
A  src/renderer/src/components/onboarding/OnboardingFlow.test.tsx
M  src/renderer/src/components/onboarding/OnboardingFlow.tsx
M  src/renderer/src/components/onboarding/OnboardingTourStep.tsx
M  src/renderer/src/components/onboarding/onboarding-folder-agent-startup.test.ts
M  src/renderer/src/components/onboarding/use-onboarding-flow.ts
M  src/renderer/src/components/settings/AgentsPane.test.tsx
M  src/renderer/src/components/settings/AgentsPane.tsx
M  src/renderer/src/components/settings/AppearancePane.tsx
M  src/renderer/src/components/settings/BrowserPane.tsx
M  src/renderer/src/components/settings/ComputerUsePane.tsx
M  src/renderer/src/components/settings/DeveloperPermissionsPane.tsx
M  src/renderer/src/components/settings/GeneralPane.tsx
M  src/renderer/src/components/settings/InputPane.tsx
UU src/renderer/src/components/settings/IntegrationsPane.tsx
M  src/renderer/src/components/settings/MobilePane.tsx
M  src/renderer/src/components/settings/MobileSettingsPane.tsx
M  src/renderer/src/components/settings/NotificationsPane.tsx
A  src/renderer/src/components/settings/QuickCommandsPane.test.ts
M  src/renderer/src/components/settings/QuickCommandsPane.tsx
A  src/renderer/src/components/settings/RecentTabOrderControl.tsx
M  src/renderer/src/components/settings/RepositoryPane.tsx
UU src/renderer/src/components/settings/Settings.tsx
M  src/renderer/src/components/settings/SettingsSection.tsx
M  src/renderer/src/components/settings/ShortcutBindingRow.tsx
A  src/renderer/src/components/settings/ShortcutFilterRail.tsx
A  src/renderer/src/components/settings/ShortcutRowsList.tsx
A  src/renderer/src/components/settings/ShortcutTerminalPolicyControl.tsx
M  src/renderer/src/components/settings/ShortcutsPane.tsx
M  src/renderer/src/components/settings/SshPane.tsx
A  src/renderer/src/components/settings/agent-status-hooks-copy.ts
M  src/renderer/src/components/settings/agents-search.ts
A  src/renderer/src/components/settings/appearance-search.ts
A  src/renderer/src/components/settings/browser-pane-search.ts
A  src/renderer/src/components/settings/computer-use-search.ts
A  src/renderer/src/components/settings/developer-permissions-search.ts
M  src/renderer/src/components/settings/general-search.ts
A  src/renderer/src/components/settings/input-search.ts
A  src/renderer/src/components/settings/integrations-search.ts
A  src/renderer/src/components/settings/mobile-pane-search.ts
A  src/renderer/src/components/settings/mobile-settings-search.ts
A  src/renderer/src/components/settings/notifications-search.ts
A  src/renderer/src/components/settings/repository-search.ts
A  src/renderer/src/components/settings/shortcuts-search.ts
A  src/renderer/src/components/settings/ssh-search.ts
M  src/renderer/src/components/sidebar/AddRepoDialog.tsx
M  src/renderer/src/components/sidebar/AddRepoSetupStep.test.ts
M  src/renderer/src/components/sidebar/AddRepoSetupStep.tsx
M  src/renderer/src/components/sidebar/ProjectAddedDialog.test.tsx
M  src/renderer/src/components/sidebar/ProjectAddedDialog.tsx
M  src/renderer/src/components/sidebar/SidebarWorkspaceOptionsMenu.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
M  src/renderer/src/components/sidebar/WorktreeList.tsx
M  src/renderer/src/components/stats/StatsPane.tsx
A  src/renderer/src/components/stats/stats-search.ts
M  src/renderer/src/components/tab-bar/TabBarQuickCommandsButton.tsx
M  src/renderer/src/components/tab-group/TabGroupPanel.tsx
M  src/renderer/src/components/tab-group/useTabGroupWorkspaceModel.ts
M  src/renderer/src/components/terminal-pane/pty-connection-types.ts
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
M  src/renderer/src/components/terminal-pane/terminal-quick-command-dispatch.test.ts
M  src/renderer/src/components/terminal-pane/terminal-quick-command-dispatch.ts
M  src/renderer/src/components/terminal-quick-commands/TerminalQuickCommandDialog.tsx
A  src/renderer/src/components/terminal-quick-commands/terminal-agent-quick-command-presets.test.ts
A  src/renderer/src/components/terminal-quick-commands/terminal-agent-quick-command-presets.ts
M  src/renderer/src/hooks/useComposerState.ts
A  src/renderer/src/hooks/useSettingsNavigationMetadata.test.ts
A  src/renderer/src/hooks/useSettingsNavigationMetadata.ts
M  src/renderer/src/lib/launch-agent-background-session.test.ts
M  src/renderer/src/lib/launch-agent-background-session.ts
M  src/renderer/src/lib/launch-agent-in-new-tab.ts
M  src/renderer/src/lib/launch-work-item-direct.ts
M  src/renderer/src/lib/onboarding-folder-agent-startup.ts
A  src/renderer/src/lib/run-quick-command-in-new-tab.test.ts
M  src/renderer/src/lib/run-quick-command-in-new-tab.ts
A  src/renderer/src/lib/settings-navigation-types.ts
M  src/renderer/src/lib/worktree-activation-created-agent.test.ts
M  src/renderer/src/lib/worktree-activation.ts
M  src/renderer/src/store/slices/browser.ts
A  src/renderer/src/store/slices/cmd-j-create-actions.test.ts
M  src/renderer/src/store/slices/editor.ts
M  src/renderer/src/store/slices/repos-onboarding-folder-startup.test.ts
M  src/renderer/src/store/slices/terminals.ts
M  src/renderer/src/store/slices/ui.ts
A  src/shared/claude-settings.ts
A  src/shared/codex-profile.ts
M  src/shared/constants.ts
M  src/shared/keybindings.ts
M  src/shared/telemetry-events.ts
M  src/shared/tui-agent-startup.test.ts
M  src/shared/tui-agent-startup.ts
M  src/shared/types.ts
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

