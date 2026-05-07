# Review Context

## Branch Info

- Base: origin/main
- Current: brennanb2025/posthog-checkin

## Changed Files Summary

- A docs/onboarding-funnel-telemetry.md
- A src/main/ipc/worktree-create-error-class.test.ts
- A src/main/ipc/worktree-create-error-class.ts
- M src/main/ipc/worktrees.ts
- M src/renderer/src/components/sidebar/AddRepoDialog.tsx
- M src/shared/telemetry-events.test.ts
- M src/shared/telemetry-events.ts

## Changed Line Ranges (PR Scope)

| File                                                | Changed Lines                          |
| --------------------------------------------------- | -------------------------------------- |
| docs/onboarding-funnel-telemetry.md                 | 1-174 (new file)                       |
| src/main/ipc/worktree-create-error-class.test.ts    | 1-71 (new file)                        |
| src/main/ipc/worktree-create-error-class.ts         | 1-55 (new file)                        |
| src/main/ipc/worktrees.ts                           | 43, 162-189                            |
| src/renderer/src/components/sidebar/AddRepoDialog.tsx | 14, 197, 215, 224-232, 258, 412      |
| src/shared/telemetry-events.test.ts                 | 109-162                                |
| src/shared/telemetry-events.ts                      | 76-102, 217-231, 249, 251              |

## Skipped Issues (Do Not Re-validate)

- worktree-create-error-class.ts:17-20 | Low | Hypothetical Buffer-stderr handling. Current throws all use bare Error('...') without .stderr.
- worktrees.ts:168 | Low | Optional comment about future single-caller assumption; not a correctness issue.
- AddRepoDialog.tsx:411-414 | Low | Inline arrow onSkip is purely consistency nit; no functional impact.
- AddRepoDialog.tsx:411-414, :197, :215, :228-231 | Low | Double-click guards: track is fire-and-forget; button unmounts on close.
- telemetry-events.test.ts:115 | Low | Test loop type (use schema.options); maintainability nit.
- telemetry-events.test.ts:137-165 | Low | Missing source enum rejection test; redundant with workspace_created coverage.
- telemetry-events.ts:87 | Low | Unused export AddRepoSetupStepAction; consistent with peer-type exports.
- worktrees.ts:168 | Low | Optional comment about emit placement vs pre-validation throws.
- docs/onboarding-funnel-telemetry.md | Low | Multiple stale line citations (telemetry-events.ts, AddRepoDialog.tsx, worktrees.ts, client.ts). Cosmetic doc drift; design doc is for humans, not load-bearing for runtime; symbols stable enough to find via grep.
- docs/onboarding-funnel-telemetry.md:124 | Low | Doc forward-look claim that workspace_composer_opened is "mostly redundant" — debatable but doc-only Phase-2 sketch, not implementation.
- worktree-create-error-class.ts:19 | Low | Only stderr harvested, not cause/stdout/output. Existing throws all use bare Error('...'); no real-world failures fall through today.
- worktrees.ts:188 | Low | track() then throw — track() is a sync void function (client.ts:256). FP.

## Issues to Fix (Phase 3)

1. **Medium** worktrees.ts:168 — `add_repo_setup_step_action.create_worktree` fires for every `worktrees:create` IPC call, regardless of source. Funnel question is "fraction of users who add a repo bail vs continue", but `worktrees:create` is invoked from many surfaces (WorktreeJumpPalette, useComposerState, launch-work-item-direct, Landing, SidebarHeader, TaskPage). Other 4 actions (skip/configure/open_existing/back) fire only from AddRepoSetupStep. Found by: Claude (×2), Codex.
   Fix: Move `create_worktree` emit to the renderer, in `handleCreateWorktree` at AddRepoDialog.tsx:204-212, mirroring the other 4 affordances. The SetupStep "Create" click already has a clean renderer-side seam there. Remove the main-side emit at worktrees.ts:168 and update its comment.

2. **Medium** worktree-create-error-class.ts:28 — `'already exists'` is too broad: matches Orca's deliberate `Branch "X" already exists` (worktree-remote.ts:97) AND the `orca-runtime.ts:2909` `Branch "X" already exists locally/on a remote` AND any future git-native `fatal: ... already exists` message. Current code already keeps `'already has pr'` and `'could not find an available worktree name'` as specific markers. Found by: Claude.
   Fix: Replace the bare `'already exists'` substring with the two concrete suffixes Orca actually throws — `'already exists locally'` and `'already exists on a remote'` — plus the existing `'already has pr'` and `'could not find an available worktree name'`. The bare-`'already exists. Pick a different worktree name.'` throw at worktree-remote.ts:97 also matches `'already exists. pick'` (lowercased). Add that anchor too (or the simpler `'already exists. pick'`).

3. **Low→Medium** worktree-create-error-class.ts:50 — `'no git provider'` is bucketed as `git_failed`, but the related SSH-precondition error `'SSH connection is not available'` (worktree-remote.ts:148) falls through to `unknown`. Two SSH-precondition errors → two different buckets. Found by: Claude.
   Fix: Drop `'no git provider'` from the git_failed list so both SSH-precondition errors consistently bucket to `unknown`. The schema-evolution doctrine prefers narrow + consistent over broad-and-incoherent.

4. **Medium** AddRepoDialog.tsx:236-240 — Implicit-close on the Setup step (X icon, ESC, outside-click) calls `closeModal()` and `resetState()` without firing `add_repo_setup_step_action`. Functionally equivalent to Skip but invisible to the funnel; under-reports bail-rate. Found by: Claude.
   Fix: In `onOpenChange`, when `step === 'setup' && !open`, emit `add_repo_setup_step_action` with `action: 'skip'`. Guard against double-fire when the explicit Skip button (line 411-415) calls `closeModal()` which re-enters `onOpenChange(false)` — use a ref-flag that the explicit Skip handler sets, and the implicit handler reads-and-resets. Alternatively, have the explicit Skip handler NOT call `closeModal()` directly and let the dialog close itself via `onOpenChange`, but that's a larger refactor; the ref-flag is the local minimum.

## Iteration State

Current iteration: 1
Last completed phase: Validation
Files fixed this iteration: []
