# Onboarding Funnel — Cohort Addendum

Addendum to [`onboarding-funnel-telemetry.md`](./onboarding-funnel-telemetry.md). Adds cohort dimensionality to the events shipping in Phase 1 (and recommends extending two existing events for symmetry). No new events; only new properties.

## Goal

Make the funnel queryable by user cohort, not just by event sequence. The headline product question is "where do **new** users drop off?" — not "where do users drop off." The current schema cannot answer the first question without a multi-step session join through every user's full history, because every event fires identically for first-time users and for someone adding their 6th repo.

A first-time user clicking Skip on the Setup step is "I don't understand what to do here." A returning user with 5 repos clicking Skip is "I'll set this up later." These are not the same UX problem and shouldn't be averaged together. Today they are.

## Non-goals

- Not adding session-start or session-age events. App-session boundaries are already inferable from `app_opened` plus the device clock; a dedicated event would duplicate work.
- Not adding time-on-step instrumentation. The funnel is about transitions, not dwell. Dwell is a separate question with a separate cost (clocks, idle detection, pause-vs-active state).
- Not adding a synthetic `onboarding_complete` event. That state is `first agent_started for distinct_id` and is computable in PostHog without a new event.
- Not adding any property that approaches uniqueness — no exact repo count, no first-seen timestamp, no install age. Cohort signals are buckets, not measurements.

## The cohort signal

Two booleans, computed at emit time from local state the renderer/main process already has:

### `is_first_repo: boolean`

True when, at the moment the event fires, the user has **zero repos** in their local store (i.e., this `repo_added` will be their first, or this Setup-step interaction follows their first `repo_added`).

Once this becomes false for a `distinct_id`, it should never become true again — repos are not deleted as part of normal onboarding flow. (If a user deletes all their repos and re-adds one, they technically re-enter the cohort. Acceptable: that user is in a re-onboarding state and the funnel question still applies.)

### `is_first_workspace: boolean`

True when, at the moment the event fires, the user has **zero workspaces** across all repos. The transition from "has a repo, no workspace" to "has a workspace" is the load-bearing step of onboarding — most of the time-to-value gap lives here. `is_first_workspace` lets us isolate the cohort that's mid-conversion.

## Where to add the properties

I audited every event in `telemetry-events.ts:245-260`. The table below covers all events that touch the onboarding journey or whose failure modes plausibly skew by cohort. Events that don't (`settings_changed`, `telemetry_opted_in`, `telemetry_opted_out`) are deliberately excluded — see "Events deliberately not extended" below.

| Event | `is_first_repo` | `is_first_workspace` | Rationale |
|---|---|---|---|
| `app_opened` (existing) | yes | yes | Session heartbeat. Both booleans here let us answer "what fraction of sessions are by first-time users?" and "of users who ever opened the app, what fraction never reach the funnel?" without a window function over full history. |
| `repo_added` (existing) | yes | yes | Marks "user got a repo." Both booleans needed: `is_first_repo` for first-time vs returning, `is_first_workspace` to identify the unusual cohort that has added repos before but never created a workspace (a real symptom we'd want to see). |
| `add_repo_setup_step_action` (Phase 1) | yes | yes | Which Setup-step action does each cohort take? Headline diagnostic for the 60% drop. |
| `workspace_created` (existing) | yes | yes | Marks "user got a workspace." Both true = onboarding milestone; both false = routine add. The shape that makes onboarding completion measurable. |
| `workspace_create_failed` (Phase 1) | yes | yes | Failure modes likely skew by cohort — first-time users hit `permission_denied` (misconfigured SSH); power users hit `path_collision` (naming conflicts). Cohort split is essential for prioritization. |
| `agent_started` (existing) | yes | yes | End of the onboarding funnel. Both booleans true = "user just completed onboarding," the canonical conversion signal. |
| `agent_error` (existing) | yes | yes | First-time users hitting `binary_not_found` is an onboarding blocker (CLI not installed); power users hitting it is an environment regression. Same enum value, completely different priority — cohort split is what disambiguates. |

Total: 7 events × 2 properties = 14 property additions. Five of those events already exist; two ship in Phase 1.

Adding properties to existing events is additive-safe per the schema-evolution doctrine in `telemetry-events.ts:238-244`. Historical events have these properties as `undefined`; dashboards built on the new fields naturally exclude pre-rollout data, which is correct (we don't have ground truth on cohort for pre-rollout users anyway).

### Events deliberately not extended

- **`settings_changed`** — settings activity isn't onboarding-specific. A first-time user flipping `experimentalAgentDashboard` and a power user flipping the same toggle are answering different questions, but the cohort dimension doesn't change *what* we'd do with the data. Skip until proven necessary.
- **`telemetry_opted_in` / `telemetry_opted_out`** — opt cohort skew is interesting but orthogonal to onboarding flow. Adding the booleans here would also be slightly self-referential (the consent toggle deciding whether to tag itself). Skip.

## Why booleans, not buckets

A bucketed enum (`prior_repo_count: '0' | '1' | '2_4' | '5_plus'`) would carry strictly more information for the same privacy cost. We chose booleans anyway because:

- The product question is binary: "is this an onboarding moment or a routine action?" Buckets answer a question we don't have yet.
- Adding a bucketed enum later is additive-safe; reducing dimensionality after the fact is not. Start narrow.
- A boolean is unambiguous at the call site. Bucket boundaries (`2_4` vs `5_plus`) require a decision the author has to defend in code review.

If Phase 1+addendum data shows we want to distinguish "second repo" from "tenth repo," we add `prior_repo_count_bucket` then. Until that question is real, don't pay for it.

## Where the values come from

`is_first_repo` is computable from the same store the existing `repo_added` deduplication uses (`repos.ts:41-49`). The repo count is in process memory; no IPC or filesystem call needed.

`is_first_workspace` is computable from the workspace store. For renderer-side emit sites (the four pure-UI actions in `add_repo_setup_step_action`), the workspace count is already in the renderer's React state. For main-side emit sites (`worktrees:create`), the count is in main's worktree registry. Both paths are O(1) reads — no database query, no async wait.

The cost is a single field read per emit site. Approximately 2 lines per emit site × 7 emit sites for each boolean ≈ 28 lines beyond the Phase 1 17, plus the schema additions (~7 lines). Total Phase 1 + addendum ≈ 50 LOC. The accessor functions for both booleans are reused across all emit sites — write once.

## Privacy guardrails

- **Booleans only.** No counts, no first-seen timestamps, no install dates. The signal is "in-cohort or not" — one bit per dimension, two bits per event.
- **No retroactive backfill.** Historical events keep `is_first_repo: undefined`. The dashboard treats undefined as "unknown cohort," not as a default. We do not run a migration to label past events.
- **No cross-event correlation in code.** The classifier for each event reads its own local state. We do not introduce a "user lifecycle" service that tracks onboarding status across events — that would be an unbounded surface for cohort PII.

The properties are subject to the same `.strict()` Zod schema enforcement as everything else; an event with a free-text first-repo claim would be dropped by the validator.

## SQL once this lands

**The headline question — onboarding-cohort Setup-step funnel:**

```sql
SELECT
  properties.action,
  count(*) AS n
FROM events
WHERE event = 'add_repo_setup_step_action'
  AND properties.is_first_repo = true
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY properties.action
ORDER BY n DESC
```

**Cohort-split workspace creation success rate:**

```sql
SELECT
  properties.is_first_repo AS first_repo_cohort,
  countIf(event = 'workspace_created') AS ok,
  countIf(event = 'workspace_create_failed') AS fail,
  ok / (ok + fail) AS success_rate
FROM events
WHERE timestamp > now() - INTERVAL 7 DAY
GROUP BY first_repo_cohort
```

**Onboarding completion rate (per-day cohort funnel from first repo to first agent):**

```sql
WITH first_repo AS (
  SELECT distinct_id, min(timestamp) AS t0
  FROM events
  WHERE event = 'repo_added' AND properties.is_first_repo = true
  GROUP BY distinct_id
),
first_agent AS (
  SELECT distinct_id, min(timestamp) AS t1
  FROM events
  WHERE event = 'agent_started' AND properties.is_first_repo = true
  GROUP BY distinct_id
)
SELECT
  toDate(first_repo.t0) AS day,
  count() AS started,
  countIf(first_agent.t1 IS NOT NULL) AS completed,
  completed / started AS completion_rate
FROM first_repo
LEFT JOIN first_agent USING distinct_id
GROUP BY day
ORDER BY day
```

Without the cohort booleans, the equivalent queries require either a window function over every user's full event history (to derive cohort membership at query time) or a maintained materialized view. With the booleans, every cohort question is a single `WHERE` clause.

## Backward compatibility

Existing dashboards on `workspace_created`, `repo_added`, `agent_started` continue to work unchanged — the new properties are optional and existing aggregations don't reference them. New cohort-aware dashboards naturally start at the rollout boundary.

The `funnel_step` event sketched in the parent doc's deferred section should carry the same two booleans when it lands, for the same reasons. Add to the schema sketch.

## Rollout

Land alongside Phase 1. The marginal cost is small (~15 LOC), and shipping cohort dimensionality after-the-fact means a window of Phase 1 data without it — exactly the data we'd want to slice.

## Open questions

- **Should `is_first_repo` survive a "delete all repos and start over" cycle?** Argument for resetting it to true: that user is in re-onboarding mode, and the funnel question still applies. Argument against: dashboards would need a tiebreaker for the rare distinct_id with multiple `is_first_repo: true` event runs. Default: do not reset. A user who has ever had a repo is not a new user. If this turns out to misclassify a meaningful population, revisit.
- **Should we also add `is_first_session: boolean` (true on the user's very first `app_opened`)?** Probably yes, but it lives outside this addendum because it requires a session-tracking mechanism that doesn't exist today. Defer.
- **Do we need `prior_repo_count_bucket` in Phase 2?** Only if `is_first_repo: false` shows wide variance worth splitting. Defer until the data tells us.
