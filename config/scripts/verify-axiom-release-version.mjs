#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { parseAxiomReleaseTag } from './axiom-release-versioning.mjs'

function main() {
  const [expectedVersion, expectedTag] = process.argv.slice(2)
  if (!expectedVersion || !expectedTag) {
    throw new Error('usage: verify-axiom-release-version.mjs <fork-version> <fork-tag>')
  }

  const parsedTag = parseAxiomReleaseTag(expectedTag)
  if (!parsedTag) {
    throw new Error(`Invalid Axiom release tag: ${expectedTag}`)
  }
  if (parsedTag.forkVersion !== expectedVersion) {
    throw new Error(
      `Axiom release tag/version mismatch: ${expectedTag} encodes ${parsedTag.forkVersion}, expected ${expectedVersion}`
    )
  }

  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  if (pkg.version !== expectedVersion) {
    throw new Error(
      `package.json version ${pkg.version} does not match Axiom release version ${expectedVersion}`
    )
  }

  console.log(`Axiom release version verified: ${expectedVersion} (${expectedTag})`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
