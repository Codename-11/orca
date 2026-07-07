import { extractLastOscTitle } from '../../shared/agent-detection'
import { extractOscScanTail, scanOsc7Uris } from './osc7-uri-extraction'
import { parseFileUriPath } from './osc7-file-uri'

const OSC_SCAN_TAIL_LIMIT = 4096

export class HeadlessEmulatorOscState {
  private cwd: string | null = null
  private lastTitle: string | null = null
  private oscScanTail = ''
  private readonly pathFlavor?: 'posix' | 'win32'
  private readonly remotePosixFileUriAuthority: boolean

  constructor(opts: { pathFlavor?: 'posix' | 'win32'; remotePosixFileUriAuthority?: boolean }) {
    this.pathFlavor = opts.pathFlavor
    this.remotePosixFileUriAuthority = opts.remotePosixFileUriAuthority === true
  }

  scan(data: string): void {
    const oscInput = this.oscScanTail + data
    this.oscScanTail = extractOscScanTail(oscInput, OSC_SCAN_TAIL_LIMIT)
    scanOsc7Uris(oscInput, (uri) => this.parseOsc7Uri(uri))
    const lastTitle = extractLastOscTitle(oscInput)
    if (lastTitle !== null) {
      this.lastTitle = lastTitle
    }
  }

  getCwd(): string | null {
    return this.cwd
  }

  setCwd(cwd: string | null): void {
    this.cwd = cwd
  }

  getLastTitle(): string | undefined {
    return this.lastTitle ?? undefined
  }

  setLastTitle(title: string): void {
    this.lastTitle = title
  }

  private parseOsc7Uri(uri: string): void {
    const parsed = parseFileUriPath(uri, {
      pathFlavor: this.pathFlavor,
      remotePosixAuthority: this.remotePosixFileUriAuthority
    })
    if (parsed) {
      this.cwd = parsed
    }
  }
}
