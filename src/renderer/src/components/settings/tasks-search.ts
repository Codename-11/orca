import type { SettingsSearchEntry } from './settings-search'

export const TASKS_PANE_SEARCH_ENTRIES: SettingsSearchEntry[] = [
  {
    title: 'Task Providers',
    description: 'Choose which task providers appear in the Tasks page and sidebar shortcuts.',
    keywords: [
      'tasks',
      'provider',
      'source',
      'github',
      'gitlab',
      'linear',
      'forge',
      'display',
      'hide'
    ]
  },
  {
    title: 'Forge Connect',
    description: 'Connect Forge to browse and manage Forge issues from the Tasks page.',
    keywords: ['forge', 'tasks', 'connect', 'api key', 'token', 'base url', 'project manager']
  }
]
