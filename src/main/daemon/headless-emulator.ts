import './xterm-env-polyfill'
import { Terminal } from '@xterm/headless'
import { SerializeAddon } from '@xterm/addon-serialize'
import { Unicode11Addon } from '@xterm/addon-unicode11'
import { activateOrcaTerminalUnicodeProvider } from '../../shared/terminal-unicode-provider'
import type { TerminalViewAttributes } from '../../shared/terminal-view-attributes'
import { collectHeadlessOscLinkRanges } from './headless-osc-link-ranges'
import { TerminalPrivateModeTracker } from './terminal-private-mode-tracker'
import { HeadlessEmulatorOscState } from './headless-emulator-osc-state'
import {
  buildHeadlessRehydrateSequences,
  collectHeadlessTerminalModes,
  normalizeSnapshotAnsiForModes
} from './headless-emulator-modes'
import {
  installTerminalViewAttributeResponder,
  type TerminalViewAttributeResponder
} from './terminal-view-attribute-responder'
import type { TerminalSnapshot } from './types'
import type { TerminalOscLinkRange } from '../../shared/terminal-osc-link-ranges'

export type HeadlessEmulatorOptions = {
  cols: number
  rows: number
  scrollback?: number
  pathFlavor?: 'posix' | 'win32'
  remotePosixFileUriAuthority?: boolean
  onQueryReply?: (reply: string) => void
}

export type HeadlessEmulatorWriteOptions = {
  forwardQueryReplies?: boolean
}

type TerminalWithSynchronousWrite = Terminal & {
  _core?: {
    writeSync?: (data: string) => void
    coreService?: {
      kittyKeyboard?: { flags?: number }
    }
  }
}

const DEFAULT_SCROLLBACK = 5000
const CONPTY_DA1_RESPONSE = '\x1b[?61;4c'
export class HeadlessEmulator {
  private terminal: Terminal
  private serializer: SerializeAddon
  private oscState: HeadlessEmulatorOscState
  private privateModes = new TerminalPrivateModeTracker()
  private restoredOscLinks: TerminalOscLinkRange[] = []
  private disposed = false
  private onQueryReply: ((reply: string) => void) | null
  private conptyDa1OverrideInstalled = false
  private viewAttributeResponder: TerminalViewAttributeResponder | null = null
  private queryReplyForwardingDepth = 0

  constructor(opts: HeadlessEmulatorOptions) {
    this.oscState = new HeadlessEmulatorOscState({
      pathFlavor: opts.pathFlavor,
      remotePosixFileUriAuthority: opts.remotePosixFileUriAuthority
    })
    this.terminal = new Terminal({
      cols: opts.cols,
      rows: opts.rows,
      scrollback: opts.scrollback ?? DEFAULT_SCROLLBACK,
      allowProposedApi: true,
      logLevel: 'off',
      vtExtensions: { kittyKeyboard: true }
    })

    this.serializer = new SerializeAddon()
    this.terminal.loadAddon(this.serializer)

    this.terminal.loadAddon(new Unicode11Addon())
    activateOrcaTerminalUnicodeProvider(this.terminal)

    this.onQueryReply = opts.onQueryReply ?? null
    if (this.onQueryReply) {
      this.terminal.onData((reply) => this.emitQueryReply(reply))
    }
  }

  installConptyPrimaryDeviceAttributesOverride(): void {
    if (this.conptyDa1OverrideInstalled) {
      return
    }
    this.conptyDa1OverrideInstalled = true
    this.terminal.parser.registerCsiHandler({ final: 'c' }, (params) => {
      const isPrimaryQuery = params.length === 0 || (params.length === 1 && params[0] === 0)
      if (!isPrimaryQuery) {
        return false
      }
      this.emitQueryReply(CONPTY_DA1_RESPONSE)
      return true
    })
  }

  installViewAttributeResponder(getBaseAttributes: () => TerminalViewAttributes | null): void {
    if (this.viewAttributeResponder) {
      return
    }
    this.viewAttributeResponder = installTerminalViewAttributeResponder({
      parser: this.terminal.parser,
      getBaseAttributes,
      emitReply: (reply) => this.emitQueryReply(reply)
    })
  }

  applyPushedViewAttributes(attributes: TerminalViewAttributes): void {
    if (this.disposed) {
      return
    }
    this.terminal.options.cursorStyle = attributes.cursorStyle
    this.terminal.options.cursorBlink = attributes.cursorBlink
    this.viewAttributeResponder?.clearColorOverrides()
  }

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
    this.oscState.scan(data)
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
        this.privateModes.scan(data)
        resolve()
      })
    })
  }

  writeSync(data: string): boolean {
    if (this.disposed) {
      return false
    }
    return this.tryWriteSync(data)
  }

  private tryWriteSync(data: string, opts: HeadlessEmulatorWriteOptions = {}): boolean {
    const writeSync = (this.terminal as TerminalWithSynchronousWrite)._core?.writeSync
    if (typeof writeSync !== 'function') {
      return false
    }
    this.oscState.scan(data)
    const forwardQueryReplies = opts.forwardQueryReplies === true
    if (forwardQueryReplies) {
      this.queryReplyForwardingDepth += 1
    }
    try {
      writeSync.call((this.terminal as TerminalWithSynchronousWrite)._core, data)
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

  getAppliedSize(): { cols: number; rows: number } {
    return { cols: this.terminal.cols, rows: this.terminal.rows }
  }

  getSnapshot(opts: { scrollbackRows?: number } = {}): TerminalSnapshot {
    const modes = collectHeadlessTerminalModes(this.terminal, this.privateModes)
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
      cwd: this.oscState.getCwd(),
      modes,
      cols: this.terminal.cols,
      rows: this.terminal.rows,
      scrollbackLines: this.terminal.buffer.normal.length - this.terminal.rows,
      lastTitle: this.oscState.getLastTitle()
    }
  }

  get isAlternateScreen(): boolean {
    return this.terminal.buffer.active.type === 'alternate'
  }

  /** Why: PSReadLine's Ctrl+L repaint is only safe at an empty prompt — with
   *  pending input it re-renders at a cached buffer row that ConPTY's fixed
   *  viewport doesn't track, painting the input well below the prompt. The
   *  cursor line counts as an empty prompt when everything before the cursor
   *  ends with a single '>' and nothing follows it ('>>' is PowerShell's
   *  continuation prompt, i.e. a multiline edit in flight). */
  isCursorOnEmptyPromptLine(): boolean {
    const buffer = this.terminal.buffer.active
    const line = buffer.getLine(buffer.baseY + buffer.cursorY)
    if (!line) {
      return false
    }
    const upToCursor = line.translateToString(true, 0, buffer.cursorX).trimEnd()
    const fullLine = line.translateToString(true).trimEnd()
    return fullLine === upToCursor && upToCursor.endsWith('>') && !upToCursor.endsWith('>>')
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
    return this.oscState.getCwd()
  }

  setCwd(cwd: string | null): void {
    this.oscState.setCwd(cwd)
  }

  setLastTitle(title: string): void {
    this.oscState.setLastTitle(title)
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
}
