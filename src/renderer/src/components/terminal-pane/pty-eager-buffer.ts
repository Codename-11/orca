import { acquirePtyDeliveryInterest } from './pty-delivery-interest'
import {
  ensurePtyDispatcher,
  ptyDataHandlers,
  ptyExitHandlers,
  ptyReplayHandlers
} from './pty-dispatcher'

// ─── Eager PTY buffer for reconnection on restart ────────────────────
// Why: On startup, PTYs are spawned before TerminalPane mounts. Shell output
// (prompt, MOTD) arrives via pty:data before xterm exists. These helpers buffer
// that output so transport.attach() can replay it when the pane finally mounts.

export type EagerPtyHandle = { flush: () => string; dispose: () => void }
const eagerPtyHandles = new Map<string, EagerPtyHandle>()
const eagerBufferTextEncoder = new TextEncoder()
const eagerBufferTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true })

type EagerBufferChunk = {
  data: string
  bytes: number
}

export function getEagerPtyBufferHandle(ptyId: string): EagerPtyHandle | undefined {
  return eagerPtyHandles.get(ptyId)
}

// Why: 512 KB matches the scrollback buffer cap used by TerminalPane's
// serialization. Prevents unbounded memory growth if a restored shell
// runs a long-lived command (e.g. tail -f) in a worktree the user never opens.
const EAGER_BUFFER_MAX_BYTES = 512 * 1024

function clampUtf8Tail(data: string, maxBytes: number): EagerBufferChunk {
  const encoded = eagerBufferTextEncoder.encode(data)
  if (encoded.byteLength <= maxBytes) {
    return { data, bytes: encoded.byteLength }
  }
  let start = encoded.byteLength - maxBytes
  while (start < encoded.byteLength && (encoded[start] & 0xc0) === 0x80) {
    start += 1
  }
  const tail = eagerBufferTextDecoder.decode(encoded.subarray(start))
  return { data: tail, bytes: encoded.byteLength - start }
}

export function registerEagerPtyBuffer(
  ptyId: string,
  onExit: (ptyId: string, code: number) => void
): EagerPtyHandle {
  ensurePtyDispatcher()
  // Why: an eager buffer means a pane mount is (potentially) pending — the
  // hidden-delivery gate must keep bytes flowing until the pane attaches and
  // takes over, so the buffer holds delivery interest for its lifetime.
  const releaseDeliveryInterest = acquirePtyDeliveryInterest(ptyId)

  // Why: a head index instead of Array.shift() — shift() is O(n), making
  // pre-attach buffering quadratic under many small chunks. Compaction is deferred.
  const chunks: EagerBufferChunk[] = []
  let head = 0
  let bufferBytes = 0

  const dataHandler = (data: string): void => {
    // A single chunk larger than the cap would otherwise bypass trimming and
    // store the whole payload; keep only its most-recent tail.
    const chunk = clampUtf8Tail(data, EAGER_BUFFER_MAX_BYTES)
    chunks.push(chunk)
    bufferBytes += chunk.bytes
    // Drop whole leading chunks (keeping the prompt-bearing tail) until within cap.
    while (bufferBytes > EAGER_BUFFER_MAX_BYTES && head < chunks.length - 1) {
      bufferBytes -= chunks[head].bytes
      chunks[head] = { data: '', bytes: 0 }
      head += 1
    }
    // Compact when dead slots reach half the array so it can't grow unbounded.
    if (head > 0 && head * 2 >= chunks.length) {
      chunks.splice(0, head)
      head = 0
    }
  }
  const exitHandler = (code: number): void => {
    // Shell died before TerminalPane attached — clean up and notify the store
    // so the tab's ptyId is cleared and connectPanePty falls through to connect().
    releaseDeliveryInterest()
    ptyDataHandlers.delete(ptyId)
    ptyReplayHandlers.delete(ptyId)
    ptyExitHandlers.delete(ptyId)
    eagerPtyHandles.delete(ptyId)
    onExit(ptyId, code)
  }

  ptyDataHandlers.set(ptyId, dataHandler)
  ptyExitHandlers.set(ptyId, exitHandler)

  const handle: EagerPtyHandle = {
    flush() {
      const data = chunks
        .slice(head)
        .map((chunk) => chunk.data)
        .join('')
      chunks.length = 0
      head = 0
      bufferBytes = 0
      return data
    },
    dispose() {
      // Why: dispose runs at pane attach (mount completed) — the pane's own
      // visibility sync now owns the hidden-delivery decision for this PTY.
      releaseDeliveryInterest()
      // Only remove if the current handler is still the temp one (compare by
      // reference). After attach() replaces the handler this becomes a no-op.
      if (ptyDataHandlers.get(ptyId) === dataHandler) {
        ptyDataHandlers.delete(ptyId)
        ptyReplayHandlers.delete(ptyId)
      }
      if (ptyExitHandlers.get(ptyId) === exitHandler) {
        ptyExitHandlers.delete(ptyId)
      }
      eagerPtyHandles.delete(ptyId)
    }
  }

  eagerPtyHandles.set(ptyId, handle)
  return handle
}

