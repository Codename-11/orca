## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/27922819519
- Upstream ref/tag: v1.4.90
- Intended Axiom version/tag: 1.4.90-axiom.1 / axiom-v1.4.90-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.90-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/main/updater-events.ts`
- `src/renderer/src/components/terminal-pane/pty-connection.ts`
- `src/renderer/src/components/terminal-pane/pty-dispatcher.ts`
- `src/renderer/src/lib/launch-agent-background-session.ts`

## Captured git status
```
M  .github/workflows/mobile-ios-release.yml
A  config/scripts/orca-linear-skill-guidance.test.mjs
M  config/scripts/package-electron-runtime-contract.test.mjs
A  docs/browser-normal-download-behavior.md
A  docs/claude-usage-tracking-codexbar-parity.md
M  mobile/app/h/[hostId]/index.tsx
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
M  mobile/fastlane/Fastfile
M  mobile/package.json
M  mobile/scripts/mobile-lag-scenario.ts
A  mobile/scripts/start-emulator.mjs
M  mobile/src/browser/MobileBrowserPane.tsx
A  mobile/src/browser/MobileBrowserToolbarIconButton.tsx
A  mobile/src/browser/MobileBrowserViewModeSwitch.tsx
M  mobile/src/browser/browser-screencast-request.test.ts
M  mobile/src/browser/browser-screencast-request.ts
A  mobile/src/browser/mobile-browser-view-mode-state.test.ts
A  mobile/src/browser/mobile-browser-view-mode-state.ts
M  mobile/src/components/MobilePrComposeSheet.tsx
M  mobile/src/components/pr-sidebar/MobilePrComposeForm.tsx
M  mobile/src/components/pr-sidebar/PRConflictingFilesSection.tsx
M  mobile/src/components/pr-sidebar/PrSidebarCreateEmptyState.tsx
M  mobile/src/components/pr-sidebar/pr-conflict-presentation.test.ts
M  mobile/src/components/pr-sidebar/pr-conflict-presentation.ts
M  mobile/src/components/pr-sidebar/pr-conflict-styles.ts
A  mobile/src/session/use-live-worktree-name.ts
A  mobile/src/session/worktree-display-name.test.ts
A  mobile/src/session/worktree-display-name.ts
M  mobile/src/source-control/MobileSourceControlModals.tsx
A  mobile/src/source-control/mobile-branch-base-ref.test.ts
M  mobile/src/source-control/mobile-branch-base-ref.ts
M  mobile/src/source-control/mobile-pr-create.test.ts
M  mobile/src/source-control/mobile-pr-create.ts
M  mobile/src/source-control/mobile-pr-link.test.ts
M  mobile/src/source-control/mobile-pr-link.ts
M  mobile/src/source-control/use-mobile-source-control-state.ts
M  mobile/src/worktree/host-worktree-rpc-types.ts
A  mobile/src/worktree/use-workspace-sections.test.ts
A  mobile/src/worktree/use-workspace-sections.ts
A  mobile/src/worktree/workspace-list-sections.test.ts
M  mobile/src/worktree/workspace-list-sections.ts
M  mobile/src/worktree/workspace-view-settings.test.ts
M  mobile/src/worktree/workspace-view-settings.ts
M  mobile/src/worktree/worktree-list-snapshot.test.ts
M  mobile/src/worktree/worktree-list-snapshot.ts
UU package.json
M  skills/linear-tickets/SKILL.md
A  skills/orca-linear/SKILL.md
M  src/main/agent-hooks/installer-utils.ts
M  src/main/agent-hooks/server.ts
A  src/main/ai-vault/session-scanner-droid-kimi-sources.ts
A  src/main/ai-vault/session-scanner-source-discovery.ts
M  src/main/ai-vault/session-scanner-types.ts
M  src/main/ai-vault/session-scanner.test.ts
M  src/main/ai-vault/session-scanner.ts
M  src/main/amp/hook-service.ts
M  src/main/antigravity/hook-service.ts
A  src/main/browser/browser-download-destination.test.ts
A  src/main/browser/browser-download-destination.ts
M  src/main/browser/browser-manager.test.ts
M  src/main/browser/browser-manager.ts
M  src/main/claude/hook-service.ts
M  src/main/codex/hook-service.ts
M  src/main/command-code/hook-service.test.ts
M  src/main/command-code/hook-service.ts
M  src/main/copilot/hook-service.ts
M  src/main/cursor/hook-service.ts
M  src/main/daemon/pty-subprocess.ts
M  src/main/devin/hook-service.ts
M  src/main/droid/hook-service.ts
M  src/main/gemini/hook-service.ts
M  src/main/github/client.test.ts
M  src/main/github/client.ts
M  src/main/github/conflict-summary.ts
M  src/main/grok/hook-service.ts
M  src/main/hermes/hook-service.ts
M  src/main/index.ts
M  src/main/ipc/ai-vault.ts
M  src/main/ipc/browser.test.ts
M  src/main/ipc/browser.ts
M  src/main/ipc/pty.test.ts
M  src/main/ipc/pty.ts
M  src/main/ipc/worktree-logic.test.ts
M  src/main/ipc/worktree-metadata-merge.ts
M  src/main/ipc/worktree-remote.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/ipc/worktrees.ts
M  src/main/kimi/hook-service.ts
M  src/main/opencode/hook-service.ts
M  src/main/pi/agent-status-extension-source.ts
M  src/main/providers/local-pty-provider.ts
M  src/main/rate-limits/claude-fetcher.test.ts
M  src/main/rate-limits/claude-fetcher.ts
A  src/main/rate-limits/claude-usage-error-classification.test.ts
A  src/main/rate-limits/claude-usage-error-classification.ts
A  src/main/rate-limits/claude-usage-refresh-plan.test.ts
A  src/main/rate-limits/claude-usage-refresh-plan.ts
M  src/main/rate-limits/service.test.ts
M  src/main/rate-limits/service.ts
M  src/main/runtime/headless-tab-group-split-layout.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/session-tabs-schemas.ts
M  src/main/runtime/rpc/methods/session-tabs.test.ts
M  src/main/runtime/rpc/methods/session-tabs.ts
M  src/main/runtime/rpc/methods/terminal.ts
M  src/main/runtime/rpc/methods/worktree-schemas.ts
M  src/main/runtime/rpc/methods/worktree.test.ts
M  src/main/runtime/rpc/methods/worktree.ts
M  src/main/ssh/ssh-relay-session.ts
UU src/main/updater-events.ts
M  src/main/updater.mac-install.test.ts
M  src/main/updater.test.ts
M  src/main/updater.ts
M  src/main/window/attach-main-window-services.ts
M  src/main/wsl.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/relay/agent-hook-server.ts
M  src/renderer/src/components/browser-pane/BrowserPane.tsx
A  src/renderer/src/components/dictation/use-hold-dictation-gesture.test.tsx
M  src/renderer/src/components/dictation/use-hold-dictation-gesture.ts
M  src/renderer/src/components/editor/CombinedDiffViewer.tsx
M  src/renderer/src/components/editor/combined-diff-entries.test.ts
M  src/renderer/src/components/editor/combined-diff-entries.ts
M  src/renderer/src/components/editor/editor-autosave-controller.test.ts
M  src/renderer/src/components/editor/editor-autosave-controller.ts
M  src/renderer/src/components/editor/editor-panel-diff-reload.test.ts
M  src/renderer/src/components/editor/editor-panel-diff-reload.ts
M  src/renderer/src/components/editor/useEditorPanelContentState.test.tsx
M  src/renderer/src/components/editor/useEditorPanelContentState.ts
M  src/renderer/src/components/editor/useEditorPanelExternalContentEvents.ts
M  src/renderer/src/components/editor/useEditorPanelFileLoadRetry.ts
M  src/renderer/src/components/floating-terminal/FloatingTerminalWindowControls.tsx
M  src/renderer/src/components/onboarding/onboarding-feature-setup.test.ts
M  src/renderer/src/components/onboarding/onboarding-feature-setup.ts
M  src/renderer/src/components/onboarding/onboarding-folder-agent-startup.test.ts
M  src/renderer/src/components/right-sidebar/AiVaultPanel.tsx
M  src/renderer/src/components/right-sidebar/ChecksPanel.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.pr-generation-records.test.ts
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/ai-vault-session-filters.test.ts
M  src/renderer/src/components/right-sidebar/ai-vault-session-filters.ts
M  src/renderer/src/components/right-sidebar/checks-panel-content.test.tsx
M  src/renderer/src/components/right-sidebar/checks-panel-content.tsx
A  src/renderer/src/components/right-sidebar/create-review-draft-title.test.ts
A  src/renderer/src/components/right-sidebar/create-review-draft-title.ts
M  src/renderer/src/components/right-sidebar/useCreatePullRequestDialogFields.test.ts
M  src/renderer/src/components/right-sidebar/useCreatePullRequestDialogFields.ts
M  src/renderer/src/components/settings/ExperimentalPane.test.tsx
M  src/renderer/src/components/settings/ExperimentalPane.tsx
M  src/renderer/src/components/settings/agent-skill-installed-command-callers.test.ts
M  src/renderer/src/components/settings/experimental-search.ts
M  src/renderer/src/components/sidebar/LinearAgentSkillSetupPrompt.reminder-toast.test.tsx
M  src/renderer/src/components/sidebar/LinearAgentSkillSetupPrompt.test.tsx
M  src/renderer/src/components/sidebar/LinearAgentSkillSetupPrompt.tsx
A  src/renderer/src/components/sidebar/LinearAgentSkillSetupPrompt.update-command.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.compact-hover.test.tsx
A  src/renderer/src/components/sidebar/WorktreeCard.hosted-review-refresh.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.pr-display.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
M  src/renderer/src/components/sidebar/WorktreeCardAgents.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCardMeta.tsx
M  src/renderer/src/components/sidebar/WorktreeCardStatusSlot.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCardStatusSlot.tsx
M  src/renderer/src/components/sidebar/WorktreeContextMenu.tsx
M  src/renderer/src/components/sidebar/folder-workspace-composer-submit.ts
M  src/renderer/src/components/sidebar/worktree-card-compact-agent-row.tsx
M  src/renderer/src/components/sidebar/worktree-list-groups.test.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.ts
M  src/renderer/src/components/status-bar/tooltip.test.ts
M  src/renderer/src/components/status-bar/tooltip.tsx
A  src/renderer/src/components/status-bar/usage-error-copy.ts
M  src/renderer/src/components/terminal-pane/TerminalPane.tsx
M  src/renderer/src/components/terminal-pane/pty-connection-types.ts
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
UU src/renderer/src/components/terminal-pane/pty-connection.ts
UU src/renderer/src/components/terminal-pane/pty-dispatcher.ts
M  src/renderer/src/components/terminal-pane/pty-transport.ts
M  src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.test.ts
M  src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.ts
M  src/renderer/src/hooks/useComposerState.ts
M  src/renderer/src/hooks/useInstalledAgentSkills.react.test.tsx
M  src/renderer/src/hooks/useInstalledAgentSkills.test.ts
M  src/renderer/src/hooks/useInstalledAgentSkills.ts
M  src/renderer/src/hooks/useIpcEvents.test.ts
M  src/renderer/src/hooks/useIpcEvents.ts
M  src/renderer/src/i18n/locales/en.json
M  src/renderer/src/i18n/locales/es.json
M  src/renderer/src/i18n/locales/ja.json
M  src/renderer/src/i18n/locales/ko.json
M  src/renderer/src/i18n/locales/zh.json
M  src/renderer/src/lib/agent-feature-install-commands.ts
M  src/renderer/src/lib/ai-vault-resume-command.test.ts
M  src/renderer/src/lib/ai-vault-resume-command.ts
M  src/renderer/src/lib/connection-context.test.ts
M  src/renderer/src/lib/connection-context.ts
M  src/renderer/src/lib/folder-workspace-connection.ts
M  src/renderer/src/lib/launch-agent-background-session.test.ts
UU src/renderer/src/lib/launch-agent-background-session.ts
M  src/renderer/src/lib/launch-agent-in-new-tab.test.ts
M  src/renderer/src/lib/launch-agent-in-new-tab.ts
M  src/renderer/src/lib/launch-work-item-direct-agent.test.ts
M  src/renderer/src/lib/launch-work-item-direct-agent.ts
M  src/renderer/src/lib/launch-work-item-direct.test.ts
M  src/renderer/src/lib/launch-work-item-direct.ts
M  src/renderer/src/lib/new-workspace.test.ts
M  src/renderer/src/lib/onboarding-folder-agent-startup.ts
M  src/renderer/src/lib/pane-manager/pane-manager-registry.test.ts
M  src/renderer/src/lib/pane-manager/pane-manager-registry.ts
M  src/renderer/src/lib/pane-manager/pane-manager.ts
M  src/renderer/src/lib/resume-sleeping-agent-session.test.ts
M  src/renderer/src/lib/resume-sleeping-agent-session.ts
M  src/renderer/src/lib/source-control-agent-action-plan.ts
M  src/renderer/src/lib/tui-agent-startup.test.ts
M  src/renderer/src/lib/tui-agent-startup.ts
A  src/renderer/src/lib/worktree-activation-created-agent-test-state.ts
M  src/renderer/src/lib/worktree-activation-created-agent.test.ts
M  src/renderer/src/lib/worktree-activation.ts
M  src/renderer/src/lib/worktree-creation-flow.ts
M  src/renderer/src/runtime/mobile-markdown-bridge.test.ts
M  src/renderer/src/runtime/mobile-markdown-bridge.ts
M  src/renderer/src/runtime/web-runtime-session.test.ts
M  src/renderer/src/runtime/web-runtime-session.ts
M  src/renderer/src/store/slices/agent-status-quit-capture.test.ts
M  src/renderer/src/store/slices/agent-status.ts
M  src/renderer/src/store/slices/generation-records-worktree-removal-leak.test.ts
M  src/renderer/src/store/slices/pull-request-generation.ts
M  src/renderer/src/store/slices/repos-onboarding-folder-startup.test.ts
M  src/renderer/src/store/slices/terminals.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/web/web-preload-api.test.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/agent-feature-install-commands.test.ts
M  src/shared/agent-feature-install-commands.ts
M  src/shared/agent-hook-listener.ts
M  src/shared/agent-hook-relay.ts
M  src/shared/agent-session-resume.ts
M  src/shared/agent-status-types.ts
M  src/shared/browser-guest-events.ts
M  src/shared/rate-limit-types.ts
M  src/shared/runtime-types.ts
A  src/shared/tui-agent-startup-shell.ts
M  src/shared/tui-agent-startup.test.ts
M  src/shared/tui-agent-startup.ts
M  src/shared/types.ts
M  src/shared/workspace-session-schema.test.ts
M  src/shared/workspace-session-schema.ts
A  src/shared/workspace-session-sleeping-agents.ts
M  tests/e2e/helpers/source-control-ai-generation.ts
M  tests/e2e/mobile-banner.spec.ts
M  tests/e2e/source-control-create-pr.spec.ts
M  tests/e2e/source-control-pr-generation-switch.spec.ts
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

