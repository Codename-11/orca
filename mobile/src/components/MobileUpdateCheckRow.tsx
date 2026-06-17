import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { AlertCircle, CheckCircle2, ChevronRight, Download, RefreshCw } from 'lucide-react-native'

import { colors, spacing, typography } from '../theme/mobile-theme'
import { formatAvailableMobileUpdate } from '../updates/mobile-update-manifest'
import {
  useMobileUpdateCheck,
  type MobileUpdateCheckResult
} from '../updates/use-mobile-update-check'

type StatusText = {
  title: string
  body: string
  actionLabel: string
  tone: 'default' | 'success' | 'warning'
}

function describeStatus(updateState: MobileUpdateCheckResult): StatusText {
  if (updateState.state === 'available') {
    const update = updateState.evaluation.update
    return {
      title: 'Mobile update available',
      body: `Install ${formatAvailableMobileUpdate(update)} from ${update.releaseTag}.`,
      actionLabel: update.platform === 'android' ? 'Download' : 'Open',
      tone: 'warning'
    }
  }

  if (updateState.state === 'current') {
    return {
      title: 'Up to date',
      body: `Latest mobile build from ${updateState.evaluation.releaseTag}.`,
      actionLabel: 'Check',
      tone: 'success'
    }
  }

  if (updateState.state === 'checking') {
    return {
      title: 'Checking for updates',
      body: 'Contacting Axiom releases.',
      actionLabel: 'Checking',
      tone: 'default'
    }
  }

  if (updateState.state === 'error') {
    return {
      title: 'Update check failed',
      body: updateState.message,
      actionLabel: 'Retry',
      tone: 'warning'
    }
  }

  if (updateState.state === 'unavailable') {
    return {
      title: 'Update check unavailable',
      body: updateState.reason.replace(/-/g, ' '),
      actionLabel: 'Retry',
      tone: 'warning'
    }
  }

  return {
    title: 'Check for updates',
    body: 'Axiom Orca Mobile release channel.',
    actionLabel: 'Check',
    tone: 'default'
  }
}

function StatusIcon({ updateState }: { updateState: MobileUpdateCheckResult }) {
  if (updateState.state === 'checking') {
    return <ActivityIndicator size="small" color={colors.textSecondary} />
  }

  if (updateState.state === 'available') {
    return <Download size={16} color={colors.statusAmber} />
  }

  if (updateState.state === 'current') {
    return <CheckCircle2 size={16} color={colors.statusGreen} />
  }

  if (updateState.state === 'error' || updateState.state === 'unavailable') {
    return <AlertCircle size={16} color={colors.statusAmber} />
  }

  return <RefreshCw size={16} color={colors.textSecondary} />
}

export function MobileUpdateCheckRow() {
  const updateState = useMobileUpdateCheck({ checkOnMount: false })
  const status = describeStatus(updateState)
  const disabled = updateState.state === 'checking'

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [styles.row, pressed && !disabled && styles.rowPressed]}
      onPress={() => {
        if (updateState.state === 'available') {
          void Linking.openURL(updateState.evaluation.update.downloadUrl)
          return
        }
        updateState.checkNow()
      }}
    >
      <View style={styles.icon}>
        <StatusIcon updateState={updateState} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{status.title}</Text>
        <Text
          style={[styles.body, status.tone === 'warning' && styles.bodyWarning]}
          numberOfLines={2}
        >
          {status.body}
        </Text>
      </View>
      <View style={styles.action}>
        <Text style={[styles.actionText, status.tone === 'success' && styles.actionTextSuccess]}>
          {status.actionLabel}
        </Text>
        {updateState.state === 'available' ? (
          <ChevronRight size={15} color={colors.textMuted} />
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPanel,
    borderRadius: 12,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg
  },
  rowPressed: {
    backgroundColor: colors.bgRaised
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    lineHeight: 17,
    marginTop: 2
  },
  bodyWarning: {
    color: colors.statusAmber
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.md
  },
  actionText: {
    fontSize: typography.metaSize,
    fontWeight: '700',
    color: colors.textSecondary
  },
  actionTextSuccess: {
    color: colors.statusGreen
  }
})
