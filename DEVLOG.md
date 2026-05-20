# Orca (Axiom fork) — DEVLOG

Append-only session log for fork-specific work. Newest entries on top.
`main` tracks `upstream/main`. Fork work lands on `feat/*` branches and
merges into `axiom/deploy`.

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
