import { createLocalizedCatalog } from '@/i18n/localized-catalog'
import { translate } from '@/i18n/i18n'
import { translateSearchKeyword } from './settings-search-keywords'

export const getGeneralAgentSearchEntries = createLocalizedCatalog(() => [
  {
    title: translate('auto.components.settings.general.search.db11502270', 'Default Agent'),
    description: translate(
      'auto.components.settings.general.search.e2da948f59',
      'Pre-select an AI coding agent in the new-workspace composer.'
    ),
    keywords: [
      ...translateSearchKeyword('auto.components.settings.general.search.8ea37a05bc', 'agent'),
      ...translateSearchKeyword('auto.components.settings.general.search.41c2f9a025', 'default'),
      ...translateSearchKeyword('auto.components.settings.general.search.95b63edde7', 'claude'),
      ...translateSearchKeyword('auto.components.settings.general.search.aea7d2cccb', 'openclaude'),
      ...translateSearchKeyword(
        'auto.components.settings.general.search.5baf51c4d9',
        'open claude'
      ),
      ...translateSearchKeyword('auto.components.settings.general.search.27d9b996ba', 'codex'),
      ...translateSearchKeyword('auto.components.settings.general.search.882c4896fd', 'opencode'),
      ...translateSearchKeyword('auto.components.settings.general.search.9b0bc30160', 'pi'),
      ...translateSearchKeyword('auto.components.settings.general.search.5fdf1dc2d1', 'omp'),
      ...translateSearchKeyword('auto.components.settings.general.search.3c30fe2d51', 'gemini'),
      ...translateSearchKeyword('auto.components.settings.general.search.f472e97440', 'aider'),
      ...translateSearchKeyword('auto.components.settings.general.search.5d9ba08673', 'copilot'),
      ...translateSearchKeyword('auto.components.settings.general.search.c61b14be7c', 'grok'),
      ...translateSearchKeyword('auto.lib.agent.catalog.fc80296033', 'devin')
    ]
  }
])
