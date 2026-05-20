import { AlertCircle, LayoutGrid, Plus, RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ForgeIssueEmptyState } from './forge-empty-state'

type ForgeIssueEmptyStatePanelProps = {
  state: ForgeIssueEmptyState
  onAction: (
    action:
      | ForgeIssueEmptyState['primaryAction']
      | NonNullable<ForgeIssueEmptyState['secondaryAction']>
  ) => void
  className?: string
}

const EMPTY_STATE_ICONS = {
  setup: AlertCircle,
  create: Plus,
  filter: Search,
  search: Search,
  statuses: LayoutGrid
} as const

export function ForgeIssueEmptyStatePanel({
  state,
  onAction,
  className
}: ForgeIssueEmptyStatePanelProps) {
  const Icon = EMPTY_STATE_ICONS[state.kind]
  return (
    <div className={cn('flex h-full min-h-64 items-center justify-center px-4 py-10', className)}>
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-border/50 bg-muted/50 text-muted-foreground">
          <Icon className="size-5" />
        </div>
        <p className="text-sm font-medium text-foreground">{state.title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{state.description}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={() => onAction(state.primaryAction)}>
            {state.primaryAction === 'New Forge issue' ? <Plus className="size-3.5" /> : null}
            {state.primaryAction === 'Clear search' ? <Search className="size-3.5" /> : null}
            {state.primaryAction === 'Refresh' || state.primaryAction === 'Refresh connection' ? (
              <RefreshCw className="size-3.5" />
            ) : null}
            {state.primaryAction}
          </Button>
          {state.secondaryAction ? (
            <Button variant="outline" size="sm" onClick={() => onAction(state.secondaryAction!)}>
              <RefreshCw className="size-3.5" />
              {state.secondaryAction}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
