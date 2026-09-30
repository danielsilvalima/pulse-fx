import logger from '@adonisjs/core/services/logger'
import type { ApplicationService } from '@adonisjs/core/types'

export default class SyncProvider {
  constructor(protected app: ApplicationService) {}

  async ready() {
    if (this.app.getEnvironment() !== 'web') return

    const { IndicatorSync } = await import('#services/indicator_sync')
    const sync = new IndicatorSync()
    const run = () => {
      sync.run().catch((error: unknown) => {
        logger.error({ err: error }, 'indicator sync failed')
      })
    }

    const boot = setTimeout(run, 2000)
    const timer = setInterval(run, 30 * 60 * 1000)
    this.app.terminating(() => {
      clearTimeout(boot)
      clearInterval(timer)
    })
  }
}
