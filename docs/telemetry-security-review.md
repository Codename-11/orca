# Telemetry Security Review

Companion to [`telemetry-plan.md`](./telemetry-plan.md), [`telemetry-implementation.md`](./telemetry-implementation.md), and [`telemetry-error-tracking.md`](./telemetry-error-tracking.md).

**Source of truth:** yes. This doc records the current telemetry threat model and resolved review findings.

**Scope.** Security review of the v1 telemetry design under the following constraints:
- Orca is open-source; an attacker can clone and inspect any shipped artifact.
- Users **cannot submit logs themselves** from locally-run / contributor / fork builds — the binary gate (`ORCA_BUILD_IDENTITY` + `ORCA_POSTHOG_WRITE_KEY` both injected by CI) is structural, not policy.
- Users cannot see our dashboards, overload the pipeline with volume (hard $500/mo billing cap + PostHog drops past cap), or otherwise interact with the backend beyond what the shipped binary authorizes.
- In-scope threats: adversarial misuse of what a shipped official binary authorizes, data-integrity risks on our own dashboards, user-data exposure via the diagnostic-bundle lane.
- Out-of-scope threats: vendor compromise (PostHog US itself), host-OS compromise, physical device seizure.

**TL;DR.** All nine findings are resolved in-place in the source docs. Issues 2 (bundle endpoint), 3 (redactor), 4a/4b/4c (renderer trust boundary), 5 (`error_name` whitelist), 8 (bundle ↔ `install_id` correlation), and 9 (PostHog auto-properties surface) are resolved with spec changes. Issues 1 (write-key spoofing) and 6 (corrupt-file reset) are resolved via documentation + tests — Issue 1 is fundamentally unsolvable with code under our anonymous-telemetry design, so the fix is explicit threat-model documentation + a spoofing-response playbook. Issue 7 (public aggregate dashboard — small-cohort side channels) is resolved by structural cut: the public dashboard itself was dropped from v1 ([`telemetry-plan.md` decision 11](./telemetry-plan.md#11-public-aggregate-dashboard--considered-and-cut-from-v1)), which removes the disclosure surface the finding was about. (An earlier draft carried a tenth finding on heartbeat clock-skew for synthetic `app_closed` events; it was eliminated when `app_closed`/`daily_active_user` were cut from the v1 schema and crash detection moved to a separate crash-reporting lane without a product-telemetry timestamp-override surface.)

**Resolution status legend:** ✅ fully resolved in spec, 📝 resolved via documentation (no code change possible), 🧪 resolved via added tests.

## Issues in priority order

1. 📝 [Write key is extractable from shipped binaries — event spoofing unaddressed](#1-write-key-is-extractable-event-spoofing-is-not-addressed)
2. ✅ [Diagnostic-bundle upload endpoint — the one genuinely user-risky surface](#2-diagnostic-bundle-upload-endpoint-the-one-genuinely-user-risky-surface)
3. ✅ [Redactor coverage is too narrow for an AI agent tool](#3-redactor-coverage-is-too-narrow-for-an-ai-agent-tool)
4. ✅ [Renderer-side IPC is the actual trust boundary](#4-renderer-side-ipc-is-the-actual-trust-boundary-and-isnt-documented-as-one)
5. ✅ [`error_name` regex allows identifier-shaped leaks](#5-error_name-regex-allows-identifier-shaped-leaks)
6. 🧪 [Corrupt-file reset case documented but not tested](#6-corrupt-file-reset-case-documented-but-not-tested)
7. ✅ [Public aggregate dashboard — small-cohort side channels (resolved by cutting the dashboard from v1)](#7-public-aggregate-dashboard-small-cohort-side-channels)
8. ✅ [Diagnostic bundles must not carry the PostHog `install_id`](#8-diagnostic-bundles-must-not-carry-the-posthog-install_id)
9. ✅ [PostHog auto-attached properties not enumerated](#9-posthog-auto-attached-properties-not-enumerated)

Each section below: the original finding, why it matters under the user-constraint set, and how it was resolved (with links to the specific doc edits).

## 1. Write key is extractable; event spoofing is not addressed

**Finding.** [`telemetry-implementation.md:1120`](./telemetry-implementation.md) calls the PostHog write key "`NEXT_PUBLIC`-equivalent" and treats it as "shipped in the binary, not secret." Correct as far as it goes. The gap: the docs don't name what an attacker who runs `strings` on the shipped official binary can *do* with it.

What they can do:
- **Submit any event name from the schema, with any `install_id`, any `orca_channel`, any `agent_error.error_class`.** The write key is the only authentication PostHog requires for `/capture/`.
- **Poison `agent_error.error_class` distribution** — e.g., spike `auth_expired` to send us down a wrong-fix path on the exact failure mode they'd like us to spend engineering time on.
- **Spoof the activation funnel** (`app_opened` / `repo_added` / `workspace_created` / `agent_started` volumes per `app_version`) to make a real regression look fine, or manufacture a fake one to push us toward rolling back a release that's actually fine.
- **Spoof `telemetry_opted_out`** events to make our consent-UX dashboards read as if the cohort is rejecting the current banner copy.

**Why the current mitigations do not cover this:**
- The `$500/mo billing cap` bounds *dollar* cost — PostHog stops ingesting past the cap, we lose a week's funnel. It does not bound **data integrity** for events submitted below the cap.
- The runtime validator runs on our own binary before transmission; an attacker POSTing directly to `us.i.posthog.com/capture/` bypasses it entirely.
- The binary gate prevents *us* from accidentally transmitting from contributor builds. It does nothing to prevent a third party from extracting the key and POSTing.
- Person-profile suppression (`$process_person_profile: false` attached by our `track()` wrapper) runs in our client. A direct POST that omits the flag will materialize a PostHog person against the spoofed `install_id`. Either way, spoofed events land in the event log and every downstream dashboard.

**What changes:** nothing required to ship v1 — but the plan should **explicitly acknowledge the threat model** rather than leaving readers with the impression the write key "isn't secret" means "no attack surface." Concrete additions:

- **In [`telemetry-plan.md`](./telemetry-plan.md) under `Non-goals` or `What we collect`:** a line saying "Dashboard data is not a source of truth for any decision that would benefit a motivated adversary. The PostHog write key is extractable from shipped binaries; events submitted directly to `/capture/` bypass the runtime validator and burst cap. This is fine for 'which panels do real users click,' not fine for 'is a named competitor doing X in our data.'"
- **Operational playbook in [`telemetry-implementation.md`](./telemetry-implementation.md) §Operational notes:** "If a campaign of spoofed events is suspected (e.g., `agent_error.error_class` distribution shifts sharply with no release correlation, or a single `install_id` emits hundreds of `agent_started` events within minutes), rotate the PostHog project. Contrast against Sentry breadcrumb counts if we ever add Sentry; the two-vendor cross-check is the practical integrity signal."
- **Optional v2:** a soft server-side per-`install_id` rate cap in PostHog ingestion (PostHog doesn't support this natively — would require a Cloudflare Worker / thin proxy). Not worth doing for v1; name it as the next lever if spoofing materializes.

**Blast radius under the user-constraint set.** Not user-harming — no user data leaks from spoofing, no user gets tracked who shouldn't. Orca-harming: we make release decisions on polluted data. Acceptable risk for v1; the mitigation is acknowledgement + rotation playbook, not architecture change.

### 📝 Resolution (documentation-only by design)

**Why no code fix exists.** Authenticating "this event is from an official Orca client" requires the official client to hold a secret the attacker's client doesn't. Any such secret is either (a) injected into the same binary → trivially extractable, no better than the write key, or (b) derived from a user identity → breaks the anonymous-install-ID design that the whole consent model rests on. A server-side per-IP rate limiter raises the floor but does not close the gap. The correct answer is to acknowledge the threat model and maintain a response playbook.

**Changes applied:**

- [`telemetry-implementation.md`](./telemetry-implementation.md) §Operational notes §Secret management: added explicit **Write-key threat model** paragraph enumerating what spoofing can do (event log poisoning, `orca_channel` misattribution, `telemetry_opted_out` spoofing), what our existing controls do not cover (validator and burst cap run in our client, don't apply to direct POSTs), and what we accept (anonymity over spoofability).
- [`telemetry-implementation.md`](./telemetry-implementation.md) §Operational notes: added **Event-spoofing response playbook** with concrete signals (sharp `error_class` distribution shift without release correlation, a single `install_id` emitting hundreds of `agent_started` events within minutes, `telemetry_opted_out` from unseen `install_id`s) and the rotation process (new PostHog project in the same US region, new write key in the next CI release, old-project-as-honeypot).
- [`telemetry-implementation.md`](./telemetry-implementation.md) §PR 5 — Dashboards: added an alert for **single `install_id` appearing in >500 `agent_started` events within 1 hour** — legitimate users do not exceed this rate (the surveyed outlier is ~15/hr), and it's the most detectable spoofing pattern in the v1 schema.

Optional v2 lever named but not implemented: a thin Cloudflare Worker proxy for edge rate-limiting per source IP. Raises the cost of sustained campaigns without requiring a client-side secret.

## 2. Diagnostic-bundle upload endpoint: the one genuinely user-risky surface

**Finding.** Mode 3 in [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) ("Share a diagnostic bundle with Orca support") is the **only** lane in the v1 design where user-controlled content flows *into* Orca infrastructure. Every other lane (product telemetry, local traces, OTLP to a user-owned endpoint) either has a constrained schema or never leaves the user's machine. The spec is correct about *what* the bundle contains, but undercooked on endpoint hardening.

**Gaps in the current spec:**

### 2a. Authentication / authorization is not specified

The doc says "uploads to a URL configured at build time (a single HTTP POST endpoint)." Nothing about auth. As written, anyone with the URL (trivially extracted from the binary — same threat model as the PostHog write key) can POST arbitrary blobs.

**What to add:**
- **Short-lived token issued by the app on click.** When the user clicks "Share," the app requests a one-time upload token from an auth endpoint, then uploads using that token. This narrows the window from "anyone forever" to "someone who extracted a token within N minutes."
- **Per-IP rate limit** at the ingest edge (Cloudflare / API gateway) — e.g., 10 uploads/IP/hour. Bundle sharing is a deliberate, low-volume human action; anything higher is abuse.
- **Content-type allowlist** — `application/json` or `application/x-ndjson` only. Reject binary uploads.
- **Max body size cap at 10 MB.** Matches the local file rotation default in [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §Mode 1. Anything larger is either a bug or an attack; fail the request.
- **No authenticated user identity.** Deliberately. The bundle is anonymous — tying it to a login would undo the "we don't collect identity" promise. The token + rate limit is the whole auth story.

### 2b. Ticket-ID scheme is not specified

Doc says "ticket ID the user gets back." Must be:
- **Unguessable** — ≥128 bits of cryptographic randomness (UUIDv4 is fine; `secrets.token_urlsafe(16)` is fine; sequential integers are not fine).
- **Not enumerable** — users can't probe "give me ticket N-1 / N+1."
- **Not printable in URLs shown to third parties by default** — the user pastes the ticket ID into a GitHub issue or support email, which is a public-ish surface. That's fine only if the ticket ID is useless without admin access to the bundle store.

### 2c. Storage bucket must be private

[`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §Open questions #1 asks "Do we run one? Where?" Add to the decision:
- **Private bucket, never served publicly.** S3 bucket with no public-read ACL, served to Orca staff via pre-signed URLs or an internal admin tool only.
- **No CDN fronting.** CDN logs and cached responses are a known leak vector for private-by-intent content.
- **Logs retention on the bucket access log ≤30 days.** The bucket itself is the sensitive thing; its access logs inherit the sensitivity.

### 2d. No deletion path for user-regret cases

The doc names 30-day retention but no explicit user-facing deletion. Add:
- **"Delete this bundle by ticket ID"** flow — in-app: user pastes (or clicks) their ticket ID and the app calls a delete endpoint. The delete endpoint trusts that anyone with the ticket ID is the legitimate owner, which is consistent with "ticket ID is the whole auth story." No email-alias fallback — the README **Privacy & Telemetry** section deliberately exposes no contact alias (see [`telemetry-plan.md` §Documentation](./telemetry-plan.md#documentation) for the anonymous-identity rationale), and the in-app flow is the only submit path anyway.
- **Bundle deletion from storage within 7 days** of the request. Matches the retention promise language in the existing banner copy.

### 2e. Renderer-side errors via IPC bridge (open question #3) becomes a write amplifier

[`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §Open questions #3 flags renderer-error piping to the local trace file as a v2 candidate. If it lands, the IPC path becomes a **write-to-local-disk surface the renderer can abuse** — a compromised renderer could fill the user's disk with trace files before rotation kicks in.

**When this v2 lands, gate it with:**
- The same burst cap pattern the product-telemetry lane uses (per-event-name token bucket).
- A hard per-session byte cap (e.g., ≤100 MB written per `session_id`, regardless of rotation) — rotation deletes old files but doesn't prevent a compromised renderer from writing faster than rotation reclaims.
- A main-process allowlist of error-category shapes from the renderer; the validator pattern applies here as much as it does to PostHog events.

### 2f. Server-side scanning of submitted bundles

Bundles contain paths, cwds, and potentially keys that slipped past the client-side redactor (defense-in-depth is the whole point of running the redactor twice in §Mode 3 step 2). Add:
- **Server-side secondary redaction** on ingest — run the same redactor rules server-side before the bundle is stored, even though the client already ran them. Client-side redaction can be bypassed by an attacker running a modified binary that POSTs directly; server-side redaction is the defense.
- **Optional static scanner for common secret shapes** (the same set named in [Issue 3](#3-redactor-coverage-is-too-narrow-for-an-ai-agent-tool) below) — flag bundles with likely-unredacted secrets for manual review before they're surfaced to the Orca team.

**Blast radius under the user-constraint set.** This *is* user-harming if mishandled — a user's bundle can contain their repo paths, their provider errors with partial prompts in span-event messages, and potentially credentials that dodged both client-side redaction passes. The full list of 2a–2f is a **launch blocker for Mode 3**, not for the rest of the plan. Modes 1 and 2 (local file, user-configured OTLP) ship fine without it because neither leaves the user's machine through Orca infra.

### ✅ Resolution (fully specified)

All seven sub-findings addressed via a new **[Endpoint contract](./telemetry-error-tracking.md#endpoint-contract)** section in [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) with ten explicit hardening requirements, each ship-blocking for Mode 3:

1. ✅ **Short-lived token auth** — 256-bit random tokens, 5-minute TTL, single-use. Resolves 2a.
2. ✅ **Per-IP rate limit at the edge** — ≤10 tokens and ≤10 uploads per IP per hour. Resolves 2a.
3. ✅ **Max body size 10 MB** — matches local-file rotation default, rejected at edge. Resolves 2a.
4. ✅ **Strict content-type allowlist** — `application/x-ndjson` or `application/json` only. Resolves 2a.
5. ✅ **Ticket IDs unguessable and non-enumerable** — 128-bit cryptographic random, URL-safe encoded, no sequential component. Resolves 2b.
6. ✅ **Private object-storage bucket, no CDN fronting, ≤30-day access logs** — resolves 2c.
7. ✅ **Server-side redaction on ingest** (third redactor pass) — defense-in-depth against a compromised-binary bypass of the client-side redactor. Resolves 2f.
8. ✅ **30-day auto-retention + ticket-ID-based delete endpoint with 7-day SLA** — resolves 2d.
9. ✅ **No authenticated user identity, ticket-ID-is-the-auth-story** — preserves the anonymous-install-ID design.
10. ✅ **No renderer access to the HTTP endpoints** — main-process-only; a compromised renderer can initiate a bundle share (user still clicks through preview) but cannot silently POST. Resolves 2e's renderer-abuse angle.

Sub-finding 2e (v2 renderer-errors-via-IPC disk-fill defense) resolved by updating [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §Open questions #3 to enumerate the three required defenses when that v2 feature lands: per-event burst cap from the PostHog lane, per-session byte ceiling (≤100 MB renderer-originated spans per `session_id`), and a main-process allowlist of renderer-submissible span shapes.

## 3. Redactor coverage is too narrow for an AI agent tool

**Finding.** The v1 redactor in [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §The redactor uses the regex `/(?:api[-_]?key|token|secret|password|bearer|authorization)\s*[:=]\s*\S+/i`. That matches labeled key-value shapes ("api_key: sk-..." or "Authorization=Bearer ..."). It **misses raw-token shapes** that appear in error spans without a label — which is the common case for an AI agent tool because:
- Provider SDKs throw errors whose `.message` contains the raw token echoed back (`"Invalid token: sk-ant-api03-..."`).
- Git operations fail with stderr containing URL-embedded tokens (`https://ghp_...@github.com/...`).
- MCP tool invocations and subprocess output dump env vars into span attributes.

The v1 doc **explicitly names** provider-key fingerprinting as a **v2 candidate**. Given the product shape, it should be v1.

**Token shapes to add in v1** (each is ~2 lines of regex, cheap):

| Pattern | Where it shows up in Orca |
|---|---|
| `sk-ant-api03-...` (Anthropic) | Every Claude API error |
| `sk-proj-...`, `sk-...` (OpenAI) | Every Codex / OpenAI error |
| `ghp_...`, `gho_...`, `ghs_...`, `ghu_...`, `ghr_...` (GitHub) | Every git push/pull auth failure |
| `xox[baprs]-...` (Slack) | Less common but cheap to include |
| `AKIA[0-9A-Z]{16}` + `aws_secret_access_key` | AWS CLI spans |
| JWT shape (`eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*`) | Session tokens, Claude Code auth state |
| `-----BEGIN [A-Z ]+-----` through `-----END [A-Z ]+-----` | Accidentally-dumped PEM keys |

**Additional rules worth adding:**

- **`.env`-shape lines.** Any line matching `^[A-Z_][A-Z0-9_]*\s*=\s*\S+$` inside an attribute value → redact the value (keep the key name for debug context). Catches the "a user pasted their .env into the terminal and it ended up in a span" case.
- **URLs with embedded credentials** — any URL matching `https?://[^/\s]+:[^@\s]+@` → strip the userinfo component (`://user:pass@host` → `://[redacted]@host`).
- **Entropy heuristic (optional).** A last-resort catch-all: any string attribute ≥20 chars that is ≥80% base64 characters and not a known-safe shape → replace with `[redacted:high-entropy]`. False positives on legitimately-opaque IDs (install_id UUIDs would match if they were in a span) are acceptable because the local file still shows the rest of the span context.

**Where the redactor runs.** Currently spec'd to run synchronously at sink-write time for the local NDJSON file, OTLP export, and bundle collection. Add one more location:

- **Server-side, on bundle upload ingest.** Defense in depth: the client-side redactor runs on an attacker-controllable binary. Server-side redaction on ingest is the guarantee. See [Issue 2f](#2f-server-side-scanning-of-submitted-bundles).

**Redactor test requirements.** The v1 test strategy in [`telemetry-implementation.md`](./telemetry-implementation.md) §Test strategy lists consent, validator, and client tests — no redactor. Add:

- `src/main/observability/redactor.test.ts` — fixture-based. For each of the ~10 secret shapes above, feed a span with the secret embedded in (a) a span-event message, (b) an attribute value, (c) the `cause` field of an exit status. Assert the secret does not appear verbatim in the serialized output.
- **Fuzz test** (optional but cheap) — property-based: generate random strings containing known-secret shapes, assert the serialized span never contains the raw shape. Catches regex edge cases faster than hand-picked fixtures.

**Blast radius under the user-constraint set.** This is the *most likely* real-world security incident in the whole telemetry design. Not from an attacker — from a well-meaning user clicking "Share diagnostic bundle" on a session where Claude Code hit an auth failure, reviewing the preview window too quickly, and shipping us their provider key. The failure mode is "we end up holding a user's Anthropic API key in our bundle storage, possibly logged by our CDN, possibly indexed by a log-aggregation tool." Client-side redaction reduces the probability; server-side redaction reduces the blast radius. Both should ship together.

### ✅ Resolution (fully specified)

Provider-key fingerprinting moved from v2 to v1. [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §The redactor now specifies six rule categories, applied in three locations:

**Rules (v1):**
1. **Labeled key-value redaction** — the original regex. Catches labeled `api_key:`, `Authorization: Bearer`, etc.
2. **Provider-key fingerprint redaction** — table of 8 shapes: Anthropic (`sk-ant-`), OpenAI (`sk-`, `sk-proj-`), GitHub (`gh[pousr]_`), AWS access key + labeled secret, JWTs, Slack tokens (`xox[baprsoe]-`), PEM-encoded private keys. Replacement preserves the *shape* (`[redacted:anthropic-key]`) for debug triage without exposing the key.
3. **URLs with embedded credentials** — strip userinfo component, keep host/path.
4. **`.env`-shape line redaction** — `FOO_SECRET=value` → `FOO_SECRET=[redacted:env-value]`, preserves key for debug.
5. **Attribute-key block-list** — `env`, `environment`, `env_vars`, `authorization`, `cookie`, `set-cookie`, `proxy-authorization`.
6. **4 KB string length cap** — bounds the accidental-blob case.

**Locations (defense in depth):**
- **Sink-write** — local NDJSON + OTLP export (every span).
- **Bundle collection** — second pass before preview window renders.
- **Server-side on ingest** — third pass; the client runs on an attacker-controllable binary, server-side is the guarantee.

**Test strategy** spec'd in the same section: fixture-based per-shape tests covering attribute-values, span-event messages, and exit-status `cause` fields; optional property-based fuzz.

[`telemetry-implementation.md`](./telemetry-implementation.md) §Test strategy gains a matching `src/main/observability/redactor.test.ts` entry (added as part of the Issue 6 test-strategy expansion).

## 4. Renderer-side IPC is the actual trust boundary and isn't documented as one

**Finding.** The architecture docs treat `window.api.telemetryTrack` as a typed-contract-with-validator. That framing is correct for developer ergonomics and for catching schema bugs. It undersells the actual security role of the main-process validator: **it's the defense against a compromised renderer**.

Why the renderer is the realistic compromise point in an AI agent tool:
- The renderer renders **agent output**, which is attacker-controllable content (prompt injection → agent writes markdown → markdown renders → content executes).
- The renderer renders **MCP tool responses**, which are third-party-controllable.
- The renderer loads **external-editor launch URLs**, diff views, PR descriptions, file-tree content.
- Any XSS-equivalent rendering bug in any of those paths gives an attacker the ability to call `window.api.telemetryTrack(...)`, `window.api.telemetrySetOptIn(...)`, and `window.api.telemetryDeclineBanner(...)` at their pace.

Current controls, scored against a compromised-renderer threat model:

| Control | Stops compromised renderer? | Notes |
|---|---|---|
| TypeScript event map | ❌ | Types do not survive IPC serialization. |
| Runtime validator in main | ✅ | Sole enforcement. Correctly identified in [`telemetry-implementation.md`](./telemetry-implementation.md). |
| Per-event-name burst cap (20/min or 30/min) | ⚠️ Partial | Caps per-event-name. 7 event types × 30/min = **210 events/min = ~12.6K/hour** per renderer. Multi-window users: multiply. |
| Shutdown gate | N/A | Only applies at quit time. |
| Consent gate | ✅ | Renderer-compromise cannot bypass `resolveConsent` — it runs on every call. |

**What's missing:**

### 4a. Global per-session event cap

The plan spec'd burst caps are **per event name**. In aggregate, a compromised renderer can emit up to (7 event types × 30/min) ≈ 12,600 events/hour per session. Across a 24-hour session that's ~300K events, well past a normal user's daily rate and straight into "we hit the $500 cap this week and lost the funnel."

**Add to [`telemetry-implementation.md`](./telemetry-implementation.md) §Burst cap:**
- A **global per-session cap** of e.g. ≤1,000 events per `session_id` (hard ceiling, not rate-limited). A normal heavy user per the survey is ~200 events/day (median ~68); 1,000 per session is well past the surveyed outlier and still leaves headroom for a long session with many workspace operations.
- Overflow: drop silently, single `console.warn` per session when the ceiling is first crossed.

### 4b. `telemetry:setOptIn` and `telemetry:declineBanner` are renderer-reachable without friction

A compromised renderer can:
- **Silently opt the user out** via `window.api.telemetrySetOptIn(false)` — DoS on our product-intelligence signal, recoverable.
- **Silently persist a banner decline** via `window.api.telemetryDeclineBanner()` — an existing user in the `optedIn === null` state has their preference flipped to `false` without the banner ever rendering. No event fires (the channel exists specifically to persist silently), but the user's cohort gets locked out of future telemetry without an interaction. Recoverable but trust-violating.
- **Spoof a consent action** via `window.api.telemetrySetOptIn(true)` for a user whose stored state was `null` (existing user undecided). Fires a `telemetry_opted_in { via: 'first_launch_banner' }` event and starts transmission — the attacker just onboarded the user into telemetry without the banner ever resolving.

The third case is the trust-violating one: an existing user's cohort gate gets bypassed by a compromised renderer.

**Add to [`telemetry-implementation.md`](./telemetry-implementation.md) §IPC surface:**
- **`telemetry:setOptIn` must fail-close on unexpected input.** Current preload signature is `(optedIn: boolean)` — validate type strictly in the main handler (the renderer can pass anything over IPC).
- **Rate-limit consent-mutation IPC** to ≤5 calls per session. A legitimate user flips the toggle at most a few times; anything beyond that is either a bug or an attack. Drop silently past the cap.
- **Do not fire `telemetry_opted_in/out` from IPC-delivered `setOptIn` calls unless a user-facing surface is actively visible.** Harder to get right; optional. The softer version: log a `console.warn` when `setOptIn` is called from IPC without a corresponding banner or settings-pane render in the recent past. Makes anomalies visible in dogfood logs.

### 4c. Document the threat model explicitly

[`telemetry-implementation.md`](./telemetry-implementation.md) §Architecture at a glance names the validator as "the sole enforcement point" because types don't survive IPC. That's the developer framing. Add a line explicitly calling out the **security framing**:

> "The main-process validator is the sole enforcement point against a compromised renderer. A renderer rendering attacker-controllable content (agent output, MCP responses, file contents) has the ability to call any `window.api.telemetry*` method. The validator, burst caps, and consent gate are designed to fail-closed under that threat model."

**Blast radius under the user-constraint set.** Not user-harming — a compromised renderer is already a catastrophic state for the user regardless of telemetry. Orca-harming: dashboard poisoning at higher rate than the [Issue 1](#1-write-key-is-extractable-event-spoofing-is-not-addressed) spoofing path, and cohort-resolver state corruption for that user. Acceptable risk for v1 with the 4a + 4b additions.

### ✅ Resolution (fully specified)

All three sub-findings resolved:

**4a (global per-session cap) — ✅.** [`telemetry-implementation.md`](./telemetry-implementation.md) §Burst cap now specifies two independent caps that must both be satisfied:
- Per-event-name token bucket (unchanged: `agent_error` 20/min, others 30/min).
- **New: per-session global ceiling of ≤1,000 events per `session_id`**, hard stop. Justified against the surveyed outlier user (~200 events/day under the v1 schema) with ~5× headroom, and positioned as a ~12× reduction below the worst-case compromised-renderer rate at the per-event-name cap alone. Overflow drops silently with one `console.warn` per ceiling-crossing.

**4b (consent-mutation IPC rate limit + strict input validation) — ✅.** [`telemetry-implementation.md`](./telemetry-implementation.md) §IPC surface rewritten:
- **Strict type-narrows in main** — `telemetry:track` drops if `name` is not a string or `props` is not object-or-null; `telemetry:setOptIn` drops if `optedIn` is not a boolean. Types do not survive IPC serialization, so the renderer can pass anything over the wire.
- **Consent-mutation rate limit** — ≤5 calls per `session_id` shared across `telemetry:setOptIn` + `telemetry:declineBanner`. A compromised renderer cannot silently flip the user's consent state repeatedly or burn the banner-decline channel to force unbounded settings-file writes.
- **Exempted** — main-originated consent mutations (e.g., the second-banner-dismissed cohort resolver in `Store.load()`) don't go through IPC, so they're not counted against this cap.

**4c (threat-model framing) — ✅.** [`telemetry-implementation.md`](./telemetry-implementation.md) §Architecture at a glance now includes an explicit **Security framing for the validator** paragraph naming the renderer-compromise threat model: "The renderer renders attacker-controllable content (agent output, MCP responses, file contents, markdown, diff views). An XSS-equivalent rendering bug in any of those paths gives an attacker the ability to call `window.api.telemetry*` at will. The validator, the two-layer burst cap, the consent-mutation rate limit, and the strict IPC type-narrows are collectively designed to fail closed under a compromised-renderer threat model — not just a misbehaving-renderer one."

[`telemetry-implementation.md`](./telemetry-implementation.md) §Test strategy additions cover each of these: `burst-cap.test.ts` for the two-bucket enforcement and the consent-mutation bucket; `ipc/telemetry.test.ts` for IPC type-narrow and consent-mutation cap behavior.

## 5. `error_name` regex allows identifier-shaped leaks

**Finding.** Earlier drafts defined `error_name` on `agent_error` as a constrained string matching `/^[A-Z][A-Za-z]{0,32}$/`. The intent — "carry only a class name, never a message" — is correct. The regex enforces shape but not semantics: a class name is what you *hope* the developer passed; the regex accepts anything that *looks* like a class name.

**Failure modes the regex accepts:**

- `PaymentFailedForUserAlice` — a developer concatenates context into an error class name at the throw site. Regex passes. Identifying string ships.
- `AuthExpiredForAcmeCorp` — similar shape, customer codename leaks.
- `TimeoutInRepoMyCompanyInternalMonorepo` — repo name variant.
- `SshFailedToGithubUserBrennanb2025` — GitHub username variant.

None of these are hypothetical in an AI agent codebase — `new Error(\`Failed for ${user}\`)` and `class FailedFor${user} extends Error` patterns happen in real code under deadline pressure. The runtime validator passes all of them.

**What to change.** Replace the regex with a **closed allowlist** of class names — the same pattern used by `SETTINGS_CHANGED_WHITELIST`. Concrete shape:

```ts
// src/shared/telemetry-events.ts
export const AGENT_ERROR_NAME_WHITELIST = [
  'Error',
  'TypeError',
  'RangeError',
  'SyntaxError',
  'ReferenceError',
  'URIError',
  'EvalError',
  'AbortError',
  'TimeoutError',
  'NetworkError',
  'AuthError',
  'RateLimitError',
  'ProviderError',
  // ... add class names as classifiers are wired, with a PR review each
] as const
export type AgentErrorName = (typeof AGENT_ERROR_NAME_WHITELIST)[number]
```

Validator behavior:
- If `error_name` is present and in the allowlist → pass through unchanged.
- If present and **not** in the allowlist → strip the property, keep `error_class`. Preserves tail visibility (we still know it was `agent_error` with e.g. `error_class: 'unknown'`), loses the specific class name. This is the same fallback already documented for regex mismatches — just a narrower accept set.

**Cost of the change.** Zero at runtime (set lookup is O(1)). Trivial at review time (adding a new error class name means one line in the whitelist plus one line in the classifier). Trades "any string that looks like a class name" for "class names we've reviewed and accepted" — which is the whole point of an allowlist.

**Why this matters under the user-constraint set.** The spec is already strict about never sending `error_message` or `error_stack`. The `error_name` field is the one narrow allow-listed string — that's exactly why it deserves tighter bounds than a regex. A regex is the *permissive* form of a whitelist; the whitelist is the *correct* form for this field.

**Secondary benefit.** The whitelist doubles as documentation. A reviewer reading [`telemetry-events.ts`](./telemetry-implementation.md) sees the exact set of `error_name` values that can ever transmit. That's the same readability property `SETTINGS_CHANGED_WHITELIST` earns — the docs already note that the whitelist approach is chosen deliberately for `settings_changed.setting_key` ("If a setting isn't in this list, we do not emit"). Apply the same reasoning here.

**Blast radius under the user-constraint set.** Low likelihood of a high-profile incident, but the specific shape of leak — "our telemetry accidentally named a user / customer / repo" — is exactly the kind of thing that ends up on a public thread with a reproducing grep. The whitelist closes that class of bug by construction.

### ✅ Resolution (whitelist spec'd, then deferred with the property)

The original resolution adopted a closed `AGENT_ERROR_NAME_WHITELIST` in place of the regex. That fix landed in the schema and was the correct call.

It was then partially superseded when the v1 `error_class` enum was trimmed to `'binary_not_found' | 'unknown'` and the optional `error_name` property was deferred entirely. The reasoning: with two enum values, `error_name`'s "tail visibility for unmapped class names" job collapses — the `'unknown'` slice already carries that signal, and a per-name whitelist adds nothing on top of it. See `telemetry-rationale-archive.md` §"Why the `error_class` enum was trimmed late, and `error_name` was deferred entirely."

**The threat the original finding identified is fully neutralized in the trimmed schema** — `error_name` is no longer a property on `agent_error`, so there is no string field on this event that could carry an identifier-shaped leak. `.strict()` rejects any extra key, including a re-introduced `error_name`, until the schema explicitly opts back in.

**If `error_name` is ever re-introduced** (for example, alongside a future enum expansion driven by structured CLI exit signals), it should be a closed whitelist for the same reasons articulated above:
- the regex is the *permissive* form; the whitelist is the *correct* form for class-name fields
- `SETTINGS_CHANGED_WHITELIST` is the same pattern doing the same job for `settings_changed.setting_key`
- adding a new transmitted name should require a PR that lands in the whitelist, giving review a chance to catch context-concatenation patterns

The schema-evolution doctrine in `telemetry-events.ts` already enforces this: `error_name` is an additive-optional field. Re-introducing it requires a typed schema change, which is the review surface where the regex-vs-whitelist decision should re-fire.

## 6. Corrupt-file reset case documented but not tested

**Finding.** Both [`telemetry-plan.md`](./telemetry-plan.md#persistence-additions-srcsharedtypests) and [`telemetry-implementation.md`](./telemetry-implementation.md#migration-one-shot-pr-1) correctly handle the corrupt-`orca-data.json` edge case:

> "If `Store.load()` hits the catch block (corrupt JSON, unreadable file) and starts fresh, `fileExistedOnLoad` is still `true` because the file was present on disk. The migration will classify these users as existing."

This is the right failure mode — a corrupted file should not silently downgrade an existing user into the default-on new-user cohort. The plan is explicit that this is a **trust-violation guard**, not a UX nicety.

**What's missing.** [`telemetry-implementation.md`](./telemetry-implementation.md) §Test strategy enumerates tests for:
- `consent.test.ts` — env-var precedence, `optedIn` states, malformed env values, migration fixture for existing vs new user.
- `validator.test.ts` — unknown names, missing keys, regex edges.
- `client.test.ts` — shutdown gate, burst cap, opt-in/out ordering.
- `telemetry-events.test.ts` — drift detector.

**None of these specifically cover the corrupt-file path.** The consent test fixture covers "has existing state" vs "fresh install" but not "file exists but load throws." Under the existing test coverage, a migration bug that mishandles the catch path could ship without any test failing — and the failure mode would be the exact trust-violation the plan is designed to prevent (an existing user silently opted in after a file corruption event they didn't cause and don't know about).

**What to add.** One explicit test in `persistence.test.ts` (or wherever the migration path is tested):

```ts
it('classifies users with corrupt orca-data.json as existing (telemetry off, banner shows)', async () => {
  // Arrange: orca-data.json exists on disk but contains invalid JSON
  await fs.writeFile(dataFile, '{"invalid json')

  // Act: Store.load() hits catch block, falls back to empty settings
  const store = await Store.load()

  // Assert: migration classifies as existing-user cohort
  const telemetry = store.getSettings().telemetry!
  expect(telemetry.existedBeforeTelemetryRelease).toBe(true)
  expect(telemetry.optedIn).toBeNull()

  // Assert: no events transmit in this state
  // (resolveConsent returns 'pending_banner', track() short-circuits)
  const consent = resolveConsent(store.getSettings())
  expect(consent.effective).toBe('pending_banner')
})
```

Plus one positive control:

```ts
it('classifies truly fresh installs as new-user cohort (telemetry on, no first-launch surface)', async () => {
  // Arrange: no orca-data.json on disk
  await fs.rm(dataFile, { force: true })

  const store = await Store.load()
  const telemetry = store.getSettings().telemetry!
  expect(telemetry.existedBeforeTelemetryRelease).toBe(false)
  expect(telemetry.optedIn).toBe(true)
})
```

**Why this matters under the user-constraint set.** The corrupt-file case is the exact migration path where an implementation bug would silently violate the plan's load-bearing promise that *existing users see zero events until they click "Sure."* The plan's text is unambiguous about the behavior; the test suite should make a regression visible before it ships. Cheap (~15 lines of test), catches the one class of bug the entire asymmetric-consent design is built to prevent.

**Adjacent test worth considering.** A second class of migration bug: a stale `telemetry` block from a pre-release dev build that was never meant to reach production. Scenario: an early internal tester had `telemetry.existedBeforeTelemetryRelease = false` and `optedIn = true` written by a pre-release build, then Orca's public telemetry PR flips the migration logic. The migration should be idempotent and leave `existedBeforeTelemetryRelease` alone once set — already handled by the `=== undefined` check at [`telemetry-implementation.md`](./telemetry-implementation.md#migration-one-shot-pr-1), but worth a one-line test asserting that a pre-populated `existedBeforeTelemetryRelease: true` is not overwritten by a second migration run.

### 🧪 Resolution (tests added)

[`telemetry-implementation.md`](./telemetry-implementation.md) §Test strategy now explicitly lists three migration tests under a new `src/main/persistence.test.ts` entry:

1. **Corrupt `orca-data.json`:** file exists but JSON parse fails, `Store.load()` hits the catch block, migration classifies user as **existing** (`existedBeforeTelemetryRelease: true`, `optedIn: null`), consent resolver returns `pending_banner`, zero events transmit until the banner is resolved.
2. **Fresh install:** file absent on disk, migration classifies user as **new** (`existedBeforeTelemetryRelease: false`, `optedIn: true`).
3. **Migration idempotency:** a pre-populated `existedBeforeTelemetryRelease: true` survives a second migration run unchanged (the `=== undefined` guard holds).

Together these assert the load-bearing promise of the asymmetric-consent design: existing users see zero events until they click "Sure," and no migration path — including the corrupt-file recovery path — silently flips that.

## 7. Public aggregate dashboard: small-cohort side channels

**Finding (original).** The earlier v1 plan committed to publishing a read-only aggregate dashboard at `orca.dev/analytics` with DAU trend, active installs per version, crash rate, and opt-out rate. Aggregate-looking dashboards can leak individual-level signal when cohort cells are small — `orca_channel: 'rc'` users are a small fraction of the base, platform × arch × channel × version cells compound small-ness fast, and per-hour/per-day granularity on those cells can reveal individual usage patterns. Worked example: an RC dashboard showing hourly DAU for `rc × linux × arm64` during a week where exactly one user matches that slice effectively shows that user's working hours, session length, and timezone offset. The draft mitigations were a minimum-cohort threshold (N ≥ 50 distinct `install_id`s per cell), weekly-or-coarser granularity on public tiles, no channel/OS/arch splits on public tiles, no per-install timelines, and threshold/granularity documented in the README **Privacy & Telemetry** section.

### ✅ Resolution (structural cut)

The public aggregate dashboard was dropped from v1 entirely — see [`telemetry-plan.md` decision 11](./telemetry-plan.md#11-public-aggregate-dashboard--considered-and-cut-from-v1) for the full rationale (competitive exposure, schema lock-in, maintenance rot, trust benefit available more cheaply via on-device surfaces). That removes the disclosure surface this finding was about; there is no public tile to apply a minimum-cohort threshold to. Internal PostHog dashboards remain (behind auth, bounded audience) and do not carry this risk.

If the public dashboard is ever revived, the mitigations above (minimum-cohort threshold, weekly-or-coarser granularity, no small-cohort splits, no per-install data on public tiles, threshold documented in the README **Privacy & Telemetry** section) are the binding contract. They are preserved here rather than deleted so a future revive does not re-litigate them.

## 8. Diagnostic bundles must not carry the PostHog `install_id`

**Finding.** [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) Mode 3 originally collected the `install_id` into every diagnostic bundle alongside trace NDJSON ("the main process collects ... the `install_id`"). The PostHog lane's anonymity story rests on `install_id` being an opaque UUID with no external coupling — no username, no provider account ID, nothing an operator can resolve to a person. The diagnostic bundle lane is identifying by construction: bundles contain paths, cwds, stack frames, and potentially git-config output, any of which can carry a real-world name.

**The correlation surface.** An Orca staff member who opens a single bundle can then join the bundle's `install_id` back to every PostHog event that user has ever emitted (daily actives, settings changes, agent errors, crashes, opt-in/out, app-version, os_release, `orca_channel`, session-duration-bucket distributions). One bundle therefore re-identifies the entire PostHog history for that `install_id`. This is inside our trust boundary ("Orca staff" is us), but it contradicts the "we do not collect identity" promise in both the banner copy and the README **Privacy & Telemetry** section: PostHog events become *retroactively identifiable* the moment the user clicks "Share a diagnostic bundle."

**Why this is worse than it looks.** The user who clicks Share is making an informed decision about *that bundle's contents* (they see the preview). They are not making a decision about their entire PostHog history. The consent contract is scope-mismatched: the user consents to sharing N minutes of traces; they unknowingly consent to re-identifying 6 months of product analytics.

**Fix.** Structural, not policy: bundles carry a fresh `bundle_submission_id` (128-bit random, generated per bundle, not persisted anywhere client-side) instead of `install_id`. Two bundles from the same user produce unrelated IDs. The two lanes are join-incompatible on the client side by construction. Server-side, add `install_id`/`installId`/`distinct_id` to the Mode-3 redactor's attribute-key block-list so a buggy span can't accidentally leak the identifier into the bundle payload.

**Blast radius.** User-harming (it's the one genuine re-identification vector in the whole design) and launch-blocking for Mode 3. Not launch-blocking for the rest of the plan.

### ✅ Resolution (fully specified)

- [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §Mode 3 step 1: bundle collection now uses a per-bundle `bundle_submission_id` (128-bit random) and explicitly not the PostHog `install_id`.
- [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §Identity table row updated to reflect the non-correlation guarantee.
- [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §Endpoint contract: new **"Why bundles do not carry `install_id`"** subsection naming the cross-lane re-identification surface and the structural fix.
- [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §The redactor Rule 5: Mode-3 server-side pass additionally blocks `install_id`, `installId`, `distinct_id` — defense-in-depth against a buggy span leaking the identifier.
- The non-correlation property is documented in the README **Privacy & Telemetry** section as an explicit guarantee (the two-lane join-incompatibility), versioned with the same schema-bump process.

## 9. PostHog auto-attached properties not enumerated

**Finding.** `posthog-node` auto-attaches a set of properties to every `capture()` call beyond what the caller passes in `properties`. The plan enumerates the explicit `CommonProps` that Orca ships (`install_id`, `session_id`, `platform`, `arch`, `os_release`, `app_version`, `orca_channel`) but does not enumerate which PostHog auto-properties survive, which are stripped, or what happens when a future `posthog-node` release adds a new one. "We don't collect X" claims in the banner and the README **Privacy & Telemetry** section are only verifiable if the full auto-attached property set is pinned.

**What could leak without an explicit policy:**

- `$geoip_*` (country, region, city, latitude/longitude, timezone) — populated server-side from the request IP unless explicitly disabled. PostHog defaults to enabled.
- `$ip` — the client IP. `posthog-node` in server-side mode does not send a client `$ip`, but this is an implementation detail of the current SDK, not a guarantee.
- `$lib`, `$lib_version` — harmless vendor metadata, but should be pinned as "allowed" so a future test catches drift.
- `$session_id`, `$device_id`, `$browser`, `$os`, `$user_agent` — web-SDK-only; `posthog-node` does not populate them. Again, an SDK-version property, not a guarantee.
- `$set`, `$set_once` — person-profile mutations. We never call `identify()`, but an accidental call somewhere in the code path would create a person profile.

**Fix.** Two changes:

1. Disable GeoIP explicitly in the `PostHog()` constructor call — `disableGeoip: true`. This is the one default that actively records data we do not want, so it deserves an explicit override regardless of `posthog-node` version.
2. Add an auto-property drift test: `client.test.ts` fires a representative event through a fake transport, captures the serialized payload, and asserts the property set equals `CommonProps ∪ EventProps ∪ { $lib, $lib_version, distinct_id, event, properties, timestamp?, uuid? }`. Any unexpected new auto-property from a future SDK upgrade fails the test and forces a review before the upgrade ships.

**Blast radius.** Low at baseline — the current `posthog-node` is well-behaved — but the class-of-bug is "silent leak via vendor default," which is high-regret if it ships. The fix is one constructor flag and one unit test; there is no reason not to pin the surface.

### ✅ Resolution (fully specified)

- [`telemetry-implementation.md`](./telemetry-implementation.md) `initTelemetry`: `PostHog()` constructor call now passes `disableGeoip: true` with a comment pointing at the auto-properties rationale.
- [`telemetry-implementation.md`](./telemetry-implementation.md) new **"PostHog auto-properties — what ships on every event"** section: a table of every auto-property, whether it ships, and how we suppress each one we don't want. The set we tolerate is `$lib` + `$lib_version` (plus `timestamp` when we pass it); everything else is either explicitly suppressed (`$geoip_*` via `disableGeoip`), not populated by `posthog-node` in Node mode (`$ip`, `$device_id`, web-SDK fields), or never invoked by our code (`$set`, `$set_once`, person-profile mutations — we never call `identify()`).
- [`telemetry-implementation.md`](./telemetry-implementation.md) §Test strategy `client.test.ts` row extended: the auto-property drift check fires a representative event through a fake transport, captures the serialized payload, and asserts the property set is exactly `CommonProps ∪ EventProps ∪ allowed-auto-props`. Unexpected new auto-property from an SDK upgrade fails the test.

## Things already well-handled (not issues)

Noted here explicitly so future reviewers don't re-litigate them and so the plan's authors know which parts of the design held up under a security pass.

### Binary gate is structural, not policy

[`telemetry-plan.md`](./telemetry-plan.md) §Dev/CI handling and [`telemetry-implementation.md`](./telemetry-implementation.md) §Dev/CI handling require **both** `ORCA_BUILD_IDENTITY` and `ORCA_POSTHOG_WRITE_KEY` to be compile-time-injected by the CI pipeline. Contributor checkouts, `pnpm dev`, third-party forks, and CI-outside-the-release-path all evaluate `IS_OFFICIAL_BUILD` to `false` at module load and short-circuit to console-mirror. Either constant missing is sufficient to disable transmission. This is the exact pattern VS Code uses (key in `product.json`, absent in OSS rebuilds = VSCodium).

**Why this is correct.** "A contributor accidentally ships events" is not a policy-enforced failure mode; it's a structurally impossible state. Defense-in-depth via the additional CI-env-var detection in `resolveConsent` is redundant but cheap.

### Fail-closed runtime validator with rate-limited warnings

[`telemetry-implementation.md`](./telemetry-implementation.md) §Runtime validator: unknown event name → drop + warn, extra key → drop + warn, missing key → drop + warn, wrong enum value → drop + warn, over-length string → drop + warn. Warnings rate-limited to 1/minute per event-name. Validator is the sole enforcement point for both main-originated and IPC-arrived events. This is the right architecture — types don't survive IPC, the validator is the backstop.

**Why this is correct.** Schema-drift bugs, IPC-bypass attempts, and compromised-renderer attacks all converge on the same enforcement point, which means the test surface is bounded and reviewable.

### CI auto-off via env detection

The consent resolver checks `CI`, `GITHUB_ACTIONS`, `GITLAB_CI`, `CIRCLECI`, `TRAVIS`, `BUILDKITE`, `JENKINS_URL`, `TEAMCITY_VERSION`. Any one true → `{ effective: 'disabled', reason: 'ci' }`. Second line of defense after the binary gate.

### Install ID is UUIDv4

Sufficient entropy (122 random bits) that guessing install IDs is computationally infeasible. Regenerable from the Privacy pane. Never derived from anything correlatable (contrast: T3 Code's SHA-256-of-provider-account-id, explicitly rejected in the telemetry plan).

### Two-lane split keeps UGC out of product telemetry

[`telemetry-error-tracking.md`](./telemetry-error-tracking.md): product-telemetry lane is enum/bool/bucketed-number only; error-tracking lane is local-by-default with explicit user-initiated outbound paths. No cross-contamination: `src/main/telemetry/` and `src/main/observability/` never import from each other. This is the right architectural boundary — doing it as two directories with an import-lint rule is more robust than a per-event `contains_ugc` flag would be at our schema size.

### No session replay, no feature flags, no surveys

These are the PostHog surfaces that have caused the largest public billing incidents and the largest public privacy incidents (session replay captures literal screen content). v1 ships none. Each would need its own billing cap if added later. The $500 cap on Product Analytics only is the right choice given the `posthog-node` main-only transport doesn't ship the other surfaces.

### Consent env vars honored across both lanes correctly

`DO_NOT_TRACK=1` and `ORCA_TELEMETRY_DISABLED=1` disable the product-telemetry lane entirely; disable OTLP export and the diagnostic bundle in the error-tracking lane; **do not disable local-file writes** (they never leave the machine, so they are not "tracking" in the DNT sense). The `ORCA_DIAGNOSTICS_DISABLED=1` escape hatch for the paranoid-device case is the right refinement. Matches Wave Terminal's precedent of splitting `telemetry:enabled` from `WAVETERM_NOPING`.

### Identity never crosses contexts

No `$identify` to GitHub username (the emdash anti-pattern), no SHA-256 of provider account IDs (the T3 Code anti-pattern). `install_id` is per-install, has no external coupling, and is not surfaced in the UI (see `telemetry-plan.md` decision 10 — surfacing the anonymous identifier would re-frame it as something the user is expected to know about and manage, cutting against the "we don't collect identity" posture). A user-facing rotation lever (the GitButler pattern) was considered and deferred from v1 in the same decision; its absence does not weaken the identity model because `install_id` is anonymous by construction.

## Summary — all findings resolved

| # | Finding | Resolution | Where |
|---|---|---|---|
| 1 | Write-key extractable / event spoofing | 📝 Threat model acknowledged + response playbook | [`telemetry-implementation.md`](./telemetry-implementation.md) §Operational notes |
| 2 | Diagnostic-bundle endpoint underspec'd | ✅ 10-item hardening contract (auth tokens, rate limits, private storage, server-side redaction, delete endpoint) | [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §Endpoint contract |
| 3 | Redactor too narrow | ✅ 8 provider-key shapes + URL-userinfo + `.env`-line rules + server-side ingest pass + fixture tests | [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §The redactor |
| 4a | Global per-session cap missing | ✅ ≤1,000 events/`session_id` hard ceiling alongside per-event-name bucket | [`telemetry-implementation.md`](./telemetry-implementation.md) §Burst cap |
| 4b | Consent-mutation IPC unlimited | ✅ ≤5/session shared cap + strict type-narrows in main | [`telemetry-implementation.md`](./telemetry-implementation.md) §IPC surface |
| 4c | Compromised-renderer threat model implicit | ✅ Explicit security-framing paragraph | [`telemetry-implementation.md`](./telemetry-implementation.md) §Architecture at a glance |
| 5 | `error_name` regex too permissive | ✅ Whitelist spec'd, then `error_name` deferred when the enum was trimmed (`agent_error` is now enum-only with no `error_name` property) | [`telemetry-implementation.md`](./telemetry-implementation.md), [`telemetry-plan.md`](./telemetry-plan.md), [`telemetry-rationale-archive.md`](./telemetry-rationale-archive.md) |
| 6 | Corrupt-file migration untested | 🧪 3 migration tests (corrupt / fresh / idempotent) | [`telemetry-implementation.md`](./telemetry-implementation.md) §Test strategy |
| 7 | Public dashboard small-cohort side channels | ✅ N≥50 threshold, weekly granularity, no channel/OS splits publicly | [`telemetry-implementation.md`](./telemetry-implementation.md) §PR 5 |
| 8 | Bundle ↔ `install_id` re-identification surface | ✅ Bundles carry `bundle_submission_id` (fresh 128-bit), never `install_id`; server-side redactor blocks the ID on ingest | [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §Mode 3, §Endpoint contract, §The redactor |
| 9 | PostHog auto-properties not pinned | ✅ `disableGeoip: true` at init; auto-property drift test; full table of ship/suppress decisions | [`telemetry-implementation.md`](./telemetry-implementation.md) `initTelemetry`, §PostHog auto-properties |

**Fundamentally unsolvable (acknowledged, not fixed):**
- Issue 1 (write-key spoofing). Closing the gap requires a client-side secret only the official client holds; either the attacker extracts it too (no better than today) or it's tied to user identity (breaks the anonymous-install-ID design the whole consent model rests on). The response is documentation + rotation playbook, not architecture change.

**Deferred to v2, spec'd in advance:**
- Optional thin Cloudflare Worker proxy for edge per-IP rate limiting on PostHog ingest (Issue 1 mitigation lever).
- IPC bridge for renderer-side errors into the local trace file (Issue 2e / [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) §Open questions #3), spec'd to require per-event burst cap + per-session byte ceiling + main-process allowlist when it lands.

**Ship readiness after these changes:**
- **PostHog product-telemetry lane (PRs 1–5)** — ready to ship as specified. All v1 hardening folded in.
- **Error-tracking Modes 1 + 2 (local file, user-owned OTLP)** — ready to ship, redactor is v1-complete.
- **Error-tracking Mode 3 (diagnostic bundle)** — ready to ship *provided* the endpoint-contract hardening is implemented as specified (auth tokens, rate limits, private storage, server-side redaction, delete endpoint). Operational choices (Cloudflare R2 vs S3, admin-tool implementation) remain open but are now constrained tightly enough that any compliant stack works.

**Not changing:** vendor (PostHog US — `us.i.posthog.com`), consent model (asymmetric), two-lane split, schema shape, binary gate. These held up under the security pass and the broader design remains correct for an open-source AI agent tool where users cannot submit events from local builds.

## Sources

Finding evidence from the reviewed docs:
- [`telemetry-plan.md`](./telemetry-plan.md) — consent model, binary gate, persistence, `What we never send`.
- [`telemetry-implementation.md`](./telemetry-implementation.md) — validator contract, burst cap, migration path, IPC surface, test strategy, `Operational notes`.
- [`telemetry-plan.md`](./telemetry-plan.md) — schema rationale, cost analysis, and deferred-event decisions.
- [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) — two-lane split, redactor rules, Mode 3 diagnostic bundle, open questions on renderer errors.
- [`telemetry-error-tracking.md`](./telemetry-error-tracking.md) — two-lane split, redactor rules, and diagnostic bundle hardening.

External references:
- [posthog.com/docs/billing/limits-alerts](https://posthog.com/docs/billing/limits-alerts) — billing-cap behavior (data drops past cap, not queued).
- [posthog.com/docs/privacy](https://posthog.com/docs/privacy) — `identified_only` person-profile mode, geoip configuration.
- HN #39984487 — the canonical "session replay ran up $10K in half a day" incident; confirms session-replay exclusion as the right scope call.
