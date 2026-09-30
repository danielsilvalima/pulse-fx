import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Favorite from '#models/favorite'
import Indicator from '#models/indicator'
import { ensureCatalog } from '#services/indicator_sync'

test.group('favorites persistence', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('stores a favorite for an anonymous viewer', async ({ client, assert }) => {
    await ensureCatalog()
    const created = await client.post('/viewers')
    created.assertStatus(200)
    const viewerId = created.body().data.id as string

    const saved = await client
      .put(`/viewers/${viewerId}/favorites/eur-brl`)
      .json({ selected: true })
    saved.assertStatus(200)

    const indicator = await Indicator.findByOrFail('code', 'eur-brl')
    const row = await Favorite.query()
      .where('viewerId', viewerId)
      .where('indicatorId', indicator.id)
      .first()
    assert.isNotNull(row)

    const list = await client.get(`/indicators?viewerId=${viewerId}`)
    const euro = list.body().data.find((item: { code: string }) => item.code === 'eur-brl')
    const dollar = list.body().data.find((item: { code: string }) => item.code === 'usd-brl')
    assert.isTrue(euro.favorite)
    assert.isFalse(dollar.favorite)

    const removed = await client
      .put(`/viewers/${viewerId}/favorites/eur-brl`)
      .json({ selected: false })
    removed.assertStatus(200)
    const after = await Favorite.query().where('viewerId', viewerId)
    assert.lengthOf(after, 0)
  })
})
