#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

function envString(name, fallback) {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: 'utf8', stdio: options.stdio ?? 'pipe' }).trim()
}

function runInherited(command, args) {
  execFileSync(command, args, { stdio: 'inherit' })
}

function hasChanges() {
  return run('git', ['status', '--porcelain']).length > 0
}

function branchExists(ref) {
  try {
    run('git', ['rev-parse', '--verify', ref])
    return true
  } catch {
    return false
  }
}

function parseArgs(argv) {
  const args = { upstreamTag: '' }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--upstream-tag') {
      args.upstreamTag = argv[++i] ?? ''
    }
  }
  return args
}

function updatePackageVersion(upstreamTag) {
  if (!upstreamTag) {
    return false
  }
  const version = upstreamTag.replace(/^v/i, '')
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  if (pkg.version === version) {
    return false
  }
  pkg.version = version
  writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
  return true
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const upstreamRepo = envString('AXIOM_UPSTREAM_REPOSITORY_URL', 'https://github.com/stablyai/orca.git')
  const upstreamBranch = envString('AXIOM_UPSTREAM_BRANCH', 'main')
  const deployBranch = envString('AXIOM_DEPLOY_BRANCH', 'axiom/deploy')

  if (hasChanges()) {
    throw new Error('Working tree must be clean before upstream sync')
  }

  try {
    run('git', ['remote', 'get-url', 'upstream'])
  } catch {
    runInherited('git', ['remote', 'add', 'upstream', upstreamRepo])
  }
  runInherited('git', ['remote', 'set-url', 'upstream', upstreamRepo])
  // Why: the fork reuses upstream version tags for Axiom releases, so fetching
  // upstream tags can fail when the same tag points at the fork's deploy merge.
  runInherited('git', ['fetch', 'upstream', upstreamBranch, '--no-tags'])
  runInherited('git', ['fetch', 'origin', deployBranch, '--tags'])

  if (branchExists(`refs/remotes/origin/${deployBranch}`)) {
    runInherited('git', ['checkout', '-B', deployBranch, `origin/${deployBranch}`])
  } else {
    runInherited('git', ['checkout', '-B', deployBranch])
  }

  runInherited('git', ['merge', '--no-ff', '--no-edit', `upstream/${upstreamBranch}`])
  const versionChanged = updatePackageVersion(args.upstreamTag)
  if (versionChanged) {
    runInherited('git', ['add', 'package.json'])
    runInherited('git', ['commit', '-m', `chore(release): align Axiom build to ${args.upstreamTag}`])
  }

  const head = run('git', ['rev-parse', 'HEAD'])
  console.log(`Axiom deploy branch ${deployBranch} synchronized at ${head}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
