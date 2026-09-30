import { test } from '@japa/runner'
import { parseFredPayload, parsePtaxPayload, parseSgsPayload } from '#services/series_parsers'

test.group('series parsers', () => {
  test('keeps the last PTAX bulletin of each day', ({ assert }) => {
    const points = parsePtaxPayload({
      value: [
        { cotacaoVenda: 5.1, dataHoraCotacao: '2026-03-02 10:00:00.000' },
        { cotacaoVenda: 5.4, dataHoraCotacao: '2026-03-02 13:10:00.000' },
        { cotacaoVenda: 5.2, dataHoraCotacao: '2026-03-03 13:10:00.000' },
      ],
    })
    assert.deepEqual(points, [
      { date: '2026-03-02', value: 5.4 },
      { date: '2026-03-03', value: 5.2 },
    ])
  })

  test('reads SGS dates as calendar days', ({ assert }) => {
    const points = parseSgsPayload([
      { data: '01/03/2026', valor: '4,50' },
      { data: '01/02/2026', valor: '4.10' },
    ])
    assert.deepEqual(points, [
      { date: '2026-02-01', value: 4.1 },
      { date: '2026-03-01', value: 4.5 },
    ])
  })

  test('drops missing FRED observations', ({ assert }) => {
    const points = parseFredPayload({
      observations: [
        { date: '2026-01-01', value: '.' },
        { date: '2026-02-01', value: '4.33' },
      ],
    })
    assert.deepEqual(points, [{ date: '2026-02-01', value: 4.33 }])
  })
})
