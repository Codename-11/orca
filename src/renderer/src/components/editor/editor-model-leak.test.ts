import { describe, expect, it } from 'vitest'
import { findLeakedDiffModelUris } from './editor-model-leak'

describe('findLeakedDiffModelUris — changes mode', () => {
  const tabId = 'tab-abc'

  it('flags single-pane modified and rotated original URIs', () => {
    const uris = [
      `diff:modified:${tabId}`,
      `diff:original:${tabId}:original:deadbeef`,
      `diff:original:other-tab:original:cafebabe`,
      `diff:modified:other-tab`,
      `unrelated:foo`
    ]
    expect(findLeakedDiffModelUris(uris, tabId, 'changes')).toEqual([
      `diff:modified:${tabId}`,
      `diff:original:${tabId}:original:deadbeef`
    ])
  })

  it('flags split-pane modified and rotated original URIs', () => {
    const uris = [
      `diff:modified:${tabId}::pane-2`,
      `diff:original:${tabId}::pane-2:original:deadbeef`,
      `diff:modified:${tabId}::pane-3`,
      `diff:original:${tabId}::pane-3:original:cafebabe`
    ]
    expect(findLeakedDiffModelUris(uris, tabId, 'changes').sort()).toEqual(
      [
        `diff:modified:${tabId}::pane-2`,
        `diff:modified:${tabId}::pane-3`,
        `diff:original:${tabId}::pane-2:original:deadbeef`,
        `diff:original:${tabId}::pane-3:original:cafebabe`
      ].sort()
    )
  })

  it('handles multiple rotations of the same tab simultaneously', () => {
    const uris = [
      `diff:modified:${tabId}`,
      `diff:original:${tabId}:original:hash1`,
      `diff:original:${tabId}:original:hash2`,
      `diff:original:${tabId}:original:hash3`
    ]
    expect(findLeakedDiffModelUris(uris, tabId, 'changes').sort()).toEqual(
      [
        `diff:modified:${tabId}`,
        `diff:original:${tabId}:original:hash1`,
        `diff:original:${tabId}:original:hash2`,
        `diff:original:${tabId}:original:hash3`
      ].sort()
    )
  })

  it('does not match a tab id whose prefix is shared with a longer id', () => {
    const uris = [
      `diff:modified:${tabId}-extended`,
      `diff:original:${tabId}-extended:original:hash`
    ]
    expect(findLeakedDiffModelUris(uris, tabId, 'changes')).toEqual([])
  })

  it('does not flag a plain-diff style original URI in changes mode', () => {
    // Why: in changes mode the original URI always has a `:original:${hash}`
    // suffix, so a bare `diff:original:${tabId}` (no trailing `:`) belongs to
    // a plain diff tab and must not match.
    const uris = [`diff:original:${tabId}`]
    expect(findLeakedDiffModelUris(uris, tabId, 'changes')).toEqual([])
  })
})

describe('findLeakedDiffModelUris — diff mode', () => {
  const tabId = 'tab-xyz'

  it('flags single-pane modified and exact original URIs', () => {
    const uris = [
      `diff:modified:${tabId}`,
      `diff:original:${tabId}`,
      `diff:modified:other-tab`,
      `diff:original:other-tab`
    ]
    expect(findLeakedDiffModelUris(uris, tabId, 'diff').sort()).toEqual(
      [`diff:modified:${tabId}`, `diff:original:${tabId}`].sort()
    )
  })

  it('flags split-pane modified and original URIs', () => {
    const uris = [
      `diff:modified:${tabId}::pane-2`,
      `diff:original:${tabId}::pane-2`,
      `diff:modified:${tabId}::pane-3`,
      `diff:original:${tabId}::pane-3`
    ]
    expect(findLeakedDiffModelUris(uris, tabId, 'diff').sort()).toEqual(
      [
        `diff:modified:${tabId}::pane-2`,
        `diff:modified:${tabId}::pane-3`,
        `diff:original:${tabId}::pane-2`,
        `diff:original:${tabId}::pane-3`
      ].sort()
    )
  })

  it('does not flag a rotated-original URI in diff mode', () => {
    // Why: plain diff tabs do not rotate the original URI, so a URI with a
    // `:original:${hash}` suffix belongs to a Changes-mode tab and must not
    // be disposed when a plain diff tab closes.
    const uris = [`diff:original:${tabId}:original:hash`]
    expect(findLeakedDiffModelUris(uris, tabId, 'diff')).toEqual([])
  })

  it('returns empty when no URIs match', () => {
    const uris = [`diff:modified:other`, `unrelated:foo`, `bar`]
    expect(findLeakedDiffModelUris(uris, tabId, 'diff')).toEqual([])
  })
})
