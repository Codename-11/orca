/*
 * Why: Forge credentials (base URL + API key) live in one module so the rest
 * of the main process and the IPC layer never touch the filesystem or env
 * directly. Token is encrypted via Electron safeStorage; base URL stays in
 * plaintext JSON so the connection status can render before a keychain prompt.
 *
 * Resolution precedence (first match wins):
 *   1. Saved configuration on disk (~/.orca/forge-config.json + forge-token.enc)
 *   2. Environment variables: ORCA_FORGE_API_URL / FORGE_API_URL / FORGE_BASE_URL
 *      and ORCA_FORGE_API_TOKEN / FORGE_API_TOKEN / FORGE_TOKEN
 *
 * Renderer code never sees the token — main-side handlers read it here and
 * forward sanitized data over IPC. See ipc/forge.ts.
 */
import { safeStorage } from 'electron'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const FORGE_CONFIG_VERSION = 1

export type ForgeConfigSource = 'config' | 'env' | 'none'

export type ForgeResolvedConfig = {
  baseUrl: string | null
  hasToken: boolean
  /** Where the base URL came from (token may differ; see resolveToken). */
  baseUrlSource: ForgeConfigSource
}

type ForgeConfigFile = {
  version: 1
  baseUrl: string | null
}

function envString(name: string): string | null {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function envBaseUrl(): string | null {
  const raw =
    envString('ORCA_FORGE_API_URL') ?? envString('FORGE_API_URL') ?? envString('FORGE_BASE_URL')
  return raw ? raw.replace(/\/+$/, '') : null
}

function envToken(): string | null {
  return (
    envString('ORCA_FORGE_API_TOKEN') ?? envString('FORGE_API_TOKEN') ?? envString('FORGE_TOKEN')
  )
}

function getOrcaDir(): string {
  return join(homedir(), '.orca')
}

function getConfigPath(): string {
  return join(getOrcaDir(), 'forge-config.json')
}

function getTokenPath(): string {
  return join(getOrcaDir(), 'forge-token.enc')
}

function ensureOrcaDir(): void {
  const dir = getOrcaDir()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 })
  }
}

let cachedConfig: ForgeConfigFile | null = null
let configLoaded = false
let cachedToken: string | null = null
let tokenLoaded = false

function loadConfigFromDisk(): ForgeConfigFile | null {
  if (configLoaded) {
    return cachedConfig
  }
  configLoaded = true
  const path = getConfigPath()
  if (!existsSync(path)) {
    return null
  }
  try {
    const raw = readFileSync(path, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<ForgeConfigFile>
    if (parsed && typeof parsed === 'object') {
      const baseUrl =
        typeof parsed.baseUrl === 'string' && parsed.baseUrl.trim()
          ? parsed.baseUrl.trim().replace(/\/+$/, '')
          : null
      cachedConfig = { version: FORGE_CONFIG_VERSION, baseUrl }
    }
  } catch {
    cachedConfig = null
  }
  return cachedConfig
}

function loadTokenFromDisk(): string | null {
  if (tokenLoaded) {
    return cachedToken
  }
  tokenLoaded = true
  const path = getTokenPath()
  if (!existsSync(path)) {
    return null
  }
  try {
    const raw = readFileSync(path)
    cachedToken = safeStorage.isEncryptionAvailable()
      ? safeStorage.decryptString(raw)
      : raw.toString('utf-8')
  } catch {
    cachedToken = null
  }
  return cachedToken
}

function writeConfigToDisk(config: ForgeConfigFile): void {
  ensureOrcaDir()
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), {
    encoding: 'utf-8',
    mode: 0o600
  })
}

function writeTokenToDisk(token: string): void {
  ensureOrcaDir()
  const path = getTokenPath()
  if (safeStorage.isEncryptionAvailable()) {
    writeFileSync(path, safeStorage.encryptString(token), { mode: 0o600 })
    return
  }
  // Why: keychain may be unavailable on headless Linux; persist plaintext at
  // 0600 so connection state survives a restart rather than silently breaking.
  writeFileSync(path, token, { encoding: 'utf-8', mode: 0o600 })
}

/** Reset module-level caches. Test-only — production callers re-read from disk
 *  through the public accessors which already cache. */
export function __resetForgeConfigCache(): void {
  cachedConfig = null
  configLoaded = false
  cachedToken = null
  tokenLoaded = false
}

export function getForgeBaseUrl(): string | null {
  const fromDisk = loadConfigFromDisk()?.baseUrl ?? null
  if (fromDisk) {
    return fromDisk
  }
  return envBaseUrl()
}

export function getForgeToken(): string | null {
  const fromDisk = loadTokenFromDisk()
  if (fromDisk) {
    return fromDisk
  }
  return envToken()
}

export function resolveForgeConfig(): ForgeResolvedConfig {
  const fromDisk = loadConfigFromDisk()
  if (fromDisk?.baseUrl) {
    return {
      baseUrl: fromDisk.baseUrl,
      hasToken: loadTokenFromDisk() !== null || envToken() !== null,
      baseUrlSource: 'config'
    }
  }
  const envUrl = envBaseUrl()
  if (envUrl) {
    return {
      baseUrl: envUrl,
      hasToken: loadTokenFromDisk() !== null || envToken() !== null,
      baseUrlSource: 'env'
    }
  }
  return {
    baseUrl: null,
    hasToken: loadTokenFromDisk() !== null || envToken() !== null,
    baseUrlSource: 'none'
  }
}

export type SaveForgeConfigArgs = {
  baseUrl: string
  apiKey?: string | null
}

export function saveForgeConfig({ baseUrl, apiKey }: SaveForgeConfigArgs): void {
  const trimmedUrl = baseUrl.trim().replace(/\/+$/, '')
  if (!trimmedUrl) {
    throw new Error('Forge base URL is required')
  }
  writeConfigToDisk({ version: FORGE_CONFIG_VERSION, baseUrl: trimmedUrl })
  cachedConfig = { version: FORGE_CONFIG_VERSION, baseUrl: trimmedUrl }
  configLoaded = true

  if (typeof apiKey === 'string') {
    if (apiKey.trim()) {
      writeTokenToDisk(apiKey.trim())
      cachedToken = apiKey.trim()
    } else {
      clearForgeTokenFromDisk()
    }
    tokenLoaded = true
  }
}

function clearForgeTokenFromDisk(): void {
  const path = getTokenPath()
  if (existsSync(path)) {
    try {
      unlinkSync(path)
    } catch {
      // best-effort
    }
  }
  cachedToken = null
  tokenLoaded = true
}

export function clearForgeConfig(): void {
  const configPath = getConfigPath()
  if (existsSync(configPath)) {
    try {
      unlinkSync(configPath)
    } catch {
      // best-effort
    }
  }
  clearForgeTokenFromDisk()
  cachedConfig = null
  configLoaded = true
}
