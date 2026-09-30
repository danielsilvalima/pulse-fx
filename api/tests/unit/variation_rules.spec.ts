import { test } from '@japa/runner'
import { relativeChange, variationFromMonths, variationFromPrints } from '#services/variation_rules'

test.group('variation rules', () => {
  test('compares the last daily print with five available prints earlier', ({ assert }) => {
    const points = [
      { date: '2026-03-02', value: 5 },
      { date: '2026-03-03', value: 5.1 },
      { date: '2026-03-04', value: 5.2 },
      { date: '2026-03-05', value: 5.2 },
      { date: '2026-03-06', value: 5.3 },
      { date: '2026-03-09', value: 5.5 },
    ]

    const variation = variationFromPrints(points, 5)
    assert.equal(variation?.base.date, '2026-03-02')
    assert.equal(variation?.current.date, '2026-03-09')
    assert.closeTo(variation?.percent ?? 0, 10, 0.0001)
  })

  test('does not invent a base when the daily history is short', ({ assert }) => {
    const points = [
      { date: '2026-03-02', value: 5 },
      { date: '2026-03-03', value: 5.1 },
    ]
    assert.isNull(variationFromPrints(points, 5))
  })

  test('uses the level in force twelve months earlier', ({ assert }) => {
    const points = [
      { date: '2024-06-01', value: 10.5 },
      { date: '2025-01-15', value: 12 },
      { date: '2025-09-01', value: 13 },
      { date: '2026-03-01', value: 14 },
    ]
    const variation = variationFromMonths(points, 12)
    assert.equal(variation?.base.date, '2025-01-15')
    assert.equal(variation?.current.value, 14)
  })

  test('returns null when the base value is zero', ({ assert }) => {
    assert.isNull(relativeChange(5, 0))
  })
})
