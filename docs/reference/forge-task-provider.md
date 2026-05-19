# Forge task provider

Forge is a first-class task provider in this fork, alongside GitHub, GitLab, and
Linear. It talks to a Forge instance over Forge's MCP HTTP alias and is
configurable per machine (base URL + API key). The integration follows the
Linear provider's shape so future upstream changes to the task surface keep
applying with minimal rework.

This document covers configuration, the runtime model, and the deliberate
trade-offs made to keep the fork clean for ongoing upstream merges.

## Configuration

Two pieces of data are required:

- **Base URL** of the Forge instance (e.g. `https://forge.axiom-labs.dev`).
- **API key** authorized to call Forge's MCP tools.

### Where the configuration lives

In precedence order:

1. **On-disk configuration**, written from the Settings UI / IPC:
   - `~/.orca/forge-config.json` — `{ "version": 1, "baseUrl": "..." }`,
     plaintext at mode 0600 so connection state can render without prompting
     the keychain.
   - `~/.orca/forge-token.enc` — encrypted with Electron `safeStorage` when the
     platform supports it, plaintext at 0600 otherwise (headless Linux without
     a keychain). This file path mirrors the Linear provider's convention.

2. **Environment variables**, intended for dev/CI and unattended runs:
   - `FORGE_BASE_URL` / `FORGE_API_URL` / `ORCA_FORGE_API_URL`
   - `FORGE_API_TOKEN` / `FORGE_TOKEN` / `ORCA_FORGE_API_TOKEN`

Renderer code never touches either of these. The main-process module
`src/main/forge/config.ts` is the only consumer; IPC handlers expose a sanitized
status object (`{ baseUrl, hasToken, source }`) to the renderer.

### IPC surface

All renderer calls go through `window.api.forge.*` (preload bridge):

| IPC channel              | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `forge:status`           | Connection probe via `workspace.get`                   |
| `forge:getConfig`        | Sanitized config status for the Settings UI            |
| `forge:saveConfig`       | Persist `{ baseUrl, apiKey }` (apiKey optional)        |
| `forge:clearConfig`      | Wipe disk config + token                               |
| `forge:listIssues`       | `issues.list` / `issues.assigned` (preset-aware)       |
| `forge:searchIssues`     | `issues.list` with query                               |
| `forge:listStatuses`     | `statuses.list`                                        |
| `forge:listProjects`     | `projects.list`                                        |
| `forge:listLabels`       | `labels.list`                                          |
| `forge:listAgents`       | `agents.list` falling back to `workspace.members`      |
| `forge:listComments`     | `comments.list`                                        |
| `forge:updateIssue`      | `issues.update` + `issues.transition` + setLabels      |
| `forge:createIssue`      | `issues.create`                                        |
| `forge:createComment`    | `comments.create`                                      |

## Runtime model

```
Renderer (TaskPage, store slice)
        │
        ▼
preload bridge  (window.api.forge.*)  ── tokens never reach here
        │
        ▼
ipcMain handlers  (src/main/ipc/forge.ts)
        │
        ▼
main-process modules
   ├─ config.ts   safeStorage-encrypted token + base URL on disk
   ├─ client.ts   HTTP transport + DTO normalization
   ├─ issues.ts   high-level operations
   ├─ projects.ts projects.list
   └─ labels.ts   labels.list
        │
        ▼
Forge MCP HTTP endpoint:  POST {baseUrl}/api/mcp/{tool}
```

The renderer store slice (`src/renderer/src/store/slices/forge.ts`) caches list
results (60s TTL), status/project/label/agent metadata (10min TTL), and
deduplicates concurrent requests by key. Mutations invalidate both caches so
the next list call hits Forge again.

## Branch strategy

Upstream compatibility matters: we sync with `stablyai/orca` regularly and
don't want Forge work tangled into merge conflicts that aren't related to
Forge.

- **`main`** — tracks `upstream/main` only. No fork-specific commits land here.
- **`feat/forge-provider`** — the clean, focused branch for all Forge work.
  Cuts cleanly off `main`. New Forge functionality lands here, gets reviewed
  here, and merges into `axiom/deploy`.
- **`axiom/deploy`** — the integration / release branch. Merges in
  `feat/forge-provider` and any other Axiom-specific tracks (release feeds,
  CI gating). This is what the Windows / Mac / Linux release pipelines build.

When upstream releases, rebase / merge `upstream/main` into `main`, then merge
`main` into `feat/forge-provider`, resolve any conflicts in Forge files (rare),
and finally merge into `axiom/deploy`.

## What's deliberately not abstracted yet

A generic "Provider" interface (one place to plug GitHub / GitLab / Linear /
Forge / future) would be cleaner, but it would require coordinated changes in
the main, preload, and renderer layers across all four providers. That
refactor belongs upstream, not in this fork — doing it here would generate
constant merge conflicts and pull the abstraction in a direction the maintainers
may not want.

For now Forge is modeled directly after Linear's path and lives next to it.
When upstream introduces a generic interface, this provider should fold into it
with mostly mechanical changes.

## Public-use posture

The provider has no Axiom-Labs hardcoded defaults at runtime. The base URL and
API key are user-provided. The only Axiom-specific concession is the default
issue identifier prefix (`FORGE`) when the server doesn't return one; that
matches Forge's default and is replaced as soon as the project provides a key
(e.g. `AXI-123`, `PER-7`).

## Testing

```bash
pnpm exec vitest run --config config/vitest.config.ts src/main/forge/
```

48 focused tests cover transport, normalization, identifier fallback, issue
operations, and secure config storage. Standard `pnpm lint`, `pnpm typecheck`,
and `pnpm build:electron-vite` are clean on this branch.
