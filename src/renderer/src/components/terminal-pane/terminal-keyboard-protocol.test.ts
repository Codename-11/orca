import { describe, expect, it } from 'vitest'
import { shouldDisableKittyKeyboardForTerminal } from './terminal-keyboard-protocol'

describe('shouldDisableKittyKeyboardForTerminal', () => {
  it('disables Kitty keyboard for local Windows terminals', () => {
    expect(
      shouldDisableKittyKeyboardForTerminal({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        connectionId: null
      })
    ).toBe(true)
  })

  it('keeps Kitty keyboard enabled for SSH terminals from Windows clients', () => {
    expect(
      shouldDisableKittyKeyboardForTerminal({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        connectionId: 'ssh-target-1'
      })
    ).toBe(false)
  })

  it('keeps Kitty keyboard enabled on non-Windows clients', () => {
    expect(
      shouldDisableKittyKeyboardForTerminal({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        connectionId: null
      })
    ).toBe(false)
  })

  it('keeps Kitty keyboard enabled until connection state is known', () => {
    expect(
      shouldDisableKittyKeyboardForTerminal({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        connectionId: undefined
      })
    ).toBe(false)
  })
})
