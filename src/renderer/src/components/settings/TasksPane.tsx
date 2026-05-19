import { useEffect, useMemo, useState } from 'react'
import { Boxes, Check, Github, Gitlab, LoaderCircle, Unplug } from 'lucide-react'
import type {
  ForgeConfigSettings,
  ForgeConnectionStatus,
  GlobalSettings,
  TaskProvider
} from '../../../../shared/types'
import {
  TASK_PROVIDERS,
  normalizeVisibleTaskProviders,
  resolveVisibleTaskProvider
} from '../../../../shared/task-providers'
import { cn } from '@/lib/utils'
import { LinearIcon } from '@/components/icons/LinearIcon'
import {
  forgeClearConfig,
  forgeGetConfig,
  forgeSaveConfig,
  forgeStatus
} from '@/runtime/runtime-forge-client'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SearchableSetting } from './SearchableSetting'
import {
  buildForgeSaveConfigArgs,
  describeForgeConfig,
  getForgeConnectCanSave
} from './forge-connect-form'

type TasksPaneProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
}

const TASK_PROVIDER_OPTIONS: readonly {
  id: TaskProvider
  label: string
  description: string
  Icon: (props: { className?: string }) => React.JSX.Element
}[] = [
  {
    id: 'github',
    label: 'GitHub',
    description: 'Show GitHub in the Tasks source picker and sidebar shortcuts.',
    Icon: ({ className }) => <Github className={className} />
  },
  {
    id: 'gitlab',
    label: 'GitLab',
    description: 'Show GitLab in the Tasks source picker and sidebar shortcuts.',
    Icon: ({ className }) => <Gitlab className={className} />
  },
  {
    id: 'linear',
    label: 'Linear',
    description: 'Show Linear in the Tasks source picker and sidebar shortcuts.',
    Icon: ({ className }) => <LinearIcon className={className} />
  },
  {
    id: 'forge',
    label: 'Forge',
    description: 'Show Forge in the Tasks source picker and sidebar shortcuts.',
    Icon: ({ className }) => <Boxes className={className} />
  }
]

type ForgeConnectAction = 'idle' | 'loading' | 'saving' | 'testing' | 'clearing'

export function TasksPane({ settings, updateSettings }: TasksPaneProps): React.JSX.Element {
  const visibleProviders = normalizeVisibleTaskProviders(settings.visibleTaskProviders)
  const [forgeConfig, setForgeConfig] = useState<ForgeConfigSettings | null>(null)
  const [forgeConnectionStatus, setForgeConnectionStatus] = useState<ForgeConnectionStatus | null>(
    null
  )
  const [forgeBaseUrlDraft, setForgeBaseUrlDraft] = useState('')
  const [forgeApiKeyDraft, setForgeApiKeyDraft] = useState('')
  const [forgeAction, setForgeAction] = useState<ForgeConnectAction>('loading')
  const activeRuntimeEnvironmentId = settings.activeRuntimeEnvironmentId

  useEffect(() => {
    let stale = false

    const loadConfig = async (): Promise<void> => {
      setForgeAction('loading')
      try {
        const config = await forgeGetConfig(settings)
        if (stale) {
          return
        }
        setForgeConfig(config)
        setForgeBaseUrlDraft(config.baseUrl ?? '')
        setForgeApiKeyDraft('')
        setForgeConnectionStatus(null)
      } catch (error) {
        if (!stale) {
          toast.error('Could not load Forge configuration.', {
            description: error instanceof Error ? error.message : String(error)
          })
        }
      } finally {
        if (!stale) {
          setForgeAction('idle')
        }
      }
    }

    void loadConfig()
    return () => {
      stale = true
    }
  }, [activeRuntimeEnvironmentId, settings])

  const forgeConfigDescription = useMemo(
    () =>
      forgeConfig
        ? describeForgeConfig(forgeConfig)
        : { label: 'Loading', detail: 'Reading Forge settings from the main process' },
    [forgeConfig]
  )

  const runForgeAction = async (
    action: Exclude<ForgeConnectAction, 'idle' | 'loading'>,
    operation: () => Promise<void>
  ): Promise<void> => {
    setForgeAction(action)
    try {
      await operation()
    } finally {
      setForgeAction('idle')
    }
  }

  const handleSaveForgeConfig = (): void => {
    if (
      !getForgeConnectCanSave({ baseUrlDraft: forgeBaseUrlDraft, saving: forgeAction !== 'idle' })
    ) {
      return
    }
    void runForgeAction('saving', async () => {
      const result = await forgeSaveConfig(
        settings,
        buildForgeSaveConfigArgs({ baseUrlDraft: forgeBaseUrlDraft, apiKeyDraft: forgeApiKeyDraft })
      )
      if (!result.ok) {
        toast.error('Forge configuration was not saved.', { description: result.error })
        return
      }
      setForgeConfig(result.config)
      setForgeBaseUrlDraft(result.config.baseUrl ?? '')
      setForgeApiKeyDraft('')
      setForgeConnectionStatus(null)
      toast.success('Forge configuration saved.')
    })
  }

  const handleTestForgeConnection = (): void => {
    void runForgeAction('testing', async () => {
      const status = await forgeStatus(settings)
      setForgeConnectionStatus(status)
      if (status.connected) {
        toast.success('Forge connection works.', {
          description: status.workspaceName ? `Workspace: ${status.workspaceName}` : undefined
        })
        return
      }
      toast.error('Forge connection failed.', { description: status.error })
    })
  }

  const handleClearForgeConfig = (): void => {
    void runForgeAction('clearing', async () => {
      const result = await forgeClearConfig(settings)
      setForgeConfig(result.config)
      setForgeBaseUrlDraft('')
      setForgeApiKeyDraft('')
      setForgeConnectionStatus(null)
      toast.success('Forge configuration cleared.')
    })
  }

  const forgeBusy = forgeAction !== 'idle'
  const canSaveForge = getForgeConnectCanSave({
    baseUrlDraft: forgeBaseUrlDraft,
    saving: forgeBusy
  })
  const canTestForge = !forgeBusy && Boolean(forgeConfig?.baseUrl)
  const canClearForge = !forgeBusy && Boolean(forgeConfig?.baseUrl || forgeConfig?.hasToken)
  const runtimeScopeLabel = activeRuntimeEnvironmentId
    ? 'active runtime environment'
    : 'this desktop'

  const toggleProvider = (provider: TaskProvider): void => {
    const isVisible = visibleProviders.includes(provider)
    if (isVisible && visibleProviders.length === 1) {
      return
    }

    const nextProviders = isVisible
      ? visibleProviders.filter((entry) => entry !== provider)
      : TASK_PROVIDERS.filter((entry) => entry === provider || visibleProviders.includes(entry))

    updateSettings({
      visibleTaskProviders: nextProviders,
      defaultTaskSource: resolveVisibleTaskProvider(settings.defaultTaskSource, nextProviders)
    })
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Task Sources</h3>
          <p className="text-xs text-muted-foreground">
            Choose which task providers appear in the Tasks page source picker and sidebar
            shortcuts. At least one provider must stay visible.
          </p>
        </div>

        <SearchableSetting
          title="Task Providers"
          description="Choose which task providers appear in the Tasks page and sidebar shortcuts."
          keywords={[
            'tasks',
            'provider',
            'source',
            'github',
            'gitlab',
            'linear',
            'forge',
            'display',
            'hide'
          ]}
          className="grid gap-2"
        >
          {TASK_PROVIDER_OPTIONS.map((option) => {
            const enabled = visibleProviders.includes(option.id)
            const isLastEnabled = enabled && visibleProviders.length === 1
            const Icon = option.Icon

            return (
              <button
                key={option.id}
                type="button"
                role="checkbox"
                aria-checked={enabled}
                aria-disabled={isLastEnabled}
                onClick={() => toggleProvider(option.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md border border-border/60 px-3 py-2.5 text-left transition-colors',
                  enabled
                    ? 'bg-accent/70 text-accent-foreground'
                    : 'bg-transparent hover:bg-muted/50',
                  isLastEnabled && 'cursor-not-allowed'
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-md border',
                    enabled
                      ? 'border-foreground/20 bg-background/70'
                      : 'border-border/60 bg-muted/40 text-muted-foreground'
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 space-y-0.5">
                  <Label className="cursor-inherit">{option.label}</Label>
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded border text-[10px]',
                    enabled
                      ? 'border-foreground/50 bg-foreground text-background'
                      : 'border-border bg-background'
                  )}
                >
                  {enabled ? <Check className="size-3" /> : null}
                </span>
              </button>
            )
          })}
        </SearchableSetting>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Forge Connect</h3>
          <p className="text-xs text-muted-foreground">
            Store Forge connection settings in the main process for {runtimeScopeLabel}. The API key
            is never persisted in renderer settings.
          </p>
        </div>

        <SearchableSetting
          title="Forge Connect"
          description="Connect Forge to browse and manage Forge issues from the Tasks page."
          keywords={[
            'forge',
            'task',
            'tasks',
            'connect',
            'api key',
            'token',
            'base url',
            'project manager'
          ]}
          className="space-y-4 rounded-lg border border-border/60 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Boxes className="size-4" />
                <span>{forgeConfigDescription.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{forgeConfigDescription.detail}</p>
            </div>
            {forgeAction === 'loading' ? (
              <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-2">
              <Label htmlFor="forge-base-url">Forge base URL</Label>
              <Input
                id="forge-base-url"
                value={forgeBaseUrlDraft}
                onChange={(event) => setForgeBaseUrlDraft(event.target.value)}
                placeholder="https://forge.example.com"
                autoComplete="url"
                disabled={forgeBusy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forge-api-key">API key</Label>
              <Input
                id="forge-api-key"
                type="password"
                value={forgeApiKeyDraft}
                onChange={(event) => setForgeApiKeyDraft(event.target.value)}
                placeholder={forgeConfig?.hasToken ? 'Leave blank to keep saved key' : 'forge_sk_…'}
                autoComplete="off"
                disabled={forgeBusy}
              />
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Leaving the API key blank keeps the saved key. Use Clear to remove both the URL and key.
          </p>

          {forgeConnectionStatus ? (
            <div
              className={cn(
                'rounded-md border px-3 py-2 text-xs',
                forgeConnectionStatus.connected
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-destructive/30 bg-destructive/10 text-destructive'
              )}
            >
              {forgeConnectionStatus.connected
                ? `Connected${forgeConnectionStatus.workspaceName ? ` · ${forgeConnectionStatus.workspaceName}` : ''}`
                : (forgeConnectionStatus.error ?? 'Forge connection failed')}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSaveForgeConfig} disabled={!canSaveForge}>
              {forgeAction === 'saving' ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : null}
              Save Forge config
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleTestForgeConnection}
              disabled={!canTestForge}
            >
              {forgeAction === 'testing' ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : null}
              Test connection
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearForgeConfig}
              disabled={!canClearForge}
            >
              {forgeAction === 'clearing' ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <Unplug className="mr-2 size-4" />
              )}
              Clear
            </Button>
          </div>
        </SearchableSetting>
      </section>
    </div>
  )
}
