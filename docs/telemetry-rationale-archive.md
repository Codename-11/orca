# Telemetry Rationale Archive

Status: archival reasoning for settled telemetry decisions. This doc is intentionally **not** the source of truth for the shipped v1 schema or rollout steps. Use it to remember why specific debates were closed so future reviews do not restart them from zero.

**Reference only:** yes. Read this after the canonical docs when you need the reasoning history behind a settled decision.

Canonical docs:
- [`telemetry-plan.md`](./telemetry-plan.md) — current product-telemetry decisions
- [`telemetry-implementation.md`](./telemetry-implementation.md) — rollout and implementation blueprint
- [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) — local-first diagnostics lane
- [`telemetry-security-review.md`](./telemetry-security-review.md) — threat model and security review

Archived appendices:
- [`telemetry-archive/cost-and-vendor-appendix.md`](./telemetry-archive/cost-and-vendor-appendix.md)
- [`telemetry-archive/peer-patterns-and-anti-patterns.md`](./telemetry-archive/peer-patterns-and-anti-patterns.md)

## What this doc preserves

This archive keeps the reasoning that was valuable but too bulky for the canonical docs:
- Why PostHog Cloud US won for v1
- Why consent is asymmetric by cohort
- Why `agent_started` is confirmed launch, not click intent
- Why `agent_error` is enum-only in PostHog
- Why several tempting events were cut or deferred
- Which peer patterns we explicitly copy, and which ones we explicitly reject
- Which cost levers are real, and which ones are noise

The heavier evidence tables live in the appendices:
- detailed cost and vendor notes: [`telemetry-archive/cost-and-vendor-appendix.md`](./telemetry-archive/cost-and-vendor-appendix.md)
- competitor patterns and anti-patterns: [`telemetry-archive/peer-patterns-and-anti-patterns.md`](./telemetry-archive/peer-patterns-and-anti-patterns.md)

## Vendor choice: why PostHog Cloud US won

The v1 choice was not "PostHog is ideal." It was "PostHog is the least-wrong option for our team and audience right now."

What mattered:
- Built-in funnels and retention without needing a separate BI stack
- Node/Electron fit in the main process
- OSS SDK and server, which matters for a developer audience that audits tooling
- Free or cheap at the scale we expect initially
- A schema portable enough that we can leave later

Why not the alternatives:
- Mixpanel / Amplitude / Heap: closed-source trust problem for this audience
- RudderStack / Segment: routing layer, not analytics product
- Plausible / Fathom / Umami / Matomo: pageview tools, wrong shape for desktop product telemetry
- Tinybird / custom ClickHouse: strong ownership story, but too much upfront BI work for v1

Why US region:
- It matches the observed norm in close peers
- It avoids introducing an EU-residency burden before an actual customer requirement exists
- The migration cost is acceptable if that requirement appears later

The important non-decision: we are not marrying the event schema to PostHog. The schema stays enums / booleans / bucketed values so migration remains feasible.

## Consent model: why asymmetric by cohort

The team debated three real options:
- default-on for everyone
- opt-in for everyone
- default-on for new users, explicit banner for existing users

The third option won because it preserves trust with existing users without throwing away the new-user activation funnel.

Reasoning:
- Existing users installed under an implied no-telemetry social contract. Silently flipping them on would be the sharpest trust violation in the entire plan.
- New users have no such prior contract. Every direct-shape competitor (emdash, Conductor, superset-sh, cmux, T3 Code, Continue, GitButler) defaults telemetry on and shows nothing at first launch, so matching that norm is the honest answer for a no-account desktop app in this category — a first-run scare-surface that no peer shows would be an unforced churn risk at the moment a new user is evaluating whether the product is worth their attention.
- The activation funnel is inherently a new-user question. If new users were opt-in only, the most important funnel would be badly selection-biased from day one.

The new-user half of this decision cycled: an earlier version of the plan included a persistent dismissible first-run toast for new users as a disclosure surface. It was cut once the direct-peer survey made it clear no close-shape competitor ships one, and that introducing the first-run surface unilaterally would read as Orca flagging an unforced concern about its own data collection. The permanent disclosure surfaces (README **Privacy & Telemetry** section, Settings → Privacy, env-var kill switches) carry the "what does Orca send?" answer without a first-launch interrupt.

A parallel decision on in-repo disclosure surface cycled the same way: the plan originally committed to a dedicated `PRIVACY.md` at repo root. It was cut once the peer survey confirmed that no direct-shape competitor ships one — emdash, superset-sh, T3 Code, cmux all carry nothing in-repo, and Warp/VS Code host privacy docs externally. Moving the disclosure into a **Privacy & Telemetry** section of the README (the pattern emdash uses) keeps a single canonical surface, avoids introducing a schema-sync contract that no peer ships, and avoids unilaterally over-disclosing in a category where the norm is README-section-or-less. Full rationale lives in [`telemetry-plan.md` decision 6](./telemetry-plan.md#6-privacy-documentation--readme-section).

What this means analytically:
- Early telemetry is cohort-shaped by design
- Existing-user and new-user dashboards should not be blended casually
- Opt-out rate is itself a product signal, not just a compliance detail
- New-user opt-outs arrive only through `via: 'settings'` (no first-run surface exists for them); existing-user opt-outs flow through `via: 'first_launch_banner'` (the "No thanks" path) or `via: 'settings'` (post-opt-in changes). The opt-out-rate dashboard must group by `via` to keep cohort signal interpretable.

## Activation semantics: why `agent_started` means confirmed launch

This was one of the more important corrections.

Earlier drafts let `agent_started` fire at click time because the renderer already knows:
- which agent Orca was asked to launch
- which surface they launched from
- whether this was new / resume / followup

That shape was convenient but too soft. It turned the most important funnel step into "user tried to launch an agent," which overstates activation when spawn fails immediately.

The tightened rule:
- renderer owns launch metadata
- main owns the success boundary
- `agent_started` fires only after main successfully creates the agent session / PTY
- the wire property is `initial_agent_kind`, because the event answers "what Orca launched first," not "what the user may later run manually in the terminal"

What this fixes:
- removes obvious false positives from the activation funnel
- keeps launch-source and initial-agent attribution intact
- avoids pretending PTY exit is a reliable completion signal

What this deliberately does **not** do:
- it does not use OSC-title agent detection as the product-telemetry source of truth
- it does not claim to measure later shell usage after Orca hands control to the user

What it still does not solve:
- it is not a completion metric
- it does not prove the session was useful
- it does not replace a future structured `agent_stopped` or "first successful turn" event if we later need that

This is the right v1 compromise: accurate enough to trust for activation, without inventing completion semantics from ambiguous PTY behavior.

## Error posture: why PostHog stays enum-only

The most repeated debate was whether to send raw error messages and stack traces through PostHog because several peers do.

The answer stayed no.

Why:
- raw error strings are the highest-risk UGC we could send
- provider and SDK errors often echo secrets, paths, repo names, and other identifying context
- if we are not also buying a true error-tracking product with grouping and issue management, we pay the privacy cost without getting the operational upside

So the split became:
- PostHog lane: `agent_error { error_class, agent_kind }`
- diagnostics lane: local NDJSON trace + optional user-shared diagnostic bundle

This keeps aggregate reliability queryable while preserving a clean rule: debug detail belongs in the diagnostics lane, not the product-analytics lane.

The accepted downside:
- most unreported incidents remain aggregate-only
- native crashes remain under-diagnosed without a real crash-reporting vendor
- per-user debugging depends on the bundle path existing and being usable

That downside is real, but still cheaper than weakening the privacy boundary in the analytics lane.

### Why the `error_class` enum was trimmed late, and `error_name` was deferred entirely

An earlier draft carried a 10-value `error_class` enum (`network_timeout`, `auth_expired`, `rate_limited`, `provider_unavailable`, `provider_error_generic`, `binary_not_found`, `binary_version_mismatch`, `workspace_gone`, `user_cancelled`, `unknown`) plus an optional `error_name` constrained to a closed `AGENT_ERROR_NAME_WHITELIST`. Both were the right design *for the architecture the enum was designed against* — direct-spawn agent SDKs that throw structured errors back to the parent process (emdash, superset-sh, T3 Code).

Orca does not have that architecture. Orca spawns an interactive PTY shell first and types the agent CLI command into it, so:

- provider-side errors (`auth_expired`, `rate_limited`, `network_timeout`, `provider_*`) live inside the agent CLI subprocess and never cross the parent boundary — they appear only as terminal output
- `binary_version_mismatch` would require a pre-launch version probe Orca doesn't perform
- `workspace_gone` and `user_cancelled` would require classifying PTY exits, which the plan defers (`agent_stopped` v2)
- `binary_not_found` is reachable, but only when the *shell* binary itself is missing — not when the agent CLI is, because the shell catches that case

That left two values ever emitted in practice: `binary_not_found` and `unknown`. The enum was trimmed to those two; `error_name` and the whitelist were deferred because, with two enum values, the per-name whitelist carries no additional signal. Both can be re-introduced as additive-optional alongside any future enum expansion (e.g., when CLI wrappers ship structured exit signals — see `agent_stopped` v2 trigger).

The `error_name` whitelist was the right pattern when there were N classes and we wanted tail visibility on unmapped names; it was the wrong pattern when there are 2 classes and the whole tail is the `'unknown'` slice. The pattern is preserved in `SETTINGS_CHANGED_WHITELIST` for the same conceptual job in a different place.

The closed-whitelist-vs-regex argument is preserved here because it survives the deferral — when `error_name` is re-introduced, it should be a closed whitelist for the same reason it was the first time:

A regex that only checked "looks like a class name" was rejected because it still allows identifier-shaped leaks such as:
- `PaymentFailedForUserAlice`
- `AuthExpiredForAcmeCorp`
- `TimeoutInRepoInternalMonorepo`

The whitelist rule is stricter and better:
- only reviewed names can leave the machine through the PostHog lane
- adding a new transmitted class name requires a PR
- the event still survives without `error_name` when the name is not approved

That is a small implementation tax for a meaningful privacy gain.

## Deferred events: what was tempting, and why it was cut

These were the recurring "should we just add this too?" debates.

### `agent_stopped`

Why it was tempting:
- completion-like signal
- natural pair with `agent_started`

Why it was cut:
- PTY exit does not reliably distinguish completed / user-killed / error
- the resulting `exit_reason` would be mostly `unknown`
- ambiguous hot-path events are expensive and misleading

Revive only when the source signal improves, for example via structured CLI-side exit reporting.

### `workspace_initialized`

Why it was tempting:
- more precise activation step
- closer match to some peer funnels

Why it was cut:
- in one interpretation it duplicates `workspace_created` because worktree creation already throws on failure
- in the more interesting interpretation it depends on setup-hook exit information we do not currently have wired cleanly

So it was not really one event; it was two different meanings hiding behind one name.

### `app_closed { was_crash }`

Why it was tempting:
- cheap binary crash signal
- common peer pattern

Why it was cut:
- once the diagnostics lane exists, a heartbeat boolean is a weak parallel signal
- the product telemetry lane is the wrong home for crash semantics if we are already splitting lanes

### `daily_active_user`

Why it was tempting:
- explicit DAU event feels simple

Why it was cut:
- DAU is derivable from `app_opened`
- the extra event buys little at our scale
- midnight edge cases are not load-bearing here

### `panel_opened`

Why it was tempting:
- broad feature-usage visibility

Why it was cut:
- it is the easiest way to produce a lot of low-signal volume
- it risks becoming the most expensive event for one of the weakest product questions

If it comes back, it should come back sampled and tied to a concrete dashboard question.

### `external_editor_launched`

Why it was tempting:
- would answer bounce-out questions

Why it was cut:
- the feature area is not mature enough yet
- the question is not load-bearing for v1

### `pr_created`

Why it was cut:
- vanity metric
- no named product decision depends on it

## Peer patterns: what we copied and what we rejected

### Patterns worth copying

- Emdash: typed event map, main-process transport, sanitizer allowlist mindset
- Superset: activation funnel focus, but not its privacy posture
- T3 Code: separate analytics lane and diagnostics lane

### Patterns deliberately rejected

- Raw error messages / stack traces in analytics
- Raw branch names or cwd in analytics
- Account-derived or provider-derived identity chains
- Broad clickstream-style event spam with no concrete dashboard question

The meta-rule is more important than any single peer: a peer shipping something is evidence that it is possible, not evidence that it is good for Orca.

## Cost reasoning that should survive

The team spent time on cost because event-count anxiety can distort schema decisions.

The durable conclusions:
- The hot path matters more than the event count on paper
- `agent_started` is the real cost lever
- Rare events are almost free; cutting them for cost reasons is usually the wrong move
- Sampling a hot ambiguous event is worse than not shipping it in the first place

That is why:
- dropping `agent_stopped` mattered
- dropping `panel_opened` mattered
- debating the cost of `telemetry_opted_out` or `settings_changed` did not

## How to use this archive in future reviews

If a future discussion asks:
- "Why not just send the stack trace?"
- "Why not make everyone opt in?"
- "Why not fire `agent_started` on click?"
- "Why not add `agent_stopped`?"
- "Why not send branch names?"

Then the answer should start here, and only change if the underlying product or technical constraints have changed.

If the constraint has changed, update:
1. [`telemetry-plan.md`](./telemetry-plan.md)
2. [`telemetry-implementation.md`](./telemetry-implementation.md)
3. this archive, with the reason the old decision no longer holds
