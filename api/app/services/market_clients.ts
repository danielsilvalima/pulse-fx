import { type DateTime } from 'luxon'
import env from '#start/env'
import type { Point } from '#services/variation_rules'
import { parseFredPayload, parsePtaxPayload, parseSgsPayload } from '#services/series_parsers'

const TIMEOUT_MS = 20_000

export class MarketClients {
  constructor(private fetchImpl: typeof fetch = fetch) {}

  async ptax(currency: string, start: DateTime, end: DateTime): Promise<Point[]> {
    const moeda = encodeURIComponent(`'${currency}'`)
    const initial = encodeURIComponent(`'${start.toFormat('MM-dd-yyyy')}'`)
    const final = encodeURIComponent(`'${end.toFormat('MM-dd-yyyy')}'`)
    const url =
      'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/' +
      'CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)' +
      `?@moeda=${moeda}&@dataInicial=${initial}&@dataFinalCotacao=${final}` +
      '&$format=json&$select=cotacaoVenda,dataHoraCotacao'
    return parsePtaxPayload(await this.readJson(url))
  }

  async sgs(seriesId: string, start: DateTime): Promise<Point[]> {
    const url = new URL(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesId}/dados`)
    url.searchParams.set('formato', 'json')
    url.searchParams.set('dataInicial', start.toFormat('dd/MM/yyyy'))
    return parseSgsPayload(await this.readJson(url))
  }

  async fred(seriesId: string, start: DateTime): Promise<Point[]> {
    const apiKey = env.get('FRED_API_KEY')
    if (!apiKey) throw new Error('FRED_API_KEY is not set')
    const url = new URL('https://api.stlouisfed.org/fred/series/observations')
    url.searchParams.set('series_id', seriesId)
    url.searchParams.set('api_key', apiKey)
    url.searchParams.set('file_type', 'json')
    url.searchParams.set('observation_start', start.toISODate() ?? '2000-01-01')
    return parseFredPayload(await this.readJson(url))
  }

  private async readJson(url: string | URL): Promise<unknown> {
    const response = await this.fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!response.ok) throw new Error(`upstream ${response.status}`)
    return response.json() as Promise<unknown>
  }
}
