# Telemetry Archive — Peer Patterns And Anti-Patterns

Status: archival appendix. This file preserves the competitor and peer reasoning that informed Orca's telemetry design. It is reference material, not the source of truth for the shipped v1 schema.

**Reference only:** yes. This appendix exists to preserve peer comparisons and anti-pattern evidence without expanding the canonical docs.

Canonical docs:
- [`../telemetry-plan.md`](../telemetry-plan.md)
- [`../telemetry-rationale-archive.md`](../telemetry-rationale-archive.md)

## Why this appendix exists

The telemetry design borrowed patterns from peers, but the long competitor survey was too bulky to keep in the canonical docs. This appendix preserves the comparisons most likely to matter when future debates come back.

## How to read peer evidence

A peer shipping something means:
- it is feasible
- it may be useful for them

It does **not** mean:
- it matches Orca's trust posture
- it fits Orca's audience
- it should be copied without qualification

## The load-bearing peers

These were the peers that actually shaped the design.

### Emdash

Why it mattered:
- Electron app
- multi-agent orchestrator
- no-account product shape
- anonymous install-style telemetry

Patterns worth copying:
- typed event map mindset
- main-process transport
- allowlist-style validation / sanitization discipline

Patterns deliberately rejected:
- raw exception message + raw stack trace in analytics
- identity enrichment tied to GitHub / account data
- broader scope-envelope correlation on every event for v1

Bottom line: emdash was the closest structural match, but not a privacy posture to copy wholesale.

### Superset

Why it mattered:
- clear activation-funnel orientation
- strong precedent for workspace-lifecycle events

Pattern worth copying:
- activation funnel focus

Patterns deliberately rejected:
- raw branch names in analytics
- raw error messages and cwd in analytics
- account-scoped telemetry assumptions

Bottom line: useful for funnel shape, not for privacy or identity design.

Current-code note:
- Superset's desktop app now tracks explicit app-owned launch/session boundaries such as `workspace_created`, `workspace_opened`, and `agent_session_launch`. That supports Orca's choice to track launch-time facts Orca already knows, rather than infer later shell usage from terminal output.
- Superset still remains a negative privacy reference for Orca because it ships raw `branch` / `base_branch` fields on workspace events and raw `error_message` / `cwd` fields on chat errors.

### T3 Code

Why it mattered:
- strongest precedent for separate analytics and diagnostics lanes

Pattern worth copying:
- product telemetry and error diagnostics should not be the same lane

Pattern deliberately rejected:
- provider-account-derived identity chain

Bottom line: the two-lane posture was the most valuable thing Orca borrowed from T3 Code.

Current-code note:
- T3 Code also records explicit provider/session lifecycle at the provider-service boundary (`provider.session.started`, `provider.turn.sent`, `provider.session.stopped`). That is a direct peer precedent for recording first-party session facts, not inferring arbitrary terminal usage later.

## Useful patterns seen in peers

### Good pattern: typed event definitions

Why it mattered:
- narrows schema drift
- makes review easier
- creates a clear place to inspect what can ship

Seen in strongest form in peers with explicit event maps rather than scattered string literals.

### Good pattern: main-process transport

Why it mattered for Orca:
- single control point
- easier consent enforcement
- cleaner boundary for renderer-originated IPC

### Good pattern: separate product telemetry from diagnostics

This was the single most important architecture pattern in the whole peer read.

Benefits:
- lets analytics stay low-sensitivity
- gives error detail a more appropriate home
- reduces pressure to punch exceptions into the analytics schema

### Good pattern: explicit consent controls

Even where peers did not fully measure consent changes, they at least showed that a visible user control is expected in this category.

## Anti-patterns we explicitly rejected

### Anti-pattern: raw error strings in product analytics

Seen in multiple peers:
- raw `error_message`
- raw stack traces
- raw provider / SDK error bodies

Why Orca rejected it:
- highest-risk UGC path
- often carries secrets, paths, repo names, or identifying context
- not worth the privacy cost without a proper error-tracking product behind it

### Anti-pattern: raw branch names, cwd, repo names, or paths

Why it mattered:
- feels harmless in implementation
- leaks customer names, ticket IDs, usernames, internal repo structure

This was one of the clearest lessons from peer review: "operationally convenient" fields often carry the most latent identifying context.

### Anti-pattern: broad clickstream capture without a question

Examples:
- lots of panel / view / focus changes
- many per-action UI events

Why Orca rejected it:
- expensive at power-user volume
- weakly tied to concrete product decisions
- easy to accumulate event debt

### Anti-pattern: identity derived from external accounts

Why Orca rejected it:
- weakens anonymity
- creates cross-install or cross-product correlation risk
- does not fit the privacy story Orca wants to tell

## Peer categories that helped frame the design

### Peers closest to Orca's shape

Most useful for design transfer:
- emdash
- superset
- T3 Code

### Peers that were informative but not direct templates

Useful for caution or specific sub-patterns:
- Warp
- Continue
- Aider
- GitButler
- Zed
- cmux

These products were still useful, but usually in narrower ways:
- Warp for scale and event volume caution
- Zed for profiling-adjacent telemetry caution
- cmux / GitButler for keeping diagnostics out of the product-analytics lane

## Why `panel_opened` was treated as a peer-derived warning

Peer reading made one thing especially clear: once a schema starts tracking broad navigation behavior, event volume rises quickly and the product question often stays vague.

That is why Orca treated `panel_opened` as a danger sign rather than a default telemetry event.

## Why the final Orca posture is intentionally narrower than many peers

The peer survey showed that several products accept tradeoffs Orca explicitly does not want:
- more permissive identity
- more permissive error logging
- more permissive project-context logging

Orca's telemetry design is narrower because:
- the audience is developer-heavy and privacy-sensitive
- the app touches especially sensitive content surfaces
- anonymous, no-account trust is part of the product's posture

That narrower posture costs some convenience. It is still the right trade for this product.

## What future reviews should take from this appendix

If someone proposes:
- raw error strings in analytics
- raw branch / repo / cwd fields
- broad clickstream telemetry
- account-derived identity

Then the burden of proof is on the change, not on the current design.

The right questions are:
1. What concrete product decision does this unlock?
2. Why can it not be answered by a narrower signal?
3. What privacy boundary are we weakening?
4. Which peer pattern are we copying, and why does it fit Orca specifically?

If those answers are weak, the proposal should probably stay out of v1 or out of the schema entirely.
