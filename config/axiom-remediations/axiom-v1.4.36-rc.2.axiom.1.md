## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26671140421
- Upstream ref/tag: v1.4.36-rc.2
- Intended Axiom version/tag: 1.4.36-rc.2.axiom.1 / axiom-v1.4.36-rc.2.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.36-rc.2.axiom.1`
- Classification: `auto_remediate` — Fork identity/update-feed files need policy-guided agent remediation: config/electron-builder.config.cjs

## Conflicted files
- `config/electron-builder.config.cjs`
- `config/scripts/verify-release-required-assets.mjs`
- `package.json`
- `src/main/cli/packaged-cli-assets.test.ts`

## Captured git status
```
M  .github/workflows/release-cut.yml
UU config/electron-builder.config.cjs
M  config/scripts/electron-builder-config.test.mjs
UU config/scripts/verify-release-required-assets.mjs
M  config/scripts/verify-release-required-assets.test.mjs
D  docs/reference/memory-leak-audit-final-comb.md
D  docs/reference/react-performance-audit.md
M  mobile/app.json
M  mobile/app/h/[hostId]/index.tsx
M  mobile/app/index.tsx
M  mobile/src/components/BottomDrawer.tsx
A  mobile/src/layout/responsive-layout-metrics.test.ts
A  mobile/src/layout/responsive-layout-metrics.ts
A  mobile/src/layout/responsive-layout.ts
UU package.json
R  resources/linux/bin/orca -> resources/linux/bin/orca-ide
M  skills/orca-cli/SKILL.md
M  skills/orchestration/SKILL.md
M  src/main/cli/cli-installer.test.ts
M  src/main/cli/cli-installer.ts
UU src/main/cli/packaged-cli-assets.test.ts
M  src/main/cli/wsl-cli-installer.test.ts
M  src/main/cli/wsl-cli-installer.ts
M  src/main/cli/wsl-cli-scripts.ts
A  src/main/git/repo-search-ref-compat.test.ts
M  src/main/git/repo.test.ts
M  src/main/git/repo.ts
M  src/main/github/client-issue-source.test.ts
M  src/main/github/client.test.ts
M  src/main/github/client.ts
M  src/main/ipc/github.test.ts
M  src/main/ipc/github.ts
M  src/main/ipc/repos-remote.test.ts
M  src/main/ipc/repos.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/github.test.ts
M  src/main/runtime/rpc/methods/github.ts
M  src/main/runtime/runtime-rpc.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/renderer/src/components/GitHubItemDialog.tsx
M  src/renderer/src/components/LinearItemDrawer.tsx
M  src/renderer/src/components/PullRequestPage.tsx
M  src/renderer/src/components/QuickOpen.tsx
M  src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/UpdateCard.tsx
M  src/renderer/src/components/browser-pane/BrowserAddressBar.tsx
M  src/renderer/src/components/editor/CodeBlockCopyButton.tsx
M  src/renderer/src/components/editor/RichMarkdownCodeBlock.tsx
M  src/renderer/src/components/editor/useLocalImageSrc.ts
M  src/renderer/src/components/floating-terminal/FloatingTerminalIconContextMenu.tsx
M  src/renderer/src/components/floating-terminal/FloatingTerminalOrchestrationDialog.tsx
A  src/renderer/src/components/github-pr-merge-state.test.ts
A  src/renderer/src/components/github-pr-merge-state.ts
M  src/renderer/src/components/new-workspace/SmartWorkspaceNameField.tsx
A  src/renderer/src/components/new-workspace/smart-workspace-source-results.test.ts
A  src/renderer/src/components/new-workspace/smart-workspace-source-results.ts
M  src/renderer/src/components/onboarding/FeatureSetupChecklist.tsx
M  src/renderer/src/components/right-sidebar/PRActions.tsx
M  src/renderer/src/components/right-sidebar/checks-panel-content.tsx
M  src/renderer/src/components/settings/AgentsPane.test.tsx
M  src/renderer/src/components/settings/AgentsPane.tsx
M  src/renderer/src/components/settings/BrowserUsePane.tsx
M  src/renderer/src/components/settings/CliSection.tsx
M  src/renderer/src/components/settings/McpConfigSection.tsx
M  src/renderer/src/components/settings/MobilePane.tsx
M  src/renderer/src/components/settings/RepositoryPane.tsx
M  src/renderer/src/components/settings/RuntimePairingUrlGenerator.tsx
M  src/renderer/src/components/settings/WslCliRegistration.tsx
M  src/renderer/src/components/settings/browser-use-search.ts
M  src/renderer/src/components/settings/general-search.ts
M  src/renderer/src/components/sidebar/WorkspaceKanbanCard.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.quick-actions.test.tsx
M  src/renderer/src/components/sidebar/WorktreeCard.tsx
A  src/renderer/src/components/sidebar/workspace-delete-quick-action.ts
M  src/renderer/src/components/stats/ShareUsageButton.tsx
M  src/renderer/src/components/task-page-cache-selectors.test.ts
M  src/renderer/src/components/task-page-cache-selectors.ts
M  src/renderer/src/components/terminal-pane/MobileDriverOverlay.tsx
M  src/renderer/src/components/terminal-pane/TerminalPane.tsx
A  src/renderer/src/components/terminal-pane/mobile-driver-overlay-collapse.test.ts
A  src/renderer/src/components/terminal-pane/mobile-driver-overlay-collapse.ts
M  src/renderer/src/components/terminal-pane/terminal-file-open-routing.ts
M  src/renderer/src/components/terminal-pane/terminal-link-handlers.test.ts
M  src/renderer/src/components/terminal-pane/use-terminal-scroll-visibility-memory.test.ts
M  src/renderer/src/components/terminal-pane/use-terminal-scroll-visibility-memory.ts
A  src/renderer/src/lib/activate-tab-and-focus-pane.test.ts
M  src/renderer/src/lib/activate-tab-and-focus-pane.ts
M  src/renderer/src/lib/agent-skill-cli-prerequisite.ts
M  src/renderer/src/lib/focus-terminal-tab-surface.test.ts
M  src/renderer/src/lib/focus-terminal-tab-surface.ts
M  src/renderer/src/lib/pane-manager/pane-fit-resize-observer.test.ts
M  src/renderer/src/lib/pane-manager/pane-fit-resize-observer.ts
A  src/renderer/src/lib/pane-manager/pane-initial-fit-lifecycle.test.ts
M  src/renderer/src/lib/pane-manager/pane-lifecycle.ts
M  src/renderer/src/lib/pane-manager/pane-manager-types.ts
M  src/renderer/src/lib/pane-manager/pane-scroll.ts
M  src/renderer/src/lib/pane-manager/pane-split-close.test.ts
M  src/renderer/src/lib/pane-manager/pane-split-close.ts
M  src/renderer/src/lib/pane-manager/pane-split-scroll.test.ts
M  src/renderer/src/lib/pane-manager/pane-split-scroll.ts
A  src/renderer/src/lib/pane-manager/pane-webgl-refresh-lifecycle.test.ts
M  src/renderer/src/lib/pane-manager/pane-webgl-renderer.ts
M  src/renderer/src/store/slices/store-session-cascades.test.ts
M  src/renderer/src/store/slices/terminals.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/web/web-preload-api.test.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/hosted-review-github.ts
M  src/shared/hosted-review-queue.test.ts
M  src/shared/hosted-review-queue.ts
M  src/shared/hosted-review.ts
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

