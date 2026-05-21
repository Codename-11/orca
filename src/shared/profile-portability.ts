import type { PersistedState } from './types'

export const ORCA_PROFILE_EXPORT_FORMAT = 'orca-profile-export'
export const ORCA_PROFILE_EXPORT_VERSION = 1

export const PROFILE_EXPORT_SECTIONS = [
  'settings',
  'repos',
  'sparsePresetsByRepo',
  'worktreeMeta',
  'worktreeLineageById',
  'ui',
  'workspaceSession',
  'sshTargets',
  'automations',
  'automationRuns',
  'onboarding'
] as const

export type ProfileExportSection = (typeof PROFILE_EXPORT_SECTIONS)[number]
export type ProfileExportData = Pick<PersistedState, ProfileExportSection>

export type ProfileExportEnvelope = {
  format: typeof ORCA_PROFILE_EXPORT_FORMAT
  version: typeof ORCA_PROFILE_EXPORT_VERSION
  exportedAt: string
  source?: {
    appName?: string
    appVersion?: string
    appId?: string
  }
  excludedSecrets: string[]
  data: Partial<ProfileExportData>
}

export type ProfileImportPreview = {
  valid: boolean
  format: 'export' | 'raw-persisted-state' | 'unknown'
  sections: ProfileExportSection[]
  counts: Partial<Record<ProfileExportSection, number>>
  excludedSecrets: string[]
  error?: string
}

export type ProfileExportDialogResult =
  | { canceled: true }
  | { canceled: false; filePath: string; excludedSecrets: string[] }

export type ProfileImportPreviewDialogResult =
  | { canceled: true }
  | { canceled: false; filePath: string; preview: ProfileImportPreview }

export type ProfileImportDialogResult = {
  backupPath: string
  importedSections: ProfileExportSection[]
}

type MutableRecord = Record<string, unknown>

const SECRET_FIELD_PATHS = [
  'settings.opencodeSessionCookie',
  'settings.codexManagedAccounts',
  'settings.activeCodexManagedAccountId',
  'settings.claudeManagedAccounts',
  'settings.activeClaudeManagedAccountId',
  'ui.browserKagiSessionLink'
] as const

function isRecord(value: unknown): value is MutableRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function hasOwn<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function sectionCount(section: ProfileExportSection, value: unknown): number {
  if (Array.isArray(value)) {
    return value.length
  }
  if (isRecord(value)) {
    if (section === 'settings' || section === 'ui' || section === 'workspaceSession') {
      return 1
    }
    return Object.keys(value).length
  }
  return value == null ? 0 : 1
}

function extractSections(data: unknown): Partial<ProfileExportData> {
  if (!isRecord(data)) {
    return {}
  }
  const result: Partial<ProfileExportData> = {}
  for (const section of PROFILE_EXPORT_SECTIONS) {
    if (hasOwn(data, section)) {
      ;(result as MutableRecord)[section] = cloneJson(data[section])
    }
  }
  return result
}

export function sanitizeProfileExportData(state: PersistedState): Partial<ProfileExportData> {
  const data = extractSections(state)
  if (isRecord(data.settings)) {
    data.settings.opencodeSessionCookie = ''
    data.settings.codexManagedAccounts = []
    data.settings.activeCodexManagedAccountId = null
    data.settings.claudeManagedAccounts = []
    data.settings.activeClaudeManagedAccountId = null
  }
  if (isRecord(data.ui)) {
    data.ui.browserKagiSessionLink = null
  }
  return data
}

export function createProfileExportEnvelope(
  state: PersistedState,
  source: ProfileExportEnvelope['source'] = {}
): ProfileExportEnvelope {
  return {
    format: ORCA_PROFILE_EXPORT_FORMAT,
    version: ORCA_PROFILE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    source,
    excludedSecrets: [...SECRET_FIELD_PATHS],
    data: sanitizeProfileExportData(state)
  }
}

export function parseProfileImportPayload(raw: unknown): ProfileExportEnvelope | null {
  if (!isRecord(raw)) {
    return null
  }
  if (raw.format === ORCA_PROFILE_EXPORT_FORMAT && raw.version === ORCA_PROFILE_EXPORT_VERSION) {
    return {
      format: ORCA_PROFILE_EXPORT_FORMAT,
      version: ORCA_PROFILE_EXPORT_VERSION,
      exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date(0).toISOString(),
      source: isRecord(raw.source) ? (raw.source as ProfileExportEnvelope['source']) : {},
      excludedSecrets: Array.isArray(raw.excludedSecrets)
        ? raw.excludedSecrets.filter((entry): entry is string => typeof entry === 'string')
        : [],
      data: extractSections(raw.data)
    }
  }
  if (typeof raw.schemaVersion === 'number') {
    return {
      format: ORCA_PROFILE_EXPORT_FORMAT,
      version: ORCA_PROFILE_EXPORT_VERSION,
      exportedAt: new Date(0).toISOString(),
      source: { appName: 'Orca' },
      excludedSecrets: [...SECRET_FIELD_PATHS],
      data: sanitizeProfileExportData(raw as PersistedState)
    }
  }
  return null
}

export function previewProfileImportPayload(raw: unknown): ProfileImportPreview {
  const envelope = parseProfileImportPayload(raw)
  if (!envelope) {
    return {
      valid: false,
      format: 'unknown',
      sections: [],
      counts: {},
      excludedSecrets: [],
      error: 'File is not an Orca profile export or orca-data.json file.'
    }
  }
  const sections = PROFILE_EXPORT_SECTIONS.filter((section) => hasOwn(envelope.data, section))
  const counts = Object.fromEntries(
    sections.map((section) => [section, sectionCount(section, envelope.data[section])])
  ) as Partial<Record<ProfileExportSection, number>>
  return {
    valid: true,
    format: envelope.exportedAt === new Date(0).toISOString() ? 'raw-persisted-state' : 'export',
    sections,
    counts,
    excludedSecrets: envelope.excludedSecrets
  }
}

export function applyProfileImport(
  current: PersistedState,
  envelope: ProfileExportEnvelope,
  selectedSections: readonly ProfileExportSection[] = PROFILE_EXPORT_SECTIONS
): PersistedState {
  const next = cloneJson(current)
  const allowed = new Set(selectedSections)
  for (const section of PROFILE_EXPORT_SECTIONS) {
    if (!allowed.has(section) || !hasOwn(envelope.data, section)) {
      continue
    }
    ;(next as MutableRecord)[section] = cloneJson(envelope.data[section])
  }
  return next
}
