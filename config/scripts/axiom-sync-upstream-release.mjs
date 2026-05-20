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

const AXIOM_IDENTITY_EXPECTATIONS = [
  ['config/electron-builder.config.cjs', 'com.axiomlabs.orca'],
  ['config/electron-builder.config.cjs', 'Axiom Orca'],
  ['config/electron-builder.config.cjs', 'b6c06723-a52f-5004-ad9f-f39666f5e928'],
  ['electron.vite.config.ts', 'ORCA_UPDATE_OWNER'],
  ['electron.vite.config.ts', 'ORCA_UPDATE_REPO'],
  ['electron.vite.config.ts', 'ORCA_APP_NAME'],
  ['resources/build/installer.nsh', 'Axiom Orca.exe'],
  ['mobile/app.json', 'com.axiomlabs.orca.mobile']
]

function assertAxiomIdentityFiles() {
  const failures = []
  for (const [file, expected] of AXIOM_IDENTITY_EXPECTATIONS) {
    let content = ''
    try {
      content = readFileSync(file, 'utf8')
    } catch (error) {
      failures.push(`${file}: missing (${error.message})`)
      continue
    }
    if (!content.includes(expected)) {
      failures.push(`${file}: missing ${expected}`)
    }
  }
  if (failures.length > 0) {
    throw new Error(`Axiom identity guard failed after upstream sync:\n${failures.join('\n')}`)
  }
}

function unresolvedConflictFiles() {
  const output = run('git', ['diff', '--name-only', '--diff-filter=U'])
  return output ? output.split('\n').filter(Boolean) : []
}

function printConflictDiagnostics(error) {
  console.error(
    '::error::Upstream merge conflicted; leaving the working tree intact for inspection.'
  )
  console.error(
    'Resolve conflicts on axiom/deploy, preserving Axiom identity/update settings, then rerun the workflow.'
  )
  if (error?.message) {
    console.error(error.message)
  }
  try {
    console.error(run('git', ['status', '--short']))
  } catch {}
  const conflicts = unresolvedConflictFiles()
  if (conflicts.length > 0) {
    console.error(`Conflicted files:\n${conflicts.join('\n')}`)
  }
}

function parseArgs(argv) {
  const args = { upstreamTag: '', forkVersion: '', forkTag: '' }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--upstream-tag') {
      args.upstreamTag = argv[++i] ?? ''
    } else if (argv[i] === '--fork-version') {
      args.forkVersion = argv[++i] ?? ''
    } else if (argv[i] === '--fork-tag') {
      args.forkTag = argv[++i] ?? ''
    }
  }
  return args
}

function updatePackageVersion(forkVersion) {
  if (!forkVersion) {
    throw new Error('Axiom fork version is required before release')
  }
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  if (pkg.version === forkVersion) {
    return false
  }
  pkg.version = forkVersion
  writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
  return true
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const upstreamRepo = envString(
    'AXIOM_UPSTREAM_REPOSITORY_URL',
    'https://github.com/stablyai/orca.git'
  )
  const upstreamBranch = envString('AXIOM_UPSTREAM_BRANCH', 'main')
  const deployBranch = envString('AXIOM_DEPLOY_BRANCH', 'axiom/deploy')

  if (upstreamBranch !== 'main') {
    throw new Error(`Refusing to mirror unexpected upstream branch: ${upstreamBranch}`)
  }
  if (deployBranch !== 'axiom/deploy') {
    throw new Error(`Refusing to release from non-Axiom deploy branch: ${deployBranch}`)
  }
  if (args.forkTag && !args.forkTag.startsWith('axiom-v')) {
    throw new Error(`Refusing to create non-Axiom release tag: ${args.forkTag}`)
  }

  if (hasChanges()) {
    throw new Error('Working tree must be clean before upstream sync')
  }

  try {
    run('git', ['remote', 'get-url', 'upstream'])
  } catch {
    runInherited('git', ['remote', 'add', 'upstream', upstreamRepo])
  }
  runInherited('git', ['remote', 'set-url', 'upstream', upstreamRepo])
  runInherited('git', ['fetch', 'upstream', upstreamBranch, '--no-tags'])
  if (args.upstreamTag) {
    runInherited('git', [
      'fetch',
      'upstream',
      `refs/tags/${args.upstreamTag}:refs/remotes/upstream-tags/${args.upstreamTag}`,
      '--no-tags'
    ])
  }
  runInherited('git', ['fetch', 'origin', deployBranch, '--tags'])

  if (branchExists(`refs/remotes/origin/${deployBranch}`)) {
    runInherited('git', ['checkout', '-B', deployBranch, `origin/${deployBranch}`])
  } else {
    runInherited('git', ['checkout', '-B', deployBranch])
  }

  assertAxiomIdentityFiles()
  const mergeRef = args.upstreamTag
    ? `refs/remotes/upstream-tags/${args.upstreamTag}`
    : `upstream/${upstreamBranch}`
  try {
    runInherited('git', ['merge', '--no-ff', '--no-edit', mergeRef])
  } catch (error) {
    printConflictDiagnostics(error)
    throw new Error(
      'Upstream merge conflicted; resolve conflicts without clobbering Axiom identity/update settings.'
    )
  }
  assertAxiomIdentityFiles()
  const versionChanged = updatePackageVersion(args.forkVersion)
  if (versionChanged) {
    runInherited('git', ['add', 'package.json'])
    runInherited('git', [
      'commit',
      '-m',
      `chore(release): align Axiom build to ${args.forkVersion}`
    ])
  }
  assertAxiomIdentityFiles()

  const head = run('git', ['rev-parse', 'HEAD'])
  console.log(
    `Axiom deploy branch ${deployBranch} synchronized at ${head} for ${args.forkTag || args.forkVersion}`
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
