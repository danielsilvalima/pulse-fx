export type Frequency = 'daily' | 'monthly'
export type Unit = 'brl' | 'percent' | 'index'
export type Source = 'bcb_ptax' | 'bcb_sgs' | 'fred' | 'ipeadata'

export type IndicatorCard = {
  code: string
  name: string
  source: Source
  frequency: Frequency
  unit: Unit
  historyLimit: number
  variationLag: number
  latestValue: number | null
  referenceDate: string | null
  variationPercent: number | null
  variationBaseDate: string | null
  lastSyncError: string | null
  favorite: boolean
}

export type IndicatorDetail = IndicatorCard & {
  summary: string
  limitations: string
  history: { date: string; value: number }[]
}

export type Direction = 'up' | 'down' | 'flat' | 'none'
