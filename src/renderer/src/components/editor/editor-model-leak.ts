// Why: kept Monaco diff models for both plain `mode === 'diff'` tabs and
// edit tabs in Changes view mode survive component unmount because of
// @monaco-editor/react's `keepCurrent*Model` flags. Tab close is the only
// signal we get that the user is done with these models. The URI scheme
// embeds the tab id, so a prefix scan over `monaco.editor.getModels()`
// reliably finds every leaked model — including split-pane variants whose
// URIs gain a `::${viewStateScopeId}` segment, and Changes-mode original
// models whose URIs gain a `:original:${hash}` rotation segment.

export type DiffModelLeakMode = 'changes' | 'diff'

export function findLeakedDiffModelUris(
  uris: readonly string[],
  tabId: string,
  mode: DiffModelLeakMode
): string[] {
  const modifiedPrefix = `diff:modified:${tabId}`
  const originalPrefix = `diff:original:${tabId}`
  const out: string[] = []
  for (const uri of uris) {
    if (uri === modifiedPrefix || uri.startsWith(`${modifiedPrefix}::`)) {
      out.push(uri)
      continue
    }
    if (mode === 'changes') {
      // Why: Changes mode rotates the original-side URI by appending
      // `:original:${hash}` (single-pane) or `::${scope}:original:${hash}`
      // (split-pane). Both are caught by the trailing `:` prefix.
      if (uri.startsWith(`${originalPrefix}:`)) {
        out.push(uri)
      }
    } else {
      // Why: plain diff tabs use the original prefix exactly for single-pane
      // and `::${scope}` for split-pane. `::` is tighter than `:` and avoids
      // accidentally matching unrelated URIs that happen to share a prefix.
      if (uri === originalPrefix || uri.startsWith(`${originalPrefix}::`)) {
        out.push(uri)
      }
    }
  }
  return out
}
