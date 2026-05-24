import * as FileSystem from 'expo-file-system/legacy'

export async function readImportFileText(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, { encoding: 'utf8' })
}
