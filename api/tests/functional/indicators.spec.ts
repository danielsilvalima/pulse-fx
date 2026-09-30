import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Indicator from '#models/indicator'
import Observation from '#models/observation'
import { ensureCatalog } from '#services/indicator_sync'

test.group('indicators http', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('returns the stored close and the same variation used on the detail', async ({
    client,
    assert,
  }) => {
    await ensureCatalog()
    const indicator = await Indicator.findByOrFail('code', 'usd-brl')
    const prints: Array<[string, number]> = [
      ['2026-03-02', 5],
      ['2026-03-03', 5.1],
      ['2026-03-04', 5.2],
      ['2026-03-05', 5.2],
      ['2026-03-06', 5.3],
      ['2026-03-09', 5.5],
    ]
    for (const [date, value] of prints) {
      await Observation.create({ indicatorId: indicator.id, observedOn: date, value })
    }

    const detail = await client.get('/indicators/usd-brl')
    detail.assertStatus(200)
    assert.equal(detail.body().data.referenceDate, '2026-03-09')
    assert.equal(detail.body().data.latestValue, 5.5)
    assert.closeTo(detail.body().data.variationPercent, 10, 0.0001)
    assert.lengthOf(detail.body().data.history, 6)

    const list = await client.get('/indicators')
    list.assertStatus(200)
    const card = list.body().data.find((item: { code: string }) => item.code === 'usd-brl')
    assert.closeTo(card.variationPercent, 10, 0.0001)
    assert.equal(card.referenceDate, '2026-03-09')
  })

  test('rejects an admin sync without the token', async ({ client }) => {
    const response = await client.post('/admin/sync').json({ force: true })
    response.assertStatus(401)
  })
})
