import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import TerminalPane from './TerminalPane'
import { useAppStore } from '../../store'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { RecoverableRenderErrorBoundary } from '../error-boundaries/RecoverableRenderErrorBoundary'
import { syncZoomCSSVar } from '@/lib/ui-zoom'
import type { DetachedTerminalWindowContext } from '@/lib/detached-terminal-window'

type LoadState = 'loading' | 'ready' | 'error'

export default function DetachedTerminalWindowApp({
  context
}: {
  context: DetachedTerminalWindowContext
}): React.JSX.Element {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const actions = useAppStore(
    useShallow((state) => ({
      fetchSettings: state.fetchSettings,
      fetchRepos: state.fetchRepos,
      fetchProjectGroups: state.fetchProjectGroups,
      fetchAllWorktrees: state.fetchAllWorktrees,
      fetchWorktreeLineage: state.fetchWorktreeLineage,
      fetchKeybindings: state.fetchKeybindings,
      hydrateWorkspaceSession: state.hydrateWorkspaceSession,
      hydrateTabsSession: state.hydrateTabsSession,
      hydrateEditorSession: state.hydrateEditorSession,
      hydrateBrowserSession: state.hydrateBrowserSession,
      fetchBrowserSessionProfiles: state.fetchBrowserSessionProfiles,
      reconnectPersistedTerminals: state.reconnectPersistedTerminals,
      setActiveView: state.setActiveView,
      setActiveWorktree: state.setActiveWorktree,
      setActiveTab: state.setActiveTab,
      setActiveTabType: state.setActiveTabType
    }))
  )
  const terminalTab = useAppStore((state) =>
    (state.tabsByWorktree[context.worktreeId] ?? []).find((tab) => tab.id === context.tabId)
  )
  const workspaceSessionReady = useAppStore((state) => state.workspaceSessionReady)
  const consumeSuppressedPtyExit = useAppStore((state) => state.consumeSuppressedPtyExit)
  const closeTab = useAppStore((state) => state.closeTab)

  useEffect(() => {
    let cancelled = false
    const abortController = new AbortController()
    void (async () => {
      try {
        await actions.fetchSettings()
        await actions.fetchRepos()
        await actions.fetchProjectGroups()
        await actions.fetchAllWorktrees()
        await actions.fetchWorktreeLineage()
        const session = await window.api.session.get()
        await actions.fetchKeybindings()
        if (cancelled) {
          return
        }
        actions.hydrateWorkspaceSession(session)
        actions.hydrateTabsSession(session)
        actions.hydrateEditorSession(session)
        actions.hydrateBrowserSession(session)
        await actions.fetchBrowserSessionProfiles()
        await actions.reconnectPersistedTerminals(abortController.signal)
        if (cancelled) {
          return
        }
        actions.setActiveView('terminal')
        actions.setActiveWorktree(context.worktreeId)
        actions.setActiveTab(context.tabId)
        actions.setActiveTabType('terminal')
        syncZoomCSSVar()
        setLoadState('ready')
      } catch (error) {
        if (cancelled) {
          return
        }
        setErrorMessage(error instanceof Error ? error.message : String(error))
        setLoadState('error')
      }
    })()
    return () => {
      cancelled = true
      abortController.abort()
    }
  }, [actions, context.tabId, context.worktreeId])

  const body = (() => {
    if (loadState === 'error') {
      return (
        <div className="flex h-full items-center justify-center bg-background p-6 text-center text-sm text-muted-foreground">
          <div>
            <div className="mb-2 text-foreground">Detached terminal failed to load.</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )
    }
    if (loadState !== 'ready' || !workspaceSessionReady) {
      return (
        <div className="flex h-full items-center justify-center bg-background text-sm text-muted-foreground">
          Loading terminal…
        </div>
      )
    }
    if (!terminalTab) {
      return (
        <div className="flex h-full items-center justify-center bg-background p-6 text-center text-sm text-muted-foreground">
          This terminal tab is no longer available.
        </div>
      )
    }
    return (
      <TerminalPane
        key={`${context.tabId}-${terminalTab.generation ?? 0}`}
        tabId={context.tabId}
        worktreeId={context.worktreeId}
        cwd={context.worktreePath}
        isActive
        isVisible
        onPtyExit={(ptyId) => {
          if (consumeSuppressedPtyExit(ptyId)) {
            return
          }
          closeTab(context.tabId)
        }}
        onCloseTab={() => closeTab(context.tabId)}
      />
    )
  })()

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-background"
      data-orca-window="detached-terminal"
    >
      <TooltipProvider delayDuration={400}>
        <RecoverableRenderErrorBoundary
          boundaryId="detached-terminal.window"
          surface="overlay"
          title="The detached terminal hit an error."
          description="Close the window to rejoin the tab in the main workspace, then pop it out again."
        >
          {body}
        </RecoverableRenderErrorBoundary>
      </TooltipProvider>
      <Toaster closeButton toastOptions={{ className: 'font-sans text-sm' }} />
    </div>
  )
}
