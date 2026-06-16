import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { ChevronRight, Download } from 'lucide-react-native'

import { colors, radii, spacing, typography } from '../theme/mobile-theme'
import { formatAvailableMobileUpdate } from '../updates/mobile-update-manifest'
import { useMobileUpdateCheck } from '../updates/use-mobile-update-check'

type Props = {
  compact?: boolean
}

export function MobileUpdateNotice({ compact = false }: Props) {
  const updateState = useMobileUpdateCheck()
  if (updateState.state !== 'available') {
    return null
  }

  const update = updateState.evaluation.update
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && styles.cardPressed
      ]}
      onPress={() => {
        void Linking.openURL(update.downloadUrl)
      }}
    >
      <View style={styles.icon}>
        <Download size={16} color={colors.textPrimary} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Mobile update available</Text>
        <Text style={styles.body} numberOfLines={2}>
          Install {formatAvailableMobileUpdate(update)} from {update.releaseTag}.
        </Text>
      </View>
      <ChevronRight size={16} color={colors.textMuted} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg
  },
  cardCompact: {
    marginTop: spacing.lg
  },
  cardPressed: {
    backgroundColor: colors.bgRaised
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.bgRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  text: {
    flex: 1,
    minWidth: 0
  },
  title: {
    fontSize: typography.bodySize,
    fontWeight: '700',
    color: colors.textPrimary
  },
  body: {
    fontSize: typography.metaSize,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 17
  }
})
