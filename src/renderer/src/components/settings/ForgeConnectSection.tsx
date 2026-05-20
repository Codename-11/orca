import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle, Unplug } from 'lucide-react'
import { toast } from 'sonner'
import type { ForgeConfigSettings, ForgeConnectionStatus } from '../../../../shared/types'
import { cn } from '@/lib/utils'
import { ForgeIcon } from '@/components/icons/ForgeIcon'
import { useAppStore } from '../../store'
import {
  forgeClearConfig,
  forgeGetConfig,
  forgeSaveConfig,
  forgeStatus
} from '@/runtime/runtime-forge-client'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SearchableSetting } from './SearchableSetting'
import {
  buildForgeSaveConfigArgs,
  describeForgeConfig,
  getForgeConnectCanSave
} from './forge-connect-form'

type ForgeConnectAction = 'idle' | 'loading' | 'saving' | 'testing' | 'clearing'

export function ForgeConnectSection(): React.JSX.Element {
  const settings = useAppStore((s) => s.settings)
  const [forgeConfig, setForgeConfig] = useState<ForgeConfigSettings | null>(null)
  const [forgeConnectionStatus, setForgeConnectionStatus] = useState<ForgeConnectionStatus | null>(
    null
  )
  const [forgeBaseUrlDraft, setForgeBaseUrlDraft] = useState('')
  const [forgeApiKeyDraft, setForgeApiKeyDraft] = useState('')
  const [forgeAction, setForgeAction] = useState<ForgeConnectAction>('loading')
  const activeRuntimeEnvironmentId = settings?.activeRuntimeEnvironmentId

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

  return (
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
        'project manager',
        'integration'
      ]}
      className="space-y-4 rounded-md border border-border/50 bg-muted/30 px-4 py-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <ForgeIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-medium">Forge</p>
            <p className="text-xs text-muted-foreground">
              Store Forge connection settings in the main process for {runtimeScopeLabel}. API keys
              never enter renderer settings.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {forgeAction === 'loading' ? (
            <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
          ) : null}
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] font-medium',
              forgeConfig?.baseUrl && forgeConfig.hasToken
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
            )}
          >
            {forgeConfigDescription.label}
          </span>
        </div>
      </div>

      <div className="rounded-md bg-background/50 px-3 py-2">
        <p className="break-all text-xs text-muted-foreground">{forgeConfigDescription.detail}</p>
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
          {forgeAction === 'saving' ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
          Save Forge config
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleTestForgeConnection}
          disabled={!canTestForge}
        >
          {forgeAction === 'testing' ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
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
  )
}
