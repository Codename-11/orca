import { useAppStore } from '@/store'
import { isMainTerminalSideEffectAuthorityForPty } from '@/components/terminal-pane/terminal-side-effect-facts-handler'
import { createAgentStatusOscProcessor } from '../../../shared/agent-status-osc'
import type { ParsedAgentStatusPayload } from '../../../shared/agent-status-types'
import type { GlobalSettings } from '../../../shared/types'

export type BackgroundAgentStatusStreamArgs = {
  paneKey: string
  launchToken: string
  runtimeEnvironmentId: string | null
  settings: Pick<GlobalSettings, 'terminalMainSideEffectAuthority'> | null
  onAgentStatus?: (payload: ParsedAgentStatusPayload) => void
}

export function createBackgroundAgentStatusStream({
  paneKey,
  launchToken,
  runtimeEnvironmentId,
  settings,
  onAgentStatus
}: BackgroundAgentStatusStreamArgs): (data: string) => void {
  // Why: for local/SSH PTYs main already parses OSC 9999 and routes it through
  // the hook server, so the background sidecar must not duplicate store writes.
  const mainOwnsAgentStatusWrites = isMainTerminalSideEffectAuthorityForPty({
    settings,
    runtimeEnvironmentId
  })
  const processAgentStatus = createAgentStatusOscProcessor()

  return (data: string): void => {
    const processed = processAgentStatus(data)
    for (const payload of processed.payloads) {
      if (!mainOwnsAgentStatusWrites) {
        useAppStore.getState().setAgentStatus(paneKey, payload, undefined, undefined, undefined, {
          launchToken
        })
      }
      onAgentStatus?.(payload)
    }
  }
}
