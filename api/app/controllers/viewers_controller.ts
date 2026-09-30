import { randomUUID } from 'node:crypto'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import Favorite from '#models/favorite'
import Indicator from '#models/indicator'
import Viewer from '#models/viewer'
import { ensureCatalog } from '#services/indicator_sync'

const favoriteValidator = vine.compile(
  vine.object({
    selected: vine.boolean(),
  })
)

export default class ViewersController {
  async store() {
    const viewer = await Viewer.create({ id: randomUUID() })
    return { data: { id: viewer.id } }
  }

  async update(ctx: HttpContext) {
    const viewer = await Viewer.find(ctx.params.id)
    if (!viewer) return ctx.response.notFound({ message: 'Perfil não encontrado' })

    await ensureCatalog()
    const indicator = await Indicator.findBy('code', ctx.params.code)
    if (!indicator) return ctx.response.notFound({ message: 'Indicador não encontrado' })

    const { selected } = await ctx.request.validateUsing(favoriteValidator)
    if (selected) {
      await Favorite.firstOrCreate(
        { viewerId: viewer.id, indicatorId: indicator.id },
        { viewerId: viewer.id, indicatorId: indicator.id }
      )
    } else {
      await Favorite.query()
        .where('viewerId', viewer.id)
        .where('indicatorId', indicator.id)
        .delete()
    }

    return { data: { code: indicator.code, selected } }
  }
}
