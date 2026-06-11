## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/27319549580
- Upstream ref/tag: v1.4.60
- Intended Axiom version/tag: 1.4.60-axiom.1 / axiom-v1.4.60-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.60-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/TaskPage.tsx`
- `src/renderer/src/components/settings/IntegrationsPane.tsx`

## Captured git status
```
D  .env.e2e
UU package.json
M  src/main/daemon/daemon-bundle-staleness.test.ts
M  src/main/daemon/daemon-health.ts
M  src/main/daemon/daemon-init.ts
M  src/main/index.ts
M  src/main/ipc/filesystem-search-git.test.ts
M  src/main/ipc/repos-create.test.ts
M  src/main/ipc/repos.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/repo.test.ts
M  src/main/runtime/rpc/methods/repo.ts
M  src/main/runtime/runtime-rpc.ts
A  src/main/startup/event-loop-stall-probe.ts
M  src/preload/api-types.ts
M  src/preload/e2e-config.ts
M  src/preload/index.ts
M  src/relay/fs-handler-git-search.test.ts
UU src/renderer/src/components/TaskPage.tsx
A  src/renderer/src/components/feature-wall/ConnectIntegrationsList.test.tsx
A  src/renderer/src/components/feature-wall/ConnectIntegrationsList.tsx
M  src/renderer/src/components/feature-wall/FeatureWallSetupChecklist.tsx
A  src/renderer/src/components/feature-wall/connect-integration-step.tsx
M  src/renderer/src/components/feature-wall/feature-wall-setup-progress.test.ts
M  src/renderer/src/components/feature-wall/use-feature-wall-task-source-presentation.ts
A  src/renderer/src/components/feature-wall/use-integration-connection-status.test.ts
A  src/renderer/src/components/feature-wall/use-integration-connection-status.ts
A  src/renderer/src/components/jira-connect-dialog.tsx
M  src/renderer/src/components/new-workspace/SmartWorkspaceNameField.tsx
A  src/renderer/src/components/right-sidebar/SearchResultItems.test.tsx
M  src/renderer/src/components/right-sidebar/SearchResultItems.tsx
M  src/renderer/src/components/right-sidebar/search-rows.test.ts
M  src/renderer/src/components/settings/CommitMessageAiPane.test.tsx
UU src/renderer/src/components/settings/IntegrationsPane.tsx
M  src/renderer/src/components/settings/RepositorySourceControlAiActionRows.tsx
M  src/renderer/src/components/settings/SourceControlActionRecipeRow.tsx
A  src/renderer/src/components/settings/cli-source-control-integration-cards.tsx
A  src/renderer/src/components/settings/integration-card-shell.tsx
M  src/renderer/src/components/settings/jira-integration-card.tsx
M  src/renderer/src/components/settings/source-control-action-recipe-options.ts
A  src/renderer/src/components/settings/source-control-integration-cards.tsx
A  src/renderer/src/components/settings/source-control-preflight-card-status.ts
A  src/renderer/src/components/settings/task-tracker-integration-cards.tsx
A  src/renderer/src/components/settings/token-source-control-integration-cards.tsx
A  src/renderer/src/components/settings/use-integration-provider-status-refresh.ts
M  src/renderer/src/components/setup-guide/setup-guide-progress-readiness.ts
A  src/renderer/src/components/setup-guide/setup-script-probe-cache.ts
M  src/renderer/src/components/setup-guide/use-setup-guide-progress.test.ts
M  src/renderer/src/components/setup-guide/use-setup-guide-progress.ts
A  src/renderer/src/components/sidebar/AddRepoCreateStep.test.tsx
M  src/renderer/src/components/sidebar/AddRepoCreateStep.tsx
M  src/renderer/src/components/sidebar/AddRepoDialog.tsx
M  src/renderer/src/components/sidebar/AddRepoDialogStepContent.test.tsx
M  src/renderer/src/components/sidebar/AddRepoDialogStepContent.tsx
M  src/renderer/src/components/sidebar/CreateProjectLocationField.tsx
M  src/renderer/src/components/sidebar/SidebarNav.tsx
M  src/renderer/src/components/sidebar/add-repo-existing-workspaces-telemetry.ts
A  src/renderer/src/components/sidebar/create-project-defaults.test.ts
A  src/renderer/src/components/sidebar/create-project-defaults.ts
A  src/renderer/src/components/sidebar/useCreateProjectDefaults.test.ts
A  src/renderer/src/components/sidebar/useCreateProjectDefaults.ts
R  src/renderer/src/components/sidebar/AddRepoCreateStep.default-checkout.test.ts -> src/renderer/src/components/sidebar/useCreateRepo.default-checkout.test.ts
A  src/renderer/src/components/sidebar/useCreateRepo.ts
M  src/renderer/src/i18n/locales/en.json
M  src/renderer/src/i18n/locales/es.json
M  src/renderer/src/i18n/locales/ja.json
M  src/renderer/src/i18n/locales/ko.json
M  src/renderer/src/i18n/locales/zh.json
M  src/renderer/src/lib/local-preflight-context.test.ts
M  src/renderer/src/lib/local-preflight-context.ts
A  src/renderer/src/lib/provider-runtime-context.ts
M  src/renderer/src/store/slices/jira.test.ts
M  src/renderer/src/store/slices/jira.ts
M  src/renderer/src/store/slices/linear.test.ts
M  src/renderer/src/store/slices/linear.ts
M  src/renderer/src/store/slices/preflight.test.ts
M  src/renderer/src/store/slices/preflight.ts
M  src/renderer/src/store/slices/settings.ts
M  src/renderer/src/web/web-preload-api.test.ts
M  src/renderer/src/web/web-preload-api.ts
A  src/shared/search-match-count.test.ts
A  src/shared/search-match-count.ts
M  src/shared/source-control-ai-action-recipes.test.ts
M  src/shared/source-control-ai.ts
M  src/shared/text-search.test.ts
M  src/shared/text-search.ts
M  src/shared/types.ts
M  tests/e2e/AGENTS.md
M  tests/e2e/global-setup.ts
A  tools/benchmarks/daemon-coldstart-bench.mjs
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

