import type { Terminal } from '@xterm/headless'

export type TerminalWithSynchronousWrite = Terminal & {
  _core?: {
    writeSync?: (data: string) => void
    coreService?: {
      kittyKeyboard?: { flags?: number }
    }
  }
}

const CONPTY_DA1_RESPONSE = '\x1b[?61;4c'

export function installConptyPrimaryDeviceAttributesOverrideForTerminal(
  terminal: Terminal,
  emitReply: (reply: string) => void
): void {
  terminal.parser.registerCsiHandler({ final: 'c' }, (params) => {
    const isPrimaryQuery = params.length === 0 || (params.length === 1 && params[0] === 0)
    if (!isPrimaryQuery) {
      return false
    }
    emitReply(CONPTY_DA1_RESPONSE)
    return true
  })
}

export function getTerminalKittyKeyboardFlags(terminal: Terminal): number {
  const flags = (terminal as TerminalWithSynchronousWrite)._core?.coreService?.kittyKeyboard?.flags
  return typeof flags === 'number' ? flags : 0
}

export function getTerminalWriteSync(terminal: Terminal): ((data: string) => void) | undefined {
  return (terminal as TerminalWithSynchronousWrite)._core?.writeSync
}
