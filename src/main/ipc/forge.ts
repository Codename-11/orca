import { ipcMain } from 'electron'
import type { ForgeIssueUpdate, ForgeListFilter } from '../../shared/types'
import { getStatus, listIssues, listStatuses, searchIssues, updateIssue } from '../forge/client'

const VALID_FILTERS = new Set<ForgeListFilter>(['active', 'assigned', 'created', 'all', 'done'])

export function registerForgeHandlers(): void {
  ipcMain.handle('forge:status', async () => getStatus())
  ipcMain.handle('forge:listStatuses', async () => listStatuses())

  ipcMain.handle(
    'forge:listIssues',
    async (_event, args?: { filter?: ForgeListFilter; limit?: number }) => {
      const filter = VALID_FILTERS.has(args?.filter as ForgeListFilter)
        ? (args!.filter as ForgeListFilter)
        : 'active'
      const limit = Math.min(Math.max(1, args?.limit ?? 50), 100)
      return listIssues(filter, limit)
    }
  )

  ipcMain.handle('forge:searchIssues', async (_event, args: { query: string; limit?: number }) => {
    if (typeof args?.query !== 'string') {
      return []
    }
    const limit = Math.min(Math.max(1, args.limit ?? 50), 100)
    return searchIssues(args.query, limit)
  })

  ipcMain.handle(
    'forge:updateIssue',
    async (_event, args: { id: string; updates: ForgeIssueUpdate }) => {
      if (typeof args?.id !== 'string' || !args.id.trim()) {
        return { ok: false, error: 'Issue ID is required' }
      }
      if (!args.updates || typeof args.updates !== 'object') {
        return { ok: false, error: 'Updates object is required' }
      }
      return updateIssue(args.id.trim(), args.updates)
    }
  )
}
