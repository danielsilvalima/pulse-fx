import type { HttpContext } from '@adonisjs/core/http'
import { IndicatorQuery } from '#services/indicator_query'

function viewerIdFrom(request: HttpContext['request']) {
  const value = request.input('viewerId')
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export default class IndicatorsController {
  async index(ctx: HttpContext) {
    const data = await new IndicatorQuery().list(viewerIdFrom(ctx.request))
    return { data }
  }

  async show(ctx: HttpContext) {
    const data = await new IndicatorQuery().show(ctx.params.code, viewerIdFrom(ctx.request))
    if (!data) return ctx.response.notFound({ message: 'Indicador não encontrado' })
    return { data }
  }
}
