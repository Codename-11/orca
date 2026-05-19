/*
 * Why: project metadata is read on demand (issue create flow + filter UI) so
 * it lives in its own module to keep the issues operation surface tight.
 */
import type { ForgeProjectSummary } from '../../shared/types'
import { forgeTool, projectArray } from './client'

export async function listProjects(): Promise<ForgeProjectSummary[]> {
  const json = await forgeTool('projects.list')
  return projectArray(json)
}
