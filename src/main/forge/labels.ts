/*
 * Why: labels are read separately from issues so the picker UI doesn't refetch
 * the whole issue list to refresh the available label set.
 */
import type { ForgeLabel } from '../../shared/types'
import { forgeTool, labelArray } from './client'

export async function listLabels(): Promise<ForgeLabel[]> {
  const json = await forgeTool('labels.list')
  return labelArray(json)
}
