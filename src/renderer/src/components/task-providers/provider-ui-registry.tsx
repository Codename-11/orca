import { Github, Gitlab } from 'lucide-react'
import type { TaskProvider } from '../../../../shared/types'
import { ForgeIcon } from '@/components/icons/ForgeIcon'
import { JiraIcon } from '@/components/icons/JiraIcon'
import { LinearIcon } from '@/components/icons/LinearIcon'

export type TaskProviderSettingsPane = 'tasks' | 'integrations'

export type TaskProviderUiCapabilities = {
  supportsCreate: boolean
  supportsDetailDrawer: boolean
  supportsAgentFilters: boolean
}

export type TaskProviderUiOption = {
  id: TaskProvider
  label: string
  description: string
  Icon: (props: { className?: string }) => React.JSX.Element
  disabled?: boolean
  settingsPane: TaskProviderSettingsPane
  settingsKeywords: readonly string[]
  onboardingTitle: string
  onboardingDescription: string
  onboardingActionLabel: string
  capabilities: TaskProviderUiCapabilities
}

export const TASK_PROVIDER_UI_OPTIONS: readonly TaskProviderUiOption[] = [
  {
    id: 'github',
    label: 'GitHub',
    description: 'Show GitHub in the Tasks source picker and sidebar shortcuts.',
    Icon: ({ className }) => <Github className={className} />,
    settingsPane: 'integrations',
    settingsKeywords: ['github', 'pull request', 'issue', 'repository'],
    onboardingTitle: 'Connect GitHub',
    onboardingDescription: 'Connect GitHub to browse issues and pull requests from Orca.',
    onboardingActionLabel: 'Open Integrations',
    capabilities: {
      supportsCreate: false,
      supportsDetailDrawer: true,
      supportsAgentFilters: false
    }
  },
  {
    id: 'gitlab',
    label: 'GitLab',
    description: 'Show GitLab in the Tasks source picker and sidebar shortcuts.',
    Icon: ({ className }) => <Gitlab className={className} />,
    settingsPane: 'integrations',
    settingsKeywords: ['gitlab', 'merge request', 'issue', 'repository'],
    onboardingTitle: 'Connect GitLab',
    onboardingDescription: 'Install and authenticate glab to browse GitLab work items from Orca.',
    onboardingActionLabel: 'Open Integrations',
    capabilities: {
      supportsCreate: false,
      supportsDetailDrawer: true,
      supportsAgentFilters: false
    }
  },
  {
    id: 'linear',
    label: 'Linear',
    description: 'Show Linear in the Tasks source picker and sidebar shortcuts.',
    Icon: ({ className }) => <LinearIcon className={className} />,
    settingsPane: 'integrations',
    settingsKeywords: ['linear', 'workspace', 'team', 'api key'],
    onboardingTitle: 'Connect Linear',
    onboardingDescription: 'Connect Linear to browse, create, and update issues from Orca.',
    onboardingActionLabel: 'Open Integrations',
    capabilities: {
      supportsCreate: true,
      supportsDetailDrawer: true,
      supportsAgentFilters: false
    }
  },
  {
    id: 'jira',
    label: 'Jira',
    description: 'Show Jira in the Tasks source picker and sidebar shortcuts.',
    Icon: ({ className }) => <JiraIcon className={className} />,
    settingsPane: 'integrations',
    settingsKeywords: ['jira', 'atlassian', 'site', 'api token'],
    onboardingTitle: 'Connect Jira',
    onboardingDescription: 'Connect Jira to browse, create, and update issues from Orca.',
    onboardingActionLabel: 'Open Integrations',
    capabilities: {
      supportsCreate: true,
      supportsDetailDrawer: true,
      supportsAgentFilters: false
    }
  },
  {
    id: 'forge',
    label: 'Forge',
    description: 'Show Forge in the Tasks source picker and sidebar shortcuts.',
    Icon: ({ className }) => <ForgeIcon className={className} />,
    settingsPane: 'integrations',
    settingsKeywords: ['forge', 'api key', 'base url', 'workspace', 'agent'],
    onboardingTitle: 'Connect Forge',
    onboardingDescription: 'Connect Forge to browse agent-native project work from Orca.',
    onboardingActionLabel: 'Open Integrations',
    capabilities: {
      supportsCreate: true,
      supportsDetailDrawer: true,
      supportsAgentFilters: true
    }
  }
]

const TASK_PROVIDER_UI_OPTION_BY_ID = new Map(
  TASK_PROVIDER_UI_OPTIONS.map((option) => [option.id, option])
)

export function getTaskProviderUiOption(provider: TaskProvider): TaskProviderUiOption {
  const option = TASK_PROVIDER_UI_OPTION_BY_ID.get(provider)
  if (!option) {
    throw new Error(`Unknown task provider: ${provider}`)
  }
  return option
}
