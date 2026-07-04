import type { TerminalModes } from './types'

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

export function buildHeadlessRehydrateSequences(modes: TerminalModes): string {
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
  if (modes.sgrMousePixelsMode) {
    seqs.push('\x1b[?1016h')
  } else if (modes.sgrMouseMode) {
    seqs.push('\x1b[?1006h')
  }
  return seqs.join('')
}
