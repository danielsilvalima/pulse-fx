import { DateTime } from 'luxon'

export type Point = {
  date: string
  value: number
}

export type Variation = {
  current: Point
  base: Point
  percent: number
}

export function relativeChange(current: number, base: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(base) || base === 0) return null
  return ((current - base) / base) * 100
}

export function variationFromPrints(points: Point[], lag: number): Variation | null {
  if (lag < 1 || points.length <= lag) return null
  const current = points[points.length - 1]
  const base = points[points.length - 1 - lag]
  const percent = relativeChange(current.value, base.value)
  if (percent === null) return null
  return { current, base, percent }
}

export function variationFromMonths(points: Point[], months: number): Variation | null {
  if (months < 1 || points.length === 0) return null
  const current = points[points.length - 1]
  const currentDate = DateTime.fromISO(current.date, { zone: 'utc' })
  if (!currentDate.isValid) return null
  const target = currentDate.minus({ months }).toISODate()
  if (!target) return null

  let base: Point | null = null
  for (const point of points) {
    if (point.date <= target) base = point
    else break
  }
  if (!base || base.date === current.date) return null
  const percent = relativeChange(current.value, base.value)
  if (percent === null) return null
  return { current, base, percent }
}

export function roundPercent(value: number): number {
  return Math.round(value * 10000) / 10000
}
