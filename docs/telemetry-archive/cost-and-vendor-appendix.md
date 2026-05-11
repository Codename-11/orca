# Telemetry Archive — Cost And Vendor Appendix

Status: archival appendix. This file preserves the detailed cost and vendor reasoning that informed the v1 telemetry choice. It is reference material, not the source of truth for the current rollout.

**Reference only:** yes. This appendix exists to preserve detailed cost and vendor evidence without expanding the canonical docs.

Canonical docs:
- [`../telemetry-plan.md`](../telemetry-plan.md)
- [`../telemetry-rationale-archive.md`](../telemetry-rationale-archive.md)

## Why this appendix exists

The canonical telemetry docs should answer:
- what we are shipping
- why the decision stands
- how to implement it

They should not force every future reader through long pricing tables and vendor comparisons. This appendix keeps that evidence available without turning it back into the main reading path.

## Vendor shortlist

The real v1 choice was between:
- **PostHog Cloud US**
- **Tinybird / custom ClickHouse**
- **Do nothing**

Everything else was materially worse for this team or this product shape.

## Vendor comparison summary

| Option | Why it was attractive | Why it did not win v1 |
|---|---|---|
| **PostHog Cloud US** | Built-in funnels and retention, Electron fit, OSS SDK/server, cheap at our scale | Data leaves our infra; still a vendor trust decision |
| **Tinybird / custom ClickHouse** | Strongest ownership story, portable, SQL-first | Requires building dashboards and BI workflow ourselves |
| **RudderStack / Segment** | Flexible routing layer | Not an analytics product; would require downstream warehouse + BI |
| **Mixpanel / Amplitude / Heap** | Mature analytics UX | Closed-source trust mismatch for a developer audience |
| **Matomo / Plausible / Fathom / Umami** | Simpler privacy story | Wrong shape for desktop app funnels |
| **Self-hosted PostHog** | Same product with stronger ownership | Extra ops burden too early for v1 |

## Why PostHog Cloud still won

The decision was mostly about team leverage:
- no separate BI tool to stand up
- no hand-written SQL required for every first funnel question
- good enough cost profile at early scale
- acceptable migration path if we later outgrow it

The strongest runner-up remained Tinybird / custom ClickHouse. If a future privacy or ownership requirement becomes load-bearing, that is still the most likely exit path.

## Cost model that informed the design

The important design conclusion was not the exact dollar figure. It was which event shapes create cost pressure.

Durable conclusions:
- hot-path events dominate
- event-count anxiety about rare events is usually misplaced
- ambiguous hot-path events are bad twice: misleading and expensive
- schema discipline matters more than raw event-name count

## PostHog pricing shape used in planning

Verified during the design process against PostHog Product Analytics pricing.

| Bracket | Per-event price |
|---|---|
| 0–1M | free |
| 1–2M | $0.0000500 |
| 2–15M | $0.0000343 |
| 15–50M | $0.0000295 |
| 50–100M | $0.0000218 |
| 100–250M | $0.0000150 |
| 250M+ | $0.0000090 |

## Projected bill ranges used in planning

The design work used two profiles:
- **median / realistic**
- **planning / padded**

The exact figures moved as the schema was reduced, but the design logic stayed stable: v1 remains cheap enough to ship, and `agent_started` remains the dominant cost lever.

### Planning table

| Users | Events/mo (realistic) | Approx bill | Events/mo (padded) | Approx bill |
|---|---|---:|---|---:|
| 100 | <1M | $0 | <1M | $0 |
| 250 | ~0.5–1.5M | $0–25 | ~1.5M | ~$25 |
| 500 | ~1–3M | $0–84 | ~3M | ~$84 |
| 1,000 | ~2–6M | ~$50–187 | ~6M | ~$187 |
| 2,500 | ~5–15M | ~$153–496 | ~15M | ~$496 |
| 5,000 | ~10–30M | ~$324–938 | ~30M | ~$938 |

The exact midpoint depends on whether you use the lighter observed profile or the padded planning profile. The design decision did not depend on picking one single number; it depended on the fact that v1 remains manageable and the hot-path event is the real billing driver.

## Event cost ranking

This is the most important cost table the earlier drafts had.

| Event | Why it matters |
|---|---|
| `agent_started` | Dominates volume; the real billing lever |
| `workspace_created` | Noticeable but far smaller than `agent_started` |
| `agent_error` | Rare enough to be cheap |
| `app_opened` | Cheap and useful because DAU/retention derive from it |
| `repo_added` | Near-free |
| `settings_changed` | Near-free |
| `telemetry_opted_in/out` | Functionally free |

This is why:
- cutting `agent_stopped` mattered
- cutting `panel_opened` mattered
- debating the cost of `settings_changed` did not

## Why `agent_stopped` being cut mattered financially

It was not just a semantics cleanup.

If `agent_stopped` had shipped as a second hot-path event:
- it would roughly double the core loop volume
- it would do so while carrying low-confidence semantics
- it would make the most expensive telemetry also the least trustworthy

That is a strong reason to avoid it until the source signal improves.

## Why `panel_opened` was treated as dangerous

`panel_opened` was the clearest example of a plausible event that fails the cost/signal test.

Why it looked attractive:
- broad feature-usage visibility
- easy to instrument

Why it was dangerous:
- high frequency
- weak product question unless tightly scoped
- risk of becoming more expensive than more meaningful lifecycle events

If it ever returns, it should return with one of these constraints:
- tied to a specific dashboard question
- heavily sampled
- or reduced to a smaller set of high-value transitions

## Billing safety valves that were part of the plan

The original design also included operational cost guardrails:
- hard billing cap
- alert threshold below the cap
- revisit trigger when cloud spend stays meaningfully high

The durable point is that surprise-bill risk was already part of the design, not an afterthought.

## When to revisit vendor choice

These were the real revisit triggers:
- sustained volume above the free tier by enough margin to matter for months
- a privacy complaint from a user cohort we care about
- a real enterprise data-residency requirement
- team capacity shifting enough that self-managed analytics becomes realistic

## What to do if this appendix becomes stale

If prices drift:
1. update the bracket table
2. update the planning table
3. keep the event-cost ranking logic unless the schema itself changes

If the schema changes:
1. update [`../telemetry-plan.md`](../telemetry-plan.md) first
2. update the rationale archive
3. then update this appendix
