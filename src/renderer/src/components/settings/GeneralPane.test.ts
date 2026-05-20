import { describe, expect, it } from 'vitest'
import { formatAppBuildLabel, shouldCommitOpenInApplicationsDraft } from './GeneralPane'

describe('GeneralPane open-in application drafts', () => {
  it('does not commit rows until both label and command are present', () => {
    expect(
      shouldCommitOpenInApplicationsDraft([{ id: 'draft', label: 'Cursor', command: '' }])
    ).toBe(false)
    expect(
      shouldCommitOpenInApplicationsDraft([{ id: 'draft', label: '', command: 'cursor' }])
    ).toBe(false)
    expect(
      shouldCommitOpenInApplicationsDraft([{ id: 'draft', label: '   ', command: 'cursor' }])
    ).toBe(false)
    expect(
      shouldCommitOpenInApplicationsDraft([{ id: 'draft', label: 'Cursor', command: '   ' }])
    ).toBe(false)
  })

  it('allows commit when every draft row has a label and command', () => {
    expect(shouldCommitOpenInApplicationsDraft([])).toBe(true)
    expect(
      shouldCommitOpenInApplicationsDraft([{ id: 'cursor', label: 'Cursor', command: 'cursor' }])
    ).toBe(true)
    expect(
      shouldCommitOpenInApplicationsDraft([
        { id: 'cursor', label: 'Cursor', command: 'cursor' },
        { id: 'zed', label: 'Zed', command: 'zed' }
      ])
    ).toBe(true)
  })
})

describe('GeneralPane build identity label', () => {
  it('includes the visible app name before the version', () => {
    expect(formatAppBuildLabel({ name: 'Axiom Orca', version: '1.4.9-axiom.1' })).toBe(
      'Axiom Orca 1.4.9-axiom.1'
    )
  })

  it('falls back to Orca while build identity is loading', () => {
    expect(formatAppBuildLabel(null)).toBe('Orca …')
  })
})
