import { describe, expect, it } from 'vitest'
import { parseHostConnectionImportPayload, summarizeHostConnectionImport } from './host-import'

const host = {
  id: 'host-1',
  name: 'Docker Server',
  endpoint: 'ws://172.16.24.250:3000/mobile',
  deviceToken: 'device-token-1',
  publicKeyB64: 'public-key-1',
  lastConnected: 1710000000000
}

describe('host connection import', () => {
  it('accepts the Axiom/Orca host backup envelope', () => {
    const hosts = parseHostConnectionImportPayload(
      JSON.stringify({ kind: 'orca-mobile-hosts', version: 1, hosts: [host] })
    )

    expect(hosts).toEqual([host])
  })

  it('accepts the legacy raw AsyncStorage host array when tokens are present', () => {
    const hosts = parseHostConnectionImportPayload(JSON.stringify([host]))

    expect(hosts).toEqual([host])
  })

  it('rejects host exports that do not include device tokens', () => {
    const { deviceToken: _deviceToken, ...tokenlessHost } = host

    expect(() =>
      parseHostConnectionImportPayload(
        JSON.stringify({ kind: 'orca-mobile-hosts', version: 1, hosts: [tokenlessHost] })
      )
    ).toThrow(/device token/i)
  })

  it('summarizes imported, duplicate, and invalid records before saving', () => {
    const existing = [{ ...host }]
    const fresh = { ...host, id: 'host-2', name: 'Laptop', deviceToken: 'device-token-2' }
    const invalid = { ...host, id: '', name: 'Broken' }

    expect(summarizeHostConnectionImport(existing, [host, fresh, invalid])).toEqual({
      hostsToSave: [fresh],
      importedCount: 1,
      skippedDuplicateCount: 1,
      skippedInvalidCount: 1
    })
  })
})
