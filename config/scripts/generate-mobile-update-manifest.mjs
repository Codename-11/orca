#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const MOBILE_UPDATE_MANIFEST_ASSET_NAME = 'mobile-update.json'
export const MOBILE_UPDATE_MANIFEST_SCHEMA_VERSION = 1

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

function parseArgs(argv) {
  const args = {
    generatedAt: new Date().toISOString()
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = argv[i + 1]
    if (arg === '--app-config') {
      args.appConfig = next
      i += 1
    } else if (arg === '--release-tag') {
      args.releaseTag = next
      i += 1
    } else if (arg === '--release-version') {
      args.releaseVersion = next
      i += 1
    } else if (arg === '--repository') {
      args.repository = next
      i += 1
    } else if (arg === '--source-sha') {
      args.sourceSha = next
      i += 1
    } else if (arg === '--apk') {
      args.apk = next
      i += 1
    } else if (arg === '--output') {
      args.output = next
      i += 1
    } else if (arg === '--generated-at') {
      args.generatedAt = next
      i += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return args
}

function requiredString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} is required`)
  }
  return value.trim()
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function resolveRepoPath(filePath) {
  return resolve(REPO_ROOT, filePath)
}

function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

function releaseAssetUrl({ repository, releaseTag, assetName }) {
  return `https://github.com/${repository}/releases/download/${encodeURIComponent(
    releaseTag
  )}/${encodeURIComponent(assetName)}`
}

export function buildMobileUpdateManifest({
  appConfig,
  releaseTag,
  releaseVersion,
  repository,
  sourceSha,
  generatedAt,
  apkPath
}) {
  const expo = appConfig?.expo
  if (!expo || typeof expo !== 'object') {
    throw new Error('mobile app config must contain expo object')
  }

  const repositoryValue = requiredString(repository, 'repository')
  const releaseTagValue = requiredString(releaseTag, 'releaseTag')
  const releaseVersionValue = requiredString(releaseVersion, 'releaseVersion')
  const sourceShaValue = requiredString(sourceSha, 'sourceSha')
  const version = requiredString(expo.version, 'expo.version')
  const android = expo.android && typeof expo.android === 'object' ? expo.android : null
  const ios = expo.ios && typeof expo.ios === 'object' ? expo.ios : null

  const platforms = {}

  if (android) {
    const versionCode = Number(android.versionCode)
    if (!Number.isInteger(versionCode) || versionCode <= 0) {
      throw new Error('expo.android.versionCode must be a positive integer')
    }

    const androidEntry = {
      packageName: requiredString(android.package, 'expo.android.package'),
      version,
      versionCode
    }

    if (apkPath) {
      const resolvedApk = resolve(apkPath)
      const assetName = basename(resolvedApk)
      androidEntry.artifact = {
        name: assetName,
        sizeBytes: statSync(resolvedApk).size,
        sha256: sha256File(resolvedApk),
        downloadUrl: releaseAssetUrl({
          repository: repositoryValue,
          releaseTag: releaseTagValue,
          assetName
        })
      }
    }

    platforms.android = androidEntry
  }

  if (ios) {
    platforms.ios = {
      bundleIdentifier: requiredString(ios.bundleIdentifier, 'expo.ios.bundleIdentifier'),
      version,
      buildNumber: requiredString(ios.buildNumber, 'expo.ios.buildNumber')
    }
  }

  return {
    schemaVersion: MOBILE_UPDATE_MANIFEST_SCHEMA_VERSION,
    generatedAt: requiredString(generatedAt, 'generatedAt'),
    release: {
      repository: repositoryValue,
      tag: releaseTagValue,
      version: releaseVersionValue,
      sourceSha: sourceShaValue,
      url: `https://github.com/${repositoryValue}/releases/tag/${encodeURIComponent(
        releaseTagValue
      )}`
    },
    platforms
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const appConfigPath = args.appConfig
    ? resolve(args.appConfig)
    : resolveRepoPath('mobile/app.json')
  const manifest = buildMobileUpdateManifest({
    appConfig: readJson(appConfigPath),
    releaseTag: args.releaseTag,
    releaseVersion: args.releaseVersion,
    repository: args.repository || process.env.GITHUB_REPOSITORY,
    sourceSha: args.sourceSha || process.env.GITHUB_SHA,
    generatedAt: args.generatedAt,
    apkPath: args.apk
  })

  const output = requiredString(args.output, 'output')
  writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${output}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
