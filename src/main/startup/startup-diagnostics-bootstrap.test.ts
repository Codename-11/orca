import { Script } from 'node:vm'

import { describe, expect, it } from 'vitest'

import { createStartupDiagnosticsBanner } from '../../../electron.vite.config'

describe('startup diagnostics bootstrap banner', () => {
  it('emits JavaScript that parses before the main process starts', () => {
    const banner = createStartupDiagnosticsBanner('index.js')

    expect(() => new Script(banner)).not.toThrow()
    expect(banner).toContain('String.fromCharCode(10)')
    expect(banner).not.toContain("message.endsWith('\n')")
    expect(banner).not.toContain("message + '\n'")
  })
})
