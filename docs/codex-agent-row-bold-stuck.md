# Codex inline-agent row stays bold after returning from another workspace

## Context — how this relates to OSC 133 shell integration

This bug surfaces a structural asymmetry in the dashboard's ack flow. The
*trigger* is the title-revert heuristic in `pty-connection.ts:onAgentExited`,
which is independently scheduled for replacement.

**Title heuristic (current, brittle):**
`useAppStore.getState().removeAgentStatus(cacheKey)` fires when the OSC
terminal title reverts to a shell label (`bash`/`zsh`/`pwsh`). Added in
PR #1019 (2026-04-24) as a stopgap because agent CLIs don't emit a hook on
Ctrl+C / clean `exit`. It produces both:

- **false positives** — codex's TUI redraws to a shell title mid-turn, firing
  a spurious `removeAgentStatus` while the agent is still running (the race
  this doc is about).
- **false negatives** — Ctrl+C'd Codex/Gemini/OpenCode never revert, so the
  row lingers 30 minutes until `AGENT_STATUS_STALE_AFTER_MS` decays it.

**OSC 133 shell integration (in flight, branch
`brennanb2025/foreground-process-agent-exit`):** Replaces the title heuristic
with `OSC 133;D` markers emitted by shell prompt hooks (zsh `precmd`,
PowerShell `PSConsoleHostReadLine`). Cross-platform by construction (works on
Windows ConPTY where `tcgetpgrp`-based polling does not), deletes both
`agent-foreground-poller.ts` and the `onAgentExited → removeAgentStatus` line
in the same PR. Design doc:
`docs/design/shell-integration-osc-133.md` (in the sibling worktree
`/Users/thebr/orca/workspaces/orca/foreground-process-agent-exit`).

**Why this fix still matters once OSC 133 lands:** the ack-scan asymmetry is
independent of the title heuristic. The inline agents list renders
`live ∪ retained` (see `useWorktreeAgentRows`), but the auto-ack scan only
walked `live`. Any retention path — explicit user dismissal today, OSC 133's
`;D` handler tomorrow, or any future "drop the live row on real process exit"
mechanism — that migrates a `done` row to retained while the user is on the
tab would re-trigger the same bug. The retained walk closes that gap once,
regardless of how `removeAgentStatus` ends up being called.

**Scope of this PR:** fix the user-visible regression now. Do not block on
OSC 133.

## Summary

When a codex turn finishes while the user is on a different workspace, the
inline-agent row in the original workspace bolds (correct), but stays bold
forever after the user returns — even after clicking the codex terminal. The
row only clears if the user explicitly clicks the agent row in the sidebar.

The root cause is a three-step trap:

1. Codex's `Stop` hook delivers `state=done`, `setAgentStatus` updates with a
   fresh `stateStartedAt`. Row goes bold.
2. Codex's TUI title reverts to a non-agent value (the title agent tracker
   sees this as "agent exited"), firing `onAgentExited` →
   `removeAgentStatus(cacheKey)`. Per `agent-status.ts:259-263` the ack
   timestamp is wiped in lockstep with the live entry.
3. `useRetainedAgentsSync` snapshots the `done` row into
   `retainedAgentsByPaneKey`. The inline agents list keeps showing it
   (it reads retained entries) — but `useAutoAckViewedAgent` only walks
   `agentStatusByPaneKey` (live), so the retained row never gets auto-acked.
   `WorktreeCardAgents.tsx:74` evaluates
   `(ackAt = 0) < (entry.stateStartedAt = doneTimestamp)` → bold forever.

For Claude Code the same retention path runs but the user's experience differs
because Claude's "bold while finished" window typically closes via auto-ack
*before* `onAgentExited` deletes the ack — i.e. there's a race between (1) and
(2), and codex tends to lose it because its title flips to shell quickly after
Stop. The first session in a session sometimes also wins the race; the second
reliably loses it. The bug is timing-dependent but trivially reproducible by
running two sequential turns.

## Repro (Cmd+D split, codex)

1. New workspace.
2. Cmd+D to open a second pane (paneKey suffix `:2`).
3. Run `codex` in the new pane.
4. Send "sleep 10 and then say hi".
5. Switch to a different workspace before codex finishes.
6. Codex finishes. Inline-agent row in the original workspace bolds.
7. Switch back. Click anywhere in the codex pane.
8. Row stays bold. Hover popup says "Done". Only clicking the row in the
   sidebar clears it.

The auto-opened initial pane (`:1`) exhibits the same bug under the same
conditions; the cmd+d split is just the path that currently produces the
fastest reliable repro.

## Evidence — log capture from /electron repro

Logs were added at every relevant call site (see "Logging instrumentation"
below). The following is the trimmed event sequence for the stuck-bold pane
(`dfa8fa3b-5e39-41d5-9e19-0f244429c3ec:2`, workspace "Stingray"):

### Main process — codex hooks fired exactly three times
```
[bold-debug-main] codex hook received {
  paneKey: 'dfa8fa3b-5e39-41d5-9e19-0f244429c3ec:2',
  tabId: 'dfa8fa3b-5e39-41d5-9e19-0f244429c3ec',
  worktreeId: '...demo-project/Stingray',
  state: 'working'
}
[bold-debug-main] codex hook received { ...same paneKey..., state: 'working' }
[bold-debug-main] codex hook received { ...same paneKey..., state: 'done' }
```
No post-Stop pings. Hook surface is clean. Disproves earlier hypothesis #1
("codex emits late state events after Stop").

### Renderer — the trap closes in four log lines
```
[bold-debug] ipc agentStatus:set received {
  paneKey: dfa8fa3b-5e39-41d5-9e19-0f244429c3ec:2, state: done, knownPaneKeys: Array(2)
}
[bold-debug] setAgentStatus {
  paneKey: dfa8fa3b-5e39-41d5-9e19-0f244429c3ec:2,
  agentType: codex, prevState: working, nextState: done,
  prevStartedAt: 1778042951947
}
[bold-debug] removeAgentStatus {
  paneKey: dfa8fa3b-5e39-41d5-9e19-0f244429c3ec:2,
  prevAgentType: codex, prevState: done,
  prevAckAt: 1778042951947
}
[bold-debug] useRetainedAgentsSync { toRetain: Array(1), consumedSuppressedPaneKeys: Array(0) }
[bold-debug] autoAck: scan {
  activeTabId: dfa8fa3b-5e39-41d5-9e19-0f244429c3ec,
  prefix: dfa8fa3b-5e39-41d5-9e19-0f244429c3ec:,
  liveCount: 1, retainedCount: 1, toAck: Array(0)
}
```

Line-by-line:

1. `setAgentStatus working → done` advances `stateStartedAt` to a NEW
   timestamp (state changed, so the carry-forward in `agent-status.ts:166-167`
   doesn't apply). Row is now bold (`ackAt < newStateStartedAt`).
2. `removeAgentStatus` fires immediately after — `prevAckAt: 1778042951947`
   was the ack from a prior auto-ack on the `working` state. Per
   `agent-status.ts:259-263`, this ack is deleted in lockstep with the live
   entry.
3. `useRetainedAgentsSync` picks up the disappearance:
   `toRetain: Array(1)`. The row now lives in `retainedAgentsByPaneKey`,
   `state: 'done'`, frozen `stateStartedAt`.
4. `autoAck: scan` runs (the user is back on the tab). It sees
   `retainedCount: 1` but `toAck: Array(0)` — the retained entry is invisible
   to the scan because `useAutoAckViewedAgent.ts:114` iterates only
   `s.agentStatusByPaneKey` (live), not the retained map.

The `liveCount: 1` in that final scan is leftover from another pane in the
same tab; the stuck pane is in retainedCount. After this point the only
log activity is `autoAck: skip — refs unchanged` and `WorktreeCardAgents
memo` re-renders with `unvisited: true` indefinitely.

### First session in the same dev run (Porpoise) cleared correctly
The ordering of (`setAgentStatus done`) and (`removeAgentStatus`) was
reversed for the first session. Auto-ack scanned the live `done` entry
in time, acked it, and the retained snapshot inherited a non-zero ack
implicitly via the rendering path (the retained row's
`stateStartedAt` was the carry-forward of `working`'s start, not a
post-bold timestamp). This is a pure timing race — not a structural
difference.

## Where each piece comes from in code

- **The bold check** — `WorktreeCardAgents.tsx:70-77`
  ```ts
  out[a.paneKey] = ackAt < a.entry.stateStartedAt
  ```
  This runs against the merged live+retained list from `useWorktreeAgentRows`.
- **Live-only walk in auto-ack** — `useAutoAckViewedAgent.ts:114`
  ```ts
  for (const [paneKey, entry] of Object.entries(s.agentStatusByPaneKey)) { ... }
  ```
  Retained entries are not considered.
- **Ack cleanup on remove** — `agent-status.ts:259-263`
  ```ts
  let nextAck = s.acknowledgedAgentsByPaneKey
  if (paneKey in nextAck) {
    nextAck = { ...nextAck }
    delete nextAck[paneKey]
  }
  ```
- **Retain on disappear** — `useRetainedAgents.ts:101-132`
  Snapshots `state: 'done'` rows into `retainedAgentsByPaneKey` when they
  vanish from `agentStatusByPaneKey`.
- **Title-revert removes the live entry** — `pty-connection.ts:291-307`
  `onAgentExited` calls `removeAgentStatus(cacheKey)` when the OSC title
  reverts to a plain shell label. Codex's TUI exits to shell quickly after
  Stop, so this fires almost immediately.
- **Click-the-terminal does NOT ack** — `TerminalPane.tsx:759-761`
  Only `clearTerminalTabUnread` and `clearWorktreeUnread`. Acks happen
  exclusively through (a) explicit click on the agent row or (b)
  `useAutoAckViewedAgent`.

## Fix

Two minimally-invasive options:

### Option A — make auto-ack walk retained entries too (preferred)

In `useAutoAckViewedAgent.ts`:

1. Add `s.retainedAgentsByPaneKey` to the ref-equality guard so retain
   transitions re-trigger the scan.
2. After the live walk, also iterate `Object.entries(s.retainedAgentsByPaneKey)`
   and push to `toAck` when `paneKey.startsWith(prefix)` and
   `ackAt < entry.entry.stateStartedAt`. No dedupe needed: when a paneKey
   appears in BOTH maps (paneKey reuse mid-frame), `acknowledgeAgents`'s
   per-key `prev < now` short-circuit (`ui.ts:328-337`) collapses the second
   push into a no-op.

Why preferred:
- Keeps the existing semantics: "while the user is looking at the tab, all
  visible agent rows on that tab are acked, regardless of provenance."
- The retain pool has a bounded lifetime (dismissed on user action / worktree
  prune), so the scan stays cheap.
- Single-file change. No store-shape change.

### Option B — preserve ack across `removeAgentStatus`

Stop wiping `acknowledgedAgentsByPaneKey[paneKey]` in
`agent-status.ts:259-263`. Two reasons this is rejected:

1. **It does not fix the bug.** The `working → done` transition mints a
   fresh `stateStartedAt` (the carry-forward at `agent-status.ts:168-169`
   only applies within the same state). Even with the prior ack preserved,
   `ackAt(=working.stateStartedAt) < newDoneStateStartedAt` keeps the row
   bold. Preservation is structurally insufficient.
2. **It leaks acks across paneKey reuse.** A stale ack would silently
   suppress unvisited signals on a future re-spawn of the same paneKey.
   The original ack-cleanup was intentional for that reason; resurrecting
   it would require a second cleanup hook on retained-row dismissal.

## Logging instrumentation in this branch (to remove on cleanup)

All gated on `console.debug('[bold-debug] ...')` — useful for future
re-investigation, but should be stripped before merge.

| File | Site | What it logs |
|---|---|---|
| `useAutoAckViewedAgent.ts` | `maybeAck` | every guard skip + scan with full inspected rows (paneKey, agentType, state, ackAt, stateStartedAt, prefixMatch, unvisited), `liveCount`, `retainedCount`, `toAck` |
| `agent-status.ts` | `setAgentStatus` | paneKey, agentType, prevState→nextState, prevStartedAt vs new stateStartedAt, carriedForward flag, updatedAt |
| `agent-status.ts` | `removeAgentStatus` | paneKey, prevAgentType, prevState, prevAckAt |
| `WorktreeCardAgents.tsx` | `unvisitedByPaneKey` memo | every render: worktreeId + per-row paneKey/agentType/state/ackAt/stateStartedAt/unvisited/isRetained |
| `useRetainedAgents.ts` | `useRetainedAgentsSync` | toRetain[] + consumedSuppressedPaneKeys when non-empty |
| `ui.ts` | `acknowledgeAgents` | called paneKeys + their prior ack values |
| `useIpcEvents.ts` | `agentStatus:set` IPC | paneKey, tabId, worktreeId, state, knownPaneKeys (codex only) |
| `main/index.ts` | hook listener | `[bold-debug-main]` paneKey, tabId, worktreeId, state (codex only) |

## Cleanup

After fix lands:
1. Remove all `[bold-debug]` and `[bold-debug-main]` logs. Specifically:
   - `useAutoAckViewedAgent.ts` — six skip-path `console.debug` calls
     (refs-unchanged, feature-gate, activeView, visibilityState, !hasFocus,
     no activeTabId), the success-path scan log, AND the `inspected[]`
     accumulator built up purely to feed that log.
   - `agent-status.ts` — `setAgentStatus` debug call AND the `__prevState` /
     `__prevStartedAt` capture that feeds it; `removeAgentStatus` has TWO
     debug calls (the `skip — not in live map` early-return at line 261 and
     the success-path log at line 264) AND the prevAgentType/prevState
     reads that feed them.
   - `WorktreeCardAgents.tsx` — the `debugRows[]` accumulator + the
     `console.debug` in the `unvisitedByPaneKey` memo, AND the
     `liveAgentStatusByPaneKey` selector that exists only to compute the
     `isRetained` field on debug rows.
   - `useRetainedAgents.ts` — the `toRetain.map(...)` log shape construction
     plus the conditional `console.debug` block.
   - `ui.ts` — the `acknowledgeAgents` debug call AND the `priorAcks` map
     it constructs.
   - `useIpcEvents.ts`, `main/index.ts` — the codex-only `agentStatus:set`
     and hook-listener `[bold-debug-main]` log calls.

2. Add a regression test at
   `src/renderer/src/hooks/useAutoAckViewedAgent.test.ts` (new file — the
   existing `agent-status-ack-cleanup.test.ts` is store-slice-scoped and a
   poor fit for a hook test that needs `document.visibilityState` /
   `document.hasFocus` / focus-event mocks). Test sequence: stub
   `document.visibilityState='visible'` and `document.hasFocus()=true`,
   render the hook against a real test store with the experimental flag
   on, set an `activeTabId` matching the paneKey prefix, then simulate the
   exact race: `setAgentStatus(paneKey, working)` → manual ack via
   `acknowledgeAgents([paneKey])` → `setAgentStatus(paneKey, done)` →
   `removeAgentStatus(paneKey)` → `retainAgents([snapshot])` → trigger
   one tracked-slice change so the scan reruns → assert
   `acknowledgedAgentsByPaneKey[paneKey] >= retained.entry.stateStartedAt`.

## Files involved

- `src/renderer/src/hooks/useAutoAckViewedAgent.ts` — auto-ack scan (THE FIX)
- `src/renderer/src/components/sidebar/WorktreeCardAgents.tsx` — bold check
- `src/renderer/src/components/dashboard/DashboardAgentRow.tsx` —
  `isUnvisited → font-semibold`
- `src/renderer/src/store/slices/agent-status.ts` — `setAgentStatus`,
  `removeAgentStatus`, ack cleanup
- `src/renderer/src/store/slices/ui.ts` — `acknowledgeAgents`
- `src/renderer/src/components/sidebar/useWorktreeAgentRows.ts` — row aggregation
- `src/renderer/src/components/dashboard/useRetainedAgents.ts` — retain sync
- `src/renderer/src/components/terminal-pane/pty-connection.ts` —
  `onAgentExited → removeAgentStatus`
- `src/main/agent-hooks/server.ts` — `normalizeCodexEvent` (state mapping)
- `src/main/codex/hook-service.ts` — codex hook install (events subscribed)
