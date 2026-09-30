import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Disclaimer } from '../components/Disclaimer'
import { Sparkline } from '../components/Sparkline'
import { api } from '../lib/api'
import {
  directionOf,
  formatDate,
  formatValue,
  formatVariation,
  lagLabel,
  sourceLabel,
} from '../lib/format'
import { viewerId } from '../lib/viewer'
import type { IndicatorDetail } from '../types'

export function DetailPage() {
  const { code } = useParams()
  const [item, setItem] = useState<IndicatorDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    let active = true
    viewerId()
      .then(async (id) => {
        const payload = await api<{ data: IndicatorDetail }>(
          `/indicators/${code}?viewerId=${encodeURIComponent(id)}`
        )
        if (active) setItem(payload.data)
      })
      .catch(() => {
        if (active) setError('Não foi possível abrir este indicador.')
      })
    return () => {
      active = false
    }
  }, [code])

  return (
    <div className="grid gap-6">
      <Link to="/" className="text-sm text-navy underline-offset-2 hover:underline">
        Voltar ao painel
      </Link>
      <Disclaimer />
      {error && <p className="text-sm text-down">{error}</p>}
      {!item && !error && <p className="text-sm text-muted">Carregando série.</p>}
      {item && (
        <>
          <header className="grid gap-2">
            <p className="text-xs tracking-wide text-muted uppercase">{sourceLabel(item.source)}</p>
            <h1 className="font-serif text-4xl text-navy">{item.name}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted">{item.summary}</p>
          </header>
          <section className="grid gap-4 border border-line bg-card p-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-muted">Último valor</p>
              <p className="mt-1 text-3xl tabular-nums">{formatValue(item.latestValue, item.unit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Data de referência</p>
              <p className="mt-1 text-3xl tabular-nums">{formatDate(item.referenceDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Variação</p>
              <p
                className={`mt-1 text-3xl tabular-nums ${
                  directionOf(item.variationPercent) === 'down'
                    ? 'text-down'
                    : directionOf(item.variationPercent) === 'up'
                      ? 'text-up'
                      : 'text-ink'
                }`}
              >
                {formatVariation(item.variationPercent)}
              </p>
              <p className="mt-1 text-xs text-muted">
                contra {lagLabel(item.frequency, item.variationLag)}
                {item.variationBaseDate ? `, base ${formatDate(item.variationBaseDate)}` : ''}
              </p>
            </div>
          </section>
          <section className="border border-line bg-card p-4">
            <h2 className="font-serif text-2xl text-navy">Histórico</h2>
            <p className="mt-1 text-sm text-muted">
              Últimos {item.historyLimit} pontos {item.frequency === 'daily' ? 'diários' : 'mensais'}.
            </p>
            <div className="mt-4">
              <Sparkline values={item.history.map((point) => point.value)} />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="py-2 font-medium">Data</th>
                    <th className="py-2 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {[...item.history].reverse().map((point) => (
                    <tr key={point.date} className="border-t border-line">
                      <td className="py-2 tabular-nums">{formatDate(point.date)}</td>
                      <td className="py-2 text-right tabular-nums">{formatValue(point.value, item.unit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="border border-line px-4 py-4">
            <h2 className="font-serif text-2xl text-navy">Limitações dos dados</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6">{item.limitations}</p>
            {item.lastSyncError && (
              <p className="mt-3 text-sm text-down">Última sincronização: {item.lastSyncError}</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
