import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { inferDefaultUpdateBranch } from './paths'
import { formatStatus } from './status'

function fixtureRepo(version: string, originUrl: string): string {
  const root = path.join(
    tmpdir(),
    `orca-update-${process.pid}-${Math.random().toString(16).slice(2)}`
  )
  mkdirSync(root, { recursive: true })
  writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version }))
  execFileSync('git', ['init'], { cwd: root, stdio: 'ignore' })
  execFileSync('git', ['remote', 'add', 'origin', originUrl], { cwd: root, stdio: 'ignore' })
  return root
}

describe('local source update branch inference', () => {
  it('uses axiom/deploy for Axiom fork versions', () => {
    const root = fixtureRepo('1.4.126-axiom.1', 'https://github.com/example/orca.git')

    expect(inferDefaultUpdateBranch(root)).toBe('origin/axiom/deploy')
  })

  it('uses axiom/deploy for Codename-11/orca origins', () => {
    const root = fixtureRepo('1.4.126', 'git@github.com:Codename-11/orca.git')

    expect(inferDefaultUpdateBranch(root)).toBe('origin/axiom/deploy')
  })

  it('uses origin/main for upstream-compatible source checkouts', () => {
    const root = fixtureRepo('1.4.126', 'https://github.com/stablyai/orca.git')

    expect(inferDefaultUpdateBranch(root)).toBe('origin/main')
  })
})

describe('local source update status formatting', () => {
  it('shows normal orca shim and serve runtime state', () => {
    expect(
      formatStatus({
        sourceRoot: '/repo/orca',
        branch: 'origin/axiom/deploy',
        runtimeRoot: '/runtime',
        cliPath: '/home/me/.local/bin/orca',
        cliTarget: '/runtime/cli/config/scripts/orca-dev.mjs',
        cliRuntime: {
          path: '/runtime/cli',
          version: '1.4.126-axiom.1',
          sha: 'abc1234',
          ref: 'HEAD',
          dirty: false
        },
        serveUnit: '/home/me/.config/systemd/user/orca-serve.service',
        serveUnitExists: true,
        serveRuntime: null
      })
    ).toContain('CLI shim: /home/me/.local/bin/orca -> /runtime/cli/config/scripts/orca-dev.mjs')
  })
})
