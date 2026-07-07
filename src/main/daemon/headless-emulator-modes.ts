import type { Terminal } from '@xterm/headless'
import type { TerminalModes } from './types'
import type { TerminalPrivateModeTracker } from './terminal-private-mode-tracker'

type TerminalWithKittyKeyboardFlags = Terminal & {
  _core?: {
    coreService?: {
      kittyKeyboard?: { flags?: number }
    }
  }
}

export function normalizeSnapshotAnsiForModes(snapshotAnsi: string, modes: TerminalModes): string {
  if (!modes.alternateScreen) {
    return snapshotAnsi
  }
  const alternateScreenMarker = '\x1b[?1049h'
  const start = snapshotAnsi.lastIndexOf(alternateScreenMarker)
  if (start === -1) {
    return snapshotAnsi
  }
  // Why: rehydrateSequences already enters the alternate screen and restores
  // mouse modes. Dropping SerializeAddon's duplicate ?1049h keeps mobile's
  // "slice from last alt-screen marker" replay from discarding those modes.
  return snapshotAnsi.slice(start + alternateScreenMarker.length)
}

export function collectHeadlessTerminalModes(
  terminal: Terminal,
  privateModes: TerminalPrivateModeTracker
): TerminalModes {
  const buffer = terminal.buffer.active
  const mouseTrackingMode = privateModes.mouseTrackingMode
  return {
    bracketedPaste: terminal.modes.bracketedPasteMode,
    mouseTracking: mouseTrackingMode !== 'none',
    mouseTrackingMode,
    sgrMouseMode: privateModes.sgrMouseMode,
    sgrMousePixelsMode: privateModes.sgrMousePixelsMode,
    applicationCursor: buffer.type === 'normal' ? terminal.modes.applicationCursorKeysMode : false,
    alternateScreen: buffer.type === 'alternate',
    kittyKeyboardFlags: getKittyKeyboardFlags(terminal)
  }
}

export function buildHeadlessRehydrateSequences(modes: TerminalModes): string {
  // Why no kitty flags here: rehydrateSequences feeds renderer xterms, and
  // POST_REPLAY_REATTACH_RESET's deliberate kitty reset (stale CSI-u Ctrl+C
  // hazard) must stay authoritative. modes.kittyKeyboardFlags exists for
  // emulator re-seed parity only; a re-seeded emulator answers ?0u and
  // protocol-conformant programs re-push.
  const seqs: string[] = []
  if (modes.alternateScreen) {
    seqs.push('\x1b[?1049h')
  }
  if (modes.bracketedPaste) {
    seqs.push('\x1b[?2004h')
  }
  if (modes.applicationCursor) {
    seqs.push('\x1b[?1h')
  }
  // Why: mobile alt-screen scroll gestures need xterm's mouse mode restored
  // from cold snapshots; OpenCode/OpenTUI enables scrollable panes this way.
  switch (modes.mouseTracking ? (modes.mouseTrackingMode ?? 'vt200') : 'none') {
    case 'x10':
      seqs.push('\x1b[?9h')
      break
    case 'vt200':
      seqs.push('\x1b[?1000h')
      break
    case 'drag':
      seqs.push('\x1b[?1002h')
      break
    case 'any':
      seqs.push('\x1b[?1003h')
      break
    case 'none':
      break
  }
  // Why: xterm tracks the mouse protocol and SGR encoding as independent
  // modes, so snapshots must preserve the encoding even when reporting is off.
  if (modes.sgrMousePixelsMode) {
    seqs.push('\x1b[?1016h')
  } else if (modes.sgrMouseMode) {
    seqs.push('\x1b[?1006h')
  }
  return seqs.join('')
}

function getKittyKeyboardFlags(terminal: Terminal): number {
  const flags = (terminal as TerminalWithKittyKeyboardFlags)._core?.coreService?.kittyKeyboard
    ?.flags
  return typeof flags === 'number' ? flags : 0
}
