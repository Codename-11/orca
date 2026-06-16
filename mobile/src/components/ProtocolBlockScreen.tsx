import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { colors, radii, spacing, typography } from '../theme/mobile-theme'
import type { CompatVerdict } from '../transport/protocol-compat'
import { AXIOM_RELEASES_URL, LATEST_ANDROID_APK_URL } from '../updates/mobile-update-manifest'
import { useMobileUpdateCheck } from '../updates/use-mobile-update-check'

type Props = {
  verdict: Extract<CompatVerdict, { kind: 'blocked' }>
}

export function ProtocolBlockScreen({ verdict }: Props) {
  const isMobileTooOld = verdict.reason === 'mobile-too-old'
  const updateState = useMobileUpdateCheck({ enabled: isMobileTooOld })
  const mobileUpdateTarget =
    updateState.state === 'available'
      ? {
          label:
            updateState.evaluation.update.platform === 'android' ? 'Download APK' : 'Open Update',
          url: updateState.evaluation.update.downloadUrl,
          storeName:
            updateState.evaluation.update.platform === 'android'
              ? 'the Axiom GitHub release APK'
              : 'your Axiom mobile distribution channel'
        }
      : Platform.OS === 'android'
        ? {
            label: 'Download APK',
            url: LATEST_ANDROID_APK_URL,
            storeName: 'the Axiom GitHub release APK'
          }
        : {
            label: 'Open Axiom Releases',
            url: AXIOM_RELEASES_URL,
            storeName: 'your Axiom mobile distribution channel'
          }
  const primaryAction = isMobileTooOld
    ? { label: mobileUpdateTarget.label, url: mobileUpdateTarget.url }
    : { label: 'Open Axiom Releases', url: AXIOM_RELEASES_URL }

  const title = isMobileTooOld ? 'Update Axiom Orca Mobile' : 'Update Axiom Orca on your computer'
  const body = isMobileTooOld
    ? `This desktop needs a newer Axiom Orca Mobile app. Update from ${mobileUpdateTarget.storeName}, then try this host again.`
    : 'This paired desktop app is too old for your current Axiom Orca Mobile app. Update Axiom Orca on your computer, then try this host again.'
  const recoveryNote =
    'Already updated? Go back to Hosts and refresh the connection. If this message stays, remove this host and pair it again.'

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {/* Why: Axiom mobile updates are fork release assets; Android can
            install the APK directly while iOS depends on its distribution channel. */}
        {primaryAction ? (
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={() => {
              void Linking.openURL(primaryAction.url)
            }}
          >
            <Text style={styles.primaryButtonText}>{primaryAction.label}</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={() => {
            // Why: route back to the host list so the user can pair a
            // different host instead of getting trapped on this screen.
            router.replace('/')
          }}
        >
          <Text style={styles.secondaryButtonText}>Back to hosts</Text>
        </Pressable>
        <Text style={styles.recoveryNote}>{recoveryNote}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg
  },
  card: {
    backgroundColor: colors.bgPanel,
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  title: {
    fontSize: typography.titleSize,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  body: {
    fontSize: typography.bodySize,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg
  },
  primaryButton: {
    backgroundColor: colors.textPrimary,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.button,
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  primaryButtonText: {
    fontSize: typography.bodySize,
    fontWeight: '600',
    color: colors.bgBase
  },
  secondaryButton: {
    backgroundColor: colors.bgRaised,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.button,
    alignItems: 'center'
  },
  secondaryButtonText: {
    fontSize: typography.bodySize,
    fontWeight: '600',
    color: colors.textPrimary
  },
  recoveryNote: {
    fontSize: typography.metaSize,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: spacing.md
  },
  pressed: {
    opacity: 0.7
  }
})
