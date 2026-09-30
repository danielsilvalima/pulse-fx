import type { Direction, Unit } from '../types'

export function formatDate(iso: string | null) {
  if (!iso) return 'Sem data'
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${day}/${month}/${year}`
}

export function formatValue(value: number | null, unit: Unit) {
  if (value === null || Number.isNaN(value)) return 'Sem dado'
  if (unit === 'brl') {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })
  }
  if (unit === 'percent') {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
  }
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

export function formatVariation(value: number | null) {
  if (value === null || Number.isNaN(value)) return 'Sem base'
  const text = Math.abs(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (value > 0) return `+${text}%`
  if (value < 0) return `-${text}%`
  return `${text}%`
}

export function directionOf(value: number | null): Direction {
  if (value === null || Number.isNaN(value)) return 'none'
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'flat'
}

export function sourceLabel(source: string) {
  if (source === 'bcb_ptax') return 'BCB PTAX'
  if (source === 'bcb_sgs') return 'BCB SGS'
  return 'FRED'
}

export function lagLabel(frequency: string, lag: number) {
  if (frequency === 'daily') return `${lag} pregões com dado`
  return `${lag} meses`
}
