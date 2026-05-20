import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type {
  ForgeAgentSummary,
  ForgeComment,
  ForgeIssue,
  ForgeIssueStatus,
  ForgeLabel,
  ForgeProjectSummary
} from '../../../../shared/types'
import { ForgeIssueDetailDrawerContent, applyForgeIssuePatch } from './ForgeIssueDetailDrawer'

const statuses: ForgeIssueStatus[] = [
  { id: 'todo', name: 'Todo', category: 'TODO', color: '#3bb8f0' },
  { id: 'review', name: 'Review', category: 'IN_REVIEW', color: '#ffb86b' }
]

const projects: ForgeProjectSummary[] = [{ id: 'project-1', key: 'AXI', name: 'Axiom UI' }]
const labels: ForgeLabel[] = [
  { id: 'label-bug', name: 'bug', color: '#f87171' },
  { id: 'label-agent', name: 'agent', color: '#22d3ee' }
]
const agents: ForgeAgentSummary[] = [
  { id: 'agent-victor', name: 'Victor', profileKey: 'victor' },
  { id: 'agent-mizu', name: 'Mizu', profileKey: 'mizu' }
]

const issue: ForgeIssue = {
  id: 'issue-1',
  identifier: 'AXI-42',
  title: 'Add Forge detail drawer',
  description: 'Bring Forge issues up to Linear interaction parity.',
  status: statuses[0],
  priority: 'HIGH',
  project: projects[0],
  assignedAgent: agents[0],
  labels: ['bug'],
  updatedAt: '2026-05-20T10:00:00.000Z',
  createdAt: '2026-05-19T09:00:00.000Z'
}

const comments: ForgeComment[] = [
  {
    id: 'comment-1',
    body: 'Looks ready for implementation.',
    author: agents[1],
    createdAt: '2026-05-20T11:00:00.000Z'
  }
]

describe('ForgeIssueDetailDrawerContent', () => {
  it('renders Linear-style Forge issue metadata, editable fields, description, and comments', () => {
    const markup = renderToStaticMarkup(
      <ForgeIssueDetailDrawerContent
        issue={issue}
        statuses={statuses}
        projects={projects}
        labels={labels}
        agents={agents}
        comments={comments}
        commentsLoading={false}
        commentDraft="Ship it"
        mutationPending={false}
        onCommentDraftChange={vi.fn()}
        onCreateComment={vi.fn()}
        onUpdateIssue={vi.fn()}
        onUseIssue={vi.fn()}
      />
    )

    expect(markup).toContain('AXI-42')
    expect(markup).toContain('Add Forge detail drawer')
    expect(markup).toContain('Axiom UI')
    expect(markup).toContain('Todo')
    expect(markup).toContain('HIGH')
    expect(markup).toContain('Victor')
    expect(markup).toContain('bug')
    expect(markup).toContain('Bring Forge issues up to Linear interaction parity.')
    expect(markup).toContain('Looks ready for implementation.')
    expect(markup).toContain('Mizu')
    expect(markup).toContain('Ship it')
    expect(markup).toContain('Add comment')
    expect(markup).toContain('Use issue')
  })

  it('applies successful mutation payloads to the visible drawer issue', () => {
    const patched = applyForgeIssuePatch(
      issue,
      {
        statusId: 'review',
        projectId: null,
        assignedAgentId: 'agent-mizu',
        priority: 'URGENT',
        labelIds: ['label-agent'],
        removeLabelIds: ['label-bug']
      },
      { statuses, projects, labels, agents }
    )

    expect(patched.status.name).toBe('Review')
    expect(patched.project).toBeNull()
    expect(patched.assignedAgent?.name).toBe('Mizu')
    expect(patched.priority).toBe('URGENT')
    expect(patched.labels).toEqual(['agent'])
  })
})
