## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/27292530714
- Upstream ref/tag: v1.4.57
- Intended Axiom version/tag: 1.4.57-axiom.1 / axiom-v1.4.57-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.57-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/TaskPage.tsx`

## Captured git status
```
M  .gitignore
M  config/scripts/bootstrap-locale-catalog.mjs
M  config/scripts/locale-translation-policy.mjs
M  config/scripts/locale-value-overrides.mjs
M  config/scripts/repair-locale-catalog.mjs
UU package.json
A  src/main/git/max-buffer-overflow.ts
M  src/main/git/status.test.ts
M  src/main/git/status.ts
M  src/main/i18n/main-i18n.ts
M  src/main/providers/ssh-git-provider.test.ts
M  src/main/providers/ssh-git-provider.ts
UU src/renderer/src/components/TaskPage.tsx
M  src/renderer/src/components/WorktreeJumpPalette.tsx
A  src/renderer/src/components/right-sidebar/PullRequestComposer.generate-tooltip.test.tsx
M  src/renderer/src/components/right-sidebar/SourceControl.tsx
M  src/renderer/src/components/settings/AppearancePane.test.tsx
M  src/renderer/src/components/settings/RepositoryHooksSection.tsx
M  src/renderer/src/components/sidebar/local-base-ref-suggestion-toast.tsx
A  src/renderer/src/components/task-page-localized-options.test.ts
A  src/renderer/src/components/task-page-localized-options.tsx
M  src/renderer/src/hooks/useSettingsNavigationMetadata.ts
M  src/renderer/src/i18n/i18n.ts
M  src/renderer/src/i18n/locales/en.json
A  src/renderer/src/i18n/locales/es.json
M  src/renderer/src/i18n/locales/ja.json
M  src/renderer/src/i18n/locales/ko.json
M  src/renderer/src/i18n/locales/zh.json
M  src/renderer/src/i18n/supported-languages.ts
M  src/shared/commit-message-generation.test.ts
M  src/shared/commit-message-generation.ts
M  src/shared/commit-message-prompt.test.ts
M  src/shared/commit-message-prompt.ts
M  src/shared/ui-language.test.ts
M  src/shared/ui-language.ts
M  src/shared/ui-locale.test.ts
M  src/shared/ui-locale.ts
```

## Resolution summary
- `package.json`: kept the Axiom fork semver as `1.4.57-axiom.1` while accepting the upstream v1.4.57 dependency/script changes.
- `src/renderer/src/components/TaskPage.tsx`: accepted upstream's localized task option extraction and preserved the Axiom Forge task provider UI, project/workspace affordances, and task-source visibility behavior.
- `src/renderer/src/components/task-page-localized-options.tsx`: added Forge to the upstream localized task source catalog and covered the provider order in the new localized-options test.
- Locale catalogs: added the Forge source label key across the shipped locale catalogs so localization coverage remains complete.

## Axiom safety notes
- Bot branch PR only; no conflict remediation was pushed directly to `axiom/deploy`.
- Preserved side-by-side identity, updater feed, fork semver, profile portability, and Forge provider/task-registry additions.
- Reviewed protected-file status: no protected Axiom files were deleted.

## Verification checklist
- [x] `pnpm install --frozen-lockfile` — passed (Node 25.6.0 emitted the existing Node 24 engine warning only).
- [x] `pnpm run typecheck` — passed.
- [x] `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` — passed, 50 tests.
- [x] `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` — passed.
- [x] `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` — passed.
- [x] `git diff --check` — passed.

## Additional focused verification
- [x] `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/task-page-localized-options.test.ts src/renderer/src/components/task-providers/provider-ui-registry.test.tsx` — passed, 7 tests.

