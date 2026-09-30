import logger from '@adonisjs/core/services/logger'
import { MigrationRunner } from '@adonisjs/lucid/migration'
import type { ApplicationService } from '@adonisjs/core/types'

export default class SyncProvider {
  constructor(protected app: ApplicationService) {}

  async ready() {
    if (this.app.getEnvironment() !== 'web') return

    const migrated = await this.migrate()
    if (!migrated) return

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

  private async migrate() {
    const db = await this.app.container.make('lucid.db')
    const runner = new MigrationRunner(db, this.app, { direction: 'up' })
    await runner.run()
    if (runner.error) {
      logger.error({ err: runner.error }, 'database migration failed')
      return false
    }
    const applied = Object.keys(runner.migratedFiles)
    if (applied.length > 0) {
      logger.info({ files: applied }, 'database migrations applied')
    }
    return true
  }
}
