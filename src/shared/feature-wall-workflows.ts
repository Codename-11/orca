import {
  FEATURE_WALL_TILES,
  isFeatureWallMediaTile,
  type FeatureWallMediaTile,
  type FeatureWallMediaTileId
} from './feature-wall-tiles'

export type FeatureWallWorkflowId =
  | 'start-work'
  | 'coordinate-agents'
  | 'inspect-edit'
  | 'review-ship'
  | 'work-remotely'

// Renderer-only action discriminator. Resolved to a real store call in
// FeatureWallModal — kept as an ID here so this module stays import-safe
// from the main process and tests.
export type FeatureWallInAppActionId =
  | 'open-tasks'
  | 'open-agent-settings'
  | 'focus-terminal'
  | 'open-ssh-settings'

export type FeatureWallPrimaryCta =
  | { kind: 'in-app'; action: FeatureWallInAppActionId; label: string }
  | { kind: 'docs'; label: string; url: string }

export type FeatureWallWorkflow = {
  id: FeatureWallWorkflowId
  title: string
  meta: string
  lede: string
  bullets: readonly string[]
  primaryTileId: FeatureWallMediaTileId
  relatedTileIds: readonly FeatureWallMediaTileId[]
  primaryCta: FeatureWallPrimaryCta
  // Always present; rendered as the secondary action even when the primary
  // CTA is itself a docs link, so users always have an "open the docs page"
  // affordance and the analytics signal stays clean.
  docsUrl: string
}

export const FEATURE_WALL_WORKFLOWS: readonly FeatureWallWorkflow[] = [
  {
    id: 'start-work',
    title: 'Tasks & worktrees',
    meta: 'GitHub · Linear · Orca CLI',
    lede: 'Browse work, spin up isolated worktrees, and let agents drive Orca from the same task surface.',
    bullets: [
      'GitHub and Linear tasks live in Orca, ready to become worktrees.',
      'One worktree per task — branch, terminal, editor, and browser stay together.',
      'Orca CLI lets agents create worktrees, snapshot, click, and fill.'
    ],
    primaryTileId: 'tile-03',
    relatedTileIds: ['tile-01', 'tile-09'],
    primaryCta: { kind: 'in-app', action: 'open-tasks', label: 'Open tasks' },
    docsUrl: 'https://www.onorca.dev/docs/review/linear'
  },
  {
    id: 'coordinate-agents',
    title: 'Agents & orchestration',
    meta: 'Agents · Usage · Shortcuts',
    lede: 'Run several agents at once. Fan one prompt across Claude, Codex, and Cursor — compare results, merge the winner.',
    bullets: [
      'Preconfigured for Claude Code, Codex, Cursor CLI, Gemini, Copilot, OpenCode, and Pi.',
      'See live usage and rate-limit resets in the titlebar.',
      'Jump across worktrees, open files, and remap shortcuts without reaching for the mouse.'
    ],
    primaryTileId: 'tile-04',
    relatedTileIds: ['tile-11', 'tile-10'],
    primaryCta: {
      kind: 'in-app',
      action: 'open-agent-settings',
      label: 'Open agent settings'
    },
    docsUrl: 'https://www.onorca.dev/docs/agents/supported'
  },
  {
    id: 'inspect-edit',
    title: 'Build surface',
    meta: 'Terminal · Editor · Browser',
    lede: 'Understand and modify what agents changed. Each worktree gets its own terminal, Monaco editor, and Chromium window.',
    bullets: [
      'Ghostty-class terminal with WebGL rendering and full scrollback search.',
      "VS Code's editor with autosave, quick-open, and drag-to-agent.",
      'Click any UI element in the embedded browser to send HTML, CSS, and a screenshot to your agent.'
    ],
    primaryTileId: 'tile-02',
    relatedTileIds: ['tile-07', 'tile-05', 'tile-12'],
    primaryCta: { kind: 'in-app', action: 'focus-terminal', label: 'Open terminal' },
    docsUrl: 'https://www.onorca.dev/docs/terminal'
  },
  {
    id: 'review-ship',
    title: 'Review & preview',
    meta: 'Diffs · PRs · Files',
    lede: 'Review changes, preview repo files, and send focused feedback back to the agent without leaving Orca.',
    bullets: [
      'Inline markdown comments on any diff line.',
      'Batch feedback and ship it back to the agent in one click.',
      'Preview PDFs, images, CSV, Markdown, and image diffs next to code review.'
    ],
    primaryTileId: 'tile-08',
    relatedTileIds: ['tile-12'],
    // Why: there is no clean store action that opens "review mode" — the
    // SourceControl sidebar surfaces automatically when a worktree has
    // changes. Falling back to docs keeps the CTA honest; the helper text
    // below the bullets explains the in-app path.
    primaryCta: {
      kind: 'docs',
      label: 'Read review docs',
      url: 'https://www.onorca.dev/docs/review/annotate-ai-diff'
    },
    docsUrl: 'https://www.onorca.dev/docs/review/annotate-ai-diff'
  },
  {
    id: 'work-remotely',
    title: 'Remote development',
    meta: 'SSH · Port forwarding',
    lede: 'Run agents on a beefy remote box with full file editing, git, and terminals — first-class, not advanced-only.',
    bullets: [
      'Auto-reconnect, port forwarding, and passphrase caching out of the box.',
      'Same Orca UI; the heavy lifting happens on the remote host.',
      'Works alongside local worktrees in the same window.'
    ],
    primaryTileId: 'tile-06',
    relatedTileIds: [],
    primaryCta: {
      kind: 'in-app',
      action: 'open-ssh-settings',
      label: 'Open SSH settings'
    },
    docsUrl: 'https://www.onorca.dev/docs/ssh'
  }
] as const

export const FEATURE_WALL_WORKFLOW_IDS = FEATURE_WALL_WORKFLOWS.map(
  (w) => w.id
) as readonly FeatureWallWorkflowId[]

const TILE_BY_ID = new Map(
  FEATURE_WALL_TILES.filter(isFeatureWallMediaTile).map((tile) => [tile.id, tile])
)

export function getFeatureWallMediaTile(id: FeatureWallMediaTileId): FeatureWallMediaTile | null {
  return TILE_BY_ID.get(id) ?? null
}

export function getFeatureWallWorkflow(id: FeatureWallWorkflowId): FeatureWallWorkflow | null {
  return FEATURE_WALL_WORKFLOWS.find((w) => w.id === id) ?? null
}

export const DEFAULT_FEATURE_WALL_WORKFLOW_ID: FeatureWallWorkflowId = 'start-work'
