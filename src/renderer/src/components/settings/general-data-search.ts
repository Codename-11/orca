import { createLocalizedCatalog } from '@/i18n/localized-catalog'
import { translate } from '@/i18n/i18n'
import { translateSearchKeyword } from './settings-search-keywords'

export const getGeneralDataSearchEntries = createLocalizedCatalog(() => [
  {
    title: translate('auto.components.settings.general.search.2a60252831', 'Profile Import / Export'),
    description: translate(
      'auto.components.settings.general.search.7f5d7c3d28',
      'Move Orca settings, repositories, workspaces, automations, and UI preferences.'
    ),
    keywords: [
      ...translateSearchKeyword('auto.components.settings.general.search.0b30d8b3f1', 'profile'),
      ...translateSearchKeyword('auto.components.settings.general.search.89ebf1c5b9', 'import'),
      ...translateSearchKeyword('auto.components.settings.general.search.9dcf523e7b', 'export'),
      ...translateSearchKeyword('auto.components.settings.general.search.95cc113f38', 'backup'),
      ...translateSearchKeyword('auto.components.settings.general.search.50a0ee37bb', 'restore'),
      ...translateSearchKeyword('auto.components.settings.general.search.7556bf114f', 'migration'),
      ...translateSearchKeyword('auto.components.settings.general.search.e7e6b7e9f0', 'axiom')
    ]
  }
])
