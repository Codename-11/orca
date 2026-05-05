# Changes View Mode — Follow-up Findings from PR #1353 Review

## Background

PR #1353 (`feat(editor): Changes view mode — in-tab HEAD-vs-working-tree diff`, merged) added the ability to render an edit-mode tab as a `DiffViewer` against `HEAD` without spawning a separate diff tab. Mode is keyed off `editorViewMode[fileId] === 'changes'` in the editor store, and the surface is rendered by `src/renderer/src/components/editor/ChangesModeView.tsx` via the existing `DiffViewer`.

After merge, an external review surfaced five concerns. Three are real and load-bearing, two are comment-accuracy nits, and one is incorrect because it missed an existing equality short-circuit. This doc captures the analysis behind each one so a follow-up PR can fix the real ones without re-deriving the context.

References:

- `src/renderer/src/components/editor/ChangesModeView.tsx`
- `src/renderer/src/components/editor/DiffViewer.tsx`
- `src/renderer/src/components/editor/EditorPanel.tsx`
- `src/renderer/src/components/right-sidebar/SourceControl.tsx`
- `src/renderer/src/store/slices/editor.ts`

## Finding 1 — Rotating original-model URI leaks Monaco models (REAL, MEDIUM)

### What the code does

`ChangesModeView.tsx`:

```ts
const headContentSignature = getContentSignature(dc.originalContent)
const originalModelKey = `${diffViewStateKey}:original:${headContentSignature}`
```

The original-side model URI is rotated whenever the HEAD blob's contents change. The rotation is intentional — the comment at `ChangesModeView.tsx:68-72` explains that after a terminal commit/pull/rebase, Monaco can otherwise keep painting the previous diff against a stale kept model.

`DiffViewer.tsx:280-283` then passes that key through:

```tsx
originalModelPath={`diff:original:${resolvedOriginalModelKey}`}
modifiedModelPath={`diff:modified:${resolvedModifiedModelKey}`}
keepCurrentOriginalModel
keepCurrentModifiedModel
```

### Why it leaks

`@monaco-editor/react`'s `keepCurrentOriginalModel` flag tells the wrapper "do not dispose the original model when this editor unmounts or its path prop changes." When `originalModelPath` changes (because the HEAD content changed and so the hash flipped), the wrapper:

1. Looks up or creates a new model at the new URI.
2. Swaps it into the diff editor.
3. Leaves the previous model registered in `monaco.editor.getModels()`.

Across a long session — repeated commits, pulls, rebases, external writes — Monaco's global model registry grows unboundedly. There is no garbage-collection path: the old URI is never re-derived (the hash is content-addressed), and nothing else disposes it.

### Fix

**Track and dispose the previous original-model URI on rotation.** Snapshot the previous `originalModelKey` in a ref; on every rotation, look up `monaco.editor.getModel(monaco.Uri.parse(prev))` and dispose it.

A naive "just drop `keepCurrentOriginalModel`" does **not** fix this leak. Reading `node_modules/@monaco-editor/react/dist/index.js`, the wrapper only consults that flag in its unmount cleanup — the path-change effect calls `setModel(newModel)` on `originalModelPath` change but never disposes the previously-attached model regardless of the flag. Flipping it would only dispose the *currently-attached* model on unmount; the N−1 already-rotated-out models would still leak.

Explicit URI-based disposal at the rotation site is also the pattern already used by `case 'diff'` cleanup in `EditorPanel.tsx:254-298`, so it keeps the leak-management strategy consistent across modes.

### Test plan

- Open a markdown file in Changes mode.
- In a terminal, commit/amend the file ten times (e.g. `git commit --amend --no-edit` after touching it).
- After each commit, confirm `monaco.editor.getModels().filter(m => m.uri.toString().startsWith('diff:original:')).length` does not grow.

## Finding 2 — Changes-mode diff models not disposed on tab close (REAL, MEDIUM)

### What the code does

`EditorPanel.tsx:245-302` runs a cleanup effect on `openFiles` change. For each tab that disappeared, it disposes the kept Monaco state owned by that tab's mode:

```ts
switch (prevFile.mode) {
  case 'edit':
    monaco.editor.getModel(monaco.Uri.parse(prevFile.filePath))?.dispose()
    // ...scrollTopCache / cursorPositionCache cleanup
    break
  case 'diff':
    monaco.editor.getModel(monaco.Uri.parse(`diff:original:${prevId}`))?.dispose()
    monaco.editor.getModel(monaco.Uri.parse(`diff:modified:${prevId}`))?.dispose()
    diffViewStateCache.delete(prevId)
    // ...
    break
  // ...
}
```

### Why it leaks

A Changes-mode tab is structurally an `edit` tab — `mode === 'edit'`, with `editorViewMode[id] === 'changes'` overlaid on top. While that tab is open, its `DiffViewer` mounts kept models at:

- `diff:original:${diffViewStateKey}:original:${hash}` (the rotated key from finding 1)
- `diff:modified:${diffViewStateKey}`

Both have `keepCurrent*Model` set, so they survive the `DiffViewer` unmount that happens when the tab is closed.

When the tab is closed, the cleanup hits `case 'edit'` and disposes only the plain edit model at `prevFile.filePath`. The `case 'diff'` branch never runs, so the two kept Changes-mode models stay in `monaco.editor.getModels()` forever.

This compounds with finding 1. Each rotation contributes a leaked original model; tab close then fails to clean up even the latest one.

### Fix

Inside `case 'edit'`, unconditionally dispose any Changes-mode diff models that match this tab's id prefix. Approximate shape:

```ts
case 'edit':
  monaco.editor.getModel(monaco.Uri.parse(prevFile.filePath))?.dispose()
  // Dispose Changes-mode diff models for this tab if any exist.
  // Prefix-scan handles both single-pane (diff:*:${prevId}[:...])
  // and split-pane (diff:*:${prevId}::${scope}[:...]) URI shapes.
  const modifiedPrefix = `diff:modified:${prevId}`
  const originalPrefix = `diff:original:${prevId}`
  for (const model of monaco.editor.getModels()) {
    const uri = model.uri.toString()
    if (
      uri === modifiedPrefix ||
      uri.startsWith(`${modifiedPrefix}::`) ||
      uri.startsWith(`${originalPrefix}:`)
    ) {
      model.dispose()
    }
  }
  diffViewStateCache.delete(prevId)
  deleteCacheEntriesByPrefix(diffViewStateCache, `${prevId}::`)
  // ...existing scroll/cursor cleanup
  break
```

Two subtleties: the original-side URI cannot be reconstructed from `prevId` alone (the hash is unknown at close time), so we iterate `monaco.editor.getModels()` and dispose by prefix match. And both the modified and original prefixes must cover the split-pane URI shape — `EditorContent.tsx:89-90` appends `::${viewStateScopeId}` to non-primary panes' `diffViewStateKey`, so a secondary pane's models look like `diff:modified:${prevId}::${scope}` and `diff:original:${prevId}::${scope}:original:${hash}`. The prefix scan above covers both shapes; the registry is small, so the iteration cost is trivial.

The same defect class exists in `case 'diff'` at `EditorPanel.tsx:285-286`, which disposes `diff:original:${prevId}` and `diff:modified:${prevId}` by exact URI and so leaks the secondary-pane models for plain diff tabs too. Fix it in the same PR using a prefix-scan of the same shape — but note the predicate diverges from `case 'edit'`: plain diff tabs have no `:original:${hash}` rotation, so the original-side single-pane URI is `diff:original:${prevId}` exactly (no trailing `:`), and the predicate must include an exact `uri === originalPrefix` clause. Concretely:

```ts
uri === modifiedPrefix ||
uri === originalPrefix ||
uri.startsWith(`${modifiedPrefix}::`) ||
uri.startsWith(`${originalPrefix}::`)
```

(`::` is tighter than `:` for the split-pane match and avoids surprising matches.) Either parameterize a single helper on `mode: 'changes' | 'diff'` to accept both URI shapes, or split into two helpers — either way, the unit test must cover both modes.

We deliberately do **not** gate this on `editorViewModeRef.current[prevId] === 'changes'`. `closeFile` in `editor.ts:781-782` deletes `editorViewMode[fileId]` synchronously inside the same `set()` call that removes the file from `openFiles`, so by the time this cleanup effect fires (after React commits the new render) the ref has already been cleared. Disposal-by-prefix is correct unconditionally: if the tab was never in Changes mode, the lookup misses and the calls are no-ops.

### Test plan

- Open a file in Changes mode, type some edits, close the tab.
- Inspect `monaco.editor.getModels()`. Confirm no `diff:original:${id}*` or `diff:modified:${id}` entries remain for the closed tab.
- Repeat 50× in one session and confirm the model registry stays bounded.

## Finding 3 — HEAD refetch on every git-status poll (NOT REAL)

### The claim

`EditorPanel.tsx:478-494` re-runs `loadDiffContent` whenever `changesStatusEntries = gitStatusByWorktree[worktreeId]` changes identity. The reviewer asserted that `setGitStatus` rebuilds the entries array on every poll, so the effect retriggers every ~3s and dispatches a redundant `git:diff` IPC.

### Why it's wrong

`setGitStatus` in `src/renderer/src/store/slices/editor.ts:1600-1684` short-circuits no-op polls:

```ts
const statusUnchanged = areGitStatusEntriesEqual(prevEntries, nextEntries)
// ...
return {
  // ...
  gitStatusByWorktree: statusUnchanged
    ? s.gitStatusByWorktree
    : { ...s.gitStatusByWorktree, [worktreeId]: nextEntries },
  // ...
}
```

`areGitStatusEntriesEqual` (`editor.ts:2068-2082`) does a structural compare across path/status/area/oldPath/conflictKind/conflictStatus/conflictStatusSource. When entries are unchanged, the *same array reference* is reused, so `gitStatusByWorktree[worktreeId]` retains identity across no-op polls and the effect does not refire.

The effect refires only when the working-tree state actually changed (file added/staged/modified/etc.) — which is the documented intent at `EditorPanel.tsx:462-466` ("the cheapest signal we have that HEAD moved").

### Caveat

There is a narrow gap: a HEAD move that leaves the unstaged file set byte-identical (e.g. `git commit` then immediately re-touch the file to the same diff) won't refire the effect. That's a separate, much smaller bug than the one filed. Not addressing here.

## Finding 4 — Sidebar Changes-mode comment has one imprecise phrase (REAL but cosmetic, LOW)

### What the code does

`SourceControl.tsx:518-539`:

```ts
const language = detectLanguage(entry.path)
const filePath = joinPath(worktreePath, entry.path)
// Why: unstaged markdown diffs open as a normal edit tab in Changes
// view mode rather than a dedicated diff tab. This unifies sidebar
// clicks with the header's Edit|Changes toggle: there is exactly one
// tab per markdown file, and the sidebar click flips that tab's view
// mode. Staged diffs still open as a separate diff tab because the
// staged content is not what the editor would be editing. Non-markdown
// files keep the existing diff-tab flow until the diff-tab type is
// eventually collapsed (see reviews/changes-view-mode-plan.md §"Follow-up").
if (language === 'markdown' && entry.area === 'unstaged') {
  openFile({ filePath, relativePath: entry.path, worktreeId, language, mode: 'edit' })
  setEditorViewMode(filePath, 'changes')
  return
}
openDiff(activeWorktreeId, filePath, entry.path, language, entry.area === 'staged')
```

### Why the comment is imprecise

The comment is technically internally consistent — the staged-diff carve-out is spelled out three lines after the "exactly one tab per markdown file" framing. The only friction is the phrase "exactly one tab per markdown file" reading as an absolute when in fact a staged diff tab can coexist with the edit tab. Minor wording polish, not a substantive change.

### Fix

Replace the phrase "exactly one tab per markdown file" with "one edit tab per markdown filePath; staged diffs are still separate tabs", so the carve-out is consistent within a single sentence rather than landing three lines later. No code change.

## Finding 5 — `inFlightDiffKey` comment claims dedup that cannot happen (REAL but cosmetic, LOW)

### What the code does

`EditorPanel.tsx:116-131`:

```ts
function inFlightDiffKey(
  file: OpenFile,
  connectionId: string | undefined,
  compareAgainstHead = false
): string {
  // ...
  return `${connectionId ?? ''}::${file.diffSource ?? ''}::${compareAgainstHead ? 'head' : 'default'}::${file.filePath}::${branch}`
}
```

And the call site at `EditorPanel.tsx:397-410`:

```ts
// Why: Changes view mode runs on top of an edit-mode tab and asks git
// for an unstaged diff against HEAD for that file. Use the 'unstaged'
// diff-source key so multiple Changes tabs across split panes share one
// IPC round-trip with any open unstaged diff-tab for the same path.
```

### Why the comment is wrong

The key embeds `compareAgainstHead ? 'head' : 'default'`. Changes-mode requests use `'head'` (because `compareAgainstHead = file.mode === 'edit'`); plain unstaged diff-tab requests use `'default'`. The two segments differ even when `diffSource` is normalized to `'unstaged'` for both, so no entry collision is possible.

The merging that *does* happen is between two split-pane Changes-mode panels viewing the same file (both `'head'`, both same `diffSource`). That's correct and worth preserving — but it's narrower than the comment claims.

### Fix

Update the comment to reflect actual behavior. Suggested wording:

```
// Why: Changes view mode runs on top of an edit-mode tab and asks git
// for an unstaged diff against HEAD. Two split-pane Changes panels for
// the same file share a single IPC round-trip; cross-mode sharing with
// a separate unstaged diff-tab is intentionally not done because the
// 'head' vs 'default' compare-against-head segment of the key differs.
```

No code change.

### P2 follow-up (out of scope here)

The fact that the comment was wrong points at a deeper smell: `compareAgainstHead` and `effectiveDiffSource` are two separate rewrites of the diff request that work at cross-purposes — one normalizes `diffSource` toward `'unstaged'` to encourage sharing, the other partitions the cache key on `'head'` vs `'default'` to prevent it. The current PR fixes the comment only. A follow-up should reconcile the two rewrites (either share across modes or stop pretending to) and is tracked as P2.

## Suggested PR Shape

A single follow-up PR is enough:

1. **Fix #1 + #2 together.** They share a model-leak class. Add explicit URI-based disposal at the rotation site in `ChangesModeView` (#1) and extend `case 'edit'` in the close-cleanup switch to dispose Changes-mode diff models by prefix scan (#2).
2. **Add a leak-watchdog regression test.** Mounting `@monaco-editor/react` under vitest+jsdom has no precedent in this repo (existing editor specs like `diff-editor-line-number-options.test.ts` use a hand-rolled `createMockCodeEditor`; `monaco-programmatic-sync.test.ts` is pure-logic). Don't introduce Monaco mount infrastructure in this PR — extract the URI-prefix-match decision into a pure helper and test it directly. The helper's predicate must be parameterized to accept both URI shapes (Changes-mode and plain-diff), since the `case 'diff'` predicate needs an exact `uri === originalPrefix` clause that the `case 'edit'` predicate does not. New vitest alongside the source at `src/renderer/src/components/editor/editor-model-leak.test.ts` (matches the convention; no `__tests__/` folder in this tree). Use `beforeEach`/`afterEach` to set per-`it` baselines. Feed the helper a fake `getModels()` snapshot covering Changes-mode single-pane, Changes-mode split-pane (`::scope`), rotated-original (`:original:${hash}`), plain-diff single-pane (`diff:original:${prevId}` exact), plain-diff split-pane (`diff:original:${prevId}::${scope}`), and unrelated URIs; assert exactly the leaked URIs are flagged for disposal in each mode. For Finding 1's rotation case, assert "exactly 1 attached `diff:original:${diffViewStateKey}:original:` model after N rotations" rather than the looser "does not grow."
3. **Fix #4 + #5.** Comment-only edits, drop in the same PR.
4. **Skip #3.** Premise was wrong; no change.
