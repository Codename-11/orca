## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/28314784767
- Upstream ref/tag: v1.4.103
- Intended Axiom version/tag: 1.4.103-axiom.1 / axiom-v1.4.103-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.103-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/Terminal.tsx`

## Captured git status
```
R  config/patches/@xterm__addon-ligatures@0.11.0-beta.285.patch -> config/patches/@xterm__addon-ligatures@0.11.0-beta.287.patch
M  docs/assets/readme-downloads.svg
M  mobile/app/h/[hostId]/index.tsx
M  mobile/app/h/[hostId]/session/[worktreeId].tsx
M  mobile/src/components/MobileMarkdown.test.ts
M  mobile/src/components/mobile-markdown-preview-html.ts
M  mobile/src/session/mobile-session-startup-source.test.ts
M  mobile/src/source-control/MobileSourceControlContent.tsx
A  mobile/src/source-control/mobile-source-control-primary-action-decision.ts
A  mobile/src/source-control/mobile-source-control-primary-action.test.ts
A  mobile/src/source-control/mobile-source-control-primary-action.ts
M  mobile/src/source-control/use-mobile-source-control-state.ts
A  mobile/src/worktree/mobile-worktree-activation-source.test.ts
A  mobile/vitest.config.ts
UU package.json
M  pnpm-lock.yaml
M  src/main/browser/offscreen-browser-backend.ts
A  src/main/browser/offscreen-browser-backend.web-preferences.test.ts
M  src/main/cli/cli-installer.test.ts
M  src/main/cli/cli-installer.ts
M  src/main/ipc/cli.ts
M  src/main/ipc/filesystem-watcher-wsl.test.ts
M  src/main/ipc/filesystem-watcher-wsl.ts
M  src/main/ipc/filesystem-watcher.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/session-tabs-schemas.ts
M  src/main/runtime/rpc/methods/session-tabs.test.ts
M  src/main/runtime/rpc/methods/session-tabs.ts
M  src/main/runtime/rpc/methods/worktree-schemas.ts
M  src/main/runtime/rpc/methods/worktree.test.ts
M  src/main/runtime/rpc/methods/worktree.ts
M  src/main/source-control/hosted-review-creation.test.ts
M  src/main/source-control/hosted-review-creation.ts
M  src/main/window/createMainWindow.test.ts
M  src/main/window/createMainWindow.ts
M  src/renderer/src/components/NewWorkspaceComposerCard.tsx
UU src/renderer/src/components/Terminal.tsx
M  src/renderer/src/components/browser-pane/BrowserPane.tsx
A  src/renderer/src/components/browser-pane/BrowserPane.webview-preferences.test.ts
M  src/renderer/src/components/editor/check-run-details-fix-context.ts
M  src/renderer/src/components/emulator-pane/MobileEmulatorAgentSetupGuideSteps.tsx
M  src/renderer/src/components/pet/PetOverlay.tsx
A  src/renderer/src/components/pet/pet-overlay-hit-area.test.tsx
M  src/renderer/src/components/right-sidebar/AiVaultPanelControls.tsx
M  src/renderer/src/components/right-sidebar/ChecksPanel.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/right-sidebar/active-checks-status.ts
M  src/renderer/src/components/right-sidebar/checks-panel-review.test.ts
M  src/renderer/src/components/right-sidebar/checks-panel-review.ts
M  src/renderer/src/components/right-sidebar/parent-pr-checks-rows.ts
M  src/renderer/src/components/right-sidebar/source-control-create-pr-intent-state.ts
M  src/renderer/src/components/right-sidebar/source-control-primary-action-types.ts
M  src/renderer/src/components/right-sidebar/source-control-primary-action.ts
M  src/renderer/src/components/settings/AgentSkillSetupPanel.test.tsx
M  src/renderer/src/components/settings/AgentSkillSetupPanel.tsx
M  src/renderer/src/components/settings/MobileEmulatorAgentControlRow.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.compact-hover.test.tsx
A  src/renderer/src/components/sidebar/WorktreeCard.merged-pr-display.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.pr-display.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
M  src/renderer/src/components/sidebar/folder-workspace-card-pr-display.ts
M  src/renderer/src/components/sidebar/use-worktree-issue-link.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.test.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.ts
M  src/renderer/src/components/status-bar/WorkspaceSpaceManagerPanel.tsx
M  src/renderer/src/components/status-bar/workspace-space-presentation.test.ts
M  src/renderer/src/components/terminal-pane/TerminalPane.tsx
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
M  src/renderer/src/components/terminal-pane/terminal-capability-replies.test.ts
M  src/renderer/src/components/terminal-pane/terminal-capability-replies.ts
R  src/renderer/src/components/terminal-pane/use-visible-terminal-worktree-claim.test.ts -> src/renderer/src/components/terminal-pane/use-visible-terminal-tab-claim.test.ts
A  src/renderer/src/components/terminal-pane/use-visible-terminal-tab-claim.ts
D  src/renderer/src/components/terminal-pane/use-visible-terminal-worktree-claim.ts
M  src/renderer/src/i18n/locales/en.json
M  src/renderer/src/i18n/locales/es.json
M  src/renderer/src/i18n/locales/ja.json
M  src/renderer/src/i18n/locales/ko.json
M  src/renderer/src/i18n/locales/zh.json
A  src/renderer/src/lib/agent-hibernation-confirmation.test.ts
A  src/renderer/src/lib/agent-hibernation-confirmation.ts
M  src/renderer/src/lib/agent-hibernation-coordinator.test.ts
M  src/renderer/src/lib/agent-hibernation-coordinator.ts
M  src/renderer/src/lib/agent-hibernation-planner.test.ts
M  src/renderer/src/lib/agent-hibernation-planner.ts
A  src/renderer/src/lib/foreground-terminal-tabs.test.ts
A  src/renderer/src/lib/foreground-terminal-tabs.ts
D  src/renderer/src/lib/foreground-terminal-worktrees.test.ts
D  src/renderer/src/lib/foreground-terminal-worktrees.ts
M  src/renderer/src/lib/pane-manager/terminal-complex-script.test.ts
M  src/renderer/src/lib/pane-manager/terminal-complex-script.ts
M  src/renderer/src/lib/worktree-activation-created-agent.test.ts
M  src/renderer/src/lib/worktree-activation.ts
M  src/renderer/src/runtime/web-runtime-session.test.ts
M  src/renderer/src/runtime/web-runtime-session.ts
M  src/renderer/src/store/slices/github-cache-key.ts
M  src/renderer/src/store/slices/github-checks.test.ts
M  src/renderer/src/store/slices/github-checks.ts
M  src/renderer/src/store/slices/github-pr-refresh-host-guard.test.ts
M  src/renderer/src/store/slices/github.test.ts
M  src/renderer/src/store/slices/github.ts
M  src/renderer/src/store/slices/hosted-review-cache-identity.ts
M  src/renderer/src/store/slices/hosted-review-cache-race.test.ts
M  src/renderer/src/store/slices/hosted-review-cache.test.ts
M  src/renderer/src/store/slices/hosted-review.test.ts
M  src/renderer/src/store/slices/hosted-review.ts
A  src/renderer/src/store/slices/repo-owner-cache-identity.test.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
A  src/shared/browser-guest-web-preferences.ts
A  src/shared/source-control-create-review-intent.ts
A  src/shared/source-control-primary-action-decision-types.ts
A  src/shared/source-control-primary-action-decision.test.ts
A  src/shared/source-control-primary-action-decision.ts
A  src/shared/source-control-primary-action-in-flight.ts
A  src/shared/source-control-primary-unpublished-action.ts
A  tests/e2e/terminal-osc-color-queries.spec.ts
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

