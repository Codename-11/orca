# Orca (Axiom fork) — DEVLOG

Append-only session log for fork-specific work. Newest entries on top.
`main` tracks `upstream/main`. Fork work lands on `feat/*` branches and
merges into `axiom/deploy`.

---

## 2026-05-31 — Remediated upstream v1.4.36-rc.13 bot PR

Resolved the agent-remediation merge for upstream `v1.4.36-rc.13` on `bot/upstream-sync-axiom-v1.4.36-rc.13.axiom.1` targeting `axiom/deploy`; no direct deploy-branch push was made. The conflict resolution keeps the fork semver at `1.4.36-rc.13.axiom.1`, preserves Axiom side-by-side app/updater identity, profile portability, and Forge provider/task-registry support, while accepting upstream AppImage CLI redirect, WSL packaged-resource launcher checks, proxy settings, integrations preflight status, and settings network UI changes. Protected deletion review found no deleted files, including no protected Axiom file removals.

Verification:

- `pnpm install --frozen-lockfile` → passed. Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm run typecheck` → passed. Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 50 tests passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/main/cli/packaged-cli-assets.test.ts src/main/cli/wsl-cli-installer.test.ts src/main/ipc/settings.test.ts src/renderer/src/components/settings/GeneralPane.test.ts src/renderer/src/components/settings/integrations-pane-status.test.ts` → 43 tests passed.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `git diff --check` → passed.

---

## 2026-05-31 — Remediated upstream v1.4.36-rc.11 bot PR

Resolved the agent-remediation merge for upstream `v1.4.36-rc.11` on `bot/upstream-sync-axiom-v1.4.36-rc.11.axiom.1` targeting `axiom/deploy`; no direct deploy-branch push was made. The conflict resolution keeps the fork semver at `1.4.36-rc.11.axiom.1`, preserves Axiom side-by-side app/updater identity, profile portability, and Forge provider/task-registry support, while accepting upstream's memoization for mobile task create target options without exposing Forge to Linear team picker options. Protected deletion review found only upstream memory-leak audit doc deletions outside the protected Axiom path list.

Verification:

- `pnpm install --frozen-lockfile` → passed. Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm run typecheck` → passed. Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 50 tests passed.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `git diff --check` → passed.

---

## 2026-05-31 — Remediated upstream v1.4.36-rc.10 bot PR

Resolved the agent-remediation merge for upstream `v1.4.36-rc.10` on `bot/upstream-sync-axiom-v1.4.36-rc.10.axiom.1` targeting `axiom/deploy`; no direct deploy-branch push was made. The conflict resolution keeps the fork semver at `1.4.36-rc.10.axiom.1`, preserves Axiom side-by-side app/updater identity, profile portability, and Forge provider/task-registry support, while accepting upstream's shared store test helper extraction for the session cascade and tab tests. Protected deletion review found only upstream sidebar hover helper/test deletions outside the protected Axiom path list.

Verification:

- `pnpm install --frozen-lockfile` → passed. Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm run typecheck` → passed. Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 50 tests passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/store/slices/store-session-cascades.test.ts src/renderer/src/store/slices/tabs.test.ts` → 110 tests passed.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `git diff --check` → passed.

---

## 2026-05-28 — Remediated upstream v1.4.35-rc.1 bot PR

Resolved the agent-remediation merge for upstream `v1.4.35-rc.1` on `bot/upstream-sync-axiom-v1.4.35-rc.1.axiom.1` targeting `axiom/deploy`; no direct deploy-branch push was made. The conflict resolution keeps the fork semver at `1.4.35-rc.1.axiom.1`, preserves Axiom side-by-side app/updater identity, profile portability, and Forge provider/task-source support, while accepting upstream settings-change broadcast and disabled TUI-agent RPC updates. Protected deletion review found no protected Axiom files removed by the merge.

Verification:

- `pnpm install --frozen-lockfile` → passed. Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm run typecheck` → passed. Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 50 tests passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/main/ipc/settings.test.ts src/main/runtime/rpc/methods/client-ui.test.ts` → 18 tests passed.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `pnpm exec oxfmt --check package.json src/main/ipc/settings.test.ts src/main/ipc/settings.ts src/main/runtime/rpc/methods/client-ui.ts` → passed.
- `pnpm exec oxlint src/main/ipc/settings.test.ts src/main/ipc/settings.ts src/main/runtime/rpc/methods/client-ui.ts` → 0 warnings / 0 errors.
- `git diff --check` → passed.

---

## 2026-05-26 — Fixed mobile Android release bundling for shared task helpers

The Axiom release workflow for `axiom-v1.4.29-axiom.2` failed in the Android APK job because Metro could not resolve runtime imports from `mobile/app/h/[hostId]/tasks.tsx` to desktop-root shared modules outside the mobile package (`../../../../src/shared/workspace-name`). Added mobile-local mirrors for the workspace-name and Forge sort helpers, moved mobile runtime imports to those local modules, and added a regression test that blocks non-type mobile imports of desktop shared runtime modules.

Verification:
- `pnpm --dir mobile exec vitest run src/tasks/mobile-runtime-imports.test.ts src/tasks/workspace-create-params.test.ts`
- `pnpm --dir mobile exec oxfmt --check src/tasks/mobile-runtime-imports.test.ts src/tasks/workspace-name.ts src/tasks/forge-issue-sort.ts src/tasks/workspace-create-params.ts app/h/'[hostId]'/tasks.tsx`
- `pnpm --dir mobile exec oxlint src/tasks/mobile-runtime-imports.test.ts src/tasks/workspace-name.ts src/tasks/forge-issue-sort.ts src/tasks/workspace-create-params.ts app/h/'[hostId]'/tasks.tsx`
- `pnpm exec tsc -p mobile/tsconfig.json --noEmit`

Note: a local `expo export --platform android` progressed beyond the original `workspace-name` failure but stopped on local dependency resolution for `lowlight`; CI performs a fresh mobile install and did not hit that before the original failure.

---

## 2026-05-26 — Fixed Axiom updater stable-vs-RC ordering

Fixed the updater's fork-aware version semantics so Axiom stable fork revisions like `1.4.28-axiom.1` are treated as stable builds, while upstream prerelease-derived builds like `1.4.28-rc.7.axiom.1` remain prereleases. The release feed resolver now ranks stable Axiom releases above same-core Axiom RC tags, preventing `releases.atom` publish order from pinning clients to an older RC when a stable fork release exists.

Investigation notes:

- The alert for `Axiom Upstream Sync Release` run `26470723699` was caused by the optional Android mobile APK job failing to resolve `../../../../src/shared/workspace-name` from `mobile/app/h/[hostId]/tasks.tsx` while building `axiom-v1.4.28-rc.5.axiom.2`.
- The follow-up tag-push run `26470772225` auto-rebuilt/published the same RC tag successfully with mobile skipped, so the notification was actionable signal for the failed manual run, not a required operator intervention.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/main/updater.fallback.test.ts src/main/updater-prerelease-feed.test.ts src/main/updater.test.ts src/main/updater-endpoints.test.ts src/main/updater-nudge.test.ts src/main/updater-changelog.test.ts` → 104 tests passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/main/axiom-release-hardening.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 31 tests passed.
- `pnpm run typecheck` → passed; Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm exec oxfmt --check src/main/updater-fallback.ts src/main/updater.fallback.test.ts src/main/updater-prerelease-feed.test.ts` → passed.
- `pnpm exec oxlint src/main/updater-fallback.ts src/main/updater.fallback.test.ts src/main/updater-prerelease-feed.test.ts` → 0 warnings / 0 errors.
- `git diff --check` → passed.

---

## 2026-05-26 — Hardened release-cut GitHub Actions auth

Updated `.github/workflows/release-cut.yml` so every checkout and `gh` release API call uses `AXIOM_AUTOMATION_TOKEN` when present, falling back to `github.token`. This aligns release-cut with the Axiom upstream mirror/sync workflows and avoids the default scheduled-run token path that produced GitHub's misleading checkout-time `Your account is suspended` 403.

Verification:

- `pnpm exec oxfmt --check .github/workflows/release-cut.yml` → passed.
- `git diff --check -- .github/workflows/release-cut.yml` → passed.
- PyYAML parse of `.github/workflows/release-cut.yml` → `yaml_ok Cut Release jobs= cut,create-release,e2e,build,publish-release,homebrew-bump`.
- GitHub Actions dry-run `workflow_dispatch` for `release-cut.yml` (`26457342076`) → passed; checkout fetched `Codename-11/orca` without the prior `Your account is suspended` 403.

---

## 2026-05-25 — Remediated upstream v1.4.28-rc.4 bot PR

Resolved the bot remediation merge for upstream `v1.4.28-rc.4` on `bot/upstream-sync-axiom-v1.4.28-rc.4.axiom.1` targeting `axiom/deploy`. Kept the fork version at `1.4.28-rc.4.axiom.1`, preserved Axiom side-by-side app/updater identity and Forge integration surface, and accepted upstream's settings navigation metadata extraction by adding Forge search metadata into the new shared integrations search file and nav description.

Verification:

- `pnpm run typecheck` → passed; Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs src/renderer/src/hooks/useSettingsNavigationMetadata.test.ts src/renderer/src/components/settings/AgentsPane.test.tsx src/renderer/src/components/settings/QuickCommandsPane.test.ts` → 61 tests passed.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml package.json src/renderer/src/components/settings/IntegrationsPane.tsx src/renderer/src/components/settings/Settings.tsx src/renderer/src/components/settings/integrations-search.ts src/renderer/src/hooks/useSettingsNavigationMetadata.ts` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json package.json src/renderer/src/components/settings/IntegrationsPane.tsx src/renderer/src/components/settings/Settings.tsx src/renderer/src/components/settings/integrations-search.ts src/renderer/src/hooks/useSettingsNavigationMetadata.ts` → passed.
- `git diff --check` → passed.

---

## 2026-05-25 — Restored Axiom upstream RC release dispatches

Fixed the Axiom upstream sync release detector so explicit upstream release/tag bridge payloads for prereleases are honored instead of being skipped as generic prerelease discovery. The release workflow now sets `AXIOM_INCLUDE_PRERELEASES=1`, matching the documented Axiom RC cadence, and the detector keeps stable-only discovery available only when prereleases are not included and no explicit upstream tag was provided. Verified `v1.4.28-rc.4` now resolves to `1.4.28-rc.4.axiom.1` / `axiom-v1.4.28-rc.4.axiom.1` with `should_release=true`.

Verification:

- `GITHUB_REPOSITORY=Codename-11/orca AXIOM_UPSTREAM_REPOSITORY=stablyai/orca AXIOM_INCLUDE_PRERELEASES=0 GH_TOKEN="$(gh auth token)" node config/scripts/axiom-check-upstream-release.mjs --upstream-tag v1.4.28-rc.4` → `should_release=true`.
- `GITHUB_REPOSITORY=Codename-11/orca AXIOM_UPSTREAM_REPOSITORY=stablyai/orca AXIOM_INCLUDE_PRERELEASES=1 GH_TOKEN="$(gh auth token)" node config/scripts/axiom-check-upstream-release.mjs` → `should_release=true` for `v1.4.28-rc.4`.
- `pnpm exec vitest run --config config/vitest.config.ts config/scripts/axiom-upstream-sync-release.test.mjs config/scripts/hermes-repository-dispatch-watcher.test.mjs` → 30 tests passed.
- `pnpm exec oxlint config/scripts/axiom-check-upstream-release.mjs config/scripts/axiom-upstream-sync-release.test.mjs config/scripts/hermes-repository-dispatch-watcher.test.mjs` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-check-upstream-release.mjs config/scripts/axiom-upstream-sync-release.test.mjs .github/workflows/axiom-upstream-sync-release.yml` → passed.
- `git diff --check` → passed.

---

## 2026-05-24 — Remediated upstream v1.4.27 bot PR

Resolved the agent-remediation merge for upstream `v1.4.27` on `bot/upstream-sync-axiom-v1.4.27-axiom.1` targeting `axiom/deploy`; no direct deploy-branch push was made. The conflict resolution keeps the fork semver at `1.4.27-axiom.1`, preserves Axiom side-by-side app/updater identity, profile portability, and Forge provider/task-registry changes, and combines upstream's remote PTY parser test expectations with Axiom's deferred callback waits. Protected deletion review found no protected Axiom files removed by the merge.

Verification:

- `pnpm install --frozen-lockfile` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `pnpm run typecheck` → passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 50 tests passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.test.ts` → 23 tests passed.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `git diff --check` → passed.

---

## 2026-05-24 — Fixed Axiom Windows packaged CLI launcher

Merged latest upstream `main` / `v1.4.27-rc.0` into the Axiom deploy update branch and resolved the expected package-version conflict as `1.4.27-rc.0.axiom.1`. Fixed the packaged Windows CLI launcher regression caused by Axiom's fork executable rename: `resources/win32/bin/orca.cmd` no longer hardcodes `Orca.exe`. Windows packaging now writes `resources/orca-electron-executable.txt` during `afterPack` with the configured `ORCA_WINDOWS_EXECUTABLE_NAME` plus `.exe`, and the launcher reads that marker before falling back to upstream `Orca.exe`.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/main/cli/packaged-cli-assets.test.ts src/main/axiom-release-hardening.test.ts` → 7 tests passed.
- `pnpm exec oxfmt --check config/electron-builder.config.cjs src/main/axiom-release-hardening.test.ts src/main/cli/packaged-cli-assets.test.ts` → passed after formatting.
- `pnpm run typecheck` → passed; Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm exec vitest run --config config/vitest.config.ts src/main/cli/packaged-cli-assets.test.ts src/main/axiom-release-hardening.test.ts config/scripts/axiom-upstream-sync-release.test.mjs src/main/updater-endpoints.test.ts src/shared/task-providers.test.ts` → 50 tests passed.
- `pnpm exec oxlint config/electron-builder.config.cjs resources/win32/bin/orca.cmd src/main/axiom-release-hardening.test.ts src/main/cli/packaged-cli-assets.test.ts .github/workflows/axiom-upstream-sync-release.yml config/scripts/axiom-upstream-sync-release.test.mjs` → 0 warnings / 0 errors.
- `git diff --check` → passed.

---

## 2026-05-23 — Restored Forge visibility in mobile task sources

Verified the mobile Tasks path already had Forge list/detail/create support, but two mobile/desktop bridge gaps could hide it from the phone: the mobile home/tasks source filter treated `forge.status.connected === false` as "do not show Forge" instead of "show Forge with setup state", and the runtime `settings.update` RPC rejected `defaultTaskSource: 'forge'` plus did not accept `visibleTaskProviders` updates from mobile.

Fixed mobile to treat a successful `forge.status` RPC as Forge support even when the Forge account is not connected yet, so the source stays selectable and can explain the setup problem. Added a mobile Settings → Task Sources screen with per-paired-desktop switches for GitHub/GitLab/Linear/Forge visibility and tap-to-make-default behavior. Extended the desktop runtime RPC settings schema so mobile can persist Forge as a default source and update visible providers. Bumped the Axiom Android `versionCode` to `3` for an installable APK over the prior import-fix build.

Verification:

- `pnpm exec vitest run src/main/runtime/rpc/methods/client-ui.test.ts mobile/src/tasks/mobile-task-providers.test.ts` → 12 tests passed.
- `pnpm test` in `mobile/` → 108 tests passed.
- `pnpm exec tsc --noEmit` in `mobile/` → passed.
- `pnpm exec expo export --platform android --output-dir /tmp/orca-mobile-export` in `mobile/` → passed.
- `pnpm exec expo prebuild --platform android --clean` in `mobile/` → passed.
- `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` in `mobile/android/` → passed after restoring `android/local.properties` SDK path created by local prebuild.
- `apksigner verify --verbose --print-certs mobile/axiom-orca-mobile-0.0.9-vc3-forge-task-sources-arm64-release.apk` → verified v2 signing; signer SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.
- `aapt dump badging mobile/axiom-orca-mobile-0.0.9-vc3-forge-task-sources-arm64-release.apk` → package `com.axiomlabs.orca.mobile`, versionCode `3`, versionName `0.0.9`.
- `pnpm run typecheck:node` → passed; Node engine warning only (`wanted node 24`, local `v25.6.0`).
- `pnpm exec oxlint mobile/app/index.tsx mobile/app/settings.tsx mobile/app/task-settings.tsx mobile/app/_layout.tsx mobile/app/h/'[hostId]'/tasks.tsx mobile/src/tasks/mobile-task-providers.ts mobile/src/tasks/mobile-task-providers.test.ts src/main/runtime/rpc/methods/client-ui.ts src/main/runtime/rpc/methods/client-ui.test.ts` → 0 warnings / 0 errors.
- `git diff --check` → passed.

---

## 2026-05-23 — Fixed mobile host import file reader for Expo 55

Fixed the Axiom mobile import flow after Expo 55 started throwing at runtime when `readAsStringAsync` is imported from the top-level `expo-file-system` module. The import screen now reads picked backup JSON files through a small transport helper that imports the legacy filesystem API from `expo-file-system/legacy`, matching the SDK migration guidance while keeping the existing import parser/storage behavior unchanged.

Bumped the Axiom Android `versionCode` to `2` for the patched local APK so it can install over the first Axiom fork build. Built and verified a local arm64 release artifact at `mobile/axiom-orca-mobile-0.0.9-vc2-import-fix-arm64-release.apk` (not intended for source control).

Verification:

- `pnpm exec vitest run src/transport/import-file-reader.test.ts` → 1 test passed after first confirming the new regression test failed before the helper existed.
- `pnpm exec tsc --noEmit` → passed.
- `pnpm test` → 106 tests passed.
- `pnpm exec oxlint app/import-connections.tsx src/transport/import-file-reader.ts src/transport/import-file-reader.test.ts` → 0 warnings / 0 errors.
- `pnpm exec expo prebuild --platform android --clean` → passed.
- `./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` → passed.
- `apksigner verify --verbose --print-certs mobile/axiom-orca-mobile-0.0.9-vc2-import-fix-arm64-release.apk` → verified v2 signing; signer SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.
- `aapt dump badging mobile/axiom-orca-mobile-0.0.9-vc2-import-fix-arm64-release.apk` → package `com.axiomlabs.orca.mobile`, versionCode `2`, versionName `0.0.9`.

---

## 2026-05-23 — Remediated upstream v1.4.23-rc.0 bot PR

Resolved the agent-remediation merge for upstream `v1.4.23-rc.0` on `bot/upstream-sync-axiom-v1.4.23-rc.0.axiom.1` targeting `axiom/deploy`; no direct deploy-branch push was made. The conflict resolution keeps the fork semver at `1.4.23-rc.0.axiom.1`, preserves Axiom side-by-side app/updater identity, keeps profile portability and Forge provider/task-registry changes intact, and accepts upstream's terminal/settings test updates with the prior deferred PTY callback safeguards. Protected deletion review found no protected Axiom files removed by the merge.

Verification:

- `pnpm install --frozen-lockfile` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `pnpm run typecheck` → passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 48 tests passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/settings/TerminalPane.ghostty.test.ts src/renderer/src/components/settings/TerminalPane.pwsh.test.ts src/renderer/src/components/terminal-pane/remote-runtime-pty-transport.test.ts` → 28 tests passed.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `git diff --check` → passed.

---

## 2026-05-23 — Remediated upstream v1.4.22 bot PR

Resolved the agent-remediation merge for upstream `v1.4.22` on `bot/upstream-sync-axiom-v1.4.22-axiom.1` targeting `axiom/deploy`; no direct deploy-branch push was made. The conflict resolution keeps the fork semver at `1.4.22-axiom.1`, preserves the Axiom build label in Settings → General → Updates while adopting upstream's settings subsection header, keeps Forge-aware task provider sidebar shortcuts alongside upstream's opt-out mobile sidebar entry, and combines Axiom's Windows Kitty-keyboard guard with upstream's Windows PTY compatibility options. Protected deletion review found no protected Axiom files removed by the merge.

CI-only follow-up fixes updated terminal settings tests for upstream's shared `SettingsFormControls` extraction and waited for deferred remote PTY title/status side effects after the upstream processor began flushing them on the next event-loop turn.

Verification:

- `pnpm install --frozen-lockfile` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `pnpm run typecheck` → passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 47 tests passed.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `git diff --check` → passed.

---

## 2026-05-22 — Remediated upstream v1.4.21-rc.2 bot PR

Resolved the agent-remediation merge for upstream `v1.4.21-rc.2` on `bot/upstream-sync-axiom-v1.4.21-rc.2.axiom.1` targeting `axiom/deploy`; no direct deploy-branch push was made. The conflict resolution keeps the fork semver at `1.4.21-rc.2.axiom.1`, preserves Axiom's task-provider shortcut registry including Forge, and accepts upstream's mobile sidebar entry/onboarding badge. Protected deletion review found no protected Axiom files removed by the merge.

Verification:

- `pnpm install --frozen-lockfile` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `pnpm run typecheck` → passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 46 tests passed.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `git diff --check` → passed.

---

## 2026-05-21 — Verified automation setup and tightened release notes delta

Verified the upstream sync automation is enabled end-to-end: repository dispatch variables for releases and main mirror are `true`, the remediation webhook/token secrets are present, Victor's webhook route is live on `/webhooks/orca-merge-remediation`, recent upstream release and main dispatch runs completed successfully, and bot remediation PRs #4/#5 were created with green checks and merged into `axiom/deploy`.

Fixed Axiom release-note fallback generation so it no longer dumps the full fork history. `config/scripts/axiom-generate-release-notes.mjs` now receives the fork tag/version from the workflow, chooses the nearest prior Axiom revision/release as the commit baseline, and excludes commits already reachable from the upstream release tag. Updated the published notes for `axiom-v1.4.18-rc.0.axiom.2`; the fallback section is now the intended short Axiom delta instead of a huge historical list.

Verification:

- `node --check config/scripts/axiom-generate-release-notes.mjs && node --check config/scripts/axiom-upstream-sync-release.test.mjs` → passed.
- `pnpm exec vitest run --config config/vitest.config.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 21 tests passed.
- `pnpm exec oxlint config/scripts/axiom-generate-release-notes.mjs config/scripts/axiom-upstream-sync-release.test.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-generate-release-notes.mjs config/scripts/axiom-upstream-sync-release.test.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `pnpm run typecheck` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `git diff --check` → passed.
- `gh release edit -R Codename-11/orca axiom-v1.4.18-rc.0.axiom.2 --notes-file /tmp/axiom-release-notes-rc0-axiom2-fixed.md` → updated release notes; verified body is 1,213 bytes with 7 bullet lines total.

---

## 2026-05-21 — Remediated upstream v1.4.18-rc.4 bot PR

Resolved the agent-remediation merge for upstream `v1.4.18-rc.4` on `bot/upstream-sync-axiom-v1.4.18-rc.4.axiom.1` targeting `axiom/deploy` without pushing directly to the deploy branch. The conflict resolution preserves Axiom's fork semver (`1.4.18-rc.4.axiom.1`), env-driven app/update/installer identity in `config/electron-builder.config.cjs`, provider registry shortcuts including Forge, and upstream's newer sidebar unread-count extraction plus Linux icon packaging fix. Protected deletion review found no protected Axiom files removed by the merge.

Verification:

- `pnpm install --frozen-lockfile` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `pnpm run typecheck` → passed.
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 45 tests passed.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `git diff --check` → passed.

---

## 2026-05-21 — Classified upstream-sync remediation pipeline

Converted Axiom Orca upstream release conflicts from noisy workflow failures into classified remediation flow. `config/scripts/axiom-sync-upstream-release.mjs` now emits `merge_result=agent_remediate` for unsafe conflicts instead of failing the whole release job, causing publish/build steps to skip while `config/scripts/axiom-request-merge-remediation.mjs` creates/updates a `bot/upstream-sync-*` branch, writes a remediation metadata commit, opens/updates a PR into `axiom/deploy`, and then optionally dispatches Hermes via HMAC-signed webhook. The safe `package.json` top-level version auto-resolver remains the only automatic merge resolver.

Hardened failure routing so non-critical sync state is durable rather than chat-noisy: GitHub issue upsert remains the fallback, `AXIOM_SYNC_FORGE_WEBHOOK` can receive Forge task payloads when configured, and Discord posts only when `AXIOM_SYNC_FAILURE_SEVERITY=critical` such as release build/publish or mirror infrastructure failures. The main mirror workflow now uses `AXIOM_MIRROR_TOKEN` / `AXIOM_AUTOMATION_TOKEN` fallback support so upstream workflow-file changes can be mirrored with a token that has workflow scope, while `main` stays a clean upstream mirror. Follow-up live testing showed the mirror must run from the Axiom workflow branch and force-update `main` to the upstream ref; the mirror workflow now checks out `axiom/deploy` for scripts while pushing `+upstream/main:main`.

Verification:

- `node --check config/scripts/axiom-sync-upstream-release.mjs && node --check config/scripts/axiom-request-merge-remediation.mjs && node --check config/scripts/axiom-report-sync-failure.mjs` → passed.
- `pnpm exec vitest run --config config/vitest.config.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 19 tests passed.
- `pnpm run typecheck` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `pnpm exec oxlint config/scripts/axiom-sync-upstream-release.mjs config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check config/scripts/axiom-sync-upstream-release.mjs config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs config/scripts/axiom-upstream-sync-release.test.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json` → passed.
- `git diff --check` → passed.

---

## 2026-05-21 — Gated upstream dispatch automation after noisy failures

Disabled unattended upstream repository-dispatch automation by default while preserving manual workflow dispatches and Axiom tag-triggered releases. `Axiom Upstream Sync Release` now only responds to upstream dispatch events when `AXIOM_AUTO_RELEASES=true`; `Axiom Upstream Main Mirror` now only responds to upstream dispatch events when `AXIOM_AUTO_MAIN_MIRROR=true`. Both repository variables were set to `false` to stop duplicate failure emails while upstream `v1.4.18-rc.2` conflicts await intentional remediation.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 19 tests passed.
- `git diff --check` → passed.
- `pnpm exec oxfmt --check .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/scripts/axiom-upstream-sync-release.test.mjs` → passed.

---

## 2026-05-21 — Profile import/export portability

Added a first pass at global Orca/Axiom profile portability from Settings → General → Data Portability. Users can export a versioned JSON profile and import either that export envelope or a raw upstream `orca-data.json`; imports preview discovered sections and create a `profile-import-backups/` snapshot before replacing selected sections.

The export path intentionally omits local auth material: OpenCode session cookies, managed Codex/Claude account auth records, active managed-account selections, and private Kagi browser session links are stripped while preserving repositories, workspace metadata/session state, sparse presets, SSH host definitions, automations, automation run history, onboarding, settings, and UI preferences.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/shared/profile-portability.test.ts src/main/ipc/settings.test.ts` → 11 tests passed.
- `pnpm run typecheck` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `pnpm exec oxlint ...` on touched profile portability/settings files → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check ...` on touched profile portability/settings files → passed after formatting.
- `git diff --check` → passed.

---

## 2026-05-21 — Agent-assisted upstream remediation and WSL status hardening

Added the next layer of Axiom upstream-sync automation: when the release sync workflow fails after `should_release`, it now runs `config/scripts/axiom-request-merge-remediation.mjs`. The script classifies merge failures against `config/axiom-merge-remediation-policy.json`, requests Hermes/agent PR remediation via `AXIOM_SYNC_REMEDIATION_WEBHOOK` for eligible conflicts, and treats protected Axiom deletions or fork identity/update-feed conflicts as review-required true blocks. The generated remediation prompt explicitly requires a bot branch/PR into `axiom/deploy` and forbids direct deploy-branch pushes.

Fixed the random Settings toast for `cli:getWslInstallStatus`: WSL CLI status probes now convert failed WSL inspection commands such as `$HOME` resolution into an inline unsupported status instead of throwing through IPC and surfacing a raw Electron remote-method error toast.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts config/scripts/axiom-upstream-sync-release.test.mjs src/main/cli/wsl-cli-installer.test.ts` → 26 tests passed.
- `pnpm run typecheck` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-upstream-sync-release.test.mjs src/main/cli/wsl-cli-installer.ts src/main/cli/wsl-cli-installer.test.ts` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check .github/workflows/axiom-upstream-sync-release.yml config/axiom-merge-remediation-policy.json config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-upstream-sync-release.test.mjs src/main/cli/wsl-cli-installer.ts src/main/cli/wsl-cli-installer.test.ts` → passed.
- `node --check config/scripts/axiom-request-merge-remediation.mjs && node --check config/scripts/axiom-upstream-sync-release.test.mjs` → passed.
- `git diff --check` → passed.

---

## 2026-05-21 — Merged upstream v1.4.16 into Axiom deploy lane

Resolved the upstream `v1.4.16` merge blockage on `axiom/deploy` while preserving the Axiom fork identity and Forge task-provider work. The deploy package version is now `1.4.16-axiom.1`; the conflict resolution kept upstream relay/socket-safety changes, upstream GitLab task-list refinements, and Axiom's Forge provider surface together.

Added a Hermes-side Discord safety net for release-sync failures: script-only cron job `Orca Axiom release failure Discord watcher` (`2fe5307843cb`) runs every 10 minutes and delivers to the originating Discord thread only when a new failed `Axiom Upstream Sync Release` run appears. The GitHub workflow still supports direct Discord webhooks via `AXIOM_SYNC_DISCORD_WEBHOOK` when that repository secret is configured.

Verification:

- `pnpm run typecheck` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/updater-prerelease-feed.test.ts src/main/updater-nudge.test.ts src/main/updater-changelog.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 90 tests passed.
- `pnpm exec oxlint src/shared/task-providers.ts src/shared/task-providers.test.ts src/renderer/src/components/TaskPage.tsx` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --write` on touched conflict-resolution files → completed.
- `git diff --cached --check` → passed.

---

## 2026-05-20 — Fork release notes and updater re-check polish

Enhanced the Axiom release-notes pipeline so fork releases can combine upstream Orca release notes with optional agent-generated Axiom patch/deviation notes, then fall back to a generated fork commit list when no richer notes file is provided. The release notes generator now accepts `--deviation-notes` / `AXIOM_RELEASE_DEVIATION_NOTES_FILE`, keeps upstream attribution, and still caps body sections below GitHub release limits.

Updated the in-app updater surfaces to point release-note links at the configured update repository. Axiom builds now resolve available-update URLs to `https://github.com/Codename-11/orca/releases/tag/axiom-v...`, while upstream builds continue to resolve to `stablyai/orca` tags. Fork builds without a configured changelog JSON now fall back to GitHub Releases instead of upstream `onorca.dev` changelog content.

Broadened automatic update checks to common desktop app triggers: startup/interval behavior is unchanged, and stale checks now also run on app activation and main-window show in addition to resume/focus, with existing in-flight dedupe and retry cadence preserved.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/main/updater-endpoints.test.ts src/main/updater.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 64 tests passed.
- `pnpm run typecheck` → passed. Node engine warning only: project wants Node 24; local runtime is Node v25.6.0.
- `pnpm exec oxlint src/main/updater.ts src/main/updater-events.ts src/main/updater-endpoints.ts src/main/updater.test.ts src/main/updater-endpoints.test.ts src/renderer/src/components/UpdateCard.tsx src/shared/types.ts` → 0 warnings / 0 errors.
- `pnpm exec oxfmt --check ...` on touched scripts/updater files → passed after formatting.
- `git diff --check` → passed.

---

## 2026-05-20 — Restored Axiom upstream auto-deploy path

Resolved the protected `v1.4.14-rc.0` upstream merge into `axiom/deploy` while preserving both sides of the settings UI collision: Axiom's visible build identity label remains in the Updates section, and upstream's desktop platform detection now powers the CLI section with Windows support. The Axiom package version for the deploy lane is now `1.4.14-rc.0.axiom.1`.

Hardened `config/scripts/axiom-sync-upstream-release.mjs` for the chronic safe conflict: if an upstream merge conflicts only on `package.json`'s top-level version line, the script resolves that file to the computed fork version, stages it, and completes the merge. Any additional or non-version conflicts still fail loudly with diagnostics so fork identity/update settings cannot be clobbered automatically.

Verification so far:

- `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/settings/GeneralPane.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 20 tests passed.
- `git diff --check` → passed after the merge commit.

---

## 2026-05-20 — Hermes upstream dispatch watcher

Added a reusable Hermes-owned repository-dispatch watcher at
`config/scripts/hermes-repository-dispatch-watcher.mjs`. The script polls an
upstream repository's latest semver tag plus branch SHA, compares against a
profile-local state file, and sends `repository_dispatch` events only for changed
surfaces. It is generic via `--upstream-repo`, `--target-repo`, event-name, branch,
and state-file flags; it reads GitHub auth from `GH_TOKEN` / `GITHUB_TOKEN` or
`gh auth token`, stays silent on success, and prints only concise actionable
errors on failure.

Installed the live Hermes script-only wrapper at
`~/.hermes/scripts/orca-upstream-watcher.sh` and registered the enabled Hermes
cron job `Orca Upstream Dispatch Watcher` (`e029ff924c8c`) on `every 15m` with
`no_agent: true`; a manual scheduler run completed with `last_status: ok`. The
state file is
`~/.hermes/state/orca-upstream-watcher.json`. A manual dry run showed no pending
dispatches after state bootstrap for upstream `v1.4.14-rc.0` and main SHA
`e88b4d1a160919db83d4c4d38cbdaf9e919fe6b9`.

Documented the reusable pattern in
`docs/reference/hermes-repository-dispatch-watcher.md`, linked it from
`docs/reference/README.md`, and added the Hermes watcher handoff to
`docs/reference/axiom-release-readiness.md`.

Bootstrap dispatch smoke: manually sent an `upstream_release` dispatch for
`v1.4.14-rc.0` after the watcher detected the current upstream tag. GitHub run
`26195770072` proved the dispatch path works, then failed loudly in the protected
sync step due upstream merge conflicts in `package.json`,
`src/renderer/src/components/settings/GeneralPane.test.ts`, and
`src/renderer/src/components/settings/GeneralPane.tsx`. The workflow's durable
failure notifier completed successfully.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts config/scripts/hermes-repository-dispatch-watcher.test.mjs config/scripts/axiom-upstream-sync-release.test.mjs` → 20 tests passed.
- `node --check config/scripts/hermes-repository-dispatch-watcher.mjs` → passed.
- `pnpm run typecheck` → passed.
- `pnpm exec oxlint ...` on watcher/tests/docs → passed.
- `pnpm exec oxfmt --check ...` on watcher/tests/docs → passed after formatting.
- `git diff --check` → passed.

---

## 2026-05-20 — Event-driven upstream hooks for releases and main mirror

Replaced the Axiom release workflow's interval timer with event-driven triggers.
Upstream release/tag hooks now enter through `repository_dispatch` event types
`upstream_release` / `upstream_tag` with `client_payload.upstream_tag`, `tag`, or
`ref`; manual release tests still use `workflow_dispatch`, and Axiom-only releases
still support pushed `axiom-v*` tags. The workflow no longer references
`AXIOM_AUTO_RELEASES` or a cron schedule.

Added `.github/workflows/axiom-upstream-main-sync.yml` as a separate clean-mirror
path for upstream commits. It accepts `repository_dispatch` events
`upstream_main` / `upstream_push` (or manual dispatch), ignores non-main refs, and
fast-forwards fork `main` from `stablyai/orca/main` without touching
`axiom/deploy` or publishing releases. Updated release readiness docs with example
GitHub dispatch payloads for a webhook bridge.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 14 tests passed.
- `pnpm run typecheck` → passed.
- `pnpm exec oxlint ...` on touched workflows/docs/tests → passed.
- `pnpm exec oxfmt --check ...` on touched workflows/docs/tests → passed after formatting tests.
- Parsed both Axiom workflow YAML files with PyYAML → passed.
- `git diff --check` → passed.
- Manual `Axiom Upstream Main Mirror` dispatch run `26194139870` succeeded and
  fast-forwarded fork `main` to match `stablyai/orca/main`.
- Repository-dispatch release hook smoke run `26194168256` succeeded and stopped
  at the already-published `axiom-v1.4.13-axiom.1` release.
- Repository-dispatch main hook smoke run `26194186289` succeeded as a no-op once
  fork `main` was already aligned.

---

## 2026-05-20 — Tag-only Axiom release triggers and updater tag parsing

Hardened the Axiom release lane so it only reacts to intentional release tags:
upstream release detection now polls semver `stablyai/orca` tags instead of arbitrary
branch changes, and the workflow also accepts pushed/manual `axiom-v*` fork tags for
fork-only revisions. Axiom tag builds checkout the tag, skip upstream merge/main
mirror mutation, verify the tag-encoded fork version matches `package.json`, then
build/publish assets from that exact tag. Upstream-derived releases still merge the
upstream tag into `axiom/deploy`, fast-forward the clean `main` mirror from upstream,
and create the next `axiom-v<version>-axiom.N` tag only outside dry runs.

The updater feed parser now normalizes `axiom-v...` tags to semver while preserving
the actual tag URL, so packaged Axiom builds can pin directly to fork releases rather
than relying only on GitHub's `/latest` redirect. The fork update endpoint remains
`Codename-11/orca` via `ORCA_UPDATE_OWNER`/`ORCA_UPDATE_REPO`.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/main/updater-prerelease-feed.test.ts src/main/updater-endpoints.test.ts config/scripts/axiom-upstream-sync-release.test.mjs` → 31 tests passed.
- `pnpm run typecheck` → passed.
- `node --check` on changed Axiom release scripts → passed.
- `node config/scripts/verify-axiom-release-version.mjs 1.4.13-axiom.1 axiom-v1.4.13-axiom.1` → passed.
- Parsed `.github/workflows/axiom-upstream-sync-release.yml` with PyYAML → passed.
- `pnpm exec oxlint ...` on touched workflow/scripts/updater tests → passed.
- `pnpm exec oxfmt --check ...` on touched workflow/scripts/updater tests → passed.
- `git diff --check` → passed.
- Follow-up publish gate fix: release asset verification now honors
  `ORCA_RELEASE_PLATFORMS=win,android` and `ORCA_ARTIFACT_BASENAME=axiom-orca`, so
  Axiom releases require only the intended fork Windows assets plus APK when mobile
  is requested instead of upstream macOS/Linux/orca-named assets.
- Live detector smoke checks against GitHub returned `should_release=true` for both
  upstream `v1.4.13` and manual `axiom-v1.4.13-axiom.1` without exposing secrets.

---

## 2026-05-20 — Fork-versioned Axiom upstream releases

Converted Axiom upstream sync from upstream-tag reuse to fork-owned release
versions/tags. Upstream releases now resolve to `1.4.x-axiom.N` app versions and
`axiom-v1.4.x-axiom.N` release tags, while manual Axiom-only builds can publish
the next revision with `bump_axiom_revision` or a specific `axiom_revision`. The
workflow tracks upstream prereleases so RC automation stays aligned with the code
merged from upstream `main`, continues to mirror `upstream/main` into `main`,
releases only from `axiom/deploy`, and points packaged update feeds at
`Codename-11/orca`.

Added a durable failure reporter that upserts one `axiom-upstream-sync` GitHub
issue, with optional Discord webhook support, when merge/test/build/publish fails.
The reporter captures the upstream tag/ref, fork tag/version, deploy branch,
run URL, conflicted files, and git status so scheduled failures are actionable
instead of just red CI runs.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts config/scripts/axiom-upstream-sync-release.test.mjs src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/updater-prerelease-feed.test.ts src/main/updater-nudge.test.ts src/main/updater-changelog.test.ts src/main/app-build-identity.test.ts src/shared/task-providers.test.ts src/renderer/src/components/forge/ForgeIssueDetailDrawer.test.tsx src/renderer/src/components/forge/forge-agent-filter.test.ts src/main/forge/issues.test.ts` → 97 tests passed.
- `pnpm run typecheck` → passed.
- `node --check` on Axiom release scripts → passed.
- Parsed `.github/workflows/axiom-upstream-sync-release.yml` with PyYAML → passed.
- Manual dry-run dispatch on `axiom/deploy` for upstream `v1.4.13-rc.2` → run
  `26182708728` completed successfully without publishing release assets.
- Follow-up scheduled run for upstream `v1.4.13` verified/merged successfully, then
  failed while creating the draft release because GitHub rejected oversized
  upstream release notes. Capped generated release notes below GitHub's release
  body limit and verified the generated notes for `v1.4.13` are under 125 KB.

---

## 2026-05-20 — Axiom upstream sync workflow safety

Ported and hardened the fork-only upstream release automation onto
`feat/forge-provider`. The workflow checks out and publishes from `axiom/deploy`,
fast-forwards `main` only from `upstream/main`, injects the Axiom build/update
identity for release jobs, and verifies fork release tests before tagging. The
sync script now refuses unexpected branch names, prints actionable conflict
diagnostics on merge failure, and guards Axiom identity files after upstream sync
so package/update settings cannot be silently clobbered.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts config/scripts/axiom-upstream-sync-release.test.mjs src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts` → 12 tests passed.
- `node --check config/scripts/axiom-check-upstream-release.mjs && node --check config/scripts/axiom-sync-upstream-release.mjs && node --check config/scripts/axiom-generate-release-notes.mjs` → passed.
- Parsed `.github/workflows/axiom-upstream-sync-release.yml` with PyYAML → passed.
- `pnpm exec oxlint config/scripts/axiom-upstream-sync-release.test.mjs .github/workflows/axiom-upstream-sync-release.yml` → passed.
- `pnpm exec oxfmt --check ...` on Axiom workflow/scripts → passed.
- `git diff --check` → passed.

---

## 2026-05-20 — Wave 11 release readiness docs and verification

Added `docs/reference/axiom-release-readiness.md` as the durable checklist for
fork branch policy, Axiom identity constants, update-feed safety, and release
verification commands. Linked it from `docs/reference/README.md` so future agents
can find it without searching the DEVLOG.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/renderer/src/components/task-providers/provider-ui-registry.test.tsx src/renderer/src/components/forge/ForgeIssueDetailDrawer.test.tsx src/renderer/src/components/forge/ForgeIssueCreateDialog.test.tsx src/renderer/src/components/forge/forge-agent-filter.test.ts src/main/forge src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/updater-prerelease-feed.test.ts src/main/updater.test.ts src/main/updater-nudge.test.ts src/main/updater-changelog.test.ts src/main/app-build-identity.test.ts src/renderer/src/components/settings/GeneralPane.test.ts` → 172 tests passed.
- `pnpm run typecheck` → passed.
- `pnpm exec oxlint ...` on docs plus touched release/build identity files → passed.
- `pnpm exec oxfmt --check ...` on docs plus touched release/build identity files → passed after formatting docs.
- `git diff --check` → passed.

---

## 2026-05-20 — Wave 10 visible Axiom Orca build identity

Added renderer-safe build identity plumbing so packaged fork builds can show
`Axiom Orca` as the visible app/build name instead of relying on the upstream
Orca label. The main process now resolves compile-time app name / User Model ID
constants for packaged startup, exposes a safe `updater:getBuildInfo` IPC
payload, and the General settings update section displays `Current build:
<name> <version>`.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/main/app-build-identity.test.ts src/renderer/src/components/settings/GeneralPane.test.ts src/main/window/attach-main-window-services.test.ts` → 12 tests passed.
- `pnpm run typecheck` → passed.
- `pnpm exec oxlint ...` on touched Wave 10 files → passed.
- `pnpm exec oxfmt --check ...` on touched Wave 10 files → passed.
- `git diff --check` → passed.

---

## 2026-05-20 — Wave 9 Axiom updater and release hardening

Hardened the fork build and updater path so Axiom Orca releases stay isolated
from upstream Orca. Desktop packaging now supports env-driven app/package
identity, fork-owned artifact names, the Axiom NSIS GUID
`b6c06723-a52f-5004-ad9f-f39666f5e928`, and a narrowed Windows running-app
check that only targets the exact Axiom executable. The updater/changelog/nudge
paths now resolve through a repository/endpoint abstraction so Axiom builds can
consume `Codename-11/orca` releases without falling back to upstream assets, and
Android now uses the fork-owned `com.axiomlabs.orca.mobile` package for
side-by-side installs.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/updater-prerelease-feed.test.ts src/main/updater.test.ts src/main/updater-nudge.test.ts src/main/updater-changelog.test.ts`
- `pnpm run typecheck`
- `pnpm exec oxlint config/electron-builder.config.cjs electron.vite.config.ts mobile/app.json resources/build/installer.nsh src/main/axiom-release-hardening.test.ts src/main/updater-changelog.ts src/main/updater-endpoints.ts src/main/updater-endpoints.test.ts src/main/updater-nudge.ts src/main/updater-prerelease-feed.ts src/main/updater.ts src/types/build-constants.d.ts`
- `pnpm exec oxfmt --check config/electron-builder.config.cjs electron.vite.config.ts mobile/app.json resources/build/installer.nsh src/main/axiom-release-hardening.test.ts src/main/updater-changelog.ts src/main/updater-endpoints.ts src/main/updater-endpoints.test.ts src/main/updater-nudge.ts src/main/updater-prerelease-feed.ts src/main/updater.ts src/types/build-constants.d.ts`
- `git diff --check`

---

## 2026-05-20 — Forge provider Wave 8 agent-oriented filters

Added agent-oriented Forge issue filtering across the renderer, runtime client,
preload boundary, IPC validation, and main-process Forge MCP calls. The Forge task
source now includes an agent selector with All agents, Unassigned, and discovered
Forge agents, and the chosen constraint is forwarded server-side for both preset
lists and search. The filtering helper and main Forge issue transport behavior are
covered by targeted tests.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/forge/forge-agent-filter.test.ts src/main/forge/issues.test.ts`
- `pnpm run typecheck`
- `pnpm exec oxlint src/main/forge/issues.ts src/main/forge/issues.test.ts src/main/ipc/forge.ts src/preload/index.ts src/preload/api-types.ts src/renderer/src/runtime/runtime-forge-client.ts src/renderer/src/components/TaskPage.tsx src/renderer/src/components/forge/forge-agent-filter.ts src/renderer/src/components/forge/forge-agent-filter.test.ts src/shared/forge-types.ts src/shared/types.ts`
- `pnpm exec oxfmt --check src/main/forge/issues.ts src/main/forge/issues.test.ts src/main/ipc/forge.ts src/preload/index.ts src/preload/api-types.ts src/renderer/src/runtime/runtime-forge-client.ts src/renderer/src/components/TaskPage.tsx src/renderer/src/components/forge/forge-agent-filter.ts src/renderer/src/components/forge/forge-agent-filter.test.ts src/shared/forge-types.ts src/shared/types.ts`
- `git diff --check`

---

## 2026-05-20 — Forge provider Wave 7 onboarding and empty states

Added a Forge empty-state model and reusable panel for task-source onboarding. The Forge
list and board now distinguish missing/disconnected Forge auth, missing board statuses,
empty search results, filtered-out issue sets, and truly empty workspaces, with inline
CTAs for refresh, clear search, and new issue creation. The UI uses the sanitized
`forgeConnectionStatus` metadata only; renderer code still never handles Forge tokens.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/forge/forge-empty-state.test.tsx src/renderer/src/components/forge/ForgeIssueEmptyStatePanel.test.tsx`
- `pnpm run typecheck`
- `pnpm exec oxlint src/renderer/src/components/TaskPage.tsx src/renderer/src/components/forge/forge-empty-state.ts src/renderer/src/components/forge/forge-empty-state.test.tsx src/renderer/src/components/forge/ForgeIssueEmptyStatePanel.tsx src/renderer/src/components/forge/ForgeIssueEmptyStatePanel.test.tsx`
- `pnpm exec oxfmt --check src/renderer/src/components/TaskPage.tsx src/renderer/src/components/forge/forge-empty-state.ts src/renderer/src/components/forge/forge-empty-state.test.tsx src/renderer/src/components/forge/ForgeIssueEmptyStatePanel.tsx src/renderer/src/components/forge/ForgeIssueEmptyStatePanel.test.tsx`
- `git diff --check`

---

## 2026-05-20 — Forge provider Wave 6 richer auth/workspace status

Expanded Forge connection status with sanitized auth/source metadata and workspace slug.
The Forge task toolbar now displays connected/error state, workspace name/slug, base URL,
and whether auth comes from a saved token or environment token without exposing token
values. Added main-process tests for sanitized workspace/auth status.

Verification:

- `pnpm run typecheck`
- `pnpm exec vitest run --config config/vitest.config.ts src/main/forge/issues.test.ts src/renderer/src/lib/forge-links.test.ts src/renderer/src/components/forge/ForgeIssueDetailDrawer.test.tsx`
- `pnpm exec oxlint src/main/forge/issues.ts src/main/forge/issues.test.ts src/renderer/src/components/TaskPage.tsx src/shared/forge-types.ts`
- `pnpm exec oxfmt --check src/main/forge/issues.ts src/main/forge/issues.test.ts src/renderer/src/components/TaskPage.tsx src/shared/forge-types.ts`
- `git diff --check`

---

## 2026-05-20 — Forge provider Wave 5 default project/status preferences

Persisted Forge issue-creation defaults in global settings (`defaultForgeProjectId`,
`defaultForgeStatusId`). The Forge composer now initializes from those preferences,
lets users adjust project/status inline, saves changes server-side, and applies the
default status after issue creation via the existing Forge transition path.

Verification:

- `pnpm run typecheck`
- `pnpm exec vitest run --config config/vitest.config.ts src/main/forge/issues.test.ts src/renderer/src/lib/forge-links.test.ts src/renderer/src/components/forge/ForgeIssueDetailDrawer.test.tsx`
- `pnpm exec oxlint src/renderer/src/components/TaskPage.tsx src/shared/types.ts src/shared/constants.ts`
- `pnpm exec oxfmt --check src/renderer/src/components/TaskPage.tsx src/shared/types.ts src/shared/constants.ts`
- `git diff --check`

---

## 2026-05-20 — Forge provider Wave 4 issue creation

Added a Forge issue composer to the Forge task source toolbar. The composer
supports title, optional markdown description, project selection, priority,
Cmd/Ctrl+Enter submit, optimistic list insertion, refresh invalidation, and
automatically opens the new issue in the Forge detail drawer. Issue creation
continues through the existing runtime/main-process Forge IPC path; renderer
code never handles Forge API tokens.

Verification:

- `pnpm run typecheck`
- `pnpm exec vitest run --config config/vitest.config.ts src/main/forge/issues.test.ts src/renderer/src/lib/forge-links.test.ts src/renderer/src/components/forge/ForgeIssueDetailDrawer.test.tsx`
- `pnpm exec oxlint src/renderer/src/components/TaskPage.tsx src/main/forge/issues.ts src/main/forge/issues.test.ts src/renderer/src/lib/forge-links.ts src/renderer/src/lib/forge-links.test.ts`
- `pnpm exec oxfmt --check src/renderer/src/components/TaskPage.tsx src/main/forge/issues.ts src/main/forge/issues.test.ts src/renderer/src/lib/forge-links.ts src/renderer/src/lib/forge-links.test.ts`
- `git diff --check`

---

## 2026-05-20 — Forge provider Wave 3 canonical links

Added Forge link helpers so renderer code only opens server-provided http(s)
issue URLs and uses the issue identifier as the safe agent reference fallback.
The Forge detail drawer now exposes an “Open in Forge” action when a canonical
URL is available, and new workspaces receive the canonical Forge URL instead of
a synthetic `forge:` pseudo-link.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/lib/forge-links.test.ts src/renderer/src/components/forge/ForgeIssueDetailDrawer.test.tsx`
- `pnpm run typecheck`

---

## 2026-05-20 — Forge provider Wave 2 detail drawer

Added a Forge issue detail drawer with Linear-style read/edit parity for title,
identifier, project, status, priority, labels, assigned agent, description, and
comments. Forge rows now open details first while preserving the explicit “Use
issue” workspace action. Mutations continue through the existing renderer runtime
client and main-process Forge IPC path; label updates now support explicit add
and remove deltas, and detail metadata loads are guarded against stale async
responses.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/main/forge/issues.test.ts src/renderer/src/components/forge/ForgeIssueDetailDrawer.test.tsx src/shared/task-providers.test.ts src/renderer/src/components/task-providers/provider-ui-registry.test.tsx`
- `pnpm run typecheck`
- `pnpm exec oxlint src/main/forge/issues.ts src/main/forge/issues.test.ts src/shared/forge-types.ts src/renderer/src/components/TaskPage.tsx src/renderer/src/components/forge/ForgeIssueDetailDrawer.tsx src/renderer/src/components/forge/ForgeIssueDetailDrawer.test.tsx`
- `pnpm exec oxfmt --check src/main/forge/issues.ts src/main/forge/issues.test.ts src/shared/forge-types.ts src/renderer/src/components/TaskPage.tsx src/renderer/src/components/forge/ForgeIssueDetailDrawer.tsx src/renderer/src/components/forge/ForgeIssueDetailDrawer.test.tsx`
- `git diff --check`

---

## 2026-05-19 — Forge provider Wave 1 registry seam

Added a renderer task-provider UI registry so provider labels, icons, settings
routing, onboarding copy, and capability flags live in one place instead of being
duplicated between Task Sources and the Tasks page source picker. Forge now
shares the same metadata path as GitHub/GitLab/Linear while provider auth/RPC
remains concrete and main-process-safe.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/task-providers/provider-ui-registry.test.tsx`
- `pnpm run typecheck`
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/renderer/src/components/task-providers/provider-ui-registry.test.tsx`

---

## 2026-05-19 — Forge provider Wave 0 audit

Added `docs/reference/task-provider-surface-map.md` to capture the current
hardcoded provider seams and the smallest upstream-compatible abstraction path:
start with provider UI metadata/capabilities, keep provider auth/RPC concrete,
and leave Axiom release/update identity outside any upstream PR shape.

Verification:

- `pnpm run typecheck`
- `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/forge src/renderer/src/store/slices/forge.test.ts src/renderer/src/runtime/runtime-forge-client.test.ts`

---

## 2026-05-19 — Forge provider enhancement plan

Added `docs/plans/2026-05-19-forge-provider-enhancements.md` to sequence the
remaining Forge provider work: Linear-style issue details, canonical Forge links,
issue creation, Forge defaults, richer auth/workspace status, onboarding empty
states, agent-native filters, Axiom build identity, and updater hardening for
fork-only releases. The plan keeps Forge work upstream-compatible by separating
provider registry seams from fork-specific implementation and preserving the
`main` / `feat/forge-provider` / `axiom/deploy` branch contract.

---

## 2026-05-19 — Forge integration settings polish

Moved Forge connection management out of Task Sources and into Integrations so
it sits with GitHub/GitLab/Linear auth setup. Added the Forge anvil/ember brand
icon as a shared renderer icon and reused it in the Tasks source picker, Task
page source selector, and Forge integration card. Settings search now routes
Forge API key/base URL queries to Integrations while Task Sources stays focused
on provider visibility.

---

## 2026-05-19 — Axiom installer running-app check narrowed

Added a fork-specific NSIS include so the Windows installer only detects and
closes the exact Axiom executable path (`$INSTDIR\\Axiom Orca.exe`).
electron-builder's default macro checks for any process whose path starts with
`$INSTDIR`, which is too broad for side-by-side fork installs and can surface
an `Axiom Orca is running` prompt when the process is not actually the Axiom
app.

Also split the package metadata name for fork builds (`ORCA_PACKAGE_NAME=axiom-orca`).
One-click NSIS derives `APP_FILENAME` / install dir from package name, not
`productName`; without this, Axiom builds still resolved to `%LocalAppData%\\Programs\\orca`,
colliding with upstream Orca even though the visible product/exe name was
`Axiom Orca`. The fork should now install under `%LocalAppData%\\Programs\\axiom-orca`.

---

## 2026-05-19 — Scheduled releases update the upstream mirror branch

Added a normal-release workflow step that fast-forwards the fork's upstream
mirror branch (`main`) to `upstream/main` after the deploy sync succeeds. This
keeps the branch contract true: `main` mirrors upstream, fork work remains on
feature branches plus `axiom/deploy`, and release automation builds the Axiom
variant from the isolated deploy branch. Forced rebuilds skip this step because
they intentionally republish the current deployed tree instead of pulling new
upstream commits.

---

## 2026-05-19 — Forced rebuild skips upstream merge

Forced rebuilds now skip the upstream merge step. The republish path is for
fork-only packaging fixes against the current deployed tree; re-merging
`upstream/main` on every forced rebuild can introduce avoidable conflicts after
upstream advances past the release tag (for example, `package.json` moving to a
future dev version while the fork release remains `v1.4.9`). Normal new-release
runs still merge upstream before tagging/building.

---

## 2026-05-19 — Manual Windows asset clobber for republished tags

Switched the Axiom Windows release job from `electron-builder --publish always`
to a two-step build/upload flow: build with `--publish never`, then upload
`dist/axiom-orca-windows-setup.exe`, its blockmap, and `dist/latest.yml` via
`gh release upload --clobber`. Electron Builder refuses to publish assets to an
existing published GitHub release once the release is more than two hours old,
which left old Windows assets in place during the first forced rebuild. Manual
upload keeps normal new releases working and makes supervised republish runs
actually replace the installer.

---

## 2026-05-19 — Existing release rebuild switch

Added a supervised `force_rebuild` input to the Axiom upstream sync workflow so
we can rebuild and clobber assets for an already-published fork release after a
fork-only packaging fix. The release detector now emits `forced_rebuild:<tag>`
instead of stopping at `fork_release_exists:<tag>` when this input is set. The
release-shell step no longer tries to convert an existing published release back
to draft; it edits title/notes in place and lets the upload steps clobber assets.

Verification:

- `GITHUB_REPOSITORY=Codename-11/orca node config/scripts/axiom-check-upstream-release.mjs --upstream-tag v1.4.9 --force-rebuild` emitted `should_release=true` and `reason=forced_rebuild:v1.4.9`.
- Parsed `.github/workflows/axiom-upstream-sync-release.yml` with PyYAML.

---

## 2026-05-19 — Windows side-by-side installer identity fix

The first Axiom Windows installer still tried to close/replace an installed
upstream Orca instance. The fork had build-time product/app overrides, but the
main-process runtime identity still hardcoded upstream `Orca` /
`com.stablyai.orca`, and the NSIS installer did not have an explicit fork-owned
GUID. Added build-time app-name/app-user-model constants and a stable Axiom NSIS
GUID (`b6c06723-a52f-5004-ad9f-f39666f5e928`) so future Windows builds have a
separate installer/update/runtime identity from upstream.

This only updates source config; no rebuild, release upload, or repush was run.

Verification:

- `pnpm exec vitest run --config config/vitest.config.ts src/main/startup --reporter=dot` — 40 / 40 pass.
- Required `config/electron-builder.config.cjs` with Axiom env and asserted
  `appId`, `productName`, `win.executableName`, and `nsis.guid`.
- `pnpm run typecheck:node`.
- `pnpm exec oxlint config/electron-builder.config.cjs electron.vite.config.ts src/main/startup/dev-instance-identity.ts src/main/startup/dev-instance-identity.test.ts`.
- `pnpm exec oxfmt --check config/electron-builder.config.cjs electron.vite.config.ts src/main/startup/dev-instance-identity.ts src/main/startup/dev-instance-identity.test.ts`.
- `git diff --check`.

---

## 2026-05-19 — Android package identity split

Changed the Axiom Android APK package ID from upstream
`com.stably.orca.mobile` to `com.axiomlabs.orca.mobile` so future Axiom APKs can
install side-by-side with the upstream Orca mobile app instead of replacing it.
This only updates source config; no rebuild, release upload, or repush was run.

Verification:

- Parsed `mobile/app.json` with Node and asserted `expo.android.package === "com.axiomlabs.orca.mobile"`.
- `git diff --check`.

---

## 2026-05-19 — Electron-builder artifact macro fix

The rerun got through sync and Android started, but the Windows electron-builder
step failed while loading `config/electron-builder.config.cjs`: the Axiom
artifact-name templates used JavaScript interpolation for electron-builder
macros (`${ext}`, `${arch}`, `${version}`), so Node tried to resolve undefined
variables before electron-builder could see the config. Added literal macro
constants and kept the fork basename interpolation outside those macros.

The failed rerun had already created a draft `v1.4.9` release shell, so the
release detector now treats existing draft releases as resumable work and the
release-shell step edits an existing draft instead of failing on recreate.

Verification:

- RED: `ORCA_ARTIFACT_BASENAME=axiom-orca node -e "require('./config/electron-builder.config.cjs')"` failed with `ReferenceError: ext is not defined`.
- GREEN: required `config/electron-builder.config.cjs` and printed `axiom-orca-windows-setup.${ext}`, `axiom-orca-macos-${arch}.${ext}`, `axiom-orca-linux.${ext}`, and `orca-ide_${version}_${arch}.${ext}`.
- `node --check config/electron-builder.config.cjs`.

---

## 2026-05-19 — Axiom release sync rerun fixes

The second `Axiom Upstream Sync Release` attempt passed the updater feed tests
but failed while creating the draft GitHub release: `gh release create` sent
`Release.target_commitish is invalid` because the workflow passed the release
tag itself as `--target` after already pushing that tag. Removed `--target` so
GitHub attaches the draft release to the existing tag.

The next rerun then failed earlier in the upstream sync step because the fork
already had an Axiom `v1.4.9` tag pointing at the deploy merge while upstream's
`v1.4.9` tag points at the upstream release commit. The sync script only needs
the upstream branch ref, so it now fetches upstream with `--no-tags` and leaves
fork release tags to the origin fetch / create-tag step.

Verification:

- `python3` + PyYAML parsed `.github/workflows/axiom-upstream-sync-release.yml`.
- `git fetch upstream main --no-tags` succeeds with the conflicting local `v1.4.9` tag present.
- `git fetch origin axiom/deploy --tags` succeeds.
- `ORCA_UPDATE_OWNER=Codename-11 ORCA_UPDATE_REPO=orca pnpm vitest run src/main/updater-prerelease-feed.test.ts --reporter=dot` — 16 / 16 pass.

---

## 2026-05-19 — Axiom updater feed test env fix

Patched `src/main/updater-prerelease-feed.test.ts` so its mocked GitHub atom
feed and manifest expectations honor `ORCA_UPDATE_OWNER` / `ORCA_UPDATE_REPO`.
The Axiom release workflow sets those env vars to the fork repo, while the test
fixtures were still hardcoded to upstream `stablyai/orca`, causing the feed tag
regex to find no parseable releases in CI.

Verification:

- `ORCA_UPDATE_OWNER=Codename-11 ORCA_UPDATE_REPO=orca pnpm exec vitest run --config config/vitest.config.ts src/main/updater-prerelease-feed.test.ts --reporter=verbose` — 16 / 16 pass.
- `pnpm exec vitest run --config config/vitest.config.ts src/main/updater-prerelease-feed.test.ts --reporter=verbose` — 16 / 16 pass.
- `pnpm exec oxlint src/main/updater-prerelease-feed.test.ts` — 0 errors.
- `pnpm exec oxfmt --check src/main/updater-prerelease-feed.test.ts` — clean.
- `pnpm run lint` — 0 errors.
- `pnpm run typecheck` — clean.

---

## 2026-05-19 — Forge Connect settings UI

Added a first-pass Forge Connect surface under Settings → Task Sources. The
pane now includes Forge in the provider visibility checklist, plus a base URL /
API key form that calls the existing main-process Forge config IPC through the
runtime-aware Forge client. The form can save config, test the current saved
connection, and clear URL/token state without storing token material in
renderer settings; blank API key saves preserve an existing main-side token.

Verification:

- RED/GREEN helper test for URL normalization, blank-token preservation, save
  gating, and sanitized config descriptions.
- `pnpm exec vitest run --config config/vitest.config.ts src/main/forge src/renderer/src/components/settings/forge-connect-form.test.ts` — 52 / 52 pass.
- `pnpm run lint` — 0 errors.
- `pnpm run typecheck` — clean.

Known environment note remains: this host is still on Node `v25.6.0` while Orca
wants Node 24, so full native-module test runs should happen under Node 24 / CI.

---

## 2026-05-19 — Forge task provider rebuild follow-up

Victor audit found two Forge MCP payload-shape issues in the Claude rebuild
before pushing: `issues.setLabels` requires `{ issueId, add, remove }`, and
`issues.assign` requires `{ issueId, agentId }`. Patched `feat/forge-provider`
with `fix(forge): align mutations with Forge MCP schema` and merged it back
into `axiom/deploy`; create now performs follow-up transition/label/assign
calls after `issues.create` instead of passing unsupported fields into the
create payload.

Additional verification:

- Live read-only REST alias smoke against Forge: `workspace.get`,
  `statuses.list`, `issues.list`, `projects.list`, `labels.list` — all HTTP 200.
- Live validation smoke confirmed old `{ id, labelIds }` shape for
  `issues.setLabels` returns HTTP 400 `issueId Required`.
- Focused Forge tests: 53 / 53 pass.
- `pnpm lint` — 0 errors.
- `pnpm typecheck` — clean.
- `pnpm run build:electron-vite` — clean.

Known environment note: full `pnpm run test` still fails on this host because
Homebrew Node `v25.6.0` is outside Orca's declared Node 24 engine and
`better-sqlite3` segfaults after native rebuild. Use Node 24 for the full suite.

---

## 2026-05-19 — Forge task provider rebuild

Restructured the Forge task-provider work into a clean, upstream-friendly
slice. The previous attempt bundled Forge with Axiom updater feeds and CI
gating in a single commit on `axiom/forge-task-provider-updater`; this
session carved out a focused `feat/forge-provider` branch that branches off
`main` and contains only Forge.

### Branch layout

| Branch                              | Purpose                 | State                                                      |
| ----------------------------------- | ----------------------- | ---------------------------------------------------------- |
| `main`                              | tracks `upstream/main`  | untouched (`03b88951`)                                     |
| `feat/forge-provider`               | clean Forge slice       | 6 commits off `main`, ready to keep building on            |
| `axiom/deploy`                      | merge / release branch  | merged `feat/forge-provider`, +7 commits ahead of `origin` |
| `axiom/forge-task-provider-updater` | superseded mixed branch | left in place, no longer the source of truth               |

Not pushed yet. `axiom/deploy` is ahead of `origin/axiom/deploy` by 7
commits (Forge work + the merge commit).

### What landed

**Main process** (`src/main/forge/`)

- `config.ts` — secure credential storage. `~/.orca/forge-config.json`
  (plaintext baseUrl at 0600) + `~/.orca/forge-token.enc` (safeStorage,
  falls back to plaintext-0600 on keychain-less Linux). Disk wins over env;
  env vars (`FORGE_BASE_URL`, `FORGE_API_TOKEN`, plus `ORCA_FORGE_*` and
  `FORGE_API_*` aliases) remain a fallback for dev/CI.
- `client.ts` — transport + DTO normalization only. `forgeTool()` POSTs to
  `{baseUrl}/api/mcp/{tool}` with Bearer token; normalizers for
  issue/status/priority/project/agent/label/comment; array extractors for
  the four wrapper shapes Forge returns.
- `issues.ts` — high-level ops: `listIssues` (preset-aware), `searchIssues`,
  `listStatuses`, `updateIssue` (status transitions split from patches;
  labels via `issues.setLabels`; assign/release branch on `assignedAgentId`),
  `createIssue` (title guard), `listComments`, `createComment`,
  `listAssignableAgents` (tries `agents.list`, falls back to
  `workspace.members`).
- `projects.ts`, `labels.ts` — thin wrappers around `projects.list` /
  `labels.list`.

**IPC** (`src/main/ipc/forge.ts`)

- Channels: `forge:status`, `forge:getConfig`, `forge:saveConfig`,
  `forge:clearConfig`, `forge:listStatuses`, `forge:listProjects`,
  `forge:listLabels`, `forge:listAgents`, `forge:listIssues`,
  `forge:searchIssues`, `forge:listComments`, `forge:updateIssue`,
  `forge:createIssue`, `forge:createComment`.
- `getConfig` returns a sanitized `{ baseUrl, hasToken, source }` —
  tokens never cross the IPC boundary.

**Preload** (`src/preload/api-types.ts`, `src/preload/index.ts`)

- `window.api.forge.*` exposes the full surface.

**Renderer**

- `src/renderer/src/runtime/runtime-forge-client.ts` — local + remote
  runtime wrappers around each IPC call.
- `src/renderer/src/store/slices/forge.ts` — new Zustand slice. Connection
  state, config state, list/search caches (60s TTL), metadata caches
  (statuses/projects/labels/agents, 10min TTL), inflight dedup, mutation
  invalidation, optimistic `patchForgeIssue` for cache entries. Wired into
  `store/index.ts`, `store/types.ts`, and the three test-store helpers
  (`store-test-helpers.ts`, `diffComments.test.ts`,
  `store-session-cascades.test.ts`, `tabs.test.ts`).
- `src/renderer/src/components/TaskPage.tsx` — added view-mode toggle
  (List / Board) in the Forge toolbar. New `forgeBoardSections` memo
  groups issues by status using `statuses.list` ordering, falling back
  to canonical category order (BACKLOG → TODO → IN_PROGRESS → IN_REVIEW
  → DONE → CANCELED) when statuses haven't loaded. Board columns render
  cards with click-to-transition via the same DropdownMenu used in list
  view. List view remains the default.

**Shared types** (`src/shared/forge-types.ts`)

- Added `ForgeLabel`, `ForgeComment`, `ForgeIssueCreate`,
  `ForgeConfigSettings`, `ForgeSaveConfigArgs`, and `ForgeIssueCreateResult`
  / `ForgeCommentCreateResult` tagged unions. `ForgeIssueUpdate` widened
  with `projectId`, `labelIds`, `assignedAgentId`. Re-exported from
  `src/shared/types.ts`.

**Tests** (`src/main/forge/`)

- `client.test.ts` — normalization, identifier fallback (AXI-123 synthesis),
  array extractor shapes, transport (env→header→URL plumbing, error
  surface, 204 handling, `ForgeNotConfiguredError`).
- `issues.test.ts` — tool-name + payload shape contracts for all ops
  (`listIssues` filters, `searchIssues` query trimming, `updateIssue`
  status/assign/release split, `createIssue` title guard, comments).
- `config.test.ts` — env fallback, disk persistence with mocked
  `safeStorage`, precedence (disk > env), clear semantics.

48 Forge tests, 181 total in adjacent suites — all pass.

### Documentation

- `docs/reference/forge-task-provider.md` — config precedence table, IPC
  surface, runtime diagram, branch strategy, and the deliberately deferred
  generic-provider abstraction note.

### Verification (`axiom/deploy` @ `a7d8c808`)

- `pnpm lint` — 0 errors across 2,421 files
- `pnpm typecheck` (node + cli + web) — clean
- `pnpm exec vitest run src/main/forge/ src/shared/task-providers.test.ts src/main/persistence.test.ts` — 181 / 181 pass
- `pnpm build:electron-vite` — built in ~58s

### Deliberately deferred

A generic Provider interface (one plug point for GitHub / GitLab / Linear /
Forge) is the right shape, but would generate constant merge conflicts with
upstream — landing it belongs upstream, not here. Forge sits next to Linear
in the same shape so when the upstream abstraction arrives, this provider
folds into it mechanically.

### Trade-offs and call-outs

- **Merge of `feat/forge-provider` → `axiom/deploy`** produced conflicts in
  the 8 files previously touched by the older mixed Forge commit
  (`4bddfd94`). All resolved in favor of `feat/forge-provider` since it
  supersedes the older content. No history rewrite of published commits.
- **`axiom/forge-task-provider-updater`** is now stale; not deleted, since
  remote branches need explicit operator approval.
- **No remote pushes** this session — local merge only.
- **Public-use posture**: no Axiom-Labs hostnames or keys hardcoded. Only
  Axiom-specific concession is the `FORGE` identifier fallback prefix when
  Forge doesn't return one (matches Forge's own default).
