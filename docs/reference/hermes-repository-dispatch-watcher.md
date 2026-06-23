# Hermes repository-dispatch watcher

Axiom Orca upstream sync is event-driven inside GitHub Actions, but we do not
control `stablyai/orca`, so we cannot assume a real upstream webhook can be
installed there. Hermes owns the lightweight fallback watcher: it polls upstream
state, emits `repository_dispatch` only when something changed, and stays silent
when clean.

The same watcher script is intentionally reusable for other fork/upstream pairs
that need "poll for change, dispatch to GitHub Actions" behavior.

## Script

Reusable script:

```bash
node config/scripts/hermes-repository-dispatch-watcher.mjs \
  --upstream-repo stablyai/orca \
  --target-repo Codename-11/orca \
  --state-file ~/.hermes/state/orca-upstream-watcher.json
```

Default behavior:

- watches latest stable semver upstream tag by default;
- watches upstream `main` SHA;
- bootstraps missing state by dispatching the current tag/main SHA once, then
  records them;
- can batch latest-stable release dispatches behind a quiet/min-age period and
  optional UTC release window;
- posts only changed eligible surfaces to the target repo's `repository_dispatch`
  API;
- writes state only after dispatches succeed, except batched releases that are
  not yet eligible are recorded as pending;
- prints nothing on successful no-op or successful dispatch;
- prints one actionable error line and exits non-zero on failure.

The script reads a GitHub token from `GH_TOKEN` / `GITHUB_TOKEN`, or from
`gh auth token` by default. Do not put token values in docs, cron prompts, logs,
or committed files.

## Orca configuration

Recommended Hermes cron wrapper at `~/.hermes/scripts/orca-upstream-watcher.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /home/bailey/.hermes/work/orca-eval/orca
exec node config/scripts/hermes-repository-dispatch-watcher.mjs \
  --upstream-repo stablyai/orca \
  --target-repo Codename-11/orca \
  --state-file /home/bailey/.hermes/state/orca-upstream-watcher.json \
  --stable-only \
  --release-only \
  --batch-latest-stable \
  --release-min-age-hours 24
```

With that unattended Orca release lane, the 15-minute poll records the latest
stable tag as soon as it appears but dispatches only after the same latest tag has
remained newest for 24 hours. If upstream publishes more stable tags during the
quiet period, the pending tag is replaced and only the newest stable can become
eligible. Add `--release-window HH:MM-HH:MM` to require dispatches to occur during
a UTC release window after the min-age gate has passed.

Register it as a script-only Hermes cron so success is silent and failures page
Discord through the configured cron delivery target:

```bash
hermes cron create 'every 15m' \
  --name 'Orca upstream dispatch watcher' \
  --script orca-upstream-watcher.sh \
  --no-agent \
  --deliver origin
```

Equivalent tool configuration:

```json
{
  "name": "Orca upstream dispatch watcher",
  "schedule": "every 15m",
  "script": "orca-upstream-watcher.sh",
  "no_agent": true,
  "deliver": "origin"
}
```

## Dispatch contract

Release/tag change:

```json
{
  "event_type": "upstream_release",
  "client_payload": {
    "upstream_tag": "v1.4.14",
    "previous_upstream_tag": "v1.4.13",
    "source": "hermes_watcher"
  }
}
```

Main branch change:

```json
{
  "event_type": "upstream_main",
  "client_payload": {
    "ref": "refs/heads/main",
    "sha": "<new upstream sha>",
    "previous_sha": "<previous upstream sha>",
    "source": "hermes_watcher"
  }
}
```

These map directly to:

- `.github/workflows/axiom-upstream-sync-release.yml` for releases/tags;
- `.github/workflows/axiom-upstream-main-sync.yml` for clean `main` mirror syncs.

## Reusing for another watcher

Use the same script with different repo, state file, and event names:

```bash
node config/scripts/hermes-repository-dispatch-watcher.mjs \
  --upstream-repo vendor/project \
  --target-repo Codename-11/project-fork \
  --state-file ~/.hermes/state/project-fork-upstream-watcher.json \
  --release-event-type upstream_release \
  --main-event-type upstream_main
```

Useful flags:

| Flag                              | Purpose                                                              |
| --------------------------------- | -------------------------------------------------------------------- |
| `--stable-only`                   | Ignore prerelease tags. This is Orca's default release-watch mode.   |
| `--include-prereleases`           | Include prerelease tags when a fork intentionally wants RC dispatch. |
| `--release-only`                  | Dispatch only tag/release changes.                                   |
| `--main-only`                     | Dispatch only upstream branch changes.                               |
| `--batch-latest-stable`           | Record latest stable tags but dispatch only when eligible.           |
| `--release-min-age-hours <hours>` | Require the latest stable tag to stay newest for this many hours.    |
| `--release-window <HH:MM-HH:MM>`  | Dispatch batched releases only inside this UTC time window.          |
| `--record-only`                   | Write current state without dispatching any repository events.       |
| `--upstream-branch <branch>`      | Watch a branch other than `main`.                                    |
| `--dry-run --json`                | Inspect detected changes without dispatching or writing state.       |
| `--bootstrap-silent`              | On a first run, write current state without dispatching it.          |
| `--no-gh-token`                   | Disable `gh auth token` fallback; require env token if dispatching.  |

Before reusing, create matching `repository_dispatch` handlers in the target
repo and make sure the target token has `repo` + `workflow` scope for private
repos or appropriate fine-grained repository Actions/write permissions.

## Operational policy

- Success stays silent.
- First run dispatches the current tag/main SHA once by default, then records
  state; use `--bootstrap-silent` only when you intentionally want to seed state
  without triggering existing workflows.
- Orca's unattended release lane should use `--batch-latest-stable` with a
  min-age quiet window so frequent stable tags coalesce into the newest pending
  release before dispatch/build.
- Failure should be noisy through Hermes cron delivery.
- The GitHub Actions workflows remain the source of truth for sync/build/release
  behavior; Hermes only detects changes and dispatches events.
- Keep one state file per watched upstream/target pair.
- Rotate tokens through Hermes/profile env or `gh auth`; never commit them.
