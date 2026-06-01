import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as DocumentPicker from 'expo-document-picker'
import { ChevronLeft, FileJson, ShieldAlert } from 'lucide-react-native'
import { colors, radii, spacing, typography } from '../src/theme/mobile-theme'
import { readImportFileText } from '../src/transport/import-file-reader'
import {
  parseHostConnectionImportPayload,
  summarizeHostConnectionImport
} from '../src/transport/host-import'
import { loadHosts, saveHost } from '../src/transport/host-store'

function formatImportSummary(importedCount: number, skippedDuplicateCount: number): string {
  const imported = `${importedCount} connection${importedCount === 1 ? '' : 's'} imported`
  if (skippedDuplicateCount === 0) {
    return imported
  }
  return `${imported}; ${skippedDuplicateCount} duplicate${skippedDuplicateCount === 1 ? '' : 's'} skipped`
}

export default function ImportConnectionsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function importBackup() {
    if (busy) {
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ['application/json', 'text/json', 'text/plain', '*/*']
      })
      if (result.canceled) {
        return
      }
      const asset = result.assets[0]
      if (!asset?.uri) {
        throw new Error('No file was selected.')
      }
      const text = await readImportFileText(asset.uri)
      const importedHosts = parseHostConnectionImportPayload(text)
      const existingHosts = await loadHosts()
      const summary = summarizeHostConnectionImport(existingHosts, importedHosts)
      for (const host of summary.hostsToSave) {
        await saveHost(host)
      }
      const message = formatImportSummary(summary.importedCount, summary.skippedDuplicateCount)
      setStatus(message)
      Alert.alert('Import complete', message, [
        { text: 'Back to hosts', onPress: () => router.replace('/') }
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setStatus(message)
      Alert.alert('Import failed', message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.heading}>Import Connections</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <FileJson size={22} color={colors.textPrimary} />
        </View>
        <Text style={styles.title}>Import saved desktop connections</Text>
        <Text style={styles.body}>
          Select an Orca connection backup JSON file from this device. Imported hosts are stored in
          Axiom Orca and their device tokens are moved into secure storage.
        </Text>
        <Pressable
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryButton,
            busy && styles.disabled,
            pressed && styles.primaryButtonPressed
          ]}
          onPress={() => void importBackup()}
        >
          <Text style={styles.primaryButtonText}>{busy ? 'Importing…' : 'Choose backup file'}</Text>
        </Pressable>
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>

      <View style={styles.notice}>
        <ShieldAlert size={18} color={colors.textMuted} />
        <Text style={styles.noticeText}>
          Android does not let Axiom Orca read another installed Orca app’s private app data
          directly. If the old install has the same package name, Android keeps the data during an
          update. For side-by-side installs, use an exported backup JSON or re-pair from desktop.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
    padding: spacing.lg
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  card: {
    backgroundColor: colors.bgPanel,
    borderColor: colors.borderSubtle,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing.lg
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgRaised,
    marginBottom: spacing.md
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm
  },
  body: {
    color: colors.textSecondary,
    fontSize: typography.bodySize,
    lineHeight: 21,
    marginBottom: spacing.lg
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.card,
    backgroundColor: colors.textPrimary,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg
  },
  primaryButtonPressed: {
    opacity: 0.88
  },
  primaryButtonText: {
    color: colors.bgBase,
    fontSize: 15,
    fontWeight: '700'
  },
  disabled: {
    opacity: 0.5
  },
  status: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.md
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderColor: colors.borderSubtle,
    borderRadius: radii.card,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: spacing.md,
    marginTop: spacing.md
  },
  noticeText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  }
})
