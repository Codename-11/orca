import { beforeEach, describe, expect, it, vi } from 'vitest'

const fileSystemMocks = vi.hoisted(() => ({
  readAsStringAsync: vi.fn()
}))

vi.mock('expo-file-system/legacy', () => fileSystemMocks)

import { readImportFileText } from './import-file-reader'

describe('import file reader', () => {
  beforeEach(() => {
    fileSystemMocks.readAsStringAsync.mockReset()
  })

  it('reads selected backup files through the Expo legacy filesystem API', async () => {
    fileSystemMocks.readAsStringAsync.mockResolvedValue('{"kind":"orca-mobile-hosts"}')

    await expect(readImportFileText('content://picked-backup.json')).resolves.toBe(
      '{"kind":"orca-mobile-hosts"}'
    )
    expect(fileSystemMocks.readAsStringAsync).toHaveBeenCalledWith('content://picked-backup.json', {
      encoding: 'utf8'
    })
  })
})
