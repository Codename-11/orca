import type React from 'react'
import { useState } from 'react'
import { Download, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import type {
  ProfileExportSection,
  ProfileImportPreview
} from '../../../../shared/profile-portability'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { SearchableSetting } from './SearchableSetting'

const PROFILE_IMPORT_SECTION_LABELS: Record<ProfileExportSection, string> = {
  settings: 'settings',
  repos: 'repositories',
  sparsePresetsByRepo: 'sparse presets',
  worktreeMeta: 'workspace metadata',
  worktreeLineageById: 'workspace lineage',
  ui: 'UI preferences',
  workspaceSession: 'workspace session',
  sshTargets: 'SSH hosts',
  automations: 'automations',
  automationRuns: 'automation run history',
  onboarding: 'onboarding state'
}

function formatProfileImportSummary(preview: ProfileImportPreview): string {
  if (!preview.valid) {
    return preview.error ?? 'This file cannot be imported.'
  }
  return preview.sections
    .map((section) => `${PROFILE_IMPORT_SECTION_LABELS[section]} (${preview.counts[section] ?? 0})`)
    .join(', ')
}

export function GeneralDataPortabilitySection(): React.JSX.Element {
  const [profileExporting, setProfileExporting] = useState(false)
  const [profileImporting, setProfileImporting] = useState(false)
  const [profileImportCandidate, setProfileImportCandidate] = useState<{
    filePath: string
    preview: ProfileImportPreview
  } | null>(null)

  const handleExportProfile = async (): Promise<void> => {
    setProfileExporting(true)
    try {
      const result = await window.api.settings.exportProfile()
      if (result.canceled) {
        return
      }
      toast.success('Profile exported', {
        description: `Saved to ${result.filePath}. Secrets were excluded.`
      })
    } catch (err) {
      toast.error('Profile export failed', {
        description: err instanceof Error ? err.message : 'Unable to export the profile.'
      })
    } finally {
      setProfileExporting(false)
    }
  }

  const handlePreviewProfileImport = async (): Promise<void> => {
    setProfileImporting(true)
    try {
      const result = await window.api.settings.previewProfileImport()
      if (result.canceled) {
        return
      }
      setProfileImportCandidate({ filePath: result.filePath, preview: result.preview })
      if (!result.preview.valid) {
        toast.error('Profile import is not valid', { description: result.preview.error })
      }
    } catch (err) {
      toast.error('Profile import preview failed', {
        description: err instanceof Error ? err.message : 'Unable to preview the import file.'
      })
    } finally {
      setProfileImporting(false)
    }
  }

  const handleImportProfile = async (): Promise<void> => {
    if (!profileImportCandidate?.preview.valid) {
      return
    }
    setProfileImporting(true)
    try {
      const result = await window.api.settings.importProfile({
        filePath: profileImportCandidate.filePath,
        sections: profileImportCandidate.preview.sections
      })
      await useAppStore.getState().fetchSettings()
      setProfileImportCandidate(null)
      toast.success('Profile imported', {
        description: `Imported ${result.importedSections.length} sections. Backup: ${result.backupPath}`
      })
    } catch (err) {
      toast.error('Profile import failed', {
        description: err instanceof Error ? err.message : 'Unable to import the profile.'
      })
    } finally {
      setProfileImporting(false)
    }
  }

  return (
    <section key="data" className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Data Portability</h3>
        <p className="text-xs text-muted-foreground">
          Export this profile or import settings, repositories, workspaces, automations, and UI
          preferences from Orca or Axiom Orca.
        </p>
      </div>

      <SearchableSetting
        title="Profile Import / Export"
        description="Move Orca settings, repositories, workspaces, automations, and UI preferences."
        keywords={['profile', 'import', 'export', 'backup', 'restore', 'migration', 'axiom']}
        className="space-y-3"
      >
        <div className="space-y-1">
          <Label>Profile Import / Export</Label>
          <p className="text-xs text-muted-foreground">
            Exports omit credentials, API cookies, and private browser session links. Imports make a
            backup before replacing selected profile sections.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExportProfile()}
            disabled={profileExporting || profileImporting}
            className="gap-1.5"
          >
            {profileExporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Export Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handlePreviewProfileImport()}
            disabled={profileExporting || profileImporting}
            className="gap-1.5"
          >
            {profileImporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Choose Import File
          </Button>
        </div>
        {profileImportCandidate ? (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
            <p className="font-medium text-foreground">Import preview</p>
            <p className="mt-1 text-muted-foreground break-all">
              {profileImportCandidate.filePath}
            </p>
            <p className="mt-2 text-muted-foreground">
              {formatProfileImportSummary(profileImportCandidate.preview)}
            </p>
            {profileImportCandidate.preview.excludedSecrets.length > 0 ? (
              <p className="mt-2 text-muted-foreground">
                Credentials stay excluded: {profileImportCandidate.preview.excludedSecrets.join(', ')}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => void handleImportProfile()}
                disabled={!profileImportCandidate.preview.valid || profileImporting}
              >
                Import Selected Sections
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setProfileImportCandidate(null)}
                disabled={profileImporting}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </SearchableSetting>
    </section>
  )
}
