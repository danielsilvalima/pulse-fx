import type { HttpContext } from '@adonisjs/core/http'
import { IndicatorSync } from '#services/indicator_sync'

export default class SyncController {
  async store(ctx: HttpContext) {
    const force = ctx.request.input('force') === true || ctx.request.input('force') === 'true'
    const data = await new IndicatorSync().run({ force })
    return { data }
  }
}
