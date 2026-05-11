// IPC surface for the error-tracking lane (telemetry-error-tracking.md
// §User controls). Five renderer-facing channels:
//
//   diagnostics:getStatus            — read-only snapshot for the Privacy pane.
//   diagnostics:openTraceFolder      — Reveal in Finder / Explorer.
//   diagnostics:clearTraces          — delete the rotated NDJSON family.
//   diagnostics:collectBundle        — assemble a redacted preview payload.
//   diagnostics:uploadBundle         — POST the (possibly-edited) payload.
//
// Same threat model as the product-telemetry IPC (`ipc/telemetry.ts`):
// renderer can pass anything over the wire, type-narrow here. Everything
// that touches the network or filesystem stays in main — the renderer
// only sees the resulting status / preview / ticket-id.
//
// Hardening item §Endpoint contract #10 ("No renderer access to any of
// these endpoints"): the upload endpoint URL never crosses IPC. The
// renderer triggers the flow; main reads the URL from a build-time
// constant or env var and does the POST itself.

import { app, ipcMain, shell } from 'electron'
import { arch as osArch, platform as osPlatform, release as osRelease } from 'node:os'
import {
  clearLocalTraces,
  collectDiagnosticBundle,
  getDiagnosticsStatus,
  getTraceFilePath,
  uploadDiagnosticBundle,
  type DiagnosticsStatus
} from '../observability'
import type { CollectedBundle, UploadBundleResult } from '../observability/bundle'

// Build-time constant for the diagnostic-token endpoint. Substituted by
// electron-vite at compile time. Local / contributor builds get `null`,
// at which point the upload path returns a clear "endpoint not configured"
// error rather than POSTing to a placeholder.
//
// The dev escape hatch is `ORCA_DIAGNOSTICS_TOKEN_URL` — set this env var
// to point at a local server during development. Mirrors the
// `ORCA_OTLP_TRACES_URL` env-var pattern for OTLP.
const BUILD_TOKEN_ENDPOINT: string | null =
  typeof ORCA_DIAGNOSTICS_TOKEN_URL !== 'undefined'
    ? ORCA_DIAGNOSTICS_TOKEN_URL
    : ((globalThis as { ORCA_DIAGNOSTICS_TOKEN_URL?: string | null }).ORCA_DIAGNOSTICS_TOKEN_URL ??
      null)

function resolveTokenEndpoint(): string | null {
  // env wins so a developer can point a packaged build at a staging server
  // for end-to-end validation without re-running the release pipeline.
  const fromEnv = process.env.ORCA_DIAGNOSTICS_TOKEN_URL
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv
  }
  return BUILD_TOKEN_ENDPOINT
}

function resolveOrcaChannel(): 'stable' | 'rc' | 'dev' {
  const ident =
    typeof ORCA_BUILD_IDENTITY !== 'undefined'
      ? ORCA_BUILD_IDENTITY
      : ((globalThis as { ORCA_BUILD_IDENTITY?: 'stable' | 'rc' | null }).ORCA_BUILD_IDENTITY ??
        null)
  if (ident === 'stable' || ident === 'rc') {
    return ident
  }
  return 'dev'
}

export function registerDiagnosticsHandlers(): void {
  ipcMain.handle('diagnostics:getStatus', (): DiagnosticsStatus => {
    return getDiagnosticsStatus()
  })

  ipcMain.handle('diagnostics:openTraceFolder', async (): Promise<void> => {
    // Show the trace file's parent in the OS file manager. Using
    // `showItemInFolder` rather than `openPath(folder)` so the file itself
    // is highlighted — the user is much more likely to want to inspect
    // `main.trace.ndjson` than to browse the `logs/` directory.
    try {
      shell.showItemInFolder(getTraceFilePath())
    } catch {
      /* swallow — best effort; the user can navigate manually */
    }
  })

  ipcMain.handle('diagnostics:clearTraces', (): void => {
    clearLocalTraces()
  })

  ipcMain.handle(
    'diagnostics:collectBundle',
    (_event, lookbackMinutesIn: unknown): CollectedBundle => {
      // Renderer-controlled input → narrow at the boundary. The default
      // (DEFAULT_LOOKBACK_MINUTES in bundle.ts) is fine for the common
      // "last 30 minutes" case the Privacy pane button triggers.
      const lookbackMinutes =
        typeof lookbackMinutesIn === 'number' && Number.isFinite(lookbackMinutesIn)
          ? Math.max(1, Math.min(24 * 60, Math.floor(lookbackMinutesIn)))
          : undefined
      return collectDiagnosticBundle({
        appVersion: app.getVersion(),
        platform: osPlatform(),
        arch: osArch(),
        osRelease: osRelease(),
        orcaChannel: resolveOrcaChannel(),
        ...(lookbackMinutes !== undefined ? { lookbackMinutes } : {})
      })
    }
  )

  ipcMain.handle(
    'diagnostics:uploadBundle',
    async (_event, payload: unknown, bundleSubmissionId: unknown): Promise<UploadBundleResult> => {
      // Strict input typing: the renderer might be compromised. Reject any
      // non-string input rather than letting `Buffer.byteLength` coerce.
      if (typeof payload !== 'string') {
        throw new Error('payload must be a string')
      }
      if (typeof bundleSubmissionId !== 'string' || bundleSubmissionId.length === 0) {
        throw new Error('bundleSubmissionId must be a non-empty string')
      }
      const tokenEndpoint = resolveTokenEndpoint()
      if (!tokenEndpoint) {
        throw new Error('diagnostic upload endpoint is not configured for this build')
      }
      return uploadDiagnosticBundle({ tokenEndpoint, payload, bundleSubmissionId })
    }
  )
}
