import type { CommandHandler } from '../dispatch'
import { runLocalSourceUpdate } from '../update/local-source-update'

export const UPDATE_HANDLERS: Record<string, CommandHandler> = {
  update: async ({ flags, json }) => {
    await runLocalSourceUpdate('cli', flags, json)
  },
  'update cli': async ({ flags, json }) => {
    await runLocalSourceUpdate('cli', flags, json)
  },
  'update serve': async ({ flags, json }) => {
    await runLocalSourceUpdate('serve', flags, json)
  },
  'update all': async ({ flags, json }) => {
    await runLocalSourceUpdate('all', flags, json)
  },
  'update status': async ({ flags, json }) => {
    await runLocalSourceUpdate('status', flags, json)
  }
}
