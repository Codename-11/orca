export async function resolveWorktreeCreateBaseBranch(args: {
  explicitBaseBranch: string | undefined
  repoWorktreeBaseRef?: string | undefined
  loadDefaultBaseRef?: () => Promise<string | null | undefined>
}): Promise<string | undefined> {
  const explicitBaseBranch = args.explicitBaseBranch?.trim()
  if (explicitBaseBranch) {
    return explicitBaseBranch
  }
  const pinnedBaseRef = args.repoWorktreeBaseRef?.trim()
  if (pinnedBaseRef) {
    return pinnedBaseRef
  }
  const defaultBaseRef = (await args.loadDefaultBaseRef?.())?.trim()
  return defaultBaseRef || undefined
}
