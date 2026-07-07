import type { CommandSpec } from '../args'
import { GLOBAL_FLAGS } from '../args'

export const UPDATE_COMMAND_SPECS: CommandSpec[] = [
  {
    path: ['update'],
    summary: 'Update the local source CLI runtime from the configured release branch',
    usage:
      'orca update [--branch <ref>] [--runtime-root <path>] [--repo <path>] [--dry-run] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'branch', 'runtime-root', 'repo', 'dry-run'],
    examples: ['orca update', 'orca update --json'],
    notes: [
      'For source/dev runtimes, updates the managed local CLI runtime and repoints the standard orca/orca-dev shims.',
      'Packaged desktop apps use the built-in updater instead of this source-runtime path.'
    ]
  },
  {
    path: ['update', 'cli'],
    summary: 'Update the local source CLI runtime',
    usage:
      'orca update cli [--branch <ref>] [--runtime-root <path>] [--repo <path>] [--dry-run] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'branch', 'runtime-root', 'repo', 'dry-run']
  },
  {
    path: ['update', 'serve'],
    summary: 'Update and restart the local headless serve runtime',
    usage:
      'orca update serve [--branch <ref>] [--runtime-root <path>] [--repo <path>] [--no-restart] [--dry-run] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'branch', 'runtime-root', 'repo', 'no-restart', 'dry-run']
  },
  {
    path: ['update', 'all'],
    summary: 'Update both local CLI and headless serve runtimes',
    usage:
      'orca update all [--branch <ref>] [--runtime-root <path>] [--repo <path>] [--no-restart] [--dry-run] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'branch', 'runtime-root', 'repo', 'no-restart', 'dry-run']
  },
  {
    path: ['update', 'status'],
    summary: 'Show local source runtime update state',
    usage: 'orca update status [--branch <ref>] [--runtime-root <path>] [--repo <path>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'branch', 'runtime-root', 'repo']
  }
]
