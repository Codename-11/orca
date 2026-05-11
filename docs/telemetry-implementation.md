# Telemetry Implementation Plan

Status: implementation blueprint. Companion to [`telemetry-plan.md`](./telemetry-plan.md) (product decisions), [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) (local-first diagnostics lane), and [`telemetry-security-review.md`](./telemetry-security-review.md) (security review). **Those docs own the "why."** This doc owns the "what, where, and when."

**Source of truth:** yes. This doc defines the intended implementation and rollout shape for the current telemetry plan.

Every decision here is settled upstream — if you find yourself re-litigating vendor, consent model, region, schema, or transport in code review, link the reviewer to the decision log entry, don't restart the debate.

## TL;DR

- **5 PRs**, each independently revertable. (Future onboarding events are tracked under §Future work. A public aggregate dashboard was considered and cut from v1 — see [`telemetry-plan.md`](./telemetry-plan.md#11-public-aggregate-dashboard--considered-and-cut-from-v1).)
- **Vendor:** PostHog Cloud US, `posthog-node` SDK in main only. Renderer events cross IPC.
- **Consent:** existing-user notice only. Existing users `optedIn: null` until they interact with the first-launch `FirstLaunchBanner` surface, which has three terminal actions: ✕ (silent opt-in), Turn off (opt out, emits `telemetry_opted_out { via: 'first_launch_banner' }`), Privacy policy (link). New users `optedIn: true` from install with **no** first-launch UI — install-time disclosure is the consent surface for that cohort, matching the category norm. Rationale in [`telemetry-plan.md` decision 3](./telemetry-plan.md#3-default-behavior--asymmetric-by-cohort) and [Decision record: first-launch surface only for existing users](#decision-record-first-launch-surface-only-for-existing-users) below.
- **Schema:** 7-event v1 schema (8 literal event strings, counting `telemetry_opted_in`/`opted_out` as a paired slot), declared Zod-first in `src/shared/telemetry-events.ts` — the validator consumes the same schemas the `EventMap` type is `z.infer`-derived from (single source of truth; no dual declaration). Deferred-event rationale lives in [`telemetry-plan.md`](./telemetry-plan.md#deferred-events-v2-candidates).
- **Enforcement:** Zod schemas at the IPC boundary + at the `track()` entry. `.strict()` on every object schema is the runtime counterpart to the compile-time rules.
- **Feature flag:** compile-time constant `TELEMETRY_ENABLED` in the client module. False through PR 2; flipped on in PR 3.
- **Kill switch:** `ORCA_TELEMETRY_DISABLED=1` and `DO_NOT_TRACK=1` env vars, both honored from PR 1 forward.
- **Reference code:** emdash at `/Users/thebr/source/repos/public/emdash` is the closest structural match — copy its sanitizer allowlist pattern. **Error-capture is the one place we diverge: we adopt T3 Code's posture, not emdash's.** See [Decision record: T3 Code's posture on errors](#decision-record-t3-codes-posture-on-errors) below. superset-sh at `/Users/thebr/source/repos/public/superset` is a secondary reference for activation-funnel shape only. Crash-detection heartbeat and explicit `daily_active_user` patterns from emdash were considered and **deferred to v2** — see [`telemetry-plan.md`](./telemetry-plan.md#deferred-events-v2-candidates).

## Decision record: T3 Code's posture on errors

**Decided:** 2026-05-02. **Stays decided until** one of the reversal conditions below fires.

**The decision:** `agent_error` is enum-only in PostHog (`error_class`, `agent_kind`). Raw error messages, stack traces, provider error bodies, and tool stdout/stderr are **never** sent to the analytics vendor. Per-incident context is captured in the local NDJSON trace file and reaches us only via a user-initiated diagnostic bundle (see [`telemetry-error-tracking.md`](./telemetry-error-tracking.md)).

**Why this is worth writing down.** The team has now cycled through this question twice — first landing on enum-only, then flipping to emdash-style raw strings (500 char message + 2 KB stack) under the "everyone else does it" argument, then flipping back. Without a durable record the next reviewer is going to ask the same question. This is the answer.

### What we liked about T3 Code's posture

T3 Code (`/Users/thebr/source/repos/public/t3code/apps/server/src/observability/`) ships **zero error events** in its PostHog schema. Errors live in span exit status inside a local NDJSON trace file; that file is optionally mirrored to an operator-run OTLP endpoint (never to T3-operated infrastructure). The analytics lane and the debug lane are distinct code paths with distinct destinations.

Four things about this line up with Orca:

1. **The analytics lane stays truly free of UGC.** Our PostHog schema promises enums, booleans, and bucketed values — no raw strings from user-adjacent surfaces. Adding `error_message` + `error_stack` would have put the first freeform strings on a PostHog event, and they'd have been the *highest-UGC-risk* freeform strings possible (stack frames carry home-directory paths with usernames; provider SDK errors routinely echo API keys; tool stdout carries branch names and remote URLs). The doctrine and the schema agree again.
2. **Debuggability moves to the right lane.** A stack frame is debug data. Debug data belongs in the error-tracking lane, which we've already specced to handle it: local file by default, redactor at sink-write time, user-previewed bundle for share-back. That lane is designed for UGC; the PostHog lane isn't. Forcing one to do the other's job is how privacy incidents happen.
3. **Anonymity stays intact.** No `github_username`, no SHA-256 of a provider account file, no IP-based geo — and now, also no stack frames that identify the user via filesystem layout. We stay in the cluster that the audience we care about (Ghostty/Helix/kitty users) actually inspects our source to verify.
4. **It's a shipping pattern, not a thought experiment.** T3 Code runs this architecture in production. The "no errors in PostHog" position isn't us inventing a posture — it's us choosing a proven peer's.

### What emdash-style would have bought us, and why we paid too much

emdash (`src/main/lib/telemetry.ts:381-395`) ships `$exception_message` (500 chars), `$exception_type`, and `$exception_stack_trace_raw` (2 KB) to PostHog on every unhandled exception. superset-sh ships `chat_error { error_message, cwd, ... }`. Warp ships raw `error: String` on `*_Failed` events (mislabeled `contains_ugc: false`). Conductor ships stack traces. Four peers, same pattern.

The argument for copying it:
- **Unattended error capture.** We'd see crashes the user never reports. ~90% of incidents go unreported even with a polished share flow.
- **Per-class drill-down.** When `agent_error.error_class = auth_expired` spikes in v1.3.25, we'd have a frame to look at.

The argument against, which won:
- **The `$exception_*` field names are PostHog's convention for unlocking PostHog Error Tracking** — stack-hash grouping, Issues UI, alerts, dedup. **That product is a separate billing line we do not plan to turn on in v1.** Ship `error_message` + `error_stack` as plain properties and we'd be paying the full UGC cost without the aggregation benefit that's the reason other peers tolerate the cost.
- **Sentry would be the right tool for "unattended stack capture with grouping,"** and we've already decided not to do Sentry in v1 (scope, cost, vendor-audit surface, redaction discipline required). The emdash pattern is a half-measure between "no unattended crashes" and "Sentry" that gets us neither of the goods fully.
- **Every raw-string peer in our survey also violates at least one other privacy commitment** (emdash attaches `github_username` post-login; superset-sh sets `sendDefaultPii: true` on its web Sentry; Warp mislabels `contains_ugc`). That correlation isn't accidental — once a codebase ships one freeform string through analytics, the review-pressure to ship the next is structurally weaker. Saying "no raw strings through PostHog, full stop" is easier to maintain than "raw strings but only these, capped at these sizes, and trust the redactor."
- **The bundle lane already exists in the spec** and is specifically built for the per-incident case. Duplicating its job inside PostHog creates two inconsistent answers to the same question.

Net: emdash-style buys ~90% of crash incidents that never get reported, at the cost of the clean analytics-lane posture. Without Sentry's grouping/Issues UI on the other side, that trade doesn't pencil.

### Accept that this choice has a real cost

We should not soften this. Without Sentry and without raw strings in PostHog:

- **Most crashes we see are aggregate-only.** A user hits a bug, never DMs us, and we see a `+1` on `agent_error.error_class = unknown` and nothing else. That's the ~90% case.
- **Native crashes are lost entirely.** Electron main-process segfaults, renderer OOMs, and app hangs die before either lane can write. `app_closed { was_crash: true }` tells us it happened; nothing tells us why. The specced NDJSON lane doesn't fix this either; only `crashReporter` + minidump upload (i.e., Sentry or a first-party ingest) would.
- **Cross-user pattern detection is manual.** "Which users on v1.3.25 hit this stack frame?" requires bundles from each user plus hand-comparison. PostHog can't answer it with this schema.

This is a priced-in cost of staying in the no-UGC-in-analytics cluster. If it starts to hurt more than the alternative, reverse the decision — but do it deliberately, not because "everyone else does it."

### Conditions that would reverse this decision

Reopen the question if any of these become true:

1. **Sentry (or an equivalent first-party minidump ingest) gets scoped in.** If we ever have a UGC-capable error-tracking vendor with `beforeSend` redaction, stack dedup, and minidump support, the whole discussion changes. Raw strings on PostHog still don't come back — the error-tracking vendor is where they'd go.
2. **An error class we care about shows a sustained spike that we cannot diagnose from bundles alone.** Concretely: `error_class` trends up for 3+ consecutive weeks, we've asked and obtained bundles from affected users, and the bundles aren't enough (e.g., the failure is transient, timing-dependent, or occurs in a branch the user can't easily reproduce). In that case, consider adding a specific classified-shape event (e.g., `agent_auth_failed { provider, retry_count, is_first_this_session }`) — enums and bucketed counts, not raw strings. This is "add narrow signal for a narrow problem," not "reverse the posture."
3. **PostHog Error Tracking becomes free or near-free at our scale AND ships a server-side redactor we trust.** The cost barrier to the emdash-style pattern is the Error Tracking billing line plus the redactor-we-own regex-maintenance burden. If PostHog changes both of those, re-run the math.
4. **A privacy-audit or regulatory requirement specifically demands unattended crash telemetry.** (Implausible but worth naming — this would be the external forcing function.)

None of these are on the horizon as of 2026-05-02. If a future reader is reading this because they want to add raw error strings to PostHog, the answer is "no — unless one of the four conditions above has actually fired." Link this section, don't restart the thread.

### Where the reasoning lives (cross-refs)

- [`telemetry-plan.md`](./telemetry-plan.md) — the product-telemetry doctrine this decision preserves.
- [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) — the NDJSON + diagnostic-bundle lane that handles the per-incident case.
- [`telemetry-security-review.md`](./telemetry-security-review.md) — the threat model and review findings behind the split.

## Decision record: first-launch surface only for existing users

**Decided:** 2026-05-04. **Stays decided until** one of the reversal conditions below fires.

**The decision:** only the existing-user cohort sees a first-launch notice. New users get no first-launch UI — default-on at install, covered by the install-time disclosure. The existing-user notice has three controls:

- **✕ (top-right corner)** — silent acknowledge. Persists `optedIn: true`, fires **nothing**. Routes through a dedicated `telemetry:acknowledgeBanner` IPC channel so no `via` derivation can tag it.
- **Turn off** — explicit opt-out. Routes through `telemetry:setOptIn(false)`; main derives `via = 'first_launch_banner'` from the pre-mutation state and emits `telemetry_opted_out { via: 'first_launch_banner' }` **before** disabling the SDK.
- **Privacy policy** — opens the privacy doc URL; no state change, no dismiss.

No auto-dismiss, no delayed re-ask. Once resolved (✕ or Turn off), the notice never returns — the cohort condition (`optedIn === null`) clears in both paths.

**Supersedes:** the asymmetric banner-vs-toast design AND the brief unified-notice-for-both-cohorts draft. Reason: new-user consent is covered by install-time disclosure and every direct-shape competitor (emdash, Conductor, superset-sh, cmux, T3 Code, Continue, GitButler); shipping a new-user notice introduces friction the rest of the category has already rejected. Collapsing to one cohort also removes one `via` value, one component (`FirstLaunchToast`), and the `firstRunNoticeShown` field from `GlobalSettings.telemetry`. ✕-as-silent-opt-in is kept because ✕ is the universal close control — adding a second "Got it" button would visually compete with "Turn off" and muddy the decision.

**Preserved invariants:** existing users stay `optedIn: null` until they touch the surface; no events transmit for existing users until they interact (✕ or Turn off); the opt-out event fires **before** SDK disable; the privacy policy link stays; env-var blocked state takes precedence over first-launch-pending in the Privacy-pane gate.

**Reversal conditions:**
1. Analytics show new-user opt-out rates materially below install-time disclosure norms, indicating the default-on-for-new-users posture is underserving informed consent.
2. A privacy-audit finding specifically requires an explicit first-launch surface for new users, or an explicit two-button shape for existing users.

## Reference implementations

When implementing, reference these two open-source peers for working code. Both are checked out locally.

### Primary reference — emdash

**Path:** `/Users/thebr/source/repos/public/emdash`

Closest match to Orca's v1 implementation on every axis that matters: Electron app, PostHog Cloud, no-account anonymous install UUID, user-facing consent toggle, typed event map, main-process transport, sanitizer allowlist. The one pattern Orca v1 adopts directly from emdash is the allowlist-based sanitizer. The emdash heartbeat-crash-detection and explicit `daily_active_user { date, timezone }` patterns were considered and **deferred to v2** because DAU is derivable from `app_opened` and crashes are handled by separate T3-style crash reporting. We deliberately **do not** copy emdash's `captureException` pattern — see §`agent_error` and "Do NOT copy from emdash" below.

**Files to study:**
- `src/shared/telemetry.ts` — typed `TelemetryEventProperties` map (55 events). Our `src/shared/telemetry-events.ts` is the same shape idea, done Zod-first.
- `src/main/lib/telemetry.ts:81-170` — `sanitizeEventAndProps` allowlist. Pattern for our `validator.ts`.
- `src/main/lib/telemetry.ts:381-395` — `captureException` with `$exception_message` / `$exception_stack_trace_raw`. **Anti-pattern we reject.** Same field-shape would have been copied from here if Orca were shipping raw errors through PostHog; we are not (per-incident context lives in the NDJSON bundle lane instead). See §`agent_error` and `telemetry-error-tracking.md`.
- `src/main/lib/telemetry.ts:185-209` — raw `fetch()` transport. **Shape reference only** — we use `posthog-node` instead (retries, backoff, batching, bounded flush).

**Do NOT copy from emdash:**
- `$identify(github_username)` + `getBaseProps` spreading `github_username` / `account_id` into every event (`src/main/lib/telemetry.ts:60-75, 211-235`). Orca v1 is anonymous install UUID only, never identified; the majority of truly-anonymous peers (cmux, GitButler, Aider, Zed, Continue, TabbyML) match this posture.
- `captureException` with `$exception_message` / `$exception_stack_trace_raw` (`src/main/lib/telemetry.ts:381-395`). Raw error strings and stack frames in PostHog carry file paths, provider API responses, and SDK error bodies — the exact UGC the rest of our schema refuses. Orca's `agent_error` is enum-only; per-incident context flows through the local NDJSON bundle lane (`telemetry-error-tracking.md`).
- `project_id` / `task_id` / `conversation_id` scope envelope attached to every event — Orca v1 deliberately omits this (v2 candidate).
- Heartbeat crash detection and explicit `daily_active_user` events — both deferred to v2 (crashes handled by separate T3-style crash reporting; DAU derived server-side from `app_opened`).

### Secondary reference — superset-sh

**Path:** `/Users/thebr/source/repos/public/superset`

Use **only for activation-funnel event shape** (the `workspace_created` event). superset is account-based and ships raw UGC strings Orca explicitly counter-designs against, so this is not a reference for transport, identity, consent, or privacy posture. Their `workspace_initialized` split and `worktree_delete_safety_trigger` pattern were considered and deferred to v2.

**Files to study (funnel shape only):**
- `apps/desktop/src/lib/trpc/routers/workspaces/procedures/create.ts:213` — `workspace_created` call site. **They ship a raw `branch` name — we never do.**
- `packages/trpc/src/router/analytics/analytics.ts` — activation funnel dashboard definitions.

**Do NOT copy from superset:**
- Raw `branch` string on `workspace_created` — Orca's `workspace_created` strips branch entirely.
- `chat_error { operation, error_name, error_message, session_id, workspace_id, pane_id, cwd, organization_id }` in `apps/desktop/src/renderer/screens/main/components/WorkspaceView/ContentView/TabsContent/TabView/ChatPane/utils/reportChatError.ts:23-36` — raw error message + cwd + account-scoped IDs. `agent_error` is enum-only; per-incident error context lives in the NDJSON bundle lane.
- Account-based identity — Orca is anonymous.

### Why not Warp, Conductor, T3 Code, Zed

- **Warp** — RudderStack + data warehouse; hundreds of events registered at compile time; requires a data-engineering team. Pattern too heavy to copy. Also ships raw `error: String` fields on `*_Failed` events.
- **Conductor** — closed source; raw stack traces in errors.
- **T3 Code** — worth knowing about for the `has*`-boolean presence pattern (`hasCwd`, `hasInput`), but identity chain derives `distinct_id` from a SHA-256 of the provider account file, which breaks Orca's anonymous-telemetry promise.
- **Zed** — native Rust, multi-vendor (Amplitude + Snowflake + Sentry + Hex); ships file extensions + detected frameworks (too close to user-profiling for v1).

The peer notes above are the only ones still meant to guide implementation.

## Codebase claims — verification status

These assertions in the doc were checked against the current `brennanb2025/telemetry` branch before the rollout. Line numbers here are pinned at verification time; they will drift.

**Verified:**
- `Store.updateSettings(updates: Partial<GlobalSettings>)` at `src/main/persistence.ts:334`. No `setSettings` method exists.
- `Store.load()` shape at `persistence.ts:73-155` — `existsSync(getDataFile())` at line 76, try/catch for corrupt-file fallback, returns `getDefaultPersistedState(homedir())` on failure.
- `Store.getSettings()` at `persistence.ts:330`.
- `Store.flush()` at `persistence.ts:427` — synchronous, clears `writeTimer`, calls `writeToDiskSync()`. Available if a future telemetry flow needs quit-safe persistence.
- ~300 ms settings debounce at `persistence.ts:170`.
- `writeToDiskSync` + tmp-file + rename pattern at `persistence.ts:211-235`. Available for any future v2 telemetry file that needs the same atomic-write pattern (v1 does not add one — the heartbeat file was cut with `app_closed`).
- `will-quit` 2-pass at `src/main/index.ts:500-532` — `daemonDisconnectDone` flag, `e.preventDefault()` + `disconnectDaemon().finally(() => app.quit())`. The telemetry `shutdownTelemetry` call folds into the existing `.finally()` chain.
- `parseWorkspaceSession` Zod parse-at-boundary precedent at `src/shared/workspace-session-schema.ts:202` (uses `.safeParse` with `{ok, value} | {ok, error}` return).
- `AGENT_NAMES` exported from `src/shared/agent-detection.ts:19` — current values `['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode', 'aider']`. This list is relevant to UI/runtime title detection only; product telemetry uses the explicit launch request metadata instead, so telemetry enums may legitimately include values that `AGENT_NAMES` does not.
- `zod@^4.3.6` already in `dependencies`. Use v4 API.
- `StatsCollector.onAgentStarted` at `src/main/stats/collector.ts:69` (count-only, kept unchanged) and `StatsCollector.onAgentStart` at line 90.

**Flagged as gaps (addressed in the rollout):**
- `boolean | null` is a new pattern in `GlobalSettings` — no existing field uses it. Worth calling out in the PR description so reviewers don't push back on the shape.
- `electron.vite.config.ts` has no `define` block and there are no compile-time `ORCA_*` constants (existing `ORCA_*` identifiers are all runtime `process.env`). PR 2 adds both the `define` block and the ambient `.d.ts` — tracked in §Dev/CI handling → Build-time injection.
- `detectAgentFromCommand` **does not exist** in `src/shared/agent-detection.ts` — detection is title-based, not command-based. The rollout deliberately avoids any dependence on title-based detection for product telemetry; the renderer passes `initial_agent_kind` from the launch request.

## Architecture at a glance

```
┌─────────────────────────────────────────────────────────────────────┐
│ Renderer                                                            │
│                                                                     │
│   window.api.telemetryTrack(name, props)  ◄── typed via EventMap    │
│                         │                                           │
└─────────────────────────┼───────────────────────────────────────────┘
                          │ IPC ('telemetry:track')
┌─────────────────────────▼───────────────────────────────────────────┐
│ Main                                                                │
│                                                                     │
│   src/main/telemetry/client.ts                                      │
│     ├─ track(name, props)                                           │
│     │    ├─ shutdown gate                                           │
│     │    ├─ consent gate (consent.ts)                               │
│     │    ├─ validator  (validator.ts)  ── fail-closed               │
│     │    ├─ burst cap  (token bucket)                               │
│     │    └─ posthog.capture({...})                                  │
│     ├─ optIn() / optOut()                                           │
│     └─ shutdown()                                                   │
│                                                                     │
│   src/main/telemetry/consent.ts      ── pure function, env + store  │
│   src/main/telemetry/install-id.ts   ── UUID generate/read          │
│                                                                     │
│   src/shared/telemetry-events.ts     ── Zod schemas = single        │
│                                        source of truth for types + │
│                                        runtime validation          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
                 us.i.posthog.com
```

**Key invariants:**
1. The renderer has **no** PostHog SDK. There is one PostHog client in the process tree — `posthog-node` in main.
2. **Every** `track()` call path — main-originated *and* IPC-arrived — hits the same validator. The validator is the sole enforcement point; TypeScript types don't survive IPC serialization.
3. Consent is resolved from environment + `GlobalSettings.telemetry` on every event. It is never cached in a module-level boolean that could drift.
4. Events are named in exactly one place: `src/shared/telemetry-events.ts`. Adding an event means adding a Zod schema to `eventSchemas`; `EventMap` updates automatically via `z.infer`. Call sites that reference unknown event names fail `tsc`, and the same schema gates the runtime path at IPC arrival.

**Security framing for the validator.** Invariant 2 is the security boundary, not just a developer-ergonomics one. The renderer renders attacker-controllable content (agent output, MCP responses, file contents, markdown, diff views). An XSS-equivalent rendering bug in any of those paths gives an attacker the ability to call `window.api.telemetry*` at will. The validator, the two-layer burst cap (per-event-name + per-session global), the consent-mutation rate limit, and the strict IPC type-narrows are collectively designed to fail closed under a *compromised-renderer* threat model — not just a misbehaving-renderer one. Changes to any of those four controls should be reviewed against that threat model.

## File inventory

New files:

| Path | Purpose | First PR |
|---|---|---|
| `src/shared/telemetry-events.ts` | Zod schemas (`eventSchemas`, `commonPropsSchema`, enum schemas); `EventMap` derived via `z.infer`; the single source of truth for both compile-time types and runtime validation | PR 2 |
| `src/main/telemetry/client.ts` | `posthog-node` wrapper; `track()`; `optIn`/`optOut`/`shutdown` | PR 2 |
| `src/main/telemetry/consent.ts` | Pure `resolveConsent(env, settings)` function | PR 1 |
| `src/main/telemetry/install-id.ts` | UUID generate/read against `GlobalSettings.telemetry.installId` | PR 1 |
| `src/main/telemetry/validator.ts` | Thin wrapper: calls `eventSchemas[name].safeParse(props)` and returns the ok/drop verdict. No schema declarations — the schemas live in `telemetry-events.ts`. | PR 2 |
| `src/main/telemetry/classify-error.ts` | Small best-effort mapper: thrown error → `ErrorClass` enum bucket (`'binary_not_found'` for ENOENT/"not found" message; `'unknown'` for everything else). ~30 LOC. | PR 4 |
| `src/main/telemetry/burst-cap.ts` | Per-event-name token bucket used by `client.ts` | PR 2 |
| `src/main/ipc/telemetry.ts` | `registerTelemetryHandlers()` → `telemetry:track`, `telemetry:setOptIn` (no `store` arg — the handlers call into `client.ts`, which reads the module-level `storeRef` populated by `initTelemetry(store)`) | PR 2 |
| `src/renderer/src/components/settings/PrivacyPane.tsx` | Settings → Privacy UI | PR 3 |
| `src/renderer/src/components/FirstLaunchBanner.tsx` | Existing-user first-launch notice (cohort gated — no new-user surface). ✕ = silent opt-in via `telemetry:acknowledgeBanner`; Turn off = opt-out via `telemetry:setOptIn(false)` with `via: 'first_launch_banner'`. | PR 3 |
| `src/renderer/src/components/TelemetryFirstLaunchSurface.tsx` | Root-mounted gate: renders `FirstLaunchBanner` only when `existedBeforeTelemetryRelease === true && optedIn === null`. | PR 3 |
| `src/renderer/src/components/settings/privacy-search.ts` | Settings search keywords | PR 3 |

Edited files:

| Path | Change | First PR |
|---|---|---|
| `src/shared/types.ts` | Add `telemetry?: {...}` block to `GlobalSettings` | PR 1 |
| `src/main/persistence.ts` | Migration: set `existedBeforeTelemetryRelease` + initialize `optedIn` + `installId` once | PR 1 |
| `src/main/index.ts` | `initTelemetry(store)` and `telemetry.shutdown()` folds into `will-quit` | PR 2 |
| `src/main/ipc/register-core-handlers.ts` | Register `telemetry` handlers | PR 2 |
| `src/preload/api-types.ts` | Declare `telemetryTrack`, `telemetrySetOptIn` | PR 2 |
| `src/preload/index.ts` | Expose the three bridges | PR 2 |
| `src/renderer/src/components/settings/Settings.tsx` | Add Privacy tab | PR 3 |
| `src/renderer/src/components/settings/SettingsSidebar.tsx` | Add Privacy sidebar entry | PR 3 |
| `README.md` | Add **Privacy & Telemetry** section (canonical on-repo disclosure — see [`telemetry-plan.md` decision 6](./telemetry-plan.md#6-privacy-documentation--readme-section)) | PR 1 |

**No changes** to `src/main/stats/` event *types* — the local `StatsCollector` keeps its existing shape; telemetry subscribes via new listener methods, it does not replace stats.

## The typed event map (`src/shared/telemetry-events.ts`)

Single source of truth. Every event name, every property, every enum value lives here. Vendor migration = rewrite `client.ts`, not call sites.

**Zod-first, no dual declaration.** The schema is declared once, in Zod, and the TypeScript `EventMap` is `z.infer`-derived from it. The codebase already uses Zod at read boundaries (see `src/shared/workspace-session-schema.ts` for the `parseWorkspaceSession` pattern), so this file follows the same convention rather than inventing a parallel compile-time/runtime split. Earlier drafts of this doc maintained a hand-rolled `EventMap` alongside a runtime `EVENT_SPEC` and a drift-detector test to keep the two aligned; the dual declaration is gone by construction now — the runtime schema **is** the type source, so there is nothing to drift.

No new dependency: `zod` is already in the tree.

```ts
// src/shared/telemetry-events.ts

import { z } from 'zod'

// ── Shared property enums ───────────────────────────────────────────────

// Mirrors the detectable agents in `src/shared/agent-detection.ts`
// (`AGENT_NAMES`), with one deliberate shift: `claude` in AGENT_NAMES ↔
// `claude-code` here (product, not CLI string) so dashboards read cleanly.
//
// Enum values are limited to agents that have a real emit path today. Adding
// a new agent is additive-safe — extend this enum when the call site that
// would emit it lands, not in anticipation.
export const agentKindSchema = z.enum([
  'claude-code',
  'codex',
  'gemini',
  'copilot',
  'cursor',
  'opencode',
  'aider',
  'other'
])
export type AgentKind = z.infer<typeof agentKindSchema>

// Trimmed to the two values Orca's PTY-typed-command launch architecture can
// actually emit:
//   - `binary_not_found` — `provider.spawn` ENOENT (the *shell* binary is
//     missing). The agent CLI being missing is invisible: Orca spawns a
//     healthy shell and types the command, and bash/zsh's "command not found"
//     surfaces only as terminal output.
//   - `unknown` — every other thrown error.
// Provider-side errors (`auth_expired`, `rate_limited`, `network_timeout`,
// `provider_*`) happen inside the agent CLI subprocess and are not observable
// to Orca. Adding a new value is additive-safe; do it when the call site
// lands, not in anticipation. The earlier draft also carried an
// `AGENT_ERROR_NAME_WHITELIST` constraining an optional `error_name` property
// on `agent_error`; both were deferred when the enum trim collapsed
// `error_name`'s utility (with two enum values, the per-name whitelist
// carries no additional signal). The whitelist mechanism can be re-introduced
// alongside any future enum expansion that benefits from it.
export const errorClassSchema = z.enum(['binary_not_found', 'unknown'])
export type ErrorClass = z.infer<typeof errorClassSchema>

export const repoMethodSchema = z.enum(['folder_picker', 'clone_url', 'drag_drop'])
export type RepoMethod = z.infer<typeof repoMethodSchema>

export const workspaceSourceSchema = z.enum([
  'command_palette',
  'sidebar',
  'shortcut',
  'drag_drop',
  'unknown'
])
export type WorkspaceSource = z.infer<typeof workspaceSourceSchema>

export const launchSourceSchema = z.enum([
  'command_palette',
  'sidebar',
  'tab_bar_quick_launch',
  'task_page',
  'new_workspace_composer',
  'workspace_jump_palette',
  'shortcut',
  'unknown'
])
export type LaunchSource = z.infer<typeof launchSourceSchema>

export const requestKindSchema = z.enum(['new', 'resume', 'followup'])
export type RequestKind = z.infer<typeof requestKindSchema>

// `env_var` is deliberately absent — env-var and CI paths override consent at
// runtime only (see consent.ts), they never mutate `optedIn` and therefore
// never fire a `telemetry_opted_in/out` event. If a future path ever
// explicitly persists an env-var-driven opt-out, add `env_var` back here
// together with the call site.
// `first_launch_notice` is deliberately absent — new users have no
// first-launch surface (see "Decision record: first-launch surface only
// for existing users"), so there is no new-user cohort to tag. Any
// opt-out a new user makes routes through Settings → Privacy and tags
// as `'settings'`. `first_launch_banner` is the tag for the existing-
// user notice's "Turn off" button. The notice's ✕ (silent acknowledge)
// persists `optedIn: true` through a separate IPC channel
// (`telemetry:acknowledgeBanner`) that emits nothing, so that path
// never reaches this schema.
export const optInViaSchema = z.enum(['first_launch_banner', 'settings'])
export type OptInVia = z.infer<typeof optInViaSchema>

// Whitelist of settings whose `setting_key` may be emitted on settings_changed.
// If a setting isn't in this list, we do not emit.
//
// Keys are camelCase to match the actual field names in GlobalSettings
// (`src/shared/types.ts` — `editorAutoSave` at line 853, `openLinksInApp` at
// 918, `experimentalTerminalDaemon` at 1014, `experimentalAgentDashboard` at
// 1027). `orca_channel` is intentionally absent — it is a build-time common
// property baked in from `ORCA_BUILD_IDENTITY`, not a user-togglable setting.
//
// Intentionally does NOT include the telemetry opt-in toggle — that is
// covered by the dedicated `telemetry_opted_in` / `telemetry_opted_out`
// events, which carry `via` context that a plain `settings_changed` could
// not. Listing it here would double-fire.
//
// Kept as an `as const` tuple so the Zod enum below and any call-site usage
// share one array — typo-drift is impossible.
export const SETTINGS_CHANGED_WHITELIST = [
  'editorAutoSave',
  'openLinksInApp',
  'experimentalTerminalDaemon',
  'experimentalAgentDashboard'
] as const
export const settingsChangedKeySchema = z.enum(SETTINGS_CHANGED_WHITELIST)
export type SettingsChangedKey = z.infer<typeof settingsChangedKeySchema>

// ── Per-event schemas ───────────────────────────────────────────────────
//
// `.strict()` on every object is what enforces "no extra keys" at runtime —
// the validator does not need a separate extra-key check because zod rejects
// unknown keys at parse time. This is the runtime counterpart to the
// compile-time "unions of string literals, no raw `string`" rule.

const emptySchema = z.object({}).strict()

const repoAddedSchema = z.object({ method: repoMethodSchema }).strict()

const workspaceCreatedSchema = z.object({
  source: workspaceSourceSchema,
  from_existing_branch: z.boolean()
}).strict()

const agentStartedSchema = z.object({
  agent_kind: agentKindSchema,
  launch_source: launchSourceSchema,
  request_kind: requestKindSchema
}).strict()

// Enum-only by design for both fields. `error_message` and `error_stack` are
// deliberately absent — `.strict()` rejects either key if a call site ever
// tries to attach one, which fails the validator and drops the event. Four
// audited peers (emdash, superset-sh, Warp, Conductor) ship raw error strings
// and stack traces through their analytics vendor; we do not. Rationale:
//   - The PostHog lane is the one place we have committed to "no UGC." A
//     raw stack frame contains file paths like `/Users/<name>/...`; a
//     provider SDK error message routinely echoes request-body fragments
//     and API keys; failed shell/git stdout carries branch names and
//     remote URLs. The redactor belongs on the error-tracking lane
//     (see `telemetry-error-tracking.md`), not bolted onto a PostHog event.
//   - We do not ship Sentry in v1. The `$exception_*` PostHog field names
//     only pay off when paired with PostHog Error Tracking (stack-hash
//     grouping, Issues UI) — we would pay the UGC cost without the
//     aggregation benefit.
//   - Per-incident stack context lives in the local NDJSON trace file and
//     reaches us only via a user-initiated diagnostic bundle. This matches
//     T3 Code's posture and keeps the anonymity promise intact.
//   - The architectural decision that closes most of the leak surface in
//     the first place is the PTY-shell-typed-command launch model: agent
//     SDK errors live inside the agent CLI subprocess and never cross the
//     parent boundary, so there is no raw error to redact for those cases.
const agentErrorSchema = z.object({
  error_class: errorClassSchema,
  agent_kind: agentKindSchema
}).strict()

const settingsChangedSchema = z.object({
  setting_key: settingsChangedKeySchema,
  value_kind: z.enum(['bool', 'enum'])
}).strict()

const telemetryOptedInSchema = z.object({ via: optInViaSchema }).strict()
const telemetryOptedOutSchema = z.object({ via: optInViaSchema }).strict()

// ── Event registry: the one record the validator consumes ───────────────
//
// The validator does `eventSchemas[name].safeParse(props)`. `EventMap` is
// `z.infer`-derived from this record, so there is exactly one source of truth
// for both compile-time types and runtime validation.
export const eventSchemas = {
  app_opened: emptySchema,

  repo_added: repoAddedSchema,
  workspace_created: workspaceCreatedSchema,

  agent_started: agentStartedSchema,
  agent_error: agentErrorSchema,

  settings_changed: settingsChangedSchema,

  telemetry_opted_in: telemetryOptedInSchema,
  telemetry_opted_out: telemetryOptedOutSchema
} as const

export type EventMap = { [N in keyof typeof eventSchemas]: z.infer<(typeof eventSchemas)[N]> }
export type EventName = keyof EventMap
export type EventProps<N extends EventName> = EventMap[N]

// Common props attached by the client — declared here so the validator
// knows which keys to allow on every outgoing event.
//
// No `env: 'prod' | 'dev'` property. Every transmitted event is by
// construction from an official CI build (see §Dev/CI handling), so a wire
// discriminator would be redundant. Contributor / `pnpm dev` builds do not
// transmit at all; they console-mirror.
//
// Every string field carries the 64-char cap directly — this is what the
// validator's "string-length cap" rule is made of; there is no separate
// post-parse length check to keep in sync with the schema.
export const commonPropsSchema = z.object({
  app_version: z.string().max(64),
  platform: z.string().max(64), // NodeJS.Platform is a union of short strings
  arch: z.string().max(64),
  os_release: z.string().max(64),
  // `.min(1)` on the two id fields: `install_id` backs PostHog's `distinctId`
  // and `session_id` is the per-process correlation key. An empty string on
  // either would collapse unrelated events into a single synthetic "user" /
  // "session" and silently corrupt every downstream dashboard, which is the
  // actual observed failure mode we're pinning against. Not pinned to UUID
  // shape — forward-compat with a future id scheme is cheap to preserve.
  install_id: z.string().min(1).max(64),
  session_id: z.string().min(1).max(64),
  orca_channel: z.enum(['stable', 'rc'])
}).strict()
export type CommonProps = z.infer<typeof commonPropsSchema>
```

**Rules the file enforces by construction:**
- Adding an event requires adding an entry to `eventSchemas`. `EventMap` updates automatically via `z.infer`; call sites fail `tsc` if the name is unknown.
- Enum properties are `z.enum([...])` — equivalent to compile-time string-literal unions but with a runtime check built in. No raw `z.string()` on enum-shaped properties.
- Free-form string fields carry an explicit `.max(N)` cap at the schema (64 for bounded context fields like `session_id`/`install_id`). Every event property is an enum, boolean, or bucketed value. The validator's length cap and the schema are the same thing.
- `.strict()` on every `z.object` is the runtime counterpart to "no extra keys" — unknown keys fail `safeParse` directly; no separate extra-key check exists or is needed.

## `GlobalSettings.telemetry` shape

Add to `src/shared/types.ts`:

```ts
export type GlobalSettings = {
  // ... existing fields
  telemetry?: {
    /** New users: initialized to `true` at install.
     *  Existing users: `null` until they resolve the first-launch notice. */
    optedIn: boolean | null
    /** Anonymous UUID v4. Generated on first run. Not surfaced in the UI —
     *  see telemetry-plan.md decision 10 for rationale. */
    installId: string
    /** Cohort marker set once during migration. Distinguishes initial `optedIn`
     *  default (existing → `null`, new → `true`) and gates the
     *  FirstLaunchBanner mount condition — only `true` for this field
     *  combined with `optedIn === null` renders the notice. New users have
     *  no first-launch surface at all. */
    existedBeforeTelemetryRelease: boolean
    // NOTE: no `lastActiveDate`, `lastSessionId`, or `lastHeartbeatTs` fields in
    // v1 — these existed in earlier drafts to support `daily_active_user`
    // gating and the `app_closed { was_crash }` heartbeat sentinel respectively,
    // both of which are now deferred to v2. DAU is derived server-side from
    // `app_opened`; crashes are handled by separate T3-style crash reporting.
    // Deferred in v1 because the source signal is ambiguous at the PTY layer.
  }
}
```

## Migration (one-shot, PR 1)

Runs in `Store.load()` before any telemetry initialization. No events transmit until PR 3.

**Signal the migration uses:** `existsSync(getDataFile())` at the top of `Store.load()` — true iff `orca-data.json` already existed when this process started. This is the only unambiguous "has the user run Orca before?" signal. Field-based inference (e.g., "does `settings.lastSeenVersion` exist?") does not work on the telemetry release itself, because every field the migration might key off is either new (so absent on every pre-telemetry install) or pre-existing (so absent on some pre-telemetry installs that never touched it).

```ts
// src/main/persistence.ts  (inside Store.load())

const dataFile = getDataFile()
const fileExistedOnLoad = existsSync(dataFile)

let parsed: PersistedState
try {
  // existing load + parse path
} catch {
  // existing corrupt-file fallback — returns defaults with telemetry: undefined.
  parsed = getDefaultPersistedState(homedir())
}

// Telemetry migration runs on whatever `parsed` ended up as — both the
// clean-parse path and the corrupt-file catch path route through here. This
// is load-bearing: a corrupt file leaves `fileExistedOnLoad === true`, so
// the user is classified as existing and enters the notice with
// `optedIn: null` rather than silently getting the default-on new-user
// cohort (see Edge case below).
if (parsed.settings?.telemetry?.existedBeforeTelemetryRelease === undefined) {
  // fileExistedOnLoad === true  ⇔ user has pre-telemetry state ⇔ existing-user cohort
  // fileExistedOnLoad === false ⇔ truly fresh install ⇔ new-user cohort
  parsed.settings = {
    ...parsed.settings,
    telemetry: {
      ...parsed.settings?.telemetry,
      existedBeforeTelemetryRelease: fileExistedOnLoad,
      // New users: on. Existing users: undecided (first-launch notice gates everything).
      optedIn: fileExistedOnLoad ? null : true,
      installId: parsed.settings?.telemetry?.installId ?? randomUUID()
    }
  }
}
```

`fileExistedOnLoad` is already computed for the `existsSync(dataFile)` branch above the migration; the migration reads the same value so there is one source of truth for "has this profile been seen before."

**Edge case — corrupt file reset.** If `Store.load()` hits the catch block (corrupt JSON, unreadable file) and starts fresh, `fileExistedOnLoad` is still `true` because the file was present on disk. The migration runs after the try/catch, so the corrupt-file catch path also applies it and classifies these users as existing. That's the correct choice: a user whose `orca-data.json` got corrupted is not a fresh install of the telemetry release, and silently opting them in would violate the same social contract we're protecting elsewhere.

**Invariant the migration preserves:** after migration, every user has `installId` populated; `optedIn` is `true` (new) or `null` (existing); `existedBeforeTelemetryRelease` is the cohort discriminator used by the first-launch UI.

## Consent resolver (`src/main/telemetry/consent.ts`)

One pure function. Every call site goes through it — no scattered env checks.

```ts
// src/main/telemetry/consent.ts

import type { GlobalSettings } from '../../shared/types'

export type ConsentState =
  | { effective: 'enabled' }
  | { effective: 'disabled'; reason: 'do_not_track' | 'orca_disabled' | 'ci' | 'user_opt_out' | 'notice_unresolved' }
  | { effective: 'pending_notice' }  // existing-user cohort, first-launch notice not yet resolved

const CI_ENV_VARS = [
  'CI',
  'GITHUB_ACTIONS',
  'GITLAB_CI',
  'CIRCLECI',
  'TRAVIS',
  'BUILDKITE',
  'JENKINS_URL',
  'TEAMCITY_VERSION'
] as const

function isEnvVarTruthy(name: string): boolean {
  const v = process.env[name]
  if (!v) return false
  const normalized = v.trim().toLowerCase()
  if (normalized === '1' || normalized === 'true') return true
  // Log warning once for misconfigured values like "yes", "on", "FALSE"
  warnOnceMisconfigured(name, v)
  return false
}

export function resolveConsent(settings: GlobalSettings): ConsentState {
  if (isEnvVarTruthy('DO_NOT_TRACK')) return { effective: 'disabled', reason: 'do_not_track' }
  if (isEnvVarTruthy('ORCA_TELEMETRY_DISABLED')) return { effective: 'disabled', reason: 'orca_disabled' }
  if (CI_ENV_VARS.some((v) => process.env[v])) return { effective: 'disabled', reason: 'ci' }

  const t = settings.telemetry
  if (!t) return { effective: 'pending_notice' } // shouldn't happen after migration

  if (t.optedIn === true) return { effective: 'enabled' }
  if (t.optedIn === false) return { effective: 'disabled', reason: 'user_opt_out' }

  // optedIn === null ⇒ existing-user cohort awaiting first-launch-notice resolution
  return { effective: 'pending_notice' }
}
```

**Why a discriminated union rather than a boolean:** the Privacy pane needs to render a "disabled because DO_NOT_TRACK is set" message (`reason` drives the copy). The first-launch notice needs to distinguish "existing user awaiting decision" from "user explicitly opted out" (`effective: 'pending_notice'` vs `effective: 'disabled'`). A boolean conflates these and forces the UI to re-derive the reason from env — which is exactly the scattered-env-check problem this function exists to solve.

**Non-persistent override:** env-var and CI paths set the effective consent to `disabled` at runtime only. They never write to `GlobalSettings.telemetry.optedIn`. Unsetting the var restores the user's real preference on next launch.

## Runtime validator (`src/main/telemetry/validator.ts`)

Fail-closed, rate-limited warnings, single enforcement point for both main-originated and IPC-arrived events. The schema *is* the validator — there is no parallel `EVENT_SPEC` to keep in sync.

```ts
// src/main/telemetry/validator.ts

import {
  commonPropsSchema,
  eventSchemas,
  type EventName,
  type EventProps
} from '../../shared/telemetry-events'

type ValidationResult<N extends EventName> =
  | { ok: true; props: EventProps<N> }
  | { ok: false; reason: string }

export function validate<N extends EventName>(name: N, props: unknown): ValidationResult<N> {
  // 1. Event name is a known key — `eventSchemas` is the source of truth for
  //    what names exist. No parallel spec to fall out of sync with.
  const schema = eventSchemas[name]
  if (!schema) return { ok: false, reason: `unknown event: ${name}` }

  // 2. `.safeParse()` enforces exact key set + types + enum membership +
  //    per-string .max() cap in one call. `.strict()` on each object schema
  //    is what rejects extra keys.
  const parsed = schema.safeParse(props)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const path = issue?.path.join('.') || '<root>'
    return { ok: false, reason: `${name}: ${path}: ${issue?.message}` }
  }

  return { ok: true, props: parsed.data as EventProps<N> }
}

// commonPropsSchema is used in client.ts to re-validate the merged outgoing
// payload just before capture() — catches the one attack vector where a bug
// in how we build CommonProps produces an oversized string, without requiring
// the validator to know about common keys.
export { commonPropsSchema }
```

**Contract:**
- Unknown event name → drop, `console.warn('[telemetry] unknown event:', name)`. Never call `posthog.capture`.
- Extra property key → drop + warn. (Enforced by `.strict()` on every per-event object schema; no separate check.)
- Missing required key / wrong type / value not in declared enum → drop + warn. (Enforced by `safeParse`.)
- Any string longer than its schema-declared `.max(N)` cap → drop + warn. (Enforced by `.max()` on each free-form string field — the cap and the schema are the same thing. Values: 64 for bounded context fields like `session_id`/`install_id`.)
- Warnings rate-limited: max 1 log per `event_name` per minute. Silent otherwise.

**Burst cap.** Two independent caps enforced in `client.ts` around the validator. Both must be satisfied for an event to transmit.

*Per-event-name token bucket:*
- `agent_error`: 20 / min
- all others: 30 / min
- Overflow: drop silently with one `console.warn` per event-name per minute.

*Per-session global ceiling:* ≤ 1,000 events total per `session_id`, hard ceiling. Justification: the surveyed outlier user emits ~400 events/day; a 1,000-event ceiling per launch is 2.5× that and still a ~30× safety factor below what a compromised renderer could emit at the per-event-name cap alone (8 event literals × 30/min × 60 min = 14,400/hour). Overflow: drop silently with a single `console.warn` when the ceiling is first crossed in a session.

Why two caps. The per-event-name bucket defends against runaway-`useEffect` bugs and repeated error serializations. The per-session ceiling is the compromised-renderer defense: a renderer rendering attacker-controllable content (agent output, MCP responses, file contents) can call `window.api.telemetryTrack(...)` at any rate the per-event-name bucket allows. Without a global ceiling, a compromised renderer could emit ~650K events over a 24h session, exhausting the $500/mo billing cap in one session.

Both caps are cheap (O(1) per call). The ceiling resets per `session_id` — a legitimate heavy user opening many sessions will not hit it; a renderer compromise within a single session will.

**Prototype-chain guard on the per-event bucket.** `consumeBurstToken(name)` rejects names that are not own-properties of `eventSchemas` — `Object.hasOwn(eventSchemas, name)`, not `name in eventSchemas`. The `in` operator walks the prototype chain, so a compromised renderer passing `'toString'` / `'__proto__'` / `'constructor'` / etc. as the event name would pass the membership check and seed a bucket for every `Object.prototype` key. Growth would be bounded (~12 keys), but the whole point of this check is to keep `perEventBuckets` pinned to the compile-time `eventSchemas` surface. Downstream validator still rejects with the proper "unknown event" reason.

## The `track()` wrapper (`src/main/telemetry/client.ts`)

```ts
// src/main/telemetry/client.ts

import { PostHog } from 'posthog-node'
import type { EventName, EventProps, CommonProps } from '../../shared/telemetry-events'
import { resolveConsent } from './consent'
import { validate } from './validator'
import { consumeBurstToken } from './burst-cap'

// Compile-time build identity. Populated by the official CI release pipeline
// via an env var at build time (see electron-vite.config.*). Contributor
// checkouts, `pnpm dev`, and third-party forks do NOT set this; the constant
// defaults to null and `track()` short-circuits to console-mirror.
// Plan rationale: telemetry-plan.md §Dev/CI handling, Decision 7.
declare const ORCA_BUILD_IDENTITY: 'stable' | 'rc' | null
declare const ORCA_POSTHOG_WRITE_KEY: string | null

// Compile-time feature flag. PR 2 ships with this false; PR 3 flips it on once
// the PostHog project is live and dashboards are verified. Independent of the
// build-identity gate: both must be satisfied to transmit, so flipping the flag
// alone still leaves contributor builds silent.
const TELEMETRY_ENABLED = false

// Derived once at module load. A build is eligible to transmit only if BOTH the
// identity constant and a write key were injected by the pipeline. One without
// the other is treated as a pipeline misconfiguration and fails closed.
const IS_OFFICIAL_BUILD: boolean =
  (ORCA_BUILD_IDENTITY === 'stable' || ORCA_BUILD_IDENTITY === 'rc') &&
  typeof ORCA_POSTHOG_WRITE_KEY === 'string' &&
  ORCA_POSTHOG_WRITE_KEY.length > 0

// Main-process-only state. Module-level singletons follow the same pattern
// already used for `posthog` and `commonProps`; threading `store` through every
// exported function would work but is verbose, and the store is a true
// process-wide singleton anyway (there is one `Store` instance in main).
let posthog: PostHog | null = null
let sessionId: string | null = null
let commonProps: CommonProps | null = null
let shuttingDown = false
let storeRef: Store | null = null

export function initTelemetry(store: Store): void {
  // Set storeRef unconditionally so other exports (setOptIn) can read it
  // even in console-mirror builds — they still need to mutate persisted
  // settings.
  storeRef = store
  if (!TELEMETRY_ENABLED || !IS_OFFICIAL_BUILD) return
  const settings = store.getSettings()
  sessionId = randomUUID()
  commonProps = buildCommonProps(settings, sessionId, ORCA_BUILD_IDENTITY!)
  // Validate commonProps ONCE at init, fail closed. A bad `install_id` (e.g.
  // empty string from a migration bug) would collapse every event in the
  // session under one synthetic PostHog `distinct_id` — we refuse to initialize
  // transport rather than ship malformed identity on every capture. The check
  // lives here, not in track(), because commonProps is a module-level singleton
  // built exactly once from inputs that cannot change mid-session.
  if (!commonPropsSchema.safeParse(commonProps).success) {
    commonProps = null
    return
  }
  posthog = new PostHog(ORCA_POSTHOG_WRITE_KEY!, {
    host: 'https://us.i.posthog.com',
    flushAt: 20,
    flushInterval: 10_000,
    // Strip every auto-attached property we don't want on our wire: no GeoIP,
    // no client IP, no web-library fingerprint. See "PostHog auto-properties"
    // below — every field on every event comes from our explicit `CommonProps`
    // or from the event's own `EventProps`.
    disableGeoip: true,
    // Default is 1000; when exceeded, the SDK drops oldest-first. Bumped to
    // 5000 to tolerate long-offline sessions (flights, VPN-down, tunnels).
    // The per-session 1,000-event ceiling in track() is still the dominant
    // cap under normal operation; this just widens the offline buffer.
    maxQueueSize: 5000
  })
  // The SDK's opt-out flag lives in its in-memory `storage-memory` module and
  // does NOT persist across process restarts — our persistent state is
  // `GlobalSettings.telemetry.optedIn`, which is what we re-apply here on
  // every boot. Do not remove this re-apply thinking it's redundant with the
  // persisted setting; the SDK flag is the one that actually gates capture().
  const consent = resolveConsent(settings)
  if (consent.effective !== 'enabled') posthog.optOut()
}

export function track<N extends EventName>(name: N, props: EventProps<N>): void {
  // Console mirror: always, in non-official builds (so dev-team and contributors
  // both see what would transmit), and also in official builds when the feature
  // flag is off (PR 2 verification).
  if (!IS_OFFICIAL_BUILD || !TELEMETRY_ENABLED) {
    console.debug('[telemetry]', name, props)
    return
  }
  if (shuttingDown) {
    console.debug('[telemetry] shutdown-gate drop:', name)
    return
  }
  if (!posthog || !commonProps || !storeRef) return

  // Burst cap BEFORE consent. A compromised renderer of an opted-out user
  // should not be able to burn handler CPU by repeatedly invoking track() at
  // arbitrary rate and forcing main to re-read settings and re-evaluate
  // resolveConsent on every call — the cap is O(1), the consent resolve isn't.
  // This ordering is the difference between "opt-out is a free drop" and
  // "opt-out is a cheap drop at the cost of a settings read per event."
  if (!consumeBurstToken(name)) return

  const consent = resolveConsent(storeRef.getSettings())
  if (consent.effective !== 'enabled') return

  const result = validate(name, props)
  if (!result.ok) {
    warnRateLimited(name, result.reason)
    return
  }

  posthog.capture({
    distinctId: commonProps.install_id,
    event: name,
    // `$process_person_profile: false` is the server-SDK equivalent of
    // posthog-js's `person_profiles: 'identified_only'` — posthog-node has no
    // init-time option, so we attach it per-event. Without this, posthog-node
    // materializes a PostHog person per `distinct_id` (one per `install_id`),
    // which we explicitly don't want for anonymous-only events.
    properties: { ...commonProps, ...result.props, $process_person_profile: false }
  })
}

export function setOptIn(via: 'settings' | 'first_launch_banner', optedIn: boolean): void {
  if (!storeRef) return
  const settings = storeRef.getSettings()
  // Why `updateSettings` (partial-merge) rather than `setSettings`: Store exposes
  // `updateSettings(updates: Partial<GlobalSettings>)` (persistence.ts:334); there
  // is no `setSettings`. A partial update also keeps unrelated settings fields
  // untouched under concurrent writes.
  storeRef.updateSettings({
    telemetry: { ...settings.telemetry!, optedIn }
  })
  if (!posthog) return
  if (optedIn) {
    posthog.optIn()
    track('telemetry_opted_in', { via })
  } else {
    // Opt-out is the one event that transmits against the user's new
    // preference — this is the signal that tells us the opt-out flow works.
    // `updateSettings` above already flipped `optedIn` to false, so calling
    // `track('telemetry_opted_out', ...)` would re-read settings, resolve
    // consent as `user_opt_out`, and drop the very event we need. Capture
    // directly instead; burst cap + validator still run (compromised-renderer
    // defense unchanged), and the consent gate is bypassed exactly once per
    // user per session at most (IPC consent-mutation cap is 5/session). The
    // opt-out event must fire BEFORE `posthog.optOut()` so the SDK's in-memory
    // gate does not drop it either.
    if (!shuttingDown && commonProps && consumeBurstToken('telemetry_opted_out')) {
      const validated = validate('telemetry_opted_out', { via })
      if (validated.ok) {
        posthog.capture({
          distinctId: commonProps.install_id,
          event: 'telemetry_opted_out',
          properties: {
            ...commonProps,
            ...validated.props,
            $process_person_profile: false
          }
        })
      }
    }
    posthog.optOut()
  }
}

export async function shutdownTelemetry(): Promise<void> {
  shuttingDown = true
  if (!posthog) return
  await posthog.shutdown(2_000) // 2s bounded flush
}
```

**PostHog auto-properties — what ships on every event.** `posthog-node` attaches a small set of properties to every `capture()` call beyond what we pass in `properties`. The full set we tolerate, and the ones we deliberately suppress:

| Auto property | Ships? | Why / how suppressed |
|---|---|---|
| `$lib` (e.g., `"posthog-node"`) | Yes | Harmless vendor metadata; tells us which SDK wrote the event. Not user-identifying. |
| `$lib_version` | Yes | Same — used to diagnose SDK-version-specific bugs. Not user-identifying. |
| `$geoip_*` (country, region, city, lat/lng, timezone) | **No** | Suppressed via `disableGeoip: true` in the PostHog constructor. PostHog-server never runs GeoIP on our events. The `$ip` field that backs GeoIP is also suppressed as a consequence (PostHog server-side ignores it when GeoIP is off, and `posthog-node` does not attach a client `$ip` on Node anyway — it uses the request source). |
| `$ip` | **No** | `posthog-node` does not attach client IP in server-side mode; combined with `disableGeoip`, no IP-derived field is recorded against the event. |
| `$session_id`, `$device_id`, `$browser`, `$os`, `$user_agent` | **No** | These are web-SDK-only auto properties. `posthog-node` does not populate them. Our `CommonProps` provides `session_id`, `platform`, `arch`, `os_release`, and `app_version` explicitly — we never want the web-SDK flavors. |
| `$set`, `$set_once` (person-profile properties) | **No** | We never call `identify()` or `set()`, and every `capture()` in `track()` attaches `$process_person_profile: false` so no person is materialized server-side for an anonymous `install_id`. Equivalent to posthog-js's `person_profiles: 'identified_only'` default, enforced per-event because `posthog-node` has no init-time equivalent. |
| `timestamp` | Only when we pass it | Default is server-side ingestion time. No v1 event overrides it — `captureSynthetic` (the crash-attribution path) is deferred to v2 alongside `app_closed`. |

**Drift check.** The `client.test.ts` suite fires a representative event, captures what `posthog-node` serialized to the wire (via a fake transport), and asserts the serialized property set is exactly `CommonProps ∪ EventProps ∪ { $process_person_profile, $lib, $lib_version, distinct_id, event, properties, timestamp?, uuid? }` — any additional auto-property that appears in a future SDK upgrade fails the test and forces a review before the upgrade ships. `$process_person_profile: false` is part of the expected set because the `track()` wrapper attaches it to every capture.

**Shutdown ordering (folds into existing `will-quit` 2-pass in `src/main/index.ts:500-532`):**
1. `will-quit` first pass — set `shuttingDown = true` (synchronous). Any in-flight IPC `telemetry:track` calls that arrive after this point drop with a `console.debug` log. v1 does not emit a clean `app_closed` event — that was cut with the `app_closed { was_crash }` event.
2. Existing `disconnectDaemon()` preventDefault path awaits async RPCs.
3. **Inside the existing `disconnectDaemon().finally(...)` chain**, after the daemon-teardown await resolves and *before* `app.quit()`: `await shutdownTelemetry()`. PostHog's own bounded flush caps at 2s, so worst-case observed quit delay increases by up to 2s on top of the current daemon-teardown budget (healthy case: daemon teardown resolves in a few hundred ms, telemetry flush completes well under the 2s cap). The flush intentionally sits in the `finally` so a daemon teardown that throws does not skip the telemetry flush.

The shutdown flush is documented user-facing: the Privacy pane's opt-out helper text and the README **Privacy & Telemetry** section both note "events captured up to ~10s before opt-out may still transmit in the final batch."

## IPC surface (`src/main/ipc/telemetry.ts`)

Three handlers. Two write, one is a fire-and-forget pipe.

**Threat model.** The renderer renders attacker-controllable content (agent output, MCP responses, file contents, markdown, diff views). An XSS-equivalent rendering bug gives an attacker the ability to invoke `window.api.telemetry*` methods. Every handler below is designed to fail closed under that threat model: the validator catches malformed tracks, consent mutations are rate-limited, and inputs are strictly type-validated in main (renderer-side TypeScript types do not survive IPC serialization).

```ts
// src/main/ipc/telemetry.ts

import { ipcMain } from 'electron'
import { track, setOptIn } from '../telemetry/client'
import { consumeConsentMutationToken } from '../telemetry/burst-cap'

export function registerTelemetryHandlers(): void {
  ipcMain.handle('telemetry:track', (_e, name: unknown, props: unknown) => {
    // Strict input typing: the renderer is not trusted. Any non-string name
    // or non-object props → drop silently (validator would also drop, but
    // the main-side type narrow keeps the attack surface minimal).
    if (typeof name !== 'string') return
    if (props !== null && typeof props !== 'object') return
    // Validator inside track() enforces the schema contract.
    track(name as never, (props ?? {}) as never)
  })

  ipcMain.handle('telemetry:setOptIn', (_e, optedIn: unknown) => {
    // Strict input typing — renderer can pass anything over IPC.
    if (typeof optedIn !== 'boolean') return
    // Consent-mutation rate limit (see burst-cap.ts). A legitimate user flips
    // the toggle at most a handful of times per session; beyond that it's a
    // bug or a compromised renderer. Drop silently past the cap.
    if (!consumeConsentMutationToken()) return
    setOptIn('settings', optedIn)
  })
}
```

**Consent-mutation rate limit** (`src/main/telemetry/burst-cap.ts` adds a second bucket alongside the per-event one):
- ≤ 5 `telemetry:setOptIn` calls per `session_id`.
- 5 is generous for legitimate use: the first-launch notice produces at most one `setOptIn` call per cohort (✕ for existing users writes `true` through a silent-persist path; Turn off writes `false` via `setOptIn`; the ✕ path for new users is a no-op because `optedIn` is already `true`), and the Privacy pane toggle gets rapid-fire-flipped at most a couple of times by a user who's exploring the UI. A real user hitting the cap would have to interact with the Privacy pane ~5 distinct times in one session.
- Overflow: drop silently with a single `console.warn` when the cap is first crossed in a session.
- Does not apply to any future main-originated consent mutation that bypasses IPC — the cap only governs renderer-triggered calls.

Registered by `registerCoreHandlers` alongside existing handlers (`src/main/ipc/register-core-handlers.ts`).

**Preload bridge** (`src/preload/index.ts`):

```ts
telemetryTrack: (name: string, props: Record<string, unknown>) =>
  ipcRenderer.invoke('telemetry:track', name, props),
telemetrySetOptIn: (optedIn: boolean) => ipcRenderer.invoke('telemetry:setOptIn', optedIn),
```

**`api-types.ts`** declares the two methods so the renderer gets types for `window.api.telemetryTrack(...)`. The typed `track()` helper the renderer actually uses lives in a small renderer module that wraps the untyped bridge:

```ts
// src/renderer/src/lib/telemetry.ts
import type { EventName, EventProps } from '../../../shared/telemetry-events'

export function track<N extends EventName>(name: N, props: EventProps<N>): void {
  // Telemetry must NEVER throw into the renderer. A missing bridge (tests,
  // early init, sandboxed iframe) would turn `window.api.telemetryTrack` into
  // a synchronous TypeError; a transient IPC failure would reject the
  // returned promise. Optional-chain both the bridge and the result, and
  // swallow both the sync throw and the async rejection.
  try {
    void window.api?.telemetryTrack?.(name, props as Record<string, unknown>)?.catch(() => {})
  } catch {
    // Swallow — telemetry must never break the renderer.
  }
}
```

Renderer call sites import `track` from this module, never `window.api.telemetryTrack` directly. This is how the renderer gets the `EventMap`-based type safety without shipping PostHog.


## Crash detection — deferred to v2

**Not shipped in v1.** Earlier drafts of this doc specced a `heartbeat.ts` module (clean-exit flag in `orca-telemetry-heartbeat.json`, 5-minute tick, synthetic `app_closed { was_crash: true }` emitted on next launch after unclean shutdown, `captureSynthetic` in `client.ts` with `event_ts_ms` clamp). The whole mechanism is cut for v1 alongside the `app_closed` event itself — crashes are handled by separate T3-style crash reporting, not by product telemetry, so the heartbeat sentinel has nothing to feed.

If a future reader is reading this because crash-rate just became a product-telemetry question, revisit the deferred-events section in [`telemetry-plan.md`](./telemetry-plan.md#deferred-events-v2-candidates).

## DAU — derived, not emitted

**Not a separate event in v1.** DAU/WAU/MAU are computed server-side as distinct `install_id`s with an `app_opened` in the window. Earlier drafts of this doc specced a `dau.ts` module (local-date gating against `GlobalSettings.telemetry.lastActiveDate`, explicit `daily_active_user { date, timezone }` event). Both the module and the field are cut — `lastActiveDate` is removed from `GlobalSettings.telemetry`.

Midnight-edge rounding is a non-problem at our scale; if that stops being true, revisit the deferred-events section in [`telemetry-plan.md`](./telemetry-plan.md#deferred-events-v2-candidates).

## Agent lifecycle events — renderer-emits pattern

### `agent_started`

**Main emits `agent_started` after confirmed launch success.** The renderer is still the source of truth for `initial_agent_kind`, `launch_source`, and `request_kind`, because it decides what Orca was asked to launch. But click intent is too soft for the most important step in the activation funnel. The event should fire only after main has successfully created the agent session / PTY. That removes the false-positive class where the user clicks launch and spawn fails immediately.

```ts
// renderer -> main spawn request
window.api.spawnAgent({
  agentKind,
  launchSource,
  requestKind,
  // ...
})

// main, after spawn/session creation succeeds
track('agent_started', {
  initial_agent_kind: initialAgentKind,
  launch_source: launchSource,
  request_kind: requestKind
})
```

`initial_agent_kind` is determined by the same renderer code that picks the `launchCommand` for `pty:spawn` (see `src/renderer/src/lib/tui-agent-startup.ts`). `launch_source` is set from the renderer entry-point that opened the agent (command palette, sidebar button, tab-bar quick launch, etc.). `request_kind` is `'new'` for a fresh session, `'resume'` for an agent resume, `'followup'` for a post-session follow-up turn. The renderer owns the launch metadata; main owns the success boundary.

**Why this is narrower than agent detection.** The telemetry question is "what did Orca launch?" not "what might the user later run manually in this shell?" OSC-title detection can still drive UI state like working/idle badges, but it is not the source of truth for product telemetry. If the user later switches from the launched agent to some other CLI inside the terminal, v1 does not try to infer or record that.

**What this tightens, and what it does not.** This change makes `agent_started` mean "Orca launched an agent session" rather than "the user requested one." It does **not** make it a completion event. v1 still does not emit a matching `agent_stopped` event — PTY exit alone can't distinguish `completed` / `user-killed` / `error`, so `exit_reason` would be ~100% `unknown` in practice. See [`telemetry-plan.md`](./telemetry-plan.md#deferred-events-v2-candidates) for the revive trigger (CLI wrappers emitting structured exit signals).

### `agent_stopped` and `pr_created` — deferred to v2

**Not shipped in v1.** Earlier drafts of this doc added `StatsCollector.onAgentStopped` and `StatsCollector.onPrCreated` listeners to wire these events. Both are cut:

- `agent_stopped` — PTY-exit signal cannot distinguish completed / user-killed / error. See [`telemetry-plan.md`](./telemetry-plan.md#deferred-events-v2-candidates).
- `pr_created` — vanity metric without a named product question. See [`telemetry-plan.md`](./telemetry-plan.md#deferred-events-v2-candidates).

`StatsCollector`'s existing `onAgentStarted` listener keeps its count-only signature unchanged. PR 4 does not add new listener methods. If either event revives in v2, the additive-listener pattern described in earlier drafts is the right shape — `record()` is the collector's mutation entry point and subscribers that run inside it can corrupt aggregates, so the listener pattern (already used by `starNag`) is the isolation mechanism.

## First-launch UX (PR 3)

One component, `FirstLaunchBanner.tsx`, shown only to the existing-user cohort. New users have no first-launch surface — install-time disclosure is their consent surface, matching the category norm (emdash, Conductor, superset-sh, cmux, T3 Code, Continue, GitButler).

**`FirstLaunchBanner.tsx` (existing-user only):**
- Three terminal actions: ✕ (silent opt-in), Turn off (opt-out event), Privacy policy (link to URL, does not dismiss).
- ✕ → persists `optedIn: true` silently (no event). Transitions `null → true`. Routes through the dedicated `telemetry:acknowledgeBanner` IPC channel so no `telemetry_opted_in` event fires and no `via` derivation tags the path.
- Turn off → fires `telemetry_opted_out { via: 'first_launch_banner' }` **before** SDK disable, then persists `optedIn: false`. Routes through `telemetry:setOptIn(false)`; main derives `via` from the pre-mutation state (`existedBeforeTelemetryRelease=true`, `optedIn=null`, `incoming=false`).
- Privacy policy → opens the policy URL without dismissing the notice.
- Mount condition: `existedBeforeTelemetryRelease === true && optedIn === null`. Once either resolve path runs, that condition clears and the notice never returns.
- No events, including `app_opened`, transmit until the user interacts with the notice (✕ or Turn off). The first-app-opened gate (`firstAppOpenedFired` in `client.ts`) is flipped by both the silent-acknowledge path and the opt-in half of `setOptIn`; PR 4's `app_opened` call site consults `hasFirstAppOpenedFired()` before firing.

**`PrivacyPane.tsx` (permanent surface):**
- New entry in `Settings.tsx` tabbed layout alongside `GeneralPane`, `AppearancePane`, etc.
- Toggle: "Share anonymous usage data" — calls `telemetrySetOptIn` on flip.
- Blocked-state handling (env var set): toggle is disabled, helper text names the specific var.
- The toggle is also disabled for existing users while the first-launch notice is unresolved (`optedIn === null`), with helper text pointing the user at the notice. New users have no such pending-first-launch state (there's no surface to resolve), so the toggle is live from first launch. Env-var reason wins over notice-pending when both apply; the OS env is the harder constraint and resolving the notice cannot un-disable a toggle already blocked at the process level.

## Dev/CI handling

Binary gate — official CI builds transmit; everything else console-mirrors. Plan rationale: `telemetry-plan.md` §Dev/CI handling, Decision 7.

| Context | Transmits? | Mechanism |
|---|---|---|
| Official stable build (CI on `vX.Y.Z`) | ✅ `orca_channel: 'stable'` | `ORCA_BUILD_IDENTITY='stable'` + `ORCA_POSTHOG_WRITE_KEY` injected at build time |
| Official RC build (CI on `vX.Y.Z-rc.N`) | ✅ `orca_channel: 'rc'` | `ORCA_BUILD_IDENTITY='rc'` + `ORCA_POSTHOG_WRITE_KEY` injected at build time |
| `pnpm dev` (team member) | ❌ console mirror | `IS_OFFICIAL_BUILD === false` at module load → `track()` short-circuits |
| `pnpm dev` (contributor) | ❌ console mirror | Same — the gate is structural, not policy-based |
| Third-party rebuild / fork | ❌ console mirror | Same — no write key in the binary, constant unset |
| CI (consent resolver) | ❌ | `resolveConsent` returns `{ effective: 'disabled', reason: 'ci' }` (second line of defense; CI builds also lack the identity constant) |
| Local testing with throwaway project | ✅ to throwaway | `ORCA_BUILD_IDENTITY=stable ORCA_POSTHOG_WRITE_KEY=phc_throwaway... pnpm build` one-off |

**Dogfooding signal** comes from the team running packaged stable/RC builds day-to-day. The surveyed ~4–12K events/user/month baseline was collected against packaged builds, so this pattern loses no data the plan relies on.

**Build-time injection.** `electron.vite.config.ts` has no existing `define` block today, and there are no `ORCA_*` compile-time constants in the tree (existing `ORCA_*` identifiers are all runtime `process.env`). PR 2 adds a `define` block to the `main` section of the config for `ORCA_BUILD_IDENTITY` and `ORCA_POSTHOG_WRITE_KEY`, together with an ambient `.d.ts` (e.g., `src/types/build-constants.d.ts`) declaring both as `declare const` so the client module type-checks. The CI release workflow reads the values from GitHub Actions secrets; any build outside the workflow (local `pnpm build`, contributor PR checks, package-for-distribution-by-others) substitutes literal `null` / empty-string, which `IS_OFFICIAL_BUILD` computes to `false` at module load. The substitution happens at compile time so there is no runtime env-var lookup a curious contributor could spoof with a shell export.

## Test strategy

Per-module tests, deterministic. No integration tests against live PostHog — the vendor is out of scope for verification.

| File | What it tests |
|---|---|
| `src/main/telemetry/consent.test.ts` | Every precedence branch: DO_NOT_TRACK, ORCA_TELEMETRY_DISABLED, CI vars, `optedIn` states, malformed env values. Migration fixture for existing vs new user. |
| `src/main/telemetry/validator.test.ts` | Fail-closed `.safeParse()` behavior: unknown event drops; `.strict()` rejects extra keys; missing required key drops; wrong enum value drops; per-field `.max(N)` cap drops overlength strings. `agent_error` with an unexpected `error_message` or `error_stack` key is rejected by `.strict()` — the event is enum-only by schema, so any call site that tries to attach raw strings fails validation and the event drops. Rate-limit behavior on warnings. |
| `src/main/telemetry/client.test.ts` | `track()` respects shutdown gate; **burst cap runs before consent resolve** (opted-out user: a flood of IPC calls never reaches `resolveConsent`, verified by spy); per-event burst cap enforcement; **per-session global ceiling (≤1,000 events) enforcement**; opt-in/out event emission ordering (opt-out event fires BEFORE SDK disable); **PostHog auto-property drift check (serialized property set is exactly `CommonProps ∪ EventProps ∪ allowed-auto-props`; unexpected new auto-property from an SDK upgrade fails the test)**. |
| `src/main/telemetry/burst-cap.test.ts` | Per-event-name token bucket refill; per-session global ceiling resets across sessions but not within one; **consent-mutation bucket (≤5 `setOptIn` calls per session)**; overflow drops are silent beyond the one-warn-per-cap-crossing log. |
| `src/main/ipc/telemetry.test.ts` | Type-validation on the IPC boundary: non-string `name` on `telemetry:track` drops; non-boolean `optedIn` on `telemetry:setOptIn` drops; consent-mutation rate limit trips after 5 calls. |
| `src/main/observability/redactor.test.ts` | Per-shape fixtures for each of the 8 provider-key shapes in [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §The redactor — each fed via (a) an attribute value, (b) a span-event message, (c) an exit-status `cause` field. Assert the raw secret never appears verbatim in the serialized output. Plus rules 1, 3, 4, 5, 6 coverage (labeled kv, URL userinfo, `.env` line, attribute-key block-list including the Mode-3-only `install_id` strip, 4 KB length cap). Optional property-based fuzz. |
| `src/main/persistence.test.ts` | **Migration — corrupt `orca-data.json`: `fileExistedOnLoad` is true, user classified as existing (`existedBeforeTelemetryRelease: true`, `optedIn: null`), zero events transmit until the first-launch notice is resolved.** **Migration — fresh install: file absent, user classified as new (`existedBeforeTelemetryRelease: false`, `optedIn: true`).** **Migration idempotency: a pre-populated `existedBeforeTelemetryRelease: true` survives a second migration run unchanged.** |
| `src/renderer/.../PrivacyPane.test.tsx` | Toggle wiring. Toggle is disabled when telemetry is blocked by env var (`DO_NOT_TRACK` / `ORCA_TELEMETRY_DISABLED`); helper text names the specific var in the blocked state. |
| `src/shared/telemetry-events.test.ts` | `agent_error` round-trip: `{ error_class, agent_kind }` parses cleanly; extra keys (including `error_message`, `error_stack`, `error_name`) are rejected by `.strict()`; unknown `error_class` enum value is rejected; deferred enum values (e.g. `auth_expired`) are pinned as failing so re-introducing them silently is impossible. (The `EVENT_SPEC`-vs-`EventMap` drift detector from earlier drafts is not needed — the runtime schema IS the type source.) |

**Mock PostHog:** all tests inject a fake `PostHog` implementation that records calls. No network, no write key required for tests.

**Snapshot test on README disclosure:** CI asserts that every event name in `EventMap` appears in the `README.md` **Privacy & Telemetry** section. Prevents the "added event, forgot to document" class of regression.


## Rollout — 5 PRs

Each PR is independently revertable. PRs 1–2 are the foundation; PR 3 is the first user-visible change and the point at which events actually transmit. PRs 4–5 light up metrics. (Earlier drafts listed a sixth "onboarding events" PR; that's been moved to §Future work since no onboarding flow exists to wire it to yet.)

### PR 1 — Foundation: types, consent, install ID, docs

**Scope:** zero network, zero UI changes. No PostHog dependency yet.

**Files:**
- `src/shared/types.ts` — add `telemetry?: {...}` to `GlobalSettings`
- `src/main/persistence.ts` — one-shot migration, sets `existedBeforeTelemetryRelease` + `installId` + `optedIn`
- `src/main/telemetry/consent.ts` — pure `resolveConsent` with full precedence
- `src/main/telemetry/install-id.ts` — UUID generator/reader
- `README.md` § **Privacy & Telemetry** — full event table, opt-out instructions, retention paths (no per-user deletion workflow — see [`telemetry-plan.md` §Documentation](./telemetry-plan.md#documentation)). Canonical on-repo disclosure.
- Tests: `consent.test.ts`, `install-id.test.ts`, migration tests in `persistence.test.ts`

**Verification:**
- Run `pnpm test` — all tests pass.
- Install a fresh build on a clean profile, verify `GlobalSettings.telemetry` is populated with `existedBeforeTelemetryRelease: false` and `optedIn: true`.
- Install same build over an existing profile, verify `existedBeforeTelemetryRelease: true` and `optedIn: null`.
- Set `DO_NOT_TRACK=1`, call `resolveConsent`, verify `{ effective: 'disabled', reason: 'do_not_track' }`.

**Risk:** low. Nothing transmits. Reverting removes the settings block; no user-visible impact.

### PR 2 — Transport: PostHog client, validator, IPC bridge

**Scope:** wires up the full `track()` path with `TELEMETRY_ENABLED = false`. No events transmit. No UI.

**Files:**
- `src/shared/telemetry-events.ts` — Zod-first: `eventSchemas` record + `z.infer`-derived `EventMap` + enum schemas + `commonPropsSchema`
- `src/main/telemetry/validator.ts` — runtime validator wrapping `eventSchemas[name].safeParse(props)`
- `src/main/telemetry/client.ts` — `initTelemetry`, `track`, `setOptIn`, `shutdownTelemetry`; `TELEMETRY_ENABLED = false`
- `src/main/telemetry/burst-cap.ts` — per-event-name token bucket + consent-mutation bucket + per-session 1,000-event ceiling
- `src/main/ipc/telemetry.ts` — two handlers (track, setOptIn)
- `src/main/ipc/register-core-handlers.ts` — register telemetry handlers
- `src/preload/index.ts` + `src/preload/api-types.ts` — expose bridges
- `src/renderer/src/lib/telemetry.ts` — typed renderer wrapper around `window.api.telemetryTrack`
- `electron.vite.config.ts` — **new `define` block** in the `main` section substituting `ORCA_BUILD_IDENTITY` and `ORCA_POSTHOG_WRITE_KEY` at compile time (reads from `process.env` at build time; CI release workflow provides the values via GitHub Actions secrets; local / contributor builds get literal `null`). There is no existing `define` block; this is new infrastructure, not a config tweak.
- `src/types/build-constants.d.ts` — **new ambient `.d.ts`** declaring `declare const ORCA_BUILD_IDENTITY: 'stable' | 'rc' | null` and `declare const ORCA_POSTHOG_WRITE_KEY: string | null` so `client.ts` type-checks against the substituted symbols.
- Tests: `validator.test.ts`, `client.test.ts`, `agent_error` round-trip coverage in `telemetry-events.test.ts`

**Verification:**
- `pnpm typecheck` — event-map types flow through to call sites. No runtime call sites yet.
- Run the app in dev, confirm `console.debug` mirror prints for ad-hoc `track('app_opened', {})` test calls from a scratch call site (remove before merge).
- Confirm the PostHog project is empty — nothing transmits because `TELEMETRY_ENABLED = false`.

**PostHog project setup** (done by the maintainer separately, before PR 3):
- Create project in US region (`us.i.posthog.com`).
- Disable precise geoip; country-only. (Project settings → Privacy → "Discard client IP data" toggle. GeoIP enrichment still computes country before the IP is discarded.)
- Session recordings: disabled.
- Set hard billing cap: $500/mo for Product Analytics. Alert at 80% ($400).
- Store the write key as a GitHub Actions secret (`ORCA_POSTHOG_WRITE_KEY`) and inject it at build time via electron-vite `define`. Same pattern for `ORCA_BUILD_IDENTITY`. No `.env.local` — contributor checkouts must not be able to populate either constant, and any local file risks a commit accident.

**Not configurable in the UI, handled elsewhere:**
- **Event retention** — plan-level default on PostHog Cloud (1yr free / up to 7yr paid, cold-storage after 1yr per `posthog.com/pricing`), no per-project toggle. We accept the default.
- **Anonymous-event profile suppression** — `posthog-node` has no `person_profiles: 'identified_only'` init option (that's posthog-js only); it defaults to creating a profile per `distinct_id`. The `track()` wrapper in `client.ts` attaches `$process_person_profile: false` on every `capture()` call so no PostHog person is materialized for an anonymous `install_id`. This is the server-SDK equivalent of `identified_only`, enforced in code, not in project config.

**Risk:** low. The flag is off; the SDK initializes and immediately opts out. Reverting removes the module and the IPC handlers.

### PR 3 — First-launch UX + Privacy pane; flip the flag

**Scope:** the first PR that actually transmits. Everything user-facing lands here.

**Files:**
- `src/renderer/src/components/FirstLaunchBanner.tsx` — existing-user first-launch notice (cohort-gated; no new-user surface)
- `src/renderer/src/components/TelemetryFirstLaunchSurface.tsx` — root-mounted gate that renders the notice only for `existedBeforeTelemetryRelease === true && optedIn === null`
- `src/renderer/src/components/settings/PrivacyPane.tsx` — toggle + blocked-state helper
- `src/renderer/src/components/settings/Settings.tsx` — Privacy tab wiring
- `src/renderer/src/components/settings/SettingsSidebar.tsx` — sidebar entry
- `src/renderer/src/components/settings/privacy-search.ts` — search keywords
- `src/renderer/src/App.tsx` — mount `TelemetryFirstLaunchSurface` at App root
- `src/main/ipc/telemetry.ts` — add `telemetry:acknowledgeBanner` silent-persist channel; `deriveOptInVia` keeps two cases (existing-user Turn off → `first_launch_banner`; otherwise → `settings`)
- `src/main/telemetry/client.ts` — `persistBannerAcknowledgeWithoutEmitting()` primitive (persists `optedIn: true`, flips the first-app-opened gate, unlocks the SDK, emits nothing); flip `TELEMETRY_ENABLED = true`
- `src/preload/index.ts` + `src/preload/api-types.ts` — `telemetryAcknowledgeBanner` bridge
- Tests: renderer component tests for toggle + button wiring; `setOptIn` event-ordering assertion; IPC tests for the `telemetry:acknowledgeBanner` channel's silent-persist + state-precondition guard

**Verification plan (dogfooding checklist):**
- Upgrade install (existing-user cohort) → notice appears. ✕ dismisses, persists `optedIn: true` silently, no event fires. "Turn off" fires `telemetry_opted_out { via: 'first_launch_banner' }` before SDK disable. Privacy policy link opens URL without dismissing. Once resolved, the notice never returns.
- Fresh install (new-user cohort) → no first-launch UI. Default-on from install.
- Privacy pane toggle flip → `telemetry_opted_in/out { via: 'settings' }`.
- `DO_NOT_TRACK=1` → Privacy pane toggle is disabled, helper text correct. Unset var, restart → toggle reflects real preference.

**Risk:** medium. This is the transmission-start PR. Rollback: flip `TELEMETRY_ENABLED` back to `false` and ship a patch. No data loss (events just stop).


### PR 4 — Core events: lifecycle, agents, workspaces

**Scope:** wire all 7 events to their call sites. This is where the event count goes from 0 to 7 (8 literal event strings, counting `telemetry_opted_in`/`opted_out` as a paired slot).

**Files:**
- `src/main/telemetry/classify-error.ts` — small best-effort mapper from thrown errors to `{ error_class }`. ENOENT / "not found" message → `'binary_not_found'`; everything else → `'unknown'`. ~30 LOC.
- `src/main/index.ts` — call order: `track('app_opened', {})` on `webContents.did-finish-load` of the first window. No crash-detection ordering (deferred to v2 — see §Crash detection); no DAU gating (deferred to v2 — see §DAU).
- Renderer agent-spawn call sites (`src/renderer/src/lib/launch-agent-in-new-tab.ts` + `tui-agent-startup.ts`) — thread `initial_agent_kind`, `launch_source`, and `request_kind` through the spawn request. Main calls `track('agent_started', ...)` only after the session / PTY is created successfully.
- Workspace create path — renderer or main, whichever owns the surface; calls `track('workspace_created', { source, from_existing_branch })` via the appropriate bridge. Workspace init/delete/safety-guard events are deferred to v2 (see [`telemetry-plan.md`](./telemetry-plan.md#deferred-events-v2-candidates)).
- `agent_error` call site — wherever errors are caught in the agent-runtime path; passes `{ error_class, agent_kind }` only. Raw message and stack are deliberately excluded from the PostHog lane; per-incident context is captured in the local NDJSON trace (see `telemetry-error-tracking.md`).
- Settings changes — the `updateSettings` IPC handler fires `settings_changed` when the key is in `SETTINGS_CHANGED_WHITELIST`
- Tests: `classify-error.test.ts`; call-site tests only where they're cheap

**Verification:**
- Local build → run through the activation funnel; verify PostHog receives events in order (`app_opened` → `repo_added` → `workspace_created` → `agent_started`) and that `agent_started` does **not** fire for a launch that fails before session creation.
- Trigger `agent_error` from each classifier branch (ENOENT-shaped error → `binary_not_found`; arbitrary message → `unknown`); verify `error_class` maps correctly. Confirm no raw message, stack, or `error_name` is present on the transmitted event (PostHog event inspector).

**Risk:** low-medium. 7 event types across a handful of call sites. Rollback: individual events can be removed by deleting their call site without breaking the framework.

### PR 5 — Internal dashboards

**Scope:** no code changes in this repo. PostHog-side configuration by whoever owns the PostHog project. All dashboards sit behind PostHog auth and are for the Orca team only. A public aggregate dashboard was considered and cut from v1 — rationale in [`telemetry-plan.md`](./telemetry-plan.md#11-public-aggregate-dashboard--considered-and-cut-from-v1).

**What ships:**
- **Activation funnel**: `app_opened` → `repo_added` → `workspace_created` → `agent_started`. Dimensions: `app_version`, `platform`, `orca_channel`. No `env` filter needed — every event in the project is by construction from an official stable/RC build. Interpret the last step as **confirmed agent launch**, not completion. No `agent_stopped` terminator — deeper completion needs a structured CLI-side signal we do not have in v1.
- **Weekly retention curve**: cohort by `install_id` first-seen; D1/D7/D30 return rate as distinct `install_id`s with an `app_opened` in each window. DAU is derived server-side from `app_opened` distinct-by-day per `install_id` (no dedicated event).
- **Agent mix by version**: `agent_started.initial_agent_kind × app_version`.
- **Error-class distribution**: `agent_error.error_class` (currently `'binary_not_found' | 'unknown'`). Realistically the dashboard will be sparse — the trimmed enum reflects that Orca's PTY-shell-typed-command launch architecture cannot observe most classes of agent-side error. Per-incident triage lives in the NDJSON bundle lane (`telemetry-error-tracking.md`); ask an affected user to share a bundle when a `'unknown'` slice spikes.
- **Experimental-feature adoption**: `settings_changed` filtered to experimental-flag keys, by `setting_key × app_version`.
- **Opt-out rate**: `telemetry_opted_out / (opted_in + opted_out)` per `via`.

Crash-rate dashboard is deferred — crashes are handled by separate T3-style crash reporting, not product telemetry.

**Alerts (PostHog → Slack):**
- Total events/day P95 deviation > 2× baseline (volume anomaly — could be real growth, could be spoofing campaign per Operational notes)
- `agent_error` spike (>30% increase week-over-week)
- Any new `event_name` appearing that is not in the v1 schema (drift detector)

**Verification:** each dashboard shows non-zero data after PR 4 has been on stable for 24h.

**Risk:** low (no code change).

## Future work

Not part of the 5-PR rollout. Listed here so the scope is explicit and the specs don't drift.

### Deferred events (v2 candidates)

Each of the events below was cut from v1 with a revive trigger captured in [`telemetry-plan.md`](./telemetry-plan.md#deferred-events-v2-candidates). This list is a quick index so PR 4 reviewers don't re-litigate.

- **`daily_active_user`** — DAU derived server-side from `app_opened`.
- **`app_closed { was_crash, session_duration_bucket }`** — crashes handled by separate T3-style crash reporting. Heartbeat sentinel mechanism cut entirely.
- **`workspace_initialized`** — duplicative with `workspace_created` (git-add meaning) or requires renderer→main setup-hook exit-code plumbing that doesn't exist today.
- **`workspace_deleted` + `workspace_delete_safety_guard_triggered`** — one-time UX calibration question, not an ongoing dashboard. Would collapse into `workspace_deleted { via_safety_guard, outcome }` when revived.
- **`agent_stopped`** — PTY exit can't distinguish completed / user-killed / error, so `exit_reason` would be ~100% `unknown` in practice.
- **`external_editor_launched { editor }`** — no "open in VS Code/Cursor/Zed" feature exists in Orca today; bounce-out is real but not load-bearing for v1.
- **`pr_created`** — vanity metric without a named product question.

If any of these revive, they are schema-additive: add a per-event schema to `eventSchemas`, wire the call site, update the README **Privacy & Telemetry** section. Property-level v2 candidates worth reconsidering later: scope envelope, per-model split, and token-count buckets.

### Onboarding events (when onboarding flow ships)

No onboarding flow exists to wire these to today. When one lands, adding the events is a ~50-LOC PR: extend `eventSchemas`, add a renderer-side `track(...)` call at each step.

If onboarding ships later, the starter event set should be:
- `onboarding_slide_viewed { slide_id }`
- `onboarding_setting_changed { setting_key, value_kind }`
- `onboarding_completed { telemetry_opted_in }`

## Call-site handoff: where each event fires

Reference table for PR 4 wiring. "Surface" is the code path that owns the event; "Property inputs" is where the property values come from.

| Event | Surface | Property inputs |
|---|---|---|
| `app_opened` | `src/main/index.ts`, on `webContents.did-finish-load` of first window | none |
| `repo_added` | `src/main/ipc/repos.ts` — add-repo handler | `method` argument threaded from renderer call |
| `workspace_created` | `src/main/ipc/worktrees.ts` (git primitive remains `addWorktree`; event name uses `workspace_` to match user-facing vocabulary) | `source` from renderer; `from_existing_branch` from args |
| `agent_started` | Main emits after confirmed session creation; renderer threads launch metadata through the spawn request (`src/renderer/src/lib/launch-agent-in-new-tab.ts` + `tui-agent-startup.ts`) | `initial_agent_kind`, `launch_source`, `request_kind` from the renderer's own command-picking logic |
| `agent_error` | Error classifier in agent-runtime path (`classify-error.ts`) | `error_class` from classifier (`'binary_not_found' | 'unknown'`); `agent_kind` from the call site. Raw message / stack / `error_name` deliberately not shipped — see §`agent_error`. |
| `settings_changed` | `src/main/ipc/settings.ts` setSetting handler, when key is whitelisted | `setting_key`, `value_kind` |
| `telemetry_opted_in` / `_out` | `src/main/telemetry/client.ts` `setOptIn` | `via` from call site |

## Operational notes

**Secret management.** The PostHog write key is `NEXT_PUBLIC`-equivalent — it's shipped in the binary of official builds, not secret. Injected at build time via GitHub Actions secret `ORCA_POSTHOG_WRITE_KEY` together with `ORCA_BUILD_IDENTITY`. Contributor / fork / local builds get literal `null` at the `declare const` sites; `IS_OFFICIAL_BUILD` evaluates to `false`, and `track()` short-circuits to console-mirror. Evidence: every PostHog-using peer audited (VS Code via `product.json`, Superset, Conductor, emdash, T3 Code, GitButler) ships the key only in their official pipeline. Rotating the key is not a security operation against leakage; the key was never secret. Rotation is the response to event-spoofing campaigns (see playbook below).

**Write-key threat model.** The key is extractable from any shipped official binary with `strings`. Consequence: anyone willing to reverse-engineer the binary can POST arbitrary events to `us.i.posthog.com/capture/` with any `install_id`, any `orca_channel`, any event name in the schema. The runtime validator, burst cap, and the per-event `$process_person_profile: false` attachment all run in our client and do not apply to direct POSTs — a spoofed POST that omits `$process_person_profile` will create a PostHog person against the spoofed `install_id`. Spoofed events still land in the event log and every downstream dashboard regardless.

What this means in practice:
- **Dashboard data is fit for internal product decisions, not for decisions a motivated adversary would benefit from distorting.** "Which panels do real users click?" — trustworthy in aggregate. "Is a named competitor visible in our error-class distribution?" — not trustworthy if that competitor has any incentive to distort.
- **We accept this trade.** The alternative would be a thin auth-proxy in front of PostHog that issues short-lived tokens to official clients — but any mechanism that distinguishes "official client" from "attacker with the binary" requires a client-side secret the official client has and the attacker doesn't, which contradicts the anonymous-install-ID design. We deliberately chose anonymity; the cost is spoofability.
- **No user-data leak.** Spoofed events do not exfiltrate user data in either direction. The risk is Orca-facing (poisoned dashboards), not user-facing.

**Event-spoofing response playbook.** If the dashboards show signals consistent with a spoofing campaign — e.g., `agent_error.error_class` distribution shifts sharply with no release correlation; `telemetry_opted_out` events arrive from `install_id`s that were never seen in an `app_opened`; `orca_channel: 'rc'` cohort size jumps implausibly between dashboard refreshes:

1. **Confirm via PostHog event log.** Filter by suspicious `install_id` or `app_version`; look for timing / IP patterns that distinguish real user sessions from an automated source.
2. **Rotate the PostHog project.** Create a new project in the same region (US — `us.i.posthog.com`), inject the new write key into the next CI release, ship a patch. Old binaries continue to POST to the old project, which becomes a honeypot we can filter out of dashboards.
3. **Optional — stand up a thin ingestion proxy (Cloudflare Worker or equivalent).** Rate-limit per source IP at the edge; reject requests whose `app_version` is not in the current release manifest. Raises the floor for repeat campaigns without claiming to close the gap.
4. **Do not issue per-user tokens.** Breaks the anonymity design; the alternative cost is worse than the attack.

The spoofing threat model and response are user-facing in the [`README.md` **Privacy & Telemetry** section](./telemetry-plan.md#documentation) only to the extent of: "the data we collect is anonymous; anyone can POST fake events to our analytics; we do not claim our dashboards are adversarially trustworthy."

**PostHog queue overflow during long offline periods.** `posthog-node` retains batched events in memory while the network is unreachable (flight, VPN down, laptop in a tunnel). The SDK's `maxQueueSize` default is 1000; past that it silently drops oldest-first. We've bumped it to 5000 to widen the offline window. In practice the per-session 1,000-event ceiling in `track()` caps normal operation well below this, so the 5000-slot offline buffer is the absolute ceiling across any conceivable offline duration. If we start seeing OOM reports correlated with long-offline sessions, revisit the cap; v1's assumption is that 5K × ~200 B/event = ~1 MB of RAM is trivially tolerable on a desktop.

**Rollback kill switch.** Flipping `TELEMETRY_ENABLED = false` in `client.ts` and shipping a patch stops all transmission. Users retain their `optedIn` preference; on the next patch that re-enables, they resume at their prior choice.

**Billing alert playbook.** When the 80% alert fires ($400/mo):
1. Check the top-3 events by volume. If one is >40% of the total for 2 consecutive weeks → sample it to 10% at the call site (not schema change). If the cap hits before the patch lands, PostHog drops events past the cap — we lose that week's funnel but don't run up the bill.
2. Cross-reference against the projected user count. If realistic users × realistic rate > $200/mo sustained, open the self-host evaluation thread.

**Drift detector.** PR 5's "new event name not in v1 schema" alert catches two failure modes: (a) a developer adds an event via `track()` with a cast bypass, (b) the validator fails open on a bug. Both should be zero-incidence; the alert exists to confirm that.

**Schema versioning.** The README **Privacy & Telemetry** section opens with `Telemetry schema version: 1.0`. Bumped on any `eventSchemas` change (same thing as any `EventMap` change — the map is `z.infer`-derived from the schema record). Future work: surface version bumps in the app with a one-line banner linking to the diff (v1.1+).

## Open items before PR 1

Resolve these before opening the first PR so decisions don't slow review:

1. **PostHog project owner** — who owns project creation, billing, member list? Maintainer decision, not an engineering one.
2. **Hosted privacy URL** — `orca.dev/privacy` or similar. If not ready by PR 1, the `README.md#privacy--telemetry` anchor is the canonical link and the hosted URL is a follow-up in the website repo.
3. **`error_class` starter enum scope** — the v1 enum is intentionally narrow (`'binary_not_found' | 'unknown'`) because Orca's PTY-shell-typed-command launch model cannot observe agent-side errors. Adding values is additive-safe; do it when a real call site lands, not in anticipation.
4. **CLI-side errors** — agent CLI errors (auth, rate-limit, provider failures) live inside the child shell + agent CLI subprocess and surface only as terminal output. They are deliberately not captured in `agent_error` — per-incident context lives in the NDJSON bundle lane instead.

## Cross-references

- **Why PostHog, why the lean v1 schema, and projected cost:** [`telemetry-plan.md`](./telemetry-plan.md)
- **Why asymmetric consent, not opt-in-for-all or default-on-for-all:** [`telemetry-plan.md` §Evidence](./telemetry-plan.md#evidence-asymmetric-consent-vs-alternatives-the-peer-set-we-studied)
- **Emdash patterns we adopt and the ones we deliberately don't:** [`telemetry-plan.md` §Patterns adopted from emdash](./telemetry-plan.md#patterns-adopted-from-emdash)
- **Diagnostic error lane (scoped outside v1):** [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) — argues for a local-file trace lane alongside the PostHog product-telemetry lane. Not in scope for the 5 PRs here; `agent_error { error_class }` is the v1 surface for failure signal and explicitly not a replacement for per-user diagnostics.
- **Security threat model and resolved findings:** [`telemetry-security-review.md`](./telemetry-security-review.md)
