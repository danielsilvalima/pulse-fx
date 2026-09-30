import { DateTime } from 'luxon'
import Indicator from '#models/indicator'
import Observation from '#models/observation'
import { CATALOG } from '#services/indicator_catalog'
import { MarketClients } from '#services/market_clients'
import type { Point } from '#services/variation_rules'

export type SyncResult = {
  code: string
  status: 'skipped' | 'updated' | 'failed'
  count?: number
  error?: string
}

export async function ensureCatalog() {
  for (const item of CATALOG) {
    await Indicator.updateOrCreate({ code: item.code }, item)
  }
}

export class IndicatorSync {
  constructor(private clients = new MarketClients()) {}

  async run(options: { force?: boolean } = {}) {
    await ensureCatalog()
    const indicators = await Indicator.query().orderBy('sort_order', 'asc')
    const results: SyncResult[] = []
    for (const indicator of indicators) {
      results.push(await this.syncOne(indicator, options.force === true))
    }
    return { results }
  }

  private async syncOne(indicator: Indicator, force: boolean): Promise<SyncResult> {
    if (!force && indicator.lastSyncedAt) {
      const due = indicator.lastSyncedAt.plus({ hours: indicator.ttlHours })
      if (due > DateTime.utc()) return { code: indicator.code, status: 'skipped' }
    }

    const end = DateTime.utc().startOf('day')
    const start =
      indicator.frequency === 'daily' ? end.minus({ days: 200 }) : end.minus({ months: 60 })

    try {
      const points = await this.fetchPoints(indicator, start, end)
      await this.store(indicator, points)
      indicator.lastSyncedAt = DateTime.utc()
      indicator.lastSyncError = null
      await indicator.save()
      return { code: indicator.code, status: 'updated', count: points.length }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'sync failed'
      indicator.lastSyncError = message
      await indicator.save()
      return { code: indicator.code, status: 'failed', error: message }
    }
  }

  private fetchPoints(indicator: Indicator, start: DateTime, end: DateTime): Promise<Point[]> {
    if (indicator.source === 'bcb_ptax') return this.clients.ptax(indicator.externalId, start, end)
    if (indicator.source === 'bcb_sgs') return this.clients.sgs(indicator.externalId, start)
    if (indicator.source === 'ipeadata') return this.clients.ipeadata(indicator.externalId, start)
    return this.clients.fred(indicator.externalId, start)
  }

  private async store(indicator: Indicator, points: Point[]) {
    for (const point of points) {
      await Observation.updateOrCreate(
        { indicatorId: indicator.id, observedOn: point.date },
        { value: point.value }
      )
    }
  }
}
