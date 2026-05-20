# Forge Provider Enhancements Implementation Plan

> **For Hermes:** Use `subagent-driven-development` to implement this plan wave-by-wave. Keep `main` as a clean upstream mirror; implement on `feat/forge-provider`; merge verified work into `axiom/deploy` for dogfood/release.

**Goal:** Complete the Forge task-manager experience in Orca by finishing the Forge-specific UX backlog, hardening Axiom fork update delivery, and extracting reusable task-provider seams that can plausibly become an upstream PR for custom task providers rather than a Forge-only fork patch.

**Architecture:** Keep Forge as a first-class provider beside Linear until an upstream-friendly provider registry is ready. Where possible, introduce small, additive adapter/metadata interfaces that preserve existing GitHub/GitLab/Linear behavior and make Forge consume the same UI/runtime seams instead of widening hardcoded switches. Keep credentials in the main process only; renderer surfaces receive sanitized config/status DTOs.

**Tech Stack:** Electron, electron-builder/electron-updater, TypeScript, React, Zustand, IPC/preload bridge, Vitest, GitHub Actions, Forge MCP HTTP alias.

---

## Completion Goal Paragraph

The work is complete when the tasks in this plan have shipped through `feat/forge-provider` into `axiom/deploy`: Forge has a Linear-quality detail drawer, canonical “Open in Forge” links, issue creation, default project/status preferences, richer auth/workspace status, onboarding empty states, and agent-native filters; the Axiom build has a visible fork identity and a tested updater lane that can deliver fork-only changes after installation; and the code is organized around upstream-compatible task-provider seams so a later PR can focus on “custom task providers” instead of Axiom-specific Forge behavior.

---

## Ground Rules

- Preserve upstream compatibility: branch from `main`, keep patches narrow, and avoid broad renderer rewrites unless they become a clean provider abstraction.
- Treat Linear as the primary UI/behavior reference for task-provider UX.
- No Forge token or API key in renderer stores, React props, logs, tests, or persisted renderer state.
- Prefer additive seams over replacing existing provider behavior.
- Keep Axiom branding/update identity build-time configurable via env constants, not runtime Axiom-only assumptions.
- Commit after each wave with conventional commits and update `DEVLOG.md`.

---

## Wave 0 — Baseline Sync and Provider Audit

**Objective:** Establish the exact upstream-compatible surface before adding feature work.

**Files to inspect:**
- `src/shared/task-providers.ts`
- `src/shared/types.ts`
- `src/main/ipc/linear.ts`
- `src/main/ipc/forge.ts`
- `src/main/runtime/rpc/methods/linear.ts`
- `src/main/runtime/rpc/methods/forge.ts`
- `src/renderer/src/runtime/runtime-linear-client.ts`
- `src/renderer/src/runtime/runtime-forge-client.ts`
- `src/renderer/src/store/slices/linear.ts`
- `src/renderer/src/store/slices/forge.ts`
- `src/renderer/src/components/TaskPage.tsx`
- `src/renderer/src/components/settings/IntegrationsPane.tsx`
- `src/renderer/src/components/settings/TasksPane.tsx`

**Steps:**
1. `git fetch --all --prune`.
2. Verify `main` still fast-forwards to `upstream/main`; do not commit to `main`.
3. Rebase or merge `main` into `feat/forge-provider` as needed.
4. Produce a short provider-surface map in this plan or a sibling note showing current hardcoded branches and likely extension points.
5. Run baseline verification:
   - `pnpm run typecheck`
   - `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/forge src/renderer/src/store/slices/forge.test.ts src/renderer/src/runtime/runtime-forge-client.test.ts`

**Acceptance:** We know which changes are pure Forge feature work and which are candidates for an upstream custom-provider abstraction.

---

## Wave 1 — Add Minimal Upstream-Friendly Task Provider Registry Seams

**Objective:** Reduce hardcoded provider switches without forcing a risky all-provider rewrite.

**Files likely modified:**
- `src/shared/task-providers.ts`
- `src/shared/task-providers.test.ts`
- `src/renderer/src/components/settings/TasksPane.tsx`
- `src/renderer/src/components/TaskPage.tsx`
- `src/renderer/src/components/icons/ForgeIcon.tsx`
- New candidate: `src/renderer/src/components/task-providers/provider-ui-registry.tsx`

**Implementation notes:**
- Start with UI metadata only: provider id, label, icon, settings route, onboarding copy, supportsCreate, supportsDetailDrawer, supportsAgentFilters.
- Do **not** move credentials or RPC calls into a generic plugin system yet.
- Keep GitHub/GitLab/Linear rendering behavior identical by snapshot-style tests.
- Make Forge consume the same registry metadata as Linear where practical.

**Tests:**
- Add registry unit tests proving all built-in providers are present and labels/icons/settings targets resolve.
- Add regression tests that existing visible task-source toggles still serialize the same IDs.

**Acceptance:** This wave can be split into an upstream PR titled roughly “Add task provider UI metadata registry” without mentioning Axiom infrastructure.

---

## Wave 2 — Forge Detail Drawer Parity

**Objective:** Give Forge issues the richer Linear-style interaction surface.

**Files likely modified/created:**
- `src/renderer/src/components/TaskPage.tsx`
- New: `src/renderer/src/components/forge/ForgeIssueDetailDrawer.tsx`
- New: `src/renderer/src/components/forge/ForgeIssueDetailDrawer.test.tsx`
- `src/renderer/src/store/slices/forge.ts`
- `src/renderer/src/runtime/runtime-forge-client.ts`
- `src/main/ipc/forge.ts`
- `src/main/forge/issues.ts`
- `src/main/forge/comments.ts` if not already complete
- `src/shared/types.ts`

**Feature scope:**
- Show title, identifier, project, status, priority, labels, assignees/agent, description, and comments.
- Allow status/project/label/assignee edits only through existing main-process Forge operations.
- Optimistically update only where Linear already does; otherwise refresh after mutation.

**Tests:**
- Renderer test for opening the drawer from a Forge issue.
- Store/runtime tests for comment/status/label mutation cache invalidation.
- Main-process tests for sanitized issue hydration and error handling.

**Acceptance:** A Forge issue can be inspected and updated without leaving Orca, with secrets remaining main-process only.

---

## Wave 3 — Canonical “Open in Forge” Links

**Objective:** Add a reliable external-link affordance for every Forge issue.

**Files likely modified:**
- `src/main/forge/issues.ts`
- `src/shared/types.ts`
- `src/renderer/src/runtime/runtime-forge-client.ts`
- `src/renderer/src/components/TaskPage.tsx`
- `src/renderer/src/components/forge/ForgeIssueDetailDrawer.tsx`

**Implementation notes:**
- Normalize a `webUrl`/`externalUrl` on Forge issue DTOs using server-provided URLs if available, otherwise derive from sanitized base URL and issue id/key.
- Open via the same external URL helper/pattern used by GitHub/Linear, not raw `window.open`.
- Guard malformed URLs.

**Tests:**
- URL normalization test.
- Renderer test that the button is disabled/hidden when no safe URL exists.

**Acceptance:** Every Forge issue card/detail drawer offers “Open in Forge” when a safe canonical URL is available.

---

## Wave 4 — Create Forge Issue from Orca

**Objective:** Let users create Forge issues from Orca context using the same mental model as existing task launch flows.

**Files likely modified/created:**
- New: `src/renderer/src/components/forge/CreateForgeIssueDialog.tsx`
- New: `src/renderer/src/components/forge/CreateForgeIssueDialog.test.tsx`
- `src/renderer/src/store/slices/forge.ts`
- `src/renderer/src/runtime/runtime-forge-client.ts`
- `src/main/ipc/forge.ts`
- `src/main/forge/issues.ts`
- `src/shared/types.ts`

**Feature scope:**
- Create title/description with optional project/status/label defaults.
- Support prefill from selected repository/session/worktree where Orca already exposes context.
- On create, invalidate Forge list caches and optionally open the new issue detail drawer.

**Tests:**
- Create dialog validation.
- Main-process `issues.create` request shape.
- Store cache invalidation after create.

**Acceptance:** Users can create a Forge issue without visiting Forge, and newly created issues appear in the task list after refresh.

---

## Wave 5 — Default Forge Project/Status Preferences

**Objective:** Make Forge issue creation and filtering smoother without hardcoding Axiom-specific defaults.

**Files likely modified:**
- `src/main/forge/config.ts`
- `src/main/ipc/forge.ts`
- `src/renderer/src/components/settings/ForgeConnectSection.tsx`
- `src/renderer/src/store/slices/forge.ts`
- `src/shared/types.ts`

**Feature scope:**
- Store sanitized preferences next to Forge base URL config: default project id, default status id, optional default label ids.
- Never store API key in the renderer.
- Load projects/statuses after successful connection and expose selector controls in Integrations.

**Tests:**
- Config migration/version test.
- IPC sanitized config test: token omitted, preference ids included.
- Renderer test for saving defaults.

**Acceptance:** Integrations can save Forge defaults, and create/filter UI uses them without embedding tenant-specific assumptions.

---

## Wave 6 — Better Forge Auth and Workspace Status

**Objective:** Make connection health explicit and debuggable.

**Files likely modified:**
- `src/main/forge/client.ts`
- `src/main/forge/config.ts`
- `src/main/ipc/forge.ts`
- `src/renderer/src/components/settings/ForgeConnectSection.tsx`
- `src/shared/types.ts`

**Feature scope:**
- Show workspace name/id when `workspace.get` succeeds.
- Show sanitized token source (`saved`, `env`, `missing`) and base URL source.
- Show API capability health for required tools: issues, statuses, projects, labels, comments.
- Keep error text useful but scrub authorization headers and token-like substrings.

**Tests:**
- Redaction tests for auth failures.
- Renderer status-card tests.

**Acceptance:** A bad Forge connection tells the user what is missing without leaking credentials.

---

## Wave 7 — Task Source Onboarding Empty State

**Objective:** Close the loop when Forge is visible but not configured.

**Files likely modified:**
- `src/renderer/src/components/TaskPage.tsx`
- `src/renderer/src/components/settings/TasksPane.tsx`
- `src/renderer/src/components/settings/IntegrationsPane.tsx`
- Provider registry file from Wave 1

**Feature scope:**
- If Forge is enabled but disconnected, show an empty state: “Connect Forge in Integrations”.
- Deep-link/open settings directly to Integrations with Forge section focused if the app has an existing settings route pattern.
- Reuse provider registry metadata for copy/button target.

**Tests:**
- Renderer test for disconnected Forge empty state.
- Settings navigation/search regression test.

**Acceptance:** Users are guided to configure Forge instead of seeing a blank/error-only task list.

---

## Wave 8 — Agent-Oriented Forge Filters

**Objective:** Expose Forge-native agent workflow filters that Linear cannot model.

**Files likely modified:**
- `src/main/forge/issues.ts`
- `src/main/ipc/forge.ts`
- `src/renderer/src/store/slices/forge.ts`
- `src/renderer/src/components/TaskPage.tsx`
- `src/shared/types.ts`

**Preset candidates:**
- Assigned to me
- Queued
- Agent-run blocked
- Needs review
- Watching
- Unassigned

**Implementation notes:**
- Keep presets as data, not branchy UI strings.
- Map presets to Forge list API parameters in main-process code.
- If a Forge server lacks a capability, degrade by hiding the preset or showing disabled explanatory copy.

**Tests:**
- Preset-to-request mapping tests.
- UI test for preset selection and cache keys.

**Acceptance:** Forge users can operate agent-centric queues from Orca without making the generic provider UI weird for Linear/GitHub.

---

## Wave 9 — Axiom Build Identity and Updater Hardening

**Objective:** Ensure installed Axiom Orca receives fork releases and fork-only fixes after installation.

**Current state:**
- Electron Builder publish target is fork-owned through `ORCA_PUBLISH_REPOSITORY`.
- Runtime updater endpoints are build-time configurable through `ORCA_UPDATE_OWNER` / `ORCA_UPDATE_REPO`.
- Axiom release workflow sets both to the fork repository and uploads `latest.yml` plus the Windows installer/blockmap.
- App/installer identity is split through `ORCA_APP_ID`, `ORCA_PRODUCT_NAME`, `ORCA_PACKAGE_NAME`, `ORCA_WINDOWS_EXECUTABLE_NAME`, and `ORCA_NSIS_GUID`.

**Known gap:** A same-version forced rebuild, such as replacing assets for `v1.4.9`, updates the release download but does not give already-installed `1.4.9` clients a newer app version to discover. Auto-update requires a semantically newer app version.

**Recommended enhancement:**
- Add an Axiom-only release revision lane that can publish fork-only changes as a semantically newer version without modifying upstream `package.json` on `main`.
- Use build-time version override env, e.g. `ORCA_APP_VERSION`, applied through `electron-builder` `extraMetadata.version` and release note generation.
- Use an Axiom feed mode env, e.g. `ORCA_UPDATE_INCLUDE_PRERELEASES=1`, so Axiom stable builds can receive fork revision tags such as `v1.4.10-axiom.1` from the fork repo when the current installed build is `1.4.9`.
- Set `autoUpdater.allowPrerelease = true` only when the build-time fork feed mode is enabled, not for upstream/default builds.
- Verify the next upstream stable (`1.4.10`) remains greater than `1.4.10-axiom.1`, allowing clean convergence when upstream ships.

**Files likely modified:**
- `config/electron-builder.config.cjs`
- `electron.vite.config.ts`
- `src/main/updater.ts`
- `src/main/updater-endpoints.ts`
- `src/main/updater-prerelease-feed.ts`
- `src/main/updater-prerelease-feed.test.ts`
- `.github/workflows/axiom-upstream-sync-release.yml`
- `config/scripts/axiom-check-upstream-release.mjs`
- `config/scripts/axiom-generate-release-notes.mjs`
- `config/scripts/verify-release-required-assets.mjs`

**Tests:**
- Unit test: stable `1.4.9` Axiom build sees `1.4.10-axiom.1` when fork feed mode is enabled.
- Unit test: default/upstream build still excludes prerelease tags unless explicitly opted in.
- Build-config test: `ORCA_APP_VERSION=1.4.10-axiom.1` produces packaged metadata version override without touching source `package.json`.
- Release-script dry run for both upstream sync releases and fork-only revision releases.

**Acceptance:** A user installed on Axiom Orca can receive both upstream-mirrored releases and fork-only Axiom revisions through the app updater, with no cross-update into upstream Orca.

---

## Wave 10 — About/Settings “Axiom Build” Indicator

**Objective:** Make it obvious the user is running the forked build and show the update channel safely.

**Files likely modified:**
- `electron.vite.config.ts`
- `src/shared/types.ts`
- `src/main/startup/dev-instance-identity.ts` or adjacent build-info module
- `src/preload/index.ts`
- `src/renderer/src/components/settings/AboutPane.tsx` or the current About/settings component

**Feature scope:**
- Display app name, app version, upstream base tag if known, update repo, and channel/revision.
- Keep this generic enough for other forks: “Build identity” rather than “Axiom-only status” where possible.

**Tests:**
- Renderer test for About/Settings build indicator.
- Build-constant fallback test for upstream/default builds.

**Acceptance:** Users can distinguish upstream Orca vs Axiom Orca and verify which update feed they are on.

---

## Wave 11 — Docs, Verification, and Release

**Objective:** Finish with a maintainable, reviewable branch and a tested installer update path.

**Files likely modified:**
- `docs/reference/forge-task-provider.md`
- `docs/plans/2026-05-19-forge-provider-enhancements.md`
- `DEVLOG.md`
- Release notes generated by `config/scripts/axiom-generate-release-notes.mjs`

**Verification gate:**
```bash
pnpm run typecheck
pnpm run typecheck:node
pnpm exec vitest run --config config/vitest.config.ts \
  src/shared/task-providers.test.ts \
  src/main/forge \
  src/main/updater-prerelease-feed.test.ts \
  src/main/updater-nudge.test.ts \
  src/main/updater-changelog.test.ts \
  src/renderer/src/store/slices/forge.test.ts \
  src/renderer/src/runtime/runtime-forge-client.test.ts
pnpm exec oxlint src/shared src/main src/renderer/src
pnpm exec oxfmt --check src/shared src/main src/renderer/src config .github
pnpm build:win
```

**Release verification:**
1. Trigger a dry-run Axiom upstream sync release.
2. Trigger a fork-only revision dry run.
3. Build the Windows installer.
4. Verify artifact identity:
   - executable name: `Axiom Orca.exe`
   - install dir package name: `axiom-orca`
   - app id: `com.axiomlabs.orca`
   - update manifest points to `Codename-11/orca`
5. Install over current Axiom Orca and verify upstream Orca remains untouched.
6. Run “Check for Updates” against a test fork revision release.

**Acceptance:** Release notes explain upstream base + Axiom delta, installer assets verify cleanly, and an installed Axiom build can update to the new release channel.
