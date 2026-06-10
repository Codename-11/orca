## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/27298655131
- Upstream ref/tag: v1.4.58
- Intended Axiom version/tag: 1.4.58-axiom.1 / axiom-v1.4.58-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.58-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/main/ipc/settings.test.ts`
- `src/main/ipc/settings.ts`
- `src/preload/api-types.ts`
- `src/preload/index.ts`

## Captured git status
```
M  config/localization-audit.md
M  config/scripts/verify-localization-catalog.mjs
A  config/scripts/verify-localization-catalog.test.mjs
M  electron.vite.config.ts
UU package.json
UU src/main/ipc/settings.test.ts
UU src/main/ipc/settings.ts
M  src/main/persistence.ts
A  src/main/warp-themes/discovery.test.ts
A  src/main/warp-themes/discovery.ts
A  src/main/warp-themes/index.test.ts
A  src/main/warp-themes/index.ts
A  src/main/warp-themes/manual-warp-theme-files.ts
A  src/main/warp-themes/parser-runner.test.ts
A  src/main/warp-themes/parser-runner.ts
A  src/main/warp-themes/parser.test.ts
A  src/main/warp-themes/parser.ts
A  src/main/warp-themes/preview-operation-budget.ts
A  src/main/warp-themes/theme-file-scanner.ts
A  src/main/warp-themes/warp-theme-import-source-validation.ts
A  src/main/warp-themes/warp-theme-parser-worker.ts
UU src/preload/api-types.ts
UU src/preload/index.ts
M  src/renderer/src/components/browser-pane/BrowserImportHintButton.tsx
A  src/renderer/src/components/icons/WarpIcon.tsx
M  src/renderer/src/components/settings/AccountsPane.test.tsx
M  src/renderer/src/components/settings/AccountsPane.tsx
M  src/renderer/src/components/settings/AppearancePane.test.tsx
M  src/renderer/src/components/settings/AppearancePane.tsx
M  src/renderer/src/components/settings/Settings.tsx
M  src/renderer/src/components/settings/SettingsFormControls.tsx
M  src/renderer/src/components/settings/TerminalAppearanceSection.ghostty.test.ts
M  src/renderer/src/components/settings/TerminalAppearanceSection.tsx
M  src/renderer/src/components/settings/TerminalSettingsPreview.tsx
M  src/renderer/src/components/settings/TerminalThemeSections.lifecycle.test.ts
M  src/renderer/src/components/settings/TerminalThemeSections.tsx
A  src/renderer/src/components/settings/WarpThemeImportButton.tsx
A  src/renderer/src/components/settings/WarpThemeImportModal.tsx
A  src/renderer/src/components/settings/YamlThemeImportButton.tsx
M  src/renderer/src/components/settings/appearance-search.ts
M  src/renderer/src/components/settings/terminal-search.test.ts
M  src/renderer/src/components/settings/terminal-search.ts
M  src/renderer/src/components/settings/terminal-theme-search.ts
A  src/renderer/src/components/settings/useWarpThemeImport.test.ts
A  src/renderer/src/components/settings/useWarpThemeImport.ts
M  src/renderer/src/components/terminal-pane/pty-connection.test.ts
M  src/renderer/src/components/terminal-pane/pty-connection.ts
M  src/renderer/src/i18n/locales/en.json
M  src/renderer/src/i18n/locales/es.json
M  src/renderer/src/i18n/locales/ja.json
M  src/renderer/src/i18n/locales/ko.json
M  src/renderer/src/i18n/locales/zh.json
M  src/renderer/src/lib/terminal-theme.test.ts
M  src/renderer/src/lib/terminal-theme.ts
A  src/renderer/src/runtime/sync-runtime-graph-automation-leaf.test.ts
M  src/renderer/src/runtime/sync-runtime-graph.ts
M  src/renderer/src/store/slices/settings.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/constants.ts
A  src/shared/terminal-custom-themes.test.ts
A  src/shared/terminal-custom-themes.ts
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

