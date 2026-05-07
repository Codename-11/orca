// Bucket errors thrown by `createLocalWorktree` / `createRemoteWorktree` into
// the `workspace_create_failed` event's `error_class` enum.
//
// Why: the throw sites are bare `throw new Error('...')` calls in
// worktree-remote.ts, some of which interpolate user-controlled content
// (branch names, paths). The classifier reads `error.message` to bucket, but
// the matched strings never cross the wire — only the enum value does. The
// schema discipline at telemetry-events.ts §"Properties to keep off these
// events" is what makes that safe.
//
// Substring set is intentionally narrow: per the schema-evolution doctrine,
// widening this match set later requires explicit review, not silent regex
// expansion. Anything we cannot confidently bucket falls through to `unknown`.

import type { WorkspaceCreateErrorClass } from '../../shared/telemetry-events'

export function classifyWorkspaceCreateError(error: unknown): WorkspaceCreateErrorClass {
  const message = error instanceof Error ? error.message : ''
  const stderr = error instanceof Error ? (error as { stderr?: unknown }).stderr : ''
  // Why: throw sites mix capitalization ('Worktree created...' vs lowercased
  // git stderr); normalize once so all anchors below can be lowercase literals.
  const text = `${message} ${typeof stderr === 'string' ? stderr : ''}`.toLowerCase()

  if (text.includes('could not resolve a default base ref')) {
    return 'base_ref_missing'
  }
  if (
    text.includes('already exists') ||
    text.includes('already has pr') ||
    text.includes('could not find an available worktree name')
  ) {
    return 'path_collision'
  }
  if (text.includes('eacces') || text.includes('eperm') || text.includes('permission denied')) {
    return 'permission_denied'
  }
  // Why: anchors are intentionally specific to true git failures from
  // worktree-remote.ts. Bare 'git ' / 'worktree' would mis-bucket SSH-relay
  // and sparse-checkout validation errors (which the design doc routes to
  // 'unknown'); 'created but not found in listing' covers the formerly
  // miscased 'Worktree created but not found in listing' throw.
  if (
    text.includes('fatal:') ||
    text.includes('git worktree') ||
    text.includes('created but not found in listing') ||
    text.includes('no git provider')
  ) {
    return 'git_failed'
  }
  return 'unknown'
}
