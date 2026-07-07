# Local source runtime updates

Axiom Orca supports the normal `orca update` command for source/dev runtimes.
Packaged desktop builds still use Electron's app updater and fork-owned GitHub
release feed; this command is for hosts where `orca` is a source checkout shim.

## Commands

```bash
orca update status
orca update
orca update cli
orca update serve
orca update all
```

Default behavior:

- `orca update` updates the managed local CLI runtime and repoints the standard
  `orca` / `orca-dev` shims.
- `orca update serve` updates the managed headless serve runtime, rewrites the
  user systemd unit to point at the managed runtime symlink, restarts
  `orca-serve.service`, and verifies systemd reported it active.
- `orca update all` performs both.
- `orca update status` prints the source repo, selected update ref, runtime root,
  CLI shim target, and serve runtime path/version/SHA.

## Update ref selection

The source updater defaults to `origin/axiom/deploy` when either:

- `package.json` version includes `axiom`, or
- the source checkout's `origin` remote is `Codename-11/orca`.

Otherwise it falls back to `origin/main` for upstream-compatible source checkouts.
Override with:

```bash
orca update --branch <ref>
```

or:

```bash
ORCA_UPDATE_BRANCH=<ref> orca update
```

## Managed paths

By default the updater owns clean managed worktrees under:

```text
~/.local/share/orca/source-runtimes/
  cli/
  serve/
  current-serve -> serve/
```

The normal shell shims point at the managed CLI runtime:

```text
~/.local/bin/orca     -> ~/.local/share/orca/source-runtimes/cli/config/scripts/orca-dev.mjs
~/.local/bin/orca-dev -> ~/.local/share/orca/source-runtimes/cli/config/scripts/orca-dev.mjs
```

Override the runtime root with:

```bash
orca update --runtime-root <path>
```

or:

```bash
ORCA_LOCAL_RUNTIME_ROOT=<path> orca update
```

## Source repo selection

The updater infers its source repo from the built CLI's `out/cli` location. To run
from a different checkout:

```bash
orca update --repo /path/to/orca
```

or:

```bash
ORCA_UPDATE_SOURCE_REPO=/path/to/orca orca update
```

The source path must be a git checkout. Packaged apps should use the app updater.

## Headless serve details

`orca update serve` preserves existing service-level details from
`~/.config/systemd/user/orca-serve.service` when present:

- `--serve-port`
- `--serve-pairing-address`

Override with:

```bash
ORCA_SERVE_PORT=6768 \
ORCA_SERVE_PAIRING_ADDRESS=100.71.8.56 \
orca update serve
```

The generated unit keeps the dedicated serve profile:

```ini
Environment=ORCA_DEV_USER_DATA_PATH=$HOME/.config/orca-serve
Environment=ORCA_USER_DATA_PATH=$HOME/.config/orca-serve
```

Use `--no-restart` to build/repoint without restarting:

```bash
orca update serve --no-restart
```

Use `--dry-run` to print planned commands without mutating paths or systemd:

```bash
orca update all --dry-run --json
```
