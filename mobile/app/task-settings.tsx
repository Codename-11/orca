import { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ChevronLeft, ListTodo } from 'lucide-react-native'
import { colors, spacing, typography } from '../src/theme/mobile-theme'
import { loadHosts } from '../src/transport/host-store'
import type { HostProfile } from '../src/transport/types'
import { useAllHostClients } from '../src/transport/client-context'
import type { RpcClient } from '../src/transport/rpc-client'
import { TaskProviderLogo } from '../src/components/TaskProviderLogo'
import {
  MOBILE_TASK_PROVIDERS,
  normalizeVisibleTaskProviders,
  resolveVisibleTaskProvider,
  toggleVisibleTaskProvider,
  type TaskProvider
} from '../src/tasks/mobile-task-providers'

type HostTaskSettings = {
  visibleTaskProviders: TaskProvider[]
  defaultTaskSource: TaskProvider
}

type RuntimeTaskSettings = {
  visibleTaskProviders?: unknown
  defaultTaskSource?: TaskProvider
}

const TASK_PROVIDER_LABELS: Record<TaskProvider, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  linear: 'Linear',
  forge: 'Forge'
}

const TASK_PROVIDER_SUBLABELS: Record<TaskProvider, string> = {
  github: 'Issues and pull requests',
  gitlab: 'Issues and merge requests',
  linear: 'Assigned and team issues',
  forge: 'Forge issues and agent tasks'
}

function normalizeSettings(value: RuntimeTaskSettings | undefined): HostTaskSettings {
  const visibleTaskProviders = normalizeVisibleTaskProviders(value?.visibleTaskProviders)
  return {
    visibleTaskProviders,
    defaultTaskSource: resolveVisibleTaskProvider(value?.defaultTaskSource, visibleTaskProviders)
  }
}

async function loadTaskSettings(client: RpcClient): Promise<HostTaskSettings> {
  const response = await client.sendRequest('settings.get')
  if (!response.ok) {
    throw new Error(response.error.message)
  }
  const settings = (response.result as { settings?: RuntimeTaskSettings }).settings ?? {}
  return normalizeSettings(settings)
}

export default function TaskSettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [hosts, setHosts] = useState<HostProfile[]>([])
  const [settingsByHost, setSettingsByHost] = useState<Record<string, HostTaskSettings>>({})
  const [loadingByHost, setLoadingByHost] = useState<Record<string, boolean>>({})
  const [errorByHost, setErrorByHost] = useState<Record<string, string>>({})

  useEffect(() => {
    void loadHosts().then(setHosts)
  }, [])

  const hostIds = useMemo(() => hosts.map((host) => host.id), [hosts])
  const hostClients = useAllHostClients(hostIds)

  useEffect(() => {
    let cancelled = false
    for (const host of hosts) {
      if (settingsByHost[host.id] || loadingByHost[host.id]) {
        continue
      }
      const entry = hostClients.find((candidate) => candidate.hostId === host.id)
      if (!entry || entry.state !== 'connected') {
        continue
      }

      setLoadingByHost((current) => ({ ...current, [host.id]: true }))
      void loadTaskSettings(entry.client)
        .then((settings) => {
          if (cancelled) {
            return
          }
          setSettingsByHost((current) => ({ ...current, [host.id]: settings }))
          setErrorByHost((current) => ({ ...current, [host.id]: '' }))
        })
        .catch((error) => {
          if (cancelled) {
            return
          }
          setErrorByHost((current) => ({
            ...current,
            [host.id]: error instanceof Error ? error.message : 'Failed to load task sources'
          }))
        })
        .finally(() => {
          if (cancelled) {
            return
          }
          setLoadingByHost((current) => ({ ...current, [host.id]: false }))
        })
    }
    return () => {
      cancelled = true
    }
  }, [hostClients, hosts, loadingByHost, settingsByHost])

  async function persistHostSettings(hostId: string, next: HostTaskSettings) {
    const entry = hostClients.find((candidate) => candidate.hostId === hostId)
    if (!entry || entry.state !== 'connected') {
      return
    }

    const previous = settingsByHost[hostId]
    setSettingsByHost((current) => ({ ...current, [hostId]: next }))
    setErrorByHost((current) => ({ ...current, [hostId]: '' }))
    try {
      const response = await entry.client.sendRequest('settings.update', {
        visibleTaskProviders: next.visibleTaskProviders,
        defaultTaskSource: next.defaultTaskSource
      })
      if (!response.ok) {
        throw new Error(response.error.message)
      }
      const settings = (response.result as { settings?: RuntimeTaskSettings }).settings
      setSettingsByHost((current) => ({ ...current, [hostId]: normalizeSettings(settings) }))
    } catch (error) {
      if (previous) {
        setSettingsByHost((current) => ({ ...current, [hostId]: previous }))
      }
      setErrorByHost((current) => ({
        ...current,
        [hostId]: error instanceof Error ? error.message : 'Failed to save task sources'
      }))
    }
  }

  function toggleProvider(hostId: string, provider: TaskProvider) {
    const current = settingsByHost[hostId] ?? normalizeSettings(undefined)
    const visibleTaskProviders = toggleVisibleTaskProvider(current.visibleTaskProviders, provider)
    const defaultTaskSource = resolveVisibleTaskProvider(
      current.defaultTaskSource,
      visibleTaskProviders
    )
    void persistHostSettings(hostId, { visibleTaskProviders, defaultTaskSource })
  }

  function makeDefault(hostId: string, provider: TaskProvider) {
    const current = settingsByHost[hostId] ?? normalizeSettings(undefined)
    if (!current.visibleTaskProviders.includes(provider)) {
      return
    }
    void persistHostSettings(hostId, { ...current, defaultTaskSource: provider })
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.heading}>Task Sources</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.groupDescription}>
          Choose which task providers show on the home Tasks shortcut and in each connected
          desktop&apos;s Tasks picker. Forge stays selectable so its setup state can be shown
          instead of disappearing when it is not connected yet.
        </Text>

        {hosts.length === 0 ? (
          <View style={[styles.section, styles.sectionTopGap]}>
            <Text style={styles.emptyText}>
              No paired desktops yet. Pair one to choose task sources.
            </Text>
          </View>
        ) : (
          hosts.map((host) => {
            const entry = hostClients.find((candidate) => candidate.hostId === host.id)
            const connected = entry?.state === 'connected'
            const settings = settingsByHost[host.id] ?? normalizeSettings(undefined)
            const loading = loadingByHost[host.id] === true && !settingsByHost[host.id]
            const error = errorByHost[host.id]
            return (
              <View key={host.id} style={[styles.section, styles.sectionTopGap]}>
                <View style={styles.hostHeader}>
                  <ListTodo size={16} color={colors.textSecondary} />
                  <View style={styles.hostHeaderText}>
                    <Text style={styles.hostName}>{host.name}</Text>
                    <Text style={styles.hostStatus}>
                      {connected
                        ? loading
                          ? 'Loading…'
                          : 'Connected'
                        : 'Connect this desktop to edit'}
                    </Text>
                  </View>
                </View>
                {MOBILE_TASK_PROVIDERS.map((provider) => {
                  const visible = settings.visibleTaskProviders.includes(provider)
                  const isDefault = settings.defaultTaskSource === provider
                  return (
                    <View key={provider}>
                      <View style={styles.separator} />
                      <View style={styles.providerRow}>
                        <TaskProviderLogo
                          provider={provider}
                          size={18}
                          color={visible ? colors.textPrimary : colors.textMuted}
                        />
                        <Pressable
                          style={styles.providerText}
                          disabled={!connected || !visible || isDefault}
                          onPress={() => makeDefault(host.id, provider)}
                        >
                          <Text style={[styles.rowLabel, !visible && styles.mutedText]}>
                            {TASK_PROVIDER_LABELS[provider]}
                          </Text>
                          <Text style={styles.rowSublabel}>
                            {isDefault ? 'Default source' : TASK_PROVIDER_SUBLABELS[provider]}
                          </Text>
                        </Pressable>
                        <Switch
                          value={visible}
                          disabled={!connected}
                          onValueChange={() => toggleProvider(host.id, provider)}
                          trackColor={{ false: colors.bgRaised, true: colors.textSecondary }}
                          thumbColor={colors.textPrimary}
                        />
                      </View>
                    </View>
                  )
                })}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>
            )
          })
        )}
      </ScrollView>
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
  scrollContent: {
    paddingBottom: spacing.xl
  },
  groupDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary
  },
  section: {
    backgroundColor: colors.bgPanel,
    borderRadius: 12,
    overflow: 'hidden'
  },
  sectionTopGap: {
    marginTop: spacing.md
  },
  hostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2
  },
  hostHeaderText: {
    flex: 1
  },
  hostName: {
    fontSize: typography.bodySize,
    fontWeight: '700',
    color: colors.textPrimary
  },
  hostStatus: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2
  },
  providerText: {
    flex: 1
  },
  rowLabel: {
    fontSize: typography.bodySize,
    fontWeight: '500',
    color: colors.textPrimary
  },
  rowSublabel: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted
  },
  mutedText: {
    color: colors.textMuted
  },
  emptyText: {
    padding: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.bodySize
  },
  errorText: {
    paddingHorizontal: spacing.md + 2,
    paddingBottom: spacing.md,
    color: colors.statusRed,
    fontSize: 12
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.md
  }
})
