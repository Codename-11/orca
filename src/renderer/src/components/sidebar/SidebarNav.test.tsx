import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { getDefaultSettings } from '../../../../shared/constants'
import {
  shouldShowAgentsButton,
  shouldShowMobileButton,
  shouldShowSetupGuideEntry,
  SidebarTaskProviderShortcuts
} from './SidebarNav'

function renderShortcuts(
  providers: Parameters<typeof SidebarTaskProviderShortcuts>[0]['visibleTaskProviders']
): string {
  return renderToStaticMarkup(
    <SidebarTaskProviderShortcuts
      canBrowseTasks
      visibleTaskProviders={providers}
      openTaskPage={vi.fn()}
    />
  )
}

describe('SidebarNav', () => {
  it('hides the Agents entry while settings are loading', () => {
    expect(shouldShowAgentsButton(null)).toBe(false)
  })

  it('hides the Agents entry while the experimental Agents view is off', () => {
    expect(
      shouldShowAgentsButton({
        ...getDefaultSettings('/tmp'),
        experimentalActivity: false
      })
    ).toBe(false)
  })

  it('shows the Agents entry when the experimental Agents view is on', () => {
    expect(
      shouldShowAgentsButton({
        ...getDefaultSettings('/tmp'),
        experimentalActivity: true
      })
    ).toBe(true)
  })

  it('shows the Mobile entry by default for older settings', () => {
    expect(shouldShowMobileButton(null)).toBe(true)
    expect(shouldShowMobileButton({})).toBe(true)
  })

  it('hides the Mobile entry when the sidebar setting is off', () => {
    expect(shouldShowMobileButton({ showMobileButton: false })).toBe(false)
  })

  it('shows the setup guide entry only before completion and before explicit hide', () => {
    expect(shouldShowSetupGuideEntry(false, false)).toBe(true)
    expect(shouldShowSetupGuideEntry(true, false)).toBe(false)
    expect(shouldShowSetupGuideEntry(false, true)).toBe(false)
  })
})

describe('SidebarTaskProviderShortcuts', () => {
  it('renders a shortcut icon for every visible task provider including Forge', () => {
    const markup = renderShortcuts(['github', 'gitlab', 'linear', 'forge'])

    expect(markup).toContain('Open GitHub tasks')
    expect(markup).toContain('Open GitLab tasks')
    expect(markup).toContain('Open Linear tasks')
    expect(markup).toContain('Open Forge tasks')
  })

  it('does not render shortcuts for hidden providers', () => {
    const markup = renderShortcuts(['forge'])

    expect(markup).toContain('Open Forge tasks')
    expect(markup).not.toContain('Open GitHub tasks')
    expect(markup).not.toContain('Open Linear tasks')
  })
})
