## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26795166730
- Upstream ref/tag: v1.4.40
- Intended Axiom version/tag: 1.4.40-axiom.1 / axiom-v1.4.40-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.40-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `mobile/package.json`
- `mobile/pnpm-lock.yaml`
- `package.json`
- `src/main/cli/wsl-cli-installer.test.ts`
- `src/main/cli/wsl-cli-installer.ts`
- `src/main/codex-accounts/runtime-home-service.test.ts`
- `src/main/codex-accounts/service.test.ts`
- `src/main/ipc/register-core-handlers.ts`
- `src/main/persistence.test.ts`
- `src/main/runtime/rpc/methods/index.ts`
- `src/preload/api-types.ts`
- `src/preload/index.ts`
- `src/renderer/src/components/TaskPage.tsx`
- `src/renderer/src/components/settings/TasksPane.tsx`
- `src/renderer/src/components/settings/tasks-search.ts`
- `src/renderer/src/components/sidebar/SidebarNav.tsx`
- `src/shared/task-providers.test.ts`
- `src/shared/task-providers.ts`

## Captured git status
```
A  docs/renderer-memory-profile-2026-06-01.md
M  mobile/app.json
M  mobile/app/pair-scan.tsx
UU mobile/package.json
UU mobile/pnpm-lock.yaml
M  mobile/src/transport/pairing.test.ts
M  mobile/src/transport/pairing.ts
UU package.json
M  src/cli/args.ts
M  src/cli/dispatch.ts
M  src/cli/format.ts
A  src/cli/handlers/diagnostics.ts
M  src/cli/help.ts
M  src/cli/index.test.ts
A  src/cli/specs/diagnostics.ts
M  src/cli/specs/index.ts
M  src/main/cli/cli-installer.test.ts
M  src/main/cli/cli-installer.ts
UU src/main/cli/wsl-cli-installer.test.ts
UU src/main/cli/wsl-cli-installer.ts
UU src/main/codex-accounts/runtime-home-service.test.ts
M  src/main/codex-accounts/runtime-home-service.ts
UU src/main/codex-accounts/service.test.ts
M  src/main/codex-accounts/service.ts
M  src/main/daemon/daemon-pty-adapter.test.ts
M  src/main/daemon/daemon-pty-adapter.ts
M  src/main/index.ts
M  src/main/ipc/browser.test.ts
M  src/main/ipc/browser.ts
A  src/main/ipc/jira.ts
M  src/main/ipc/mobile.test.ts
M  src/main/ipc/mobile.ts
M  src/main/ipc/register-core-handlers.test.ts
UU src/main/ipc/register-core-handlers.ts
M  src/main/ipc/skills.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/ipc/worktrees.ts
A  src/main/jira/client.ts
A  src/main/jira/issues.test.ts
A  src/main/jira/issues.ts
M  src/main/memory/collector.test.ts
M  src/main/memory/collector.ts
UU src/main/persistence.test.ts
M  src/main/persistence.ts
M  src/main/runtime/orca-runtime-browser.test.ts
M  src/main/runtime/orca-runtime-browser.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
A  src/main/runtime/rpc/methods/diagnostics.test.ts
A  src/main/runtime/rpc/methods/diagnostics.ts
UU src/main/runtime/rpc/methods/index.ts
A  src/main/runtime/rpc/methods/jira.test.ts
A  src/main/runtime/rpc/methods/jira.ts
M  src/main/runtime/runtime-rpc.ts
M  src/main/runtime/worktree-teardown.test.ts
M  src/main/runtime/worktree-teardown.ts
M  src/main/skills/discovery.test.ts
M  src/main/skills/discovery.ts
A  src/main/star-nag/service.test.ts
M  src/main/star-nag/service.ts
M  src/main/startup/__fixtures__/fake-electron-vite-dev-cli.mjs
A  src/main/startup/configure-process-dev-parent-shutdown.test.ts
M  src/main/startup/configure-process.test.ts
M  src/main/startup/configure-process.ts
M  src/main/startup/run-electron-vite-dev-web.test.ts
M  src/main/startup/run-electron-vite-dev.test.ts
UU src/preload/api-types.ts
UU src/preload/index.ts
A  src/renderer/src/components/JiraIssueWorkspace.tsx
M  src/renderer/src/components/NewWorkspaceComposerCard.tsx
UU src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/Terminal.tsx
A  src/renderer/src/components/browser-pane/BrowserPaneOverlayLayer.test.tsx
M  src/renderer/src/components/browser-pane/BrowserPaneOverlayLayer.tsx
M  src/renderer/src/components/browser-pane/browser-automation-visibility.test.ts
M  src/renderer/src/components/browser-pane/browser-automation-visibility.ts
M  src/renderer/src/components/browser-pane/webview-registry.test.ts
M  src/renderer/src/components/browser-pane/webview-registry.ts
A  src/renderer/src/components/icons/JiraIcon.tsx
M  src/renderer/src/components/new-workspace/SmartWorkspaceNameField.tsx
M  src/renderer/src/components/onboarding/OnboardingInlineCommandTerminal.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
A  src/renderer/src/components/right-sidebar/source-control-discard-dialog.test.tsx
A  src/renderer/src/components/right-sidebar/source-control-discard-dialog.tsx
M  src/renderer/src/components/settings/AgentSkillSetupPanel.tsx
M  src/renderer/src/components/settings/CliSection.tsx
A  src/renderer/src/components/settings/CliSkillRuntimeSetup.tsx
M  src/renderer/src/components/settings/GeneralPane.tsx
M  src/renderer/src/components/settings/Settings.tsx
UU src/renderer/src/components/settings/TasksPane.tsx
M  src/renderer/src/components/settings/mobile-network-interface-selection.test.ts
M  src/renderer/src/components/settings/mobile-network-interface-selection.ts
UU src/renderer/src/components/settings/tasks-search.ts
UU src/renderer/src/components/sidebar/SidebarNav.tsx
A  src/renderer/src/components/sidebar/sleep-worktree-activation-race.test.ts
M  src/renderer/src/components/sidebar/sleep-worktree-flow.test.ts
M  src/renderer/src/components/sidebar/sleep-worktree-flow.ts
A  src/renderer/src/components/task-page-jira-cache-selectors.ts
M  src/renderer/src/hooks/useComposerState.ts
M  src/renderer/src/hooks/useInstalledAgentSkills.test.ts
M  src/renderer/src/hooks/useInstalledAgentSkills.ts
M  src/renderer/src/hooks/useIpcEvents.test.ts
M  src/renderer/src/hooks/useIpcEvents.ts
M  src/renderer/src/lib/crash-diagnostics.test.ts
M  src/renderer/src/lib/crash-diagnostics.ts
M  src/renderer/src/lib/linear-linked-work-item.ts
A  src/renderer/src/lib/linked-work-item-provider.test.ts
A  src/renderer/src/lib/linked-work-item-provider.ts
M  src/renderer/src/lib/new-workspace.ts
A  src/renderer/src/lib/sidebar-worktree-activation.test.ts
M  src/renderer/src/lib/sidebar-worktree-activation.ts
M  src/renderer/src/lib/worktree-activation-created-agent.test.ts
M  src/renderer/src/lib/worktree-activation.ts
A  src/renderer/src/runtime/runtime-jira-client.ts
M  src/renderer/src/store/index.ts
M  src/renderer/src/store/slices/diffComments.test.ts
A  src/renderer/src/store/slices/jira.ts
M  src/renderer/src/store/slices/settings.test.ts
M  src/renderer/src/store/slices/settings.ts
M  src/renderer/src/store/slices/store-cascades.test.ts
M  src/renderer/src/store/slices/store-test-helpers.ts
M  src/renderer/src/store/slices/ui.test.ts
M  src/renderer/src/store/slices/ui.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/store/types.ts
M  src/shared/constants.ts
A  src/shared/jira-types.ts
M  src/shared/skills.ts
A  src/shared/tailnet-address.test.ts
A  src/shared/tailnet-address.ts
UU src/shared/task-providers.test.ts
UU src/shared/task-providers.ts
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

