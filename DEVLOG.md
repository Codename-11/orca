# Orca (Axiom fork) — DEVLOG

Append-only session log for fork-specific work. Newest entries on top.
`main` tracks `upstream/main`. Fork work lands on `feat/*` branches and
merges into `axiom/deploy`.

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

| Branch | Purpose | State |
|---|---|---|
| `main` | tracks `upstream/main` | untouched (`03b88951`) |
| `feat/forge-provider` | clean Forge slice | 6 commits off `main`, ready to keep building on |
| `axiom/deploy` | merge / release branch | merged `feat/forge-provider`, +7 commits ahead of `origin` |
| `axiom/forge-task-provider-updater` | superseded mixed branch | left in place, no longer the source of truth |

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
