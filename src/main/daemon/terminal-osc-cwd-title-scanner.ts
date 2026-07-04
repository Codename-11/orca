import { extractLastOscTitle } from '../../shared/agent-detection'
import { extractOscScanTail, scanOsc7Uris } from './osc7-uri-extraction'
import { parseFileUriPath } from './osc7-file-uri'

export type TerminalOscCwdTitleScannerOptions = {
  pathFlavor?: 'posix' | 'win32'
  remotePosixFileUriAuthority?: boolean
}

const OSC_SCAN_TAIL_LIMIT = 4096

/** Regex-side mirror of the OSC sequences the emulator tracks outside xterm:
 *  OSC 7 cwd updates and OSC 0/2 titles. Keeps an unterminated-sequence tail
 *  so sequences split across PTY chunks still parse. */
export class TerminalOscCwdTitleScanner {
  private scanTail = ''
  cwd: string | null = null
  lastTitle: string | null = null

  constructor(private readonly opts: TerminalOscCwdTitleScannerOptions = {}) {}

  scan(data: string): void {
    const input = this.scanTail + data
    this.scanTail = extractOscScanTail(input, OSC_SCAN_TAIL_LIMIT)
    this.scanOsc7(input)
    const lastTitle = extractLastOscTitle(input)
    if (lastTitle !== null) {
      this.lastTitle = lastTitle
    }
  }

  private scanOsc7(data: string): void {
    scanOsc7Uris(data, (uri) => {
      const parsed = parseFileUriPath(uri, {
        pathFlavor: this.opts.pathFlavor,
        remotePosixAuthority: this.opts.remotePosixFileUriAuthority === true
      })
      if (parsed) {
        this.cwd = parsed
      }
    })
  }
}
