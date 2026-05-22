export function shouldDisableKittyKeyboardForTerminal(args: {
  userAgent: string
  connectionId: string | null | undefined
}): boolean {
  // Why: Windows local PTYs run through ConPTY, where some native CLIs do not
  // handle xterm's Kitty-enhanced key sequences. SSH terminals keep the
  // enhanced protocol for remotes that understand it.
  return args.userAgent.includes('Windows') && args.connectionId === null
}
