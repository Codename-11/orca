/**
 * Singleton PTY event dispatcher and eager buffer helpers.
 *
 * Why extracted: keeps pty-transport.ts under the 300-line limit while
 * co-locating the global handler maps that both the transport factory
 * and the eager-buffer reconnection logic share.
 */
import { acquirePtyDeliveryInterest } from './pty-delivery-interest'
import type { PtyDataMeta } from './pty-transport-types'
import { ackPtyData, exposeE2eTerminalPtyAckGate } from './terminal-pty-ack-gate'

// ── Singleton PTY event dispatcher ───────────────────────────────────
// One global IPC listener per channel, routes events to transports by
// PTY ID. Eliminates the N-listener problem that triggers
// MaxListenersExceededWarning with many panes/tabs.

export const ptyDataHandlers = new Map<string, (data: string, meta?: PtyDataMeta) => void>()
/** Sidecar subscriptions that observe PTY data without owning the primary
 *  handler. Used by features that need to react to the live byte stream
 *  (e.g. agent-paste-draft watching for DECSET 2004 / bracketed-paste-
 *  enable). Sidecars are invoked AFTER the primary handler so xterm rendering
 *  is never delayed by a side-effect-only watcher. Each Set entry is one
 *  active subscription; removal is by Set.delete inside the unsubscribe fn. */
export const ptyDataSidecars = new Map<string, Set<(data: string) => void>>()

/** Register a side-channel data watcher for a PTY without taking ownership
 *  of the primary handler. Returns an unsubscribe fn. ensurePtyDispatcher()
 *  is called automatically so the underlying IPC stream is wired up. */
export function subscribeToPtyData(ptyId: string, watcher: (data: string) => void): () => void {
  ensurePtyDispatcher()
  // Why: a sidecar is, by definition, a raw-byte consumer — its registration
  // doubles as the delivery-interest signal that suppresses main's
  // hidden-delivery gate (terminal-side-effect-authority.md, Open Items).
  const releaseDeliveryInterest = acquirePtyDeliveryInterest(ptyId)
  let set = ptyDataSidecars.get(ptyId)
  if (!set) {
    set = new Set()
    ptyDataSidecars.set(ptyId, set)
  }
  set.add(watcher)
  return () => {
    releaseDeliveryInterest()
    const current = ptyDataSidecars.get(ptyId)
    if (!current) {
      return
    }
    current.delete(watcher)
    if (current.size === 0) {
      ptyDataSidecars.delete(ptyId)
    }
  }
}
/** Per-PTY replay handlers for relay pty.attach replay data. Routed through
 *  a dedicated pty:replay IPC channel so the renderer can engage the replay
 *  guard and suppress xterm auto-replies during replay. */
export const ptyReplayHandlers = new Map<string, (data: string) => void>()
export const ptyExitHandlers = new Map<string, (code: number) => void>()
const ptyExitSidecars = new Map<string, Set<(code: number) => void>>()
/** Per-PTY teardown callbacks registered by each transport to clear closure
 *  state (stale-title timer, agent tracker) that would otherwise fire after
 *  the data handler is removed. */
export const ptyTeardownHandlers = new Map<string, () => void>()
let ptyDispatcherAttached = false

export type PtyDataHandlerShutdownSnapshot = {
  ptyId: string
  dataHandler?: (data: string, meta?: PtyDataMeta) => void
  replayHandler?: (data: string) => void
  teardownHandler?: () => void
}

/**
 * Remove data and status handlers for the given PTY IDs so that any final
 * data flushed by the main process during PTY teardown cannot trigger
 * bell / agent-status notifications from a worktree that is being shut down.
 * Also invokes per-transport teardown callbacks to cancel accumulated closure
 * state (e.g. staleTitleTimer, agent tracker) that could independently fire
 * stale notifications.
 * Exit handlers are intentionally kept alive so the normal exit-cleanup
 * path (unregister, clear stale timers, update store) still runs.
 */
export function unregisterPtyDataHandlers(ptyIds: string[]): PtyDataHandlerShutdownSnapshot[] {
  const snapshots: PtyDataHandlerShutdownSnapshot[] = []
  for (const id of ptyIds) {
    snapshots.push({
      ptyId: id,
      dataHandler: ptyDataHandlers.get(id),
      replayHandler: ptyReplayHandlers.get(id),
      teardownHandler: ptyTeardownHandlers.get(id)
    })
    ptyDataHandlers.delete(id)
    ptyReplayHandlers.delete(id)
    ptyTeardownHandlers.get(id)?.()
    ptyTeardownHandlers.delete(id)
  }
  return snapshots
}

export function restorePtyDataHandlersAfterFailedShutdown(
  snapshots: readonly PtyDataHandlerShutdownSnapshot[]
): void {
  for (const snapshot of snapshots) {
    if (snapshot.dataHandler) {
      ptyDataHandlers.set(snapshot.ptyId, snapshot.dataHandler)
    }
    if (snapshot.replayHandler) {
      ptyReplayHandlers.set(snapshot.ptyId, snapshot.replayHandler)
    }
    if (snapshot.teardownHandler) {
      ptyTeardownHandlers.set(snapshot.ptyId, snapshot.teardownHandler)
    }
  }
}

export function ensurePtyDispatcher(): void {
  if (ptyDispatcherAttached) {
    return
  }
  ptyDispatcherAttached = true
  exposeE2eTerminalPtyAckGate()
  window.api.pty.onData((payload) => {
    try {
      let meta: PtyDataMeta | undefined
      if (typeof payload.seq === 'number') {
        meta ??= {}
        meta.seq = payload.seq
      }
      if (typeof payload.rawLength === 'number') {
        meta ??= {}
        meta.rawLength = payload.rawLength
      }
      ptyDataHandlers.get(payload.id)?.(payload.data, meta)
      const sidecars = ptyDataSidecars.get(payload.id)
      if (sidecars && sidecars.size > 0) {
        // Why: snapshot the Set before iterating because watchers commonly
        // unsubscribe themselves on the very chunk that satisfies them
        // (e.g. agent-paste-draft resolves on DECSET 2004 and immediately
        // tears down). Iterating the live Set in that case can skip a
        // watcher or — if a watcher synchronously subscribes a sibling —
        // double-fire. The Set is never large (one watcher per active
        // ready-wait), so the array allocation is cheap.
        const snapshot = Array.from(sidecars)
        for (const watcher of snapshot) {
          watcher(payload.data)
        }
      }
    } finally {
      // Why: main budgets renderer-bound terminal output by bytes accepted
      // into this dispatcher. ACK in finally so a bad sidecar cannot leave
      // a PTY permanently backpressured.
      ackPtyData(payload.id, payload.rawLength ?? payload.data.length)
    }
  })
  window.api.pty.onReplay((payload) => {
    ptyReplayHandlers.get(payload.id)?.(payload.data)
  })
  window.api.pty.onExit((payload) => {
    ptyExitHandlers.get(payload.id)?.(payload.code)
    const sidecars = ptyExitSidecars.get(payload.id)
    if (sidecars && sidecars.size > 0) {
      const snapshot = Array.from(sidecars)
      ptyExitSidecars.delete(payload.id)
      for (const sidecar of snapshot) {
        sidecar(payload.code)
      }
    }
  })
}

export function subscribeToPtyExit(ptyId: string, watcher: (code: number) => void): () => void {
  ensurePtyDispatcher()
  let set = ptyExitSidecars.get(ptyId)
  if (!set) {
    set = new Set()
    ptyExitSidecars.set(ptyId, set)
  }
  set.add(watcher)
  return () => {
    const current = ptyExitSidecars.get(ptyId)
    if (!current) {
      return
    }
    current.delete(watcher)
    if (current.size === 0) {
      ptyExitSidecars.delete(ptyId)
    }
  }
}

export {
  getEagerPtyBufferHandle,
  registerEagerPtyBuffer
} from './pty-eager-buffer'
export type { EagerPtyHandle } from './pty-eager-buffer'
export type {
  IpcPtyTransportOptions,
  PtyBufferSnapshot,
  PtyConnectResult,
  PtyDataMeta,
  PtyTransport
} from './pty-transport-types'
