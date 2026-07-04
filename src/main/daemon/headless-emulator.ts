import './xterm-env-polyfill'
import { Terminal } from '@xterm/headless'
import { SerializeAddon } from '@xterm/addon-serialize'

import { Unicode11Addon } from '@xterm/addon-unicode11'
import { activateOrcaTerminalUnicodeProvider } from '../../shared/terminal-unicode-provider'
import type { TerminalViewAttributes } from '../../shared/terminal-view-attributes'
import { collectHeadlessOscLinkRanges } from './headless-osc-link-ranges'
import { TerminalPrivateModeTracker } from './terminal-private-mode-tracker'
import { TerminalOscCwdTitleScanner } from './terminal-osc-cwd-title-scanner'
import {
  getTerminalKittyKeyboardFlags,
  getTerminalWriteSync,
  installConptyPrimaryDeviceAttributesOverrideForTerminal
} from './headless-emulator-core'
import {
  buildHeadlessRehydrateSequences,
  normalizeSnapshotAnsiForModes
} from './headless-emulator-rehydrate'
import {
  installTerminalViewAttributeResponder,
  type TerminalViewAttributeResponder
} from './terminal-view-attribute-responder'
import type { TerminalSnapshot, TerminalModes } from './types'
import type { TerminalOscLinkRange } from '../../shared/terminal-osc-link-ranges'

export type HeadlessEmulatorOptions = {
  cols: number
  rows: number
  scrollback?: number

  pathFlavor?: 'posix' | 'win32'
  remotePosixFileUriAuthority?: boolean
  /** Runtime-only query reply sink; daemon Session must never pass this. */
  onQueryReply?: (reply: string) => void
}

export type HeadlessEmulatorWriteOptions = {
  /** Reply ownership captured at ingestion for this exact chunk. */
  forwardQueryReplies?: boolean
}

const DEFAULT_SCROLLBACK = 5000

export class HeadlessEmulator {
  private terminal: Terminal
  private serializer: SerializeAddon

  private oscText: TerminalOscCwdTitleScanner
  private privateModes = new TerminalPrivateModeTracker()
  private restoredOscLinks: TerminalOscLinkRange[] = []
  private disposed = false
  private onQueryReply: ((reply: string) => void) | null
  private conptyDa1OverrideInstalled = false
  private viewAttributeResponder: TerminalViewAttributeResponder | null = null
  // Reply forwarding is scoped to the exact parse window for one flagged chunk.
  private queryReplyForwardingDepth = 0

  constructor(opts: HeadlessEmulatorOptions) {
    this.oscText = new TerminalOscCwdTitleScanner({
      pathFlavor: opts.pathFlavor,
      remotePosixFileUriAuthority: opts.remotePosixFileUriAuthority
    })
    this.terminal = new Terminal({
      cols: opts.cols,
      rows: opts.rows,
      scrollback: opts.scrollback ?? DEFAULT_SCROLLBACK,
      allowProposedApi: true,
      logLevel: 'off',
      // Renderer parity: parse kitty keyboard mode pushes for hidden query replies.
      vtExtensions: { kittyKeyboard: true }
    })

    this.serializer = new SerializeAddon()
    this.terminal.loadAddon(this.serializer)

    // Match renderer xterm character widths, including Unicode 11 / emoji joining.
    this.terminal.loadAddon(new Unicode11Addon())
    activateOrcaTerminalUnicodeProvider(this.terminal)

    // Only runtime hidden-delivery responders answer queries from dropped bytes.
    this.onQueryReply = opts.onQueryReply ?? null
    if (this.onQueryReply) {
      this.terminal.onData((reply) => this.emitQueryReply(reply))
    }
  }

  /** Main-side ConPTY DA1 override twin of renderer device attributes. */
  installConptyPrimaryDeviceAttributesOverride(): void {
    // Idempotent: creation and retrofitted spawn marks can both request it.
    if (this.conptyDa1OverrideInstalled) {
      return
    }
    this.conptyDa1OverrideInstalled = true
    installConptyPrimaryDeviceAttributesOverrideForTerminal(this.terminal, (reply) =>
      this.emitQueryReply(reply)
    )
  }

  /** Runtime-only view-attribute bridge; daemon Session remains write-only. */
  installViewAttributeResponder(getBaseAttributes: () => TerminalViewAttributes | null): void {
    if (this.viewAttributeResponder) {
      return
    }
    this.viewAttributeResponder = installTerminalViewAttributeResponder({
      parser: this.terminal.parser,
      getBaseAttributes,
      // Keep replies inside the per-chunk forwarding window.
      emitReply: (reply) => this.emitQueryReply(reply)
    })
  }

  /** Applies renderer view attributes and clears per-PTY color overrides. */
  applyPushedViewAttributes(attributes: TerminalViewAttributes): void {
    if (this.disposed) {
      return
    }
    this.terminal.options.cursorStyle = attributes.cursorStyle
    this.terminal.options.cursorBlink = attributes.cursorBlink
    this.viewAttributeResponder?.clearColorOverrides()
  }

  /** Re-seed snapshot kitty keyboard flags without forwarding query replies. */
  applyKittyKeyboardFlags(flags: number): Promise<void> {
    if (!Number.isInteger(flags) || flags <= 0) {
      return Promise.resolve()
    }
    return this.write(`\x1b[=${flags};1u`)
  }

  private emitQueryReply(reply: string): void {
    if (this.queryReplyForwardingDepth > 0 && this.onQueryReply) {
      this.onQueryReply(reply)
    }
  }

  /** Severs the reply sink at PTY teardown. */
  disableQueryReplyForwarding(): void {
    this.onQueryReply = null
  }

  write(data: string, opts: HeadlessEmulatorWriteOptions = {}): Promise<void> {
    if (this.disposed) {
      return Promise.resolve()
    }

    const forwardQueryReplies = opts.forwardQueryReplies === true
    if (this.tryWriteSync(data, { forwardQueryReplies })) {
      return Promise.resolve()
    }
    this.oscText.scan(data)
    // Sentinel brackets exactly this queued write's parse window.
    if (forwardQueryReplies) {
      this.terminal.write('', () => {
        this.queryReplyForwardingDepth += 1
      })
    }
    return new Promise<void>((resolve) => {
      this.terminal.write(data, () => {
        if (forwardQueryReplies) {
          this.queryReplyForwardingDepth -= 1
        }
        // Commit mirrored private modes after xterm parses the same bytes.
        this.privateModes.scan(data)
        resolve()
      })
    })
  }

  /** Synchronous write for cold-restore log replay. */
  writeSync(data: string): boolean {
    if (this.disposed) {
      return false
    }
    return this.tryWriteSync(data)
  }

  private tryWriteSync(data: string, opts: HeadlessEmulatorWriteOptions = {}): boolean {
    const writeSync = getTerminalWriteSync(this.terminal)
    if (typeof writeSync !== 'function') {
      return false
    }
    this.oscText.scan(data)
    const forwardQueryReplies = opts.forwardQueryReplies === true
    if (forwardQueryReplies) {
      this.queryReplyForwardingDepth += 1
    }
    // Avoid snapshotting a half-applied queued write.
    try {
      writeSync.call((this.terminal as unknown as { _core?: unknown })._core, data)
    } finally {
      if (forwardQueryReplies) {
        this.queryReplyForwardingDepth -= 1
      }
    }
    this.privateModes.scan(data)
    return true
  }

  resize(cols: number, rows: number): void {
    if (this.disposed) {
      return
    }
    this.restoredOscLinks = []
    this.terminal.resize(cols, rows)
  }

  // Mirrors the size accepted by the child-side resize gate.
  getAppliedSize(): { cols: number; rows: number } {
    return { cols: this.terminal.cols, rows: this.terminal.rows }
  }

  getSnapshot(opts: { scrollbackRows?: number } = {}): TerminalSnapshot {
    const modes = this.getModes()
    const snapshotAnsi = normalizeSnapshotAnsiForModes(
      this.serializer.serialize({ scrollback: opts.scrollbackRows }),
      modes
    )
    return {
      snapshotAnsi,
      scrollbackAnsi: '',
      oscLinks: collectHeadlessOscLinkRanges(
        this.terminal,
        opts.scrollbackRows,
        this.restoredOscLinks
      ),
      rehydrateSequences: buildHeadlessRehydrateSequences(modes),
      cwd: this.oscText.cwd,
      modes,
      cols: this.terminal.cols,
      rows: this.terminal.rows,
      scrollbackLines: this.terminal.buffer.normal.length - this.terminal.rows,
      lastTitle: this.oscText.lastTitle ?? undefined
    }
  }

  get isAlternateScreen(): boolean {
    return this.terminal.buffer.active.type === 'alternate'
  }

  getVisibleLines(): string[] {
    const buffer = this.terminal.buffer.active
    const lines: string[] = []
    for (let row = buffer.viewportY; row < buffer.viewportY + this.terminal.rows; row += 1) {
      lines.push(buffer.getLine(row)?.translateToString(true) ?? '')
    }
    return lines
  }

  getCwd(): string | null {
    return this.oscText.cwd
  }

  setCwd(cwd: string | null): void {
    this.oscText.cwd = cwd
  }

  setLastTitle(title: string): void {
    this.oscText.lastTitle = title
  }

  setRestoredOscLinks(links: TerminalOscLinkRange[] | undefined): void {
    this.restoredOscLinks = links?.slice() ?? []
  }

  clearScrollback(): void {
    this.restoredOscLinks = []
    this.terminal.clear()
  }

  dispose(): void {
    this.disposed = true
    this.terminal.dispose()
  }

  private getModes(): TerminalModes {
    const buffer = this.terminal.buffer.active
    const mouseTrackingMode = this.privateModes.mouseTrackingMode
    return {
      bracketedPaste: this.terminal.modes.bracketedPasteMode,
      mouseTracking: mouseTrackingMode !== 'none',
      mouseTrackingMode,

      sgrMouseMode: this.privateModes.sgrMouseMode,
      sgrMousePixelsMode: this.privateModes.sgrMousePixelsMode,
      applicationCursor:
        buffer.type === 'normal' ? this.terminal.modes.applicationCursorKeysMode : false,
      alternateScreen: buffer.type === 'alternate',
      kittyKeyboardFlags: getTerminalKittyKeyboardFlags(this.terminal)
    }
  }
}
