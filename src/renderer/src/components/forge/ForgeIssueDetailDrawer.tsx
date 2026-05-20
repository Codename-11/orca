import { ArrowRight, LoaderCircle, MessageSquare, UserRound } from 'lucide-react'
import type {
  ForgeAgentSummary,
  ForgeComment,
  ForgeIssue,
  ForgeIssuePriority,
  ForgeIssueStatus,
  ForgeLabel,
  ForgeProjectSummary,
  ForgeIssueUpdate
} from '../../../../shared/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

const NONE_VALUE = '__none__'
const PRIORITIES: ForgeIssuePriority[] = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']

type ForgeIssueDetailDrawerContentProps = {
  issue: ForgeIssue
  statuses: ForgeIssueStatus[]
  projects: ForgeProjectSummary[]
  labels: ForgeLabel[]
  agents: ForgeAgentSummary[]
  comments: ForgeComment[]
  commentsLoading: boolean
  commentDraft: string
  mutationPending: boolean
  onCommentDraftChange: (value: string) => void
  onCreateComment: (body: string) => void
  onUpdateIssue: (updates: ForgeIssueUpdate) => void
  onUseIssue: () => void
}

type ForgeIssueDetailDrawerProps = ForgeIssueDetailDrawerContentProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function agentName(agent: ForgeAgentSummary | null | undefined): string {
  if (!agent) {
    return 'Unassigned'
  }
  return agent.name ?? agent.profileKey ?? agent.id
}

function commentAuthor(comment: ForgeComment): string {
  return agentName(comment.author)
}

function formatDate(value: string | undefined | null): string {
  if (!value) {
    return 'Unknown'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function selectClass(): string {
  return 'h-8 w-full rounded-md border border-border/50 bg-background px-2 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60'
}

export function ForgeIssueDetailDrawerContent({
  issue,
  statuses,
  projects,
  labels,
  agents,
  comments,
  commentsLoading,
  commentDraft,
  mutationPending,
  onCommentDraftChange,
  onCreateComment,
  onUpdateIssue,
  onUseIssue
}: ForgeIssueDetailDrawerContentProps): React.JSX.Element {
  const availableLabels = labels.filter((label) => !issue.labels?.includes(label.name))
  const statusOptions = statuses.some((status) => status.id === issue.status.id)
    ? statuses
    : [issue.status, ...statuses]
  const projectOptions =
    issue.project && !projects.some((project) => project.id === issue.project?.id)
      ? [issue.project, ...projects]
      : projects
  const agentOptions =
    issue.assignedAgent && !agents.some((agent) => agent.id === issue.assignedAgent?.id)
      ? [issue.assignedAgent, ...agents]
      : agents
  const canSubmitComment = commentDraft.trim().length > 0 && !mutationPending

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3 pr-8">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{issue.identifier}</span>
              <Badge variant="outline" className="rounded-md text-[10px]">
                {issue.priority}
              </Badge>
            </div>
            <h2 className="text-lg font-semibold leading-tight text-foreground">{issue.title}</h2>
          </div>
          <Button size="sm" className="shrink-0 gap-1.5" onClick={onUseIssue}>
            <ArrowRight className="size-3.5" />
            Use issue
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 scrollbar-sleek">
        <section className="grid gap-3 rounded-md border border-border/50 bg-muted/25 p-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs text-muted-foreground">
            <span>Status</span>
            <select
              aria-label="Forge issue status"
              value={issue.status.id}
              disabled={mutationPending || statusOptions.length === 0}
              onChange={(event) => onUpdateIssue({ statusId: event.currentTarget.value })}
              className={selectClass()}
            >
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-xs text-muted-foreground">
            <span>Priority</span>
            <select
              aria-label="Forge issue priority"
              value={issue.priority}
              disabled={mutationPending}
              onChange={(event) =>
                onUpdateIssue({ priority: event.currentTarget.value as ForgeIssuePriority })
              }
              className={selectClass()}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-xs text-muted-foreground">
            <span>Project</span>
            <select
              aria-label="Forge issue project"
              value={issue.project?.id ?? NONE_VALUE}
              disabled={mutationPending}
              onChange={(event) =>
                onUpdateIssue({
                  projectId:
                    event.currentTarget.value === NONE_VALUE ? null : event.currentTarget.value
                })
              }
              className={selectClass()}
            >
              <option value={NONE_VALUE}>No project</option>
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-xs text-muted-foreground">
            <span>Agent</span>
            <select
              aria-label="Forge issue agent"
              value={issue.assignedAgent?.id ?? NONE_VALUE}
              disabled={mutationPending}
              onChange={(event) =>
                onUpdateIssue({
                  assignedAgentId:
                    event.currentTarget.value === NONE_VALUE ? null : event.currentTarget.value
                })
              }
              className={selectClass()}
            >
              <option value={NONE_VALUE}>Unassigned</option>
              {agentOptions.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agentName(agent)}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-foreground">Labels</h3>
            <select
              aria-label="Add Forge issue label"
              value={NONE_VALUE}
              disabled={mutationPending || availableLabels.length === 0}
              onChange={(event) => {
                if (event.currentTarget.value !== NONE_VALUE) {
                  onUpdateIssue({ labelIds: [event.currentTarget.value] })
                }
              }}
              className="h-7 rounded-md border border-border/50 bg-background px-2 text-[11px] text-foreground"
            >
              <option value={NONE_VALUE}>Add label</option>
              {availableLabels.map((label) => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>
          </div>
          {issue.labels && issue.labels.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {issue.labels.map((label) => {
                const labelId = labels.find((candidate) => candidate.name === label)?.id
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={!labelId || mutationPending}
                    onClick={() => labelId && onUpdateIssue({ removeLabelIds: [labelId] })}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-foreground transition hover:bg-accent disabled:cursor-default disabled:opacity-70"
                    aria-label={`Remove ${label} label`}
                  >
                    {label}
                    {labelId ? <span aria-hidden="true">×</span> : null}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No labels</p>
          )}
        </section>

        <section className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">Description</h3>
          <div className="whitespace-pre-wrap rounded-md border border-border/50 bg-muted/25 p-3 text-sm text-foreground">
            {issue.description?.trim() ? (
              issue.description
            ) : (
              <span className="text-muted-foreground">No description provided.</span>
            )}
          </div>
        </section>

        <section className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Comments</h3>
          </div>
          {commentsLoading ? (
            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/25 p-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading comments…
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-2">
              {comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-md border border-border/50 bg-muted/20 p-3"
                >
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="size-3.5" />
                      {commentAuthor(comment)}
                    </span>
                    <time>{formatDate(comment.createdAt)}</time>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                    {comment.body}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-border/50 bg-muted/20 p-3 text-sm text-muted-foreground">
              No comments yet.
            </p>
          )}

          <div className="space-y-2">
            <textarea
              aria-label="Forge comment body"
              value={commentDraft}
              disabled={mutationPending}
              onChange={(event) => onCommentDraftChange(event.currentTarget.value)}
              placeholder="Add a comment..."
              className="min-h-24 w-full resize-y rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!canSubmitComment}
                onClick={() => onCreateComment(commentDraft)}
                className="gap-1.5"
              >
                {mutationPending ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
                Add comment
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export function ForgeIssueDetailDrawer({
  open,
  onOpenChange,
  ...contentProps
}: ForgeIssueDetailDrawerProps): React.JSX.Element {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(92vw,640px)] gap-0 p-0 sm:max-w-[640px]">
        <SheetHeader className="sr-only">
          <SheetTitle>{contentProps.issue.identifier}</SheetTitle>
          <SheetDescription>{contentProps.issue.title}</SheetDescription>
        </SheetHeader>
        <ForgeIssueDetailDrawerContent {...contentProps} />
      </SheetContent>
    </Sheet>
  )
}

export function applyForgeIssuePatch(
  issue: ForgeIssue,
  updates: ForgeIssueUpdate,
  metadata: {
    statuses: readonly ForgeIssueStatus[]
    projects: readonly ForgeProjectSummary[]
    labels: readonly ForgeLabel[]
    agents: readonly ForgeAgentSummary[]
  }
): ForgeIssue {
  const nextStatus = updates.statusId
    ? (metadata.statuses.find((status) => status.id === updates.statusId) ?? issue.status)
    : issue.status
  const nextProject = Object.prototype.hasOwnProperty.call(updates, 'projectId')
    ? (metadata.projects.find((project) => project.id === updates.projectId) ?? null)
    : issue.project
  const nextAgent = Object.prototype.hasOwnProperty.call(updates, 'assignedAgentId')
    ? (metadata.agents.find((agent) => agent.id === updates.assignedAgentId) ?? null)
    : issue.assignedAgent
  const removedLabelNames = new Set(
    (updates.removeLabelIds ?? [])
      .map((labelId) => metadata.labels.find((label) => label.id === labelId)?.name)
      .filter((label): label is string => Boolean(label))
  )
  const currentLabels = (issue.labels ?? []).filter((label) => !removedLabelNames.has(label))
  const nextLabels =
    updates.labelIds || updates.removeLabelIds
      ? Array.from(
          new Set([
            ...currentLabels,
            ...(updates.labelIds ?? [])
              .map((labelId) => metadata.labels.find((label) => label.id === labelId)?.name)
              .filter((label): label is string => Boolean(label))
          ])
        )
      : issue.labels

  return {
    ...issue,
    title: updates.title ?? issue.title,
    description: Object.prototype.hasOwnProperty.call(updates, 'description')
      ? (updates.description ?? undefined)
      : issue.description,
    priority: updates.priority ?? issue.priority,
    status: nextStatus,
    project: nextProject,
    assignedAgent: nextAgent,
    labels: nextLabels
  }
}
