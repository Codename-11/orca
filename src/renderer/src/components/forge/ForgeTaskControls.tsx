import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  FolderKanban,
  LayoutGrid,
  List,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Users,
  X
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { shouldSuppressEnterSubmit } from '@/lib/new-workspace-enter-guard'
import {
  ALL_FORGE_AGENTS_FILTER,
  UNASSIGNED_FORGE_AGENT_FILTER,
  type ForgeAgentFilterValue
} from '@/components/forge/forge-agent-filter'
import type {
  ForgeAgentSummary,
  ForgeConnectionStatus,
  ForgeIssueSort,
  ForgeIssueSortKey,
  ForgeProjectSummary,
  ForgeWorkspaceSummary
} from '../../../../shared/types'

export type ForgePresetId = 'active' | 'assigned' | 'created' | 'all' | 'done'

export const FORGE_PRESETS: { id: ForgePresetId; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'created', label: 'Created' },
  { id: 'all', label: 'All' },
  { id: 'done', label: 'Done' }
]

export const FORGE_SORT_OPTIONS: { id: ForgeIssueSortKey; label: string }[] = [
  { id: 'updated', label: 'Updated' },
  { id: 'created', label: 'Created' },
  { id: 'priority', label: 'Priority' },
  { id: 'identifier', label: 'Identifier' },
  { id: 'title', label: 'Title' }
]

export const FORGE_PROJECT_FILTER_ALL = 'all-projects'

export type ForgeTaskViewMode = 'list' | 'board'

type ForgeTaskControlsProps = {
  workspaces: ForgeWorkspaceSummary[]
  selectedWorkspaceId: string | null
  onWorkspaceChange: (workspaceId: string) => void
  searchInput: string
  activePreset: ForgePresetId
  activeAgentFilter: ForgeAgentFilterValue
  activeProjectFilter: string | null
  activeSort: ForgeIssueSort
  agents: ForgeAgentSummary[]
  projects: ForgeProjectSummary[]
  connectionStatus: ForgeConnectionStatus | null
  loading: boolean
  viewMode: ForgeTaskViewMode
  onSearchInputChange: (value: string) => void
  onSearchSubmit: (value: string) => void
  onSearchClear: () => void
  onPresetChange: (presetId: ForgePresetId) => void
  onNewIssue: () => void
  onViewModeChange: (mode: ForgeTaskViewMode) => void
  onRefresh: () => void
  onAgentFilterChange: (value: ForgeAgentFilterValue) => void
  onProjectFilterChange: (projectId: string | null) => void
  onSortChange: (sort: ForgeIssueSort) => void
}

export function ForgeTaskControls({
  workspaces,
  selectedWorkspaceId,
  onWorkspaceChange,
  searchInput,
  activePreset,
  activeAgentFilter,
  activeProjectFilter,
  activeSort,
  agents,
  projects,
  connectionStatus,
  loading,
  viewMode,
  onSearchInputChange,
  onSearchSubmit,
  onSearchClear,
  onPresetChange,
  onNewIssue,
  onViewModeChange,
  onRefresh,
  onAgentFilterChange,
  onProjectFilterChange,
  onSortChange
}: ForgeTaskControlsProps): React.JSX.Element {
  return (
    <div className="min-w-0 rounded-md rounded-b-none border border-border/50 bg-muted/50 p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Why: only surface a workspace picker when more than one workspace is reachable; the connection badge covers the single-workspace case. */}
          {workspaces.length > 1 ? (
            <Select value={selectedWorkspaceId ?? undefined} onValueChange={onWorkspaceChange}>
              <SelectTrigger
                aria-label="Select Forge workspace"
                className="h-8 w-auto min-w-[150px] max-w-[220px] border-border/50 bg-background text-xs"
              >
                <SelectValue placeholder="Workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {FORGE_PRESETS.map((preset) => {
            const active = !searchInput && activePreset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPresetChange(preset.id)}
                className={cn(
                  'rounded-md border px-2 py-1 text-xs transition',
                  active
                    ? 'border-border/50 bg-foreground/90 text-background backdrop-blur-md'
                    : 'border-border/50 bg-transparent text-foreground hover:bg-muted/50'
                )}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onNewIssue}
                aria-label="New Forge issue"
                className="border-border/50 bg-transparent hover:bg-muted/50 backdrop-blur-md supports-[backdrop-filter]:bg-transparent"
              >
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              New Forge issue
            </TooltipContent>
          </Tooltip>
          <div className="flex rounded-md border border-border/50 bg-transparent p-0.5">
            {[
              { id: 'list' as const, label: 'List', Icon: List },
              { id: 'board' as const, label: 'Board', Icon: LayoutGrid }
            ].map(({ id, label, Icon }) => {
              const active = viewMode === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onViewModeChange(id)}
                  aria-pressed={active}
                  aria-label={`${label} view`}
                  className={cn(
                    'flex items-center gap-1.5 rounded px-2 py-1 text-xs transition',
                    active
                      ? 'bg-foreground/90 text-background'
                      : 'text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              )
            })}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={loading}
                aria-label="Refresh Forge issues"
                className="border-border/50 bg-transparent hover:bg-muted/50 backdrop-blur-md supports-[backdrop-filter]:bg-transparent"
              >
                {loading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              Refresh Forge issues
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {connectionStatus ? <ForgeConnectionStatusRow status={connectionStatus} /> : null}
      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') {
                return
              }
              if (
                shouldSuppressEnterSubmit(
                  { isComposing: event.nativeEvent.isComposing, shiftKey: event.shiftKey },
                  false
                )
              ) {
                return
              }
              event.preventDefault()
              onSearchSubmit(searchInput.trim())
            }}
            placeholder="Search Forge issues..."
            className="h-8 rounded-md border-border/50 bg-background pl-8 pr-8 text-xs"
          />
          {searchInput ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={onSearchClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <Select value={activeAgentFilter} onValueChange={(value) => onAgentFilterChange(value)}>
          <SelectTrigger
            aria-label="Filter Forge issues by assigned agent"
            className="h-8 w-full min-w-[180px] max-w-[240px] border-border/50 bg-background text-xs sm:w-auto"
          >
            <Users className="mr-2 size-3.5 text-muted-foreground" />
            <SelectValue placeholder="All agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FORGE_AGENTS_FILTER}>All agents</SelectItem>
            <SelectItem value={UNASSIGNED_FORGE_AGENT_FILTER}>Unassigned</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
                {agent.profileKey ? (
                  <span className="ml-1 text-muted-foreground">@{agent.profileKey}</span>
                ) : null}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={activeProjectFilter ?? FORGE_PROJECT_FILTER_ALL}
          onValueChange={(value) =>
            onProjectFilterChange(value === FORGE_PROJECT_FILTER_ALL ? null : value)
          }
        >
          <SelectTrigger
            aria-label="Filter Forge issues by project"
            className="h-8 w-full min-w-[160px] max-w-[220px] border-border/50 bg-background text-xs sm:w-auto"
          >
            <FolderKanban className="mr-2 size-3.5 text-muted-foreground" />
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FORGE_PROJECT_FILTER_ALL}>All projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Select
            value={activeSort.key}
            onValueChange={(value) =>
              onSortChange({
                ...activeSort,
                key: value as ForgeIssueSortKey
              })
            }
          >
            <SelectTrigger
              aria-label="Sort Forge issues"
              className="h-8 w-full min-w-[140px] max-w-[180px] border-border/50 bg-background text-xs sm:w-auto"
            >
              <ArrowDownUp className="mr-2 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {FORGE_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Why: a compact arrow toggle flips sort direction without a second dropdown; aria-label reflects the next action. */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  onSortChange({
                    ...activeSort,
                    direction: activeSort.direction === 'asc' ? 'desc' : 'asc'
                  })
                }
                aria-label={activeSort.direction === 'asc' ? 'Sort descending' : 'Sort ascending'}
                className="h-8 w-8 shrink-0 border-border/50 bg-background hover:bg-muted/50"
              >
                {activeSort.direction === 'asc' ? (
                  <ArrowUp className="size-4" />
                ) : (
                  <ArrowDown className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              {activeSort.direction === 'asc' ? 'Ascending' : 'Descending'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

function ForgeConnectionStatusRow({
  status
}: {
  status: ForgeConnectionStatus
}): React.JSX.Element {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
      <span
        className={cn(
          'rounded-full border px-2 py-0.5 font-medium',
          status.connected
            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
            : 'border-destructive/35 bg-destructive/10 text-destructive'
        )}
      >
        {status.connected ? 'Connected' : 'Not connected'}
      </span>
      {status.workspaceName ? <span>{status.workspaceName}</span> : null}
      {status.workspaceSlug ? <span className="font-mono">/{status.workspaceSlug}</span> : null}
      {status.baseUrl ? (
        <span className="max-w-[260px] truncate font-mono">{status.baseUrl}</span>
      ) : null}
      <span>
        Auth:{' '}
        {status.hasToken
          ? status.configSource === 'env'
            ? 'environment token'
            : 'saved token'
          : 'missing token'}
      </span>
      {status.error ? <span className="text-destructive">{status.error}</span> : null}
    </div>
  )
}
