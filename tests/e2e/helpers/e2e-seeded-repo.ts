import { expect as playwrightExpect, type Page } from '@stablyai/playwright-test'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { TEST_REPO_PATH_FILE } from '../global-setup'

export function isValidGitRepo(repoPath: string): boolean {
  if (!repoPath || !existsSync(repoPath)) {
    return false
  }

  try {
    return (
      execSync('git rev-parse --is-inside-work-tree', {
        cwd: repoPath,
        stdio: 'pipe',
        encoding: 'utf8'
      }).trim() === 'true'
    )
  } catch {
    return false
  }
}

export function createSeededTestRepo(): string {
  // Why: realpathSync so the seeded path matches the store's repo.path on
  // macOS, where os.tmpdir() (/var/...) symlinks to /private/var/... and the
  // app canonicalizes repo.path via `git rev-parse --show-toplevel` on add.
  const testRepoDir = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'orca-e2e-repo-')))

  execSync('git init', { cwd: testRepoDir, stdio: 'pipe' })
  execSync('git config user.email "e2e@test.local"', { cwd: testRepoDir, stdio: 'pipe' })
  execSync('git config user.name "E2E Test"', { cwd: testRepoDir, stdio: 'pipe' })

  writeFileSync(
    path.join(testRepoDir, 'README.md'),
    '# Orca E2E Test Repo\n\nThis repo was created automatically for Playwright tests.\n'
  )
  writeFileSync(path.join(testRepoDir, 'CLAUDE.md'), '# CLAUDE.md\n\nTest instructions for E2E.\n')
  writeFileSync(
    path.join(testRepoDir, 'package.json'),
    `${JSON.stringify({ name: 'orca-e2e-test', version: '0.0.0', private: true }, null, 2)}\n`
  )
  writeFileSync(path.join(testRepoDir, '.gitignore'), 'node_modules/\n')
  mkdirSync(path.join(testRepoDir, 'src'), { recursive: true })
  writeFileSync(path.join(testRepoDir, 'src', 'index.ts'), 'export const hello = "world"\n')

  execSync('git add -A', { cwd: testRepoDir, stdio: 'pipe' })
  execSync('git commit -m "Initial commit for E2E tests"', { cwd: testRepoDir, stdio: 'pipe' })

  // Why: worker-scoped fixture fallbacks can run in parallel; UUIDs avoid
  // colliding on the same temp repo/worktree when workers start together.
  const worktreeDir = path.join(testRepoDir, '..', `orca-e2e-worktree-${randomUUID()}`)
  execSync(`git worktree add "${worktreeDir}" -b e2e-secondary`, {
    cwd: testRepoDir,
    stdio: 'pipe'
  })

  writeFileSync(TEST_REPO_PATH_FILE, testRepoDir)
  return testRepoDir
}

export async function ensureSeededTestRepoSessionReady(page: Page, testRepoPath: string): Promise<void> {
  const repoPath = isValidGitRepo(testRepoPath) ? testRepoPath : createSeededTestRepo()

  // Add the test repo via the IPC bridge. Why: calling window.api.repos.add()
  // goes through the same code path as the "Add Project" UI flow, ensuring
  // worktrees are fetched and the session initializes properly.
  await page.evaluate(async (repoPath) => {
    await window.api.repos.add({ path: repoPath })
  }, repoPath)

  // Fetch repos in the renderer store so it picks up the new repo, then opt
  // this disposable repo into showing external worktrees.
  await playwrightExpect
    .poll(
      () =>
        page.evaluate(async (repoPath) => {
          const store = window.__store
          if (!store) {
            return false
          }
          await store.getState().fetchRepos()
          const repo = store.getState().repos.find((candidate) => candidate.path === repoPath)
          if (!repo) {
            return false
          }
          // Why: the fixture deliberately creates external Git worktrees. New
          // repos hide those by default after the visibility rollout.
          await store.getState().updateRepo(repo.id, { externalWorktreeVisibility: 'show' })
          return true
        }, repoPath),
      {
        timeout: 30_000,
        message: `Expected e2e repo to be loaded: ${repoPath}`
      }
    )
    .toBe(true)

  // Best-effort fetch of every repo's worktrees. Why: the renderer can still
  // re-navigate during initial hydration and destroy the execution context
  // mid-evaluate; the authoritative seeded-worktree poll below is the real wait.
  await page
    .evaluate(async () => {
      const store = window.__store
      if (!store) {
        return
      }
      const repos = store.getState().repos
      for (const repo of repos) {
        await store.getState().fetchWorktrees(repo.id)
      }
    })
    .catch(() => false)

  // Why: parallel specs mutate real git worktrees in the shared fixture repo.
  // A first scan can briefly return no rows while git holds a worktree lock,
  // so poll the public fetch path until the seeded primary + secondary load.
  await playwrightExpect
    .poll(
      () =>
        page.evaluate(async (repoPath) => {
          const store = window.__store
          if (!store) {
            return 0
          }
          const repo = store.getState().repos.find((candidate) => candidate.path === repoPath)
          if (!repo) {
            return 0
          }
          await store.getState().fetchWorktrees(repo.id)
          return store.getState().worktreesByRepo[repo.id]?.length ?? 0
        }, repoPath),
      {
        timeout: 30_000,
        message: 'seeded e2e worktrees did not load'
      }
    )
    .toBeGreaterThanOrEqual(2)

  // Wait for workspaceSessionReady to become true.
  await page.waitForFunction(
    () => {
      const store = window.__store
      return store?.getState().workspaceSessionReady === true
    },
    null,
    { timeout: 30_000 }
  )

  // Re-activate the test repo's primary worktree after session hydration.
  await page.evaluate((repoPath: string) => {
    const store = window.__store
    if (!store) {
      return
    }

    const state = store.getState()
    const allWorktrees = Object.values(state.worktreesByRepo).flat()
    const testWorktree = allWorktrees.find(
      (worktree) => worktree.path === repoPath || worktree.path.startsWith(repoPath)
    )
    if (testWorktree) {
      state.setActiveWorktree(testWorktree.id)
    }
  }, repoPath)

  // Best-effort seed of a baseline terminal tab when a fresh isolated profile
  // has none yet. Terminal-focused suites call ensureTerminalVisible(), which
  // performs the authoritative wait.
  await page.evaluate(() => {
    const store = window.__store
    if (!store) {
      return
    }
    const state = store.getState()
    if (!state.activeWorktreeId) {
      return
    }
    const tabs = state.tabsByWorktree[state.activeWorktreeId] ?? []
    if (tabs.length === 0) {
      state.createTab(state.activeWorktreeId)
    }
  })
}
