import type { Point } from '#services/variation_rules'

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function rowsOf(payload: unknown, key: string): Record<string, unknown>[] {
  const record = asRecord(payload)
  const rows = record?.[key]
  if (!Array.isArray(rows)) return []
  return rows.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const normalized = value.trim().replace(',', '.')
  if (!normalized || normalized === '.') return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function parsePtaxPayload(payload: unknown): Point[] {
  const byDay = new Map<string, { date: string; value: number; stamp: string }>()
  for (const row of rowsOf(payload, 'value')) {
    const stamp = typeof row.dataHoraCotacao === 'string' ? row.dataHoraCotacao : ''
    const date = stamp.slice(0, 10)
    const value = parseNumber(row.cotacaoVenda)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || value === null) continue
    const current = byDay.get(date)
    if (!current || stamp > current.stamp) byDay.set(date, { date, value, stamp })
  }
  return [...byDay.values()]
    .map(({ date, value }) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function parseSgsPayload(payload: unknown): Point[] {
  const rows = Array.isArray(payload) ? payload : []
  const points: Point[] = []
  for (const row of rows) {
    const record = asRecord(row)
    if (!record || typeof record.data !== 'string') continue
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(record.data)
    const value = parseNumber(record.valor)
    if (!match || value === null) continue
    points.push({ date: `${match[3]}-${match[2]}-${match[1]}`, value })
  }
  return points.sort((a, b) => a.date.localeCompare(b.date))
}

function calendarDate(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  if (iso) return iso[1]
  const ticks = /^\/Date\((-?\d+)\)\/$/.exec(value)
  if (!ticks) return null
  const date = new Date(Number(ticks[1]))
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

export function parseIpeadataPayload(payload: unknown): Point[] {
  const byDate = new Map<string, number>()
  for (const row of rowsOf(payload, 'value')) {
    const date = calendarDate(row.VALDATA)
    const value = parseNumber(row.VALVALOR)
    if (!date || value === null) continue
    byDate.set(date, value)
  }
  return [...byDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function parseWorldBankPayload(payload: unknown): Point[] {
  if (!Array.isArray(payload) || !Array.isArray(payload[1])) return []
  const points: Point[] = []
  for (const row of payload[1]) {
    const record = asRecord(row)
    if (!record || typeof record.date !== 'string' || !/^\d{4}$/.test(record.date)) continue
    const value = parseNumber(record.value)
    if (value === null) continue
    points.push({ date: `${record.date}-01-01`, value })
  }
  return points.sort((a, b) => a.date.localeCompare(b.date))
}

export function parseFredPayload(payload: unknown): Point[] {
  const points: Point[] = []
  for (const row of rowsOf(payload, 'observations')) {
    const date = typeof row.date === 'string' ? row.date : ''
    const value = parseNumber(row.value)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || value === null) continue
    points.push({ date, value })
  }
  return points.sort((a, b) => a.date.localeCompare(b.date))
}
