# Axiom Orca release readiness

This fork keeps upstream Orca compatibility while shipping Axiom-only provider
and release behavior. The release path is intentionally split from upstream so
`main` can remain a clean mirror of `stablyai/orca`.

## Branch contract

- `main` mirrors upstream Orca. Do not commit Forge provider, Axiom build,
  updater, or workflow changes directly to `main`.
- `feat/forge-provider` carries the Forge provider implementation and supporting
  fork hardening while it is under active development.
- `axiom/deploy` is the release branch. Fork releases must build from this
  branch only after `feat/forge-provider` has been merged into it.

## Fork identity

Axiom desktop builds must preserve these values:

| Surface                     | Value                                  |
| --------------------------- | -------------------------------------- |
| App ID / User Model ID      | `com.axiomlabs.orca`                   |
| Product / app name          | `Axiom Orca`                           |
| Package metadata name       | `axiom-orca`                           |
| Windows executable basename | `Axiom Orca`                           |
| Windows NSIS GUID           | `b6c06723-a52f-5004-ad9f-f39666f5e928` |
| Windows artifact basename   | `axiom-orca`                           |
| Android package             | `com.axiomlabs.orca.mobile`            |

Fork builds inject those values through `electron.vite.config.ts`,
`config/electron-builder.config.cjs`, `resources/build/installer.nsh`, and
`mobile/app.json`. The renderer reads only sanitized build metadata through
`updater:getBuildInfo`; it never receives release secrets.

## Update feed safety

Axiom builds must use fork-owned update endpoints and release assets. The update
path is centralized in `src/main/updater-endpoints.ts` so upstream-compatible
builds default to `stablyai/orca`, while Axiom builds can route to the fork via
`ORCA_UPDATE_OWNER`, `ORCA_UPDATE_REPO`, `ORCA_UPDATE_FEED_URL`,
`ORCA_UPDATE_DOWNLOAD_BASE_URL`, `ORCA_UPDATE_CHANGELOG_URL`, and
`ORCA_UPDATE_NUDGE_URL`.

Do not publish fork assets over an upstream release/tag. Axiom releases use
fork-owned prerelease versions and tags:

| Upstream release | Axiom app version | Axiom release tag       |
| ---------------- | ----------------- | ----------------------- |
| `v1.4.10`        | `1.4.10-axiom.1`  | `axiom-v1.4.10-axiom.1` |
| Axiom hotfix     | `1.4.10-axiom.2`  | `axiom-v1.4.10-axiom.2` |

The workflow tracks upstream prerelease cuts (`AXIOM_INCLUDE_PRERELEASES=1`) so
Axiom's release lane follows the same automated RC cadence as upstream rather
than rebuilding older stable tags from newer `main` code. Scheduled upstream sync
skips once the matching fork tag exists. Manual Axiom-only update builds should
use `bump_axiom_revision` or `axiom_revision` so the Electron updater sees a
semantically newer fork version from the `Codename-11/orca` release feed.

## Pre-release checklist

Run these from the release branch before cutting or rebuilding a fork release:

```bash
pnpm exec vitest run --config config/vitest.config.ts \
  src/main/axiom-release-hardening.test.ts \
  src/main/updater-endpoints.test.ts \
  src/main/updater-prerelease-feed.test.ts \
  src/main/updater.test.ts \
  src/main/updater-nudge.test.ts \
  src/main/updater-changelog.test.ts \
  src/main/app-build-identity.test.ts \
  src/renderer/src/components/settings/GeneralPane.test.ts
pnpm run typecheck
pnpm exec oxlint config/electron-builder.config.cjs electron.vite.config.ts \
  mobile/app.json resources/build/installer.nsh src/main/updater-endpoints.ts \
  src/main/app-build-identity.ts src/renderer/src/components/settings/GeneralPane.tsx
pnpm exec oxfmt --check config/electron-builder.config.cjs electron.vite.config.ts \
  mobile/app.json resources/build/installer.nsh src/main/updater-endpoints.ts \
  src/main/app-build-identity.ts src/renderer/src/components/settings/GeneralPane.tsx
git diff --check
```

For workflow-only edits, also validate any Axiom release scripts with Node, run
`config/scripts/axiom-upstream-sync-release.test.mjs`, and parse the workflow
YAML before merging.

## Upstream-sync automation

The Axiom upstream sync workflow lives at
`.github/workflows/axiom-upstream-sync-release.yml`. It is allowed to push only:

- `refs/remotes/upstream/main` to `refs/heads/main`, preserving `main` as the
  upstream mirror.
- The synchronized release commit to `axiom/deploy`.
- The selected release tag that the build jobs check out.

The sync script refuses unexpected branch names, emits conflict diagnostics when
an upstream release merge fails, and re-checks the Axiom identity files after
sync so upstream changes cannot silently remove fork package/update settings. It
merges the upstream release tag into `axiom/deploy`, updates `package.json` to the
selected fork version, tags the result as `axiom-v<version>`, and then builds from
that tag.

Failures are noisy and durable: merge conflicts, guard failures, test failures,
and build/publish failures upsert a single `axiom-upstream-sync` GitHub issue with
conflicted files, upstream tag/ref, fork tag/version, deploy branch, and Actions
run URL. Keep GitHub Issues enabled on `Codename-11/orca` so this upsert path can
persist notifications. If `AXIOM_SYNC_DISCORD_WEBHOOK` is configured, failures
also post to Discord. Successful no-op/successful release runs do not post
chat/task noise.
