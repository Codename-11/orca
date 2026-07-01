import type { ParsedAgentStatusPayload } from '../../../../shared/agent-status-types'
import type { EventProps } from '../../../../shared/telemetry-events'
import type { ProjectExecutionRuntimeResolution } from '../../../../shared/project-execution-runtime'
import type { StartupCommandDelivery } from '../../../../shared/codex-startup-delivery'
import type { SleepingAgentLaunchConfig } from '../../../../shared/agent-session-resume'
import type { TerminalOscColorQueryReplyColors } from '../../../../shared/terminal-osc-color-reply'
import type { TuiAgent } from '../../../../shared/types'

export type PtyDataMeta = {
  seq?: number
  rawLength?: number
}

export type PtyBufferSnapshot = {
  data: string
  cols: number
  rows: number
  seq?: number
  /** Lowest seq main could still deliver when the snapshot was taken (start
   *  of its pending renderer-delivery queue; equals `seq` when empty). Bytes
   *  are delivered once and in order, so a post-restore chunk at or below
   *  this seq can never be a duplicate the snapshot already covers. */
  pendingDeliveryStartSeq?: number
  source?: 'headless' | 'renderer'
  /** True when the snapshot captures an alternate-screen TUI (Claude Code,
   *  vim). Restore must NOT clear xterm's buffer in that case — the TUI's
   *  scrollback lives in xterm and a clear destroys scroll-up after a tab
   *  return. Mirrors the attach-time guard in pty-transport.ts. */
  alternateScreen?: boolean
}

export type LocalPtySessionMetadata = { cwd?: string; shellOverride?: string }

export type PtyConnectResult = {
  id: string
  launchConfig?: SleepingAgentLaunchConfig
  snapshot?: string
  snapshotCols?: number
  snapshotRows?: number
  isAlternateScreen?: boolean
  sessionExpired?: boolean
  coldRestore?: { scrollback: string; cwd: string }
  replay?: string
}

type PtyCallbacks = {
  onConnect?: () => void
  onDisconnect?: () => void
  onData?: (data: string, meta?: PtyDataMeta) => void
  /** Replay bytes from a prior session (eager buffers, attach-time screen
   *  clears). Routed separately from onData so the renderer can engage
   *  the replay guard — otherwise xterm auto-replies to embedded query
   *  sequences leak into the shell. See replay-guard.ts. */
  onReplayData?: (data: string) => void
  onStatus?: (shell: string) => void
  onError?: (message: string, errors?: string[]) => void
  onExit?: (code: number) => void
}

export type PtyTransport = {
  connect: (options: {
    url: string
    cols?: number
    rows?: number
    /** Daemon session ID for reattach. When provided, the daemon reconnects
     *  to an existing session instead of creating a new one. */
    sessionId?: string
    command?: string
    env?: Record<string, string>
    launchConfig?: SleepingAgentLaunchConfig
    launchToken?: string
    launchAgent?: TuiAgent
    startupCommandDelivery?: StartupCommandDelivery
    /** Hidden-at-spawn declaration (terminal-query-authority.md): no visible
     *  view will consume this PTY's bytes, so main marks it hidden BEFORE the
     *  first byte and the gate + model responder own spawn-time queries.
     *  Ignored by remote-runtime transports (not gate-markable). */
    initiallyHidden?: boolean
    callbacks: PtyCallbacks
  }) => void | Promise<void | string | PtyConnectResult>
  /** Attach to an existing PTY that was eagerly spawned during startup.
   *  Skips pty:spawn — registers handlers and replays buffered data instead. */
  attach: (options: {
    existingPtyId: string
    cols?: number
    rows?: number
    /** When true, the session uses the alternate screen buffer (e.g., Codex).
     *  Skips the delayed double-resize since a single resize already triggers
     *  a full TUI repaint without content loss. */
    isAlternateScreen?: boolean
    callbacks: PtyCallbacks
  }) => void
  disconnect: () => void
  sendInput: (data: string) => boolean
  sendInputAccepted?: (data: string) => Promise<boolean>
  resize: (
    cols: number,
    rows: number,
    meta?: { widthPx?: number; heightPx?: number; cellW?: number; cellH?: number }
  ) => boolean
  isConnected: () => boolean
  getPtyId: () => string | null
  getConnectionId?: () => string | null | undefined
  getLocalSessionMetadata?: () => LocalPtySessionMetadata | null
  /** Drop cross-chunk parser carries (partial OSC-9999 prefix). Called when a
   *  model-restore marker reports dropped bytes — a carry spanning the gap
   *  would corrupt the next live chunk. IPC transports only. */
  resetCrossChunkParserState?: () => void
  serializeBuffer?: (opts?: { scrollbackRows?: number }) => Promise<PtyBufferSnapshot | null>
  preserve?: () => void
  /** Unregister PTY handlers without killing the process, so a remounted
   *  pane can reattach to the same running shell. */
  detach?: () => void
  destroy?: () => void | Promise<void>
}

export type IpcPtyTransportOptions = {
  cwd?: string
  env?: Record<string, string>
  command?: string
  launchConfig?: SleepingAgentLaunchConfig
  launchToken?: string
  launchAgent?: TuiAgent
  startupCommandDelivery?: StartupCommandDelivery
  connectionId?: string | null
  /** Orca worktree identity for scoped shell history. */
  worktreeId?: string
  /** Why: closes the SIGKILL race documented in INVESTIGATION.md by letting
   *  main patch + sync-flush the (worktreeId, tabId, leafId → ptyId) binding
   *  before pty:spawn returns. Only the renderer's daemon-host path threads
   *  these from the calling pane's (tabId, leafId). */
  tabId?: string
  leafId?: string
  /** Whether renderer-backed runtime reveal should focus the created tab. */
  activate?: boolean
  /** Why: mirrors PtySpawnOptions.shellOverride — see types.ts for rationale. */
  shellOverride?: string
  projectRuntime?: ProjectExecutionRuntimeResolution
  terminalColorQueryReplies?: TerminalOscColorQueryReplyColors
  /** Telemetry metadata for the `agent_started` event. Forwarded verbatim
   *  to `pty:spawn` so main can fire the event after confirmed launch. The
   *  IPC handler re-validates the schema; this type is the renderer-side
   *  contract. */
  telemetry?: EventProps<'agent_started'>
  onPtyExit?: (ptyId: string) => void
  onTitleChange?: (title: string, rawTitle: string) => void
  onPtySpawn?: (ptyId: string) => void
  onBell?: () => void
  onAgentBecameIdle?: (title: string) => void
  onAgentBecameWorking?: () => void
  onAgentExited?: () => void
  /** Callback for OSC 9999 agent status payloads parsed from PTY output. */
  onAgentStatus?: (payload: ParsedAgentStatusPayload) => void
}
