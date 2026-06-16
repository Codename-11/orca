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

The workflow tracks stable upstream releases by default
(`AXIOM_INCLUDE_PRERELEASES=0`) so Axiom's fork does not build/publish every
upstream RC/release-cut. Upstream release/tag hooks may still enter the fork as
`repository_dispatch` events (`upstream_release` or `upstream_tag`) with
`client_payload.upstream_tag` (or `tag` / `ref`) set to the upstream `v*` tag,
but RC tags are detected and skipped before merge/build/release. Manual
Axiom-only update builds should use `bump_axiom_revision`, `axiom_revision`, or a
pushed `axiom-v*` tag so the Electron updater sees a semantically newer fork
version from the `Codename-11/orca` release feed.

Mobile release assets are intentionally version-gated rather than SHA-gated.
Stable Axiom releases may attach `app-release.apk` even when only desktop or
upstream code changed, so mobile checks `mobile-update.json` and prompts only
when the native mobile build id is newer (`expo.android.versionCode` on Android,
`expo.ios.buildNumber` on iOS). The manifest also carries the release source SHA
and APK SHA-256 for verification/diagnostics; a changed APK hash without a native
build id bump is a release packaging error, not a client update signal.

## Axiom patch release workflow

Use this path when Axiom has a fork-only fix already on `axiom/deploy` and needs
an update build before or instead of an upstream PR. A push to `axiom/deploy`
does not publish a release by itself; it only updates the branch that the release
workflow will check out.

1. Confirm the patch is on `origin/axiom/deploy`.
2. Identify the upstream base tag for the current Axiom release. For
   `axiom-v1.4.27-axiom.1`, the upstream base tag is `v1.4.27`.
3. Dispatch the release workflow with a fork revision bump:

```bash
gh workflow run axiom-upstream-sync-release.yml \
  --repo Codename-11/orca \
  --ref axiom/deploy \
  -f upstream_tag=<upstream-v-tag> \
  -f dry_run=false \
  -f build_mobile=false \
  -f force_rebuild=false \
  -f bump_axiom_revision=true
```

The workflow computes the next `axiom.N` revision, updates `package.json`,
pushes the release commit back to `axiom/deploy`, creates the `axiom-v*` tag,
builds release assets from that tag, verifies required assets, and publishes the
GitHub release. Stable upstream bases build both Windows and Android assets;
upstream prerelease bases are skipped unless Axiom intentionally pushes/builds an
`axiom-v*` tag.

Use `axiom_revision=<number>` only when the revision number must be selected
explicitly. Use `axiom_tag=<existing-axiom-v-tag>` with `force_rebuild=true` only
when rebuilding and re-uploading assets for an existing fork release.

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
`config/scripts/axiom-upstream-sync-release.test.mjs`,
`config/scripts/generate-mobile-update-manifest.test.mjs`, and parse the
workflow YAML before merging.

## Upstream-sync automation

The Axiom upstream sync release workflow lives at
`.github/workflows/axiom-upstream-sync-release.yml`. It is event-driven, not
interval-driven: upstream release/tag hooks should trigger `repository_dispatch`
events, manual testing uses `workflow_dispatch`, and Axiom-only fork releases can
still be triggered by pushing an `axiom-v*` tag.

The clean upstream mirror workflow lives at
`.github/workflows/axiom-upstream-main-sync.yml`. It accepts `repository_dispatch`
events (`upstream_main` / `upstream_push`) and fast-forwards fork `main` from
`stablyai/orca/main` only when the payload ref is `refs/heads/main` (or `main`).

Hermes owns the lightweight upstream watcher for cases where a true upstream
GitHub webhook is unavailable. `config/scripts/hermes-repository-dispatch-watcher.mjs`
polls the latest semver upstream tag and upstream `main` SHA, stores last-seen
state under `~/.hermes/state/`, and dispatches only changed surfaces to the two
workflows above. The watcher is silent on success, dispatches the current
snapshot once on first run so a newly-created watcher does not miss an already
visible upstream tag, and is documented in
`docs/reference/hermes-repository-dispatch-watcher.md` so the pattern can be
reused for other upstream/fork watchers.

Example dispatch payloads for a webhook bridge:

```bash
# Upstream release/tag event
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/Codename-11/orca/dispatches \
  -d '{"event_type":"upstream_release","client_payload":{"upstream_tag":"v1.4.13"}}'

# Upstream main push event
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/Codename-11/orca/dispatches \
  -d '{"event_type":"upstream_main","client_payload":{"ref":"refs/heads/main"}}'
```

The release workflow is allowed to push only:

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

The generated release notes include upstream notes plus fork-local commit deltas,
but they are capped below GitHub's 125 KB release body limit. If upstream ships a
very large changelog, the workflow trims long sections and leaves a note in the
release body instead of failing at `gh release create`.

Failures are noisy and durable: merge conflicts, guard failures, test failures,
and build/publish failures upsert a single `axiom-upstream-sync` GitHub issue with
conflicted files, upstream tag/ref, fork tag/version, deploy branch, and Actions
run URL. Keep GitHub Issues enabled on `Codename-11/orca` so this upsert path can
persist notifications. If `AXIOM_SYNC_DISCORD_WEBHOOK` is configured, failures
also post to Discord. Successful no-op/successful release runs do not post
chat/task noise.
