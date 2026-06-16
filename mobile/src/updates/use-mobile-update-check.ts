import { useEffect, useState } from 'react'

import { startDiagnosticFetchTimeout } from '../diagnostics/diagnostic-fetch-timeout'
import { getInstalledMobileBuild } from './installed-mobile-build'
import {
  MOBILE_UPDATE_MANIFEST_URL,
  evaluateMobileUpdate,
  parseMobileUpdateManifest,
  type MobileUpdateEvaluation
} from './mobile-update-manifest'

export type MobileUpdateCheckState =
  | { state: 'checking' }
  | { state: 'available'; evaluation: Extract<MobileUpdateEvaluation, { kind: 'available' }> }
  | { state: 'current'; evaluation: Extract<MobileUpdateEvaluation, { kind: 'current' }> }
  | {
      state: 'unavailable'
      reason: Exclude<MobileUpdateEvaluation['kind'], 'available' | 'current'>
    }
  | { state: 'error'; message: string }

type Options = {
  enabled?: boolean
  timeoutMs?: number
  manifestUrl?: string
}

export function useMobileUpdateCheck({
  enabled = true,
  timeoutMs = 6_000,
  manifestUrl = MOBILE_UPDATE_MANIFEST_URL
}: Options = {}): MobileUpdateCheckState {
  const [state, setState] = useState<MobileUpdateCheckState>({ state: 'checking' })

  useEffect(() => {
    if (!enabled) {
      return
    }

    let disposed = false
    const timeout = startDiagnosticFetchTimeout(timeoutMs)

    async function check() {
      setState({ state: 'checking' })
      try {
        const response = await fetch(manifestUrl, {
          headers: { Accept: 'application/json' },
          signal: timeout.signal
        })
        if (!response.ok) {
          throw new Error(`Update manifest returned HTTP ${response.status}`)
        }
        const manifest = parseMobileUpdateManifest(await response.json())
        if (!manifest) {
          throw new Error('Update manifest has an unexpected shape')
        }
        const evaluation = evaluateMobileUpdate(manifest, getInstalledMobileBuild())
        if (disposed) {
          return
        }
        if (evaluation.kind === 'available') {
          setState({ state: 'available', evaluation })
        } else if (evaluation.kind === 'current') {
          setState({ state: 'current', evaluation })
        } else {
          setState({ state: 'unavailable', reason: evaluation.kind })
        }
      } catch (error) {
        if (disposed) {
          return
        }
        setState({
          state: 'error',
          message: timeout.timedOut
            ? 'Update check timed out'
            : error instanceof Error
              ? error.message
              : 'Update check failed'
        })
      } finally {
        timeout.dispose()
      }
    }

    void check()

    return () => {
      disposed = true
      timeout.dispose()
    }
  }, [enabled, manifestUrl, timeoutMs])

  return state
}
