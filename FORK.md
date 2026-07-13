# Axiom Orca Fork

This repository is the Axiom fork of upstream Orca.

The fork is maintained so `main` can stay a clean mirror of
[`stablyai/orca`](https://github.com/stablyai/orca), while Axiom-specific
provider, branding, updater, and release changes ship from fork branches and
`axiom/deploy`.

## Remotes

- `origin`: Axiom fork, `https://github.com/Codename-11/orca`
- `upstream`: upstream Orca, `https://github.com/stablyai/orca.git`

Set `upstream` as fetch-only locally when possible:

```bash
git remote add upstream https://github.com/stablyai/orca.git
git remote set-url --push upstream DISABLED
git fetch upstream main --prune
```

## Branch Contract

- `main` mirrors `upstream/main` only. Do not commit Forge provider, Axiom
  build identity, updater, workflow, or release changes directly to `main`.
- Feature branches carry focused fork work, for example `feat/forge-provider`.
- `axiom/deploy` is the fork integration and release branch. Axiom builds and
  release tags are produced from this branch.
- Upstream-compatible provider seams should be kept separate from Axiom/Forge
  service code so they can become clean upstream PRs later.

## Fork Footprint Extraction

When Axiom-only provider behavior must touch upstream hot files, extract the
fork-owned surface into a clearly named Axiom/Forge module and leave only a thin
import/props seam in the upstream-owned file. Move only code that is genuinely
fork-only; keep upstream flow changes in place when merge conflicts are useful
review signals. Avoid circular imports by passing stable data and callbacks
across the seam, and name modules by their domain (for example,
`components/forge/ForgeTaskControls.tsx`) rather than vague helper/common names.

## Release And Update Invariants

Axiom desktop and mobile builds must preserve their side-by-side identity with
upstream Orca. The canonical identity values and release checklist live in
[`docs/reference/axiom-release-readiness.md`](docs/reference/axiom-release-readiness.md).

Core rules:

- Axiom builds use fork-owned release assets and update feeds.
- Do not publish fork assets over upstream `v*` tags.
- Axiom release tags use the `axiom-v*` format, for example
  `axiom-v1.4.10-axiom.1`.
- Axiom app versions use fork suffixes, for example `1.4.10-axiom.1`.
- Build identity is injected through env/config, not hardcoded runtime
  assumptions.
- Axiom's Windows release workflow explicitly opts out of the upstream SignPath
  publisher check while its installers are unsigned. `latest.yml` SHA512 hashes
  still protect update payload integrity.

### One-time unsigned Windows updater bootstrap

Already-installed builds whose updater metadata requires `SignPath Foundation`
cannot in-app install an unsigned transition build. Users must manually download
and install the first release containing the publisher opt-out, unless that
transition release is Authenticode-signed by the expected publisher. Once a user
is running the fixed release, later unsigned Axiom releases can install through
the in-app updater because SHA512 feed verification remains active without the
stale publisher requirement.

## Axiom Patch Releases

Do not rely on a plain push to `axiom/deploy` to publish a release. Branch
pushes update the release branch only; they do not start the Axiom release
pipeline.

After merging or pushing an Axiom-only patch to `axiom/deploy`, publish a new
fork revision by manually dispatching the Axiom release workflow against the
upstream tag that the current fork release is based on:

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

Example: if the current fork release is `axiom-v1.4.27-axiom.1`, an Axiom-only
patch should dispatch with `upstream_tag=v1.4.27` and
`bump_axiom_revision=true`. The workflow creates the next fork version and tag,
for example `1.4.27-axiom.2` / `axiom-v1.4.27-axiom.2`, pushes the release
version commit to `axiom/deploy`, builds the required assets, and publishes the
fork-owned GitHub release.

Use `axiom_revision=<number>` only when intentionally selecting an explicit fork
revision. Use `force_rebuild=true` only to rebuild/re-upload an existing release
tag.

## Upstream Sync

Upstream main and release sync are automated through:

- [`.github/workflows/axiom-upstream-main-sync.yml`](.github/workflows/axiom-upstream-main-sync.yml)
- [`.github/workflows/axiom-upstream-sync-release.yml`](.github/workflows/axiom-upstream-sync-release.yml)
- [`config/scripts/axiom-sync-upstream-release.mjs`](config/scripts/axiom-sync-upstream-release.mjs)
- [`docs/reference/local-source-runtime-update.md`](docs/reference/local-source-runtime-update.md)

The sync path is allowed to update:

- fork `main` from `upstream/main`
- the synchronized release commit on `axiom/deploy`
- the selected `axiom-v*` release tag

## Conflict Remediation

When upstream sync conflicts with protected fork changes, remediation should go
through a `bot/upstream-sync-*` PR targeting `axiom/deploy`. Do not push
conflict remediation directly to `axiom/deploy` unless explicitly approved.

The protected paths and required checks are defined in
[`config/axiom-merge-remediation-policy.json`](config/axiom-merge-remediation-policy.json).

## Fork Docs

- [`DEVLOG.md`](DEVLOG.md): append-only log for fork-specific work and
  verification.
- [`docs/reference/axiom-release-readiness.md`](docs/reference/axiom-release-readiness.md):
  release identity, updater safety, and sync automation.
- [`docs/reference/local-source-runtime-update.md`](docs/reference/local-source-runtime-update.md):
  normal `orca update` behavior for source/dev CLI and headless serve runtimes.
- [`docs/reference/forge-task-provider.md`](docs/reference/forge-task-provider.md):
  Forge provider behavior and branch strategy.
- [`docs/reference/task-provider-surface-map.md`](docs/reference/task-provider-surface-map.md):
  upstreamable provider seams versus fork-side behavior.
- [`docs/reference/hermes-repository-dispatch-watcher.md`](docs/reference/hermes-repository-dispatch-watcher.md):
  upstream watcher used when direct upstream webhooks are unavailable.
