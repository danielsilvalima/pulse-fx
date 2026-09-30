import Favorite from '#models/favorite'
import Indicator from '#models/indicator'
import Observation from '#models/observation'
import { ensureCatalog } from '#services/indicator_sync'
import {
  roundPercent,
  variationFromMonths,
  variationFromPrints,
  type Point,
} from '#services/variation_rules'

function present(indicator: Indicator, points: Point[], favorite: boolean) {
  const latest = points.at(-1) ?? null
  const variation =
    indicator.frequency === 'daily'
      ? variationFromPrints(points, indicator.variationLag)
      : variationFromMonths(points, indicator.variationLag)
  const history = points.slice(-indicator.historyLimit)

  return {
    code: indicator.code,
    name: indicator.name,
    source: indicator.source,
    frequency: indicator.frequency,
    unit: indicator.unit,
    summary: indicator.summary,
    limitations: indicator.limitations,
    historyLimit: indicator.historyLimit,
    variationLag: indicator.variationLag,
    latestValue: latest?.value ?? null,
    referenceDate: latest?.date ?? null,
    variationPercent: variation ? roundPercent(variation.percent) : null,
    variationBaseDate: variation?.base.date ?? null,
    lastSyncError: indicator.lastSyncError,
    favorite,
    history,
  }
}

async function pointsFor(indicatorId: number): Promise<Point[]> {
  const rows = await Observation.query()
    .where('indicatorId', indicatorId)
    .orderBy('observedOn', 'asc')
  return rows.map((row) => ({ date: row.observedOn, value: row.value }))
}

export class IndicatorQuery {
  async list(viewerId?: string) {
    await ensureCatalog()
    const indicators = await Indicator.query().orderBy('sort_order', 'asc')
    const favorites = viewerId ? await Favorite.query().where('viewerId', viewerId) : []
    const selected = new Set(favorites.map((item) => item.indicatorId))
    const cards = []
    for (const indicator of indicators) {
      const detail = present(indicator, await pointsFor(indicator.id), selected.has(indicator.id))
      cards.push({
        code: detail.code,
        name: detail.name,
        source: detail.source,
        frequency: detail.frequency,
        unit: detail.unit,
        historyLimit: detail.historyLimit,
        variationLag: detail.variationLag,
        latestValue: detail.latestValue,
        referenceDate: detail.referenceDate,
        variationPercent: detail.variationPercent,
        variationBaseDate: detail.variationBaseDate,
        lastSyncError: detail.lastSyncError,
        favorite: detail.favorite,
      })
    }
    return cards
  }

  async show(code: string, viewerId?: string) {
    await ensureCatalog()
    const indicator = await Indicator.findBy('code', code)
    if (!indicator) return null
    const favorite = viewerId
      ? await Favorite.query()
          .where('viewerId', viewerId)
          .where('indicatorId', indicator.id)
          .first()
      : null
    return present(indicator, await pointsFor(indicator.id), !!favorite)
  }
}
