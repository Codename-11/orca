import { HostProfileSchema, type HostProfile } from './types'

export const HOST_CONNECTION_BACKUP_KIND = 'orca-mobile-hosts'
export const HOST_CONNECTION_BACKUP_VERSION = 1

type HostConnectionBackupEnvelope = {
  kind?: unknown
  version?: unknown
  hosts?: unknown
}

export type HostConnectionImportSummary = {
  hostsToSave: HostProfile[]
  importedCount: number
  skippedDuplicateCount: number
  skippedInvalidCount: number
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function extractCandidateHosts(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value
  }
  if (isObject(value) && Array.isArray((value as HostConnectionBackupEnvelope).hosts)) {
    return (value as { hosts: unknown[] }).hosts
  }
  throw new Error('Selected file is not an Orca host backup.')
}

function looksLikeTokenlessStoredHost(value: unknown): boolean {
  if (!isObject(value)) {
    return false
  }
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.endpoint === 'string' &&
    typeof value.publicKeyB64 === 'string' &&
    typeof value.lastConnected === 'number' &&
    !('deviceToken' in value)
  )
}

function isSameHostConnection(left: HostProfile, right: HostProfile): boolean {
  return (
    left.id === right.id &&
    left.name === right.name &&
    left.endpoint === right.endpoint &&
    left.deviceToken === right.deviceToken &&
    left.publicKeyB64 === right.publicKeyB64 &&
    left.lastConnected === right.lastConnected
  )
}

export function parseHostConnectionImportPayload(payloadText: string): HostProfile[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(payloadText)
  } catch {
    throw new Error('Selected file is not valid JSON.')
  }

  const candidates = extractCandidateHosts(parsed)
  let sawTokenlessHost = false
  const hosts: HostProfile[] = []
  for (const candidate of candidates) {
    if (looksLikeTokenlessStoredHost(candidate)) {
      sawTokenlessHost = true
      continue
    }
    const result = HostProfileSchema.safeParse(candidate)
    if (result.success) {
      hosts.push(result.data)
    }
  }

  if (hosts.length === 0 && sawTokenlessHost) {
    throw new Error(
      'This backup only contains host metadata. Import needs the device token for each saved connection.'
    )
  }
  if (hosts.length === 0) {
    throw new Error('No importable saved connections were found in this file.')
  }
  return hosts
}

export function summarizeHostConnectionImport(
  existingHosts: readonly HostProfile[],
  importedCandidates: readonly unknown[]
): HostConnectionImportSummary {
  const existingById = new Map(existingHosts.map((host) => [host.id, host]))
  const queuedById = new Set<string>()
  const hostsToSave: HostProfile[] = []
  let skippedDuplicateCount = 0
  let skippedInvalidCount = 0

  for (const candidate of importedCandidates) {
    const result = HostProfileSchema.safeParse(candidate)
    if (!result.success) {
      skippedInvalidCount += 1
      continue
    }

    const host = result.data
    const existing = existingById.get(host.id)
    if (queuedById.has(host.id) || (existing && isSameHostConnection(existing, host))) {
      skippedDuplicateCount += 1
      continue
    }

    queuedById.add(host.id)
    hostsToSave.push(host)
  }

  return {
    hostsToSave,
    importedCount: hostsToSave.length,
    skippedDuplicateCount,
    skippedInvalidCount
  }
}

export function createHostConnectionBackupPayload(hosts: readonly HostProfile[]): string {
  return JSON.stringify(
    {
      kind: HOST_CONNECTION_BACKUP_KIND,
      version: HOST_CONNECTION_BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      hosts
    },
    null,
    2
  )
}
