import { useCallback, useEffect, useRef, useState } from 'react'

import {
  startDiagnosticFetchTimeout,
  type DiagnosticFetchTimeout
} from '../diagnostics/diagnostic-fetch-timeout'
import { getInstalledMobileBuild } from './installed-mobile-build'
import {
  MOBILE_UPDATE_MANIFEST_URL,
  evaluateMobileUpdate,
  parseMobileUpdateManifest,
  type MobileUpdateEvaluation
} from './mobile-update-manifest'

export type MobileUpdateCheckState =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available'; evaluation: Extract<MobileUpdateEvaluation, { kind: 'available' }> }
  | { state: 'current'; evaluation: Extract<MobileUpdateEvaluation, { kind: 'current' }> }
  | {
      state: 'unavailable'
      reason: Exclude<MobileUpdateEvaluation['kind'], 'available' | 'current'>
    }
  | { state: 'error'; message: string }

export type MobileUpdateCheckResult = MobileUpdateCheckState & {
  checkNow: () => void
}

type Options = {
  enabled?: boolean
  checkOnMount?: boolean
  timeoutMs?: number
  manifestUrl?: string
}

export function useMobileUpdateCheck({
  enabled = true,
  checkOnMount = true,
  timeoutMs = 6_000,
  manifestUrl = MOBILE_UPDATE_MANIFEST_URL
}: Options = {}): MobileUpdateCheckResult {
  const [state, setState] = useState<MobileUpdateCheckState>(
    enabled && checkOnMount ? { state: 'checking' } : { state: 'idle' }
  )
  const requestIdRef = useRef(0)
  const timeoutRef = useRef<DiagnosticFetchTimeout | null>(null)
  const disposedRef = useRef(false)

  const checkNow = useCallback(() => {
    if (!enabled) {
      setState({ state: 'idle' })
      return
    }

    requestIdRef.current += 1
    const requestId = requestIdRef.current
    timeoutRef.current?.dispose()
    const timeout = startDiagnosticFetchTimeout(timeoutMs)
    timeoutRef.current = timeout

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
        if (disposedRef.current || requestId !== requestIdRef.current) {
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
        if (disposedRef.current || requestId !== requestIdRef.current) {
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
        if (timeoutRef.current === timeout) {
          timeoutRef.current = null
        }
        timeout.dispose()
      }
    }

    void check()
  }, [enabled, manifestUrl, timeoutMs])

  useEffect(() => {
    disposedRef.current = false
    return () => {
      disposedRef.current = true
      requestIdRef.current += 1
      timeoutRef.current?.dispose()
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      timeoutRef.current?.dispose()
      timeoutRef.current = null
      setState({ state: 'idle' })
      return
    }
    if (checkOnMount) {
      checkNow()
    }
  }, [checkNow, checkOnMount, enabled])

  return { ...state, checkNow }
}
