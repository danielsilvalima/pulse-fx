import { useEffect, useState } from 'react'
import { IndicatorCard } from '../components/IndicatorCard'
import { Disclaimer } from '../components/Disclaimer'
import { api } from '../lib/api'
import { directionOf, formatDate, formatValue, formatVariation, lagLabel, sourceLabel } from '../lib/format'
import { viewerId } from '../lib/viewer'
import type { IndicatorCard as Indicator } from '../types'

export function DashboardPage() {
  const [items, setItems] = useState<Indicator[]>([])
  const [profileId, setProfileId] = useState<string | null>(null)
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    viewerId()
      .then(async (id) => {
        if (!active) return
        setProfileId(id)
        const payload = await api<{ data: Indicator[] }>(`/indicators?viewerId=${id}`)
        if (active) setItems(payload.data)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os indicadores.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function toggleFavorite(item: Indicator) {
    if (!profileId) return
    const next = !item.favorite
    setItems((current) =>
      current.map((entry) => (entry.code === item.code ? { ...entry, favorite: next } : entry))
    )
    try {
      await api(`/viewers/${profileId}/favorites/${item.code}`, {
        method: 'PUT',
        body: JSON.stringify({ selected: next }),
      })
    } catch {
      setItems((current) =>
        current.map((entry) => (entry.code === item.code ? { ...entry, favorite: item.favorite } : entry))
      )
      setError('Não foi possível atualizar o favorito.')
    }
  }

  const visible = onlyFavorites ? items.filter((item) => item.favorite) : items

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-navy">Painel</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Câmbio em real e indicadores que ajudam a ler o cenário. Os números vêm do que já está salvo na base.
          </p>
        </div>
        <button
          type="button"
          aria-pressed={onlyFavorites}
          onClick={() => setOnlyFavorites((value) => !value)}
          className="border border-navy bg-navy px-3 py-2 text-sm text-paper"
        >
          {onlyFavorites ? 'Ver todos' : 'Meus indicadores'}
        </button>
      </div>
      <Disclaimer />
      {loading && <p className="text-sm text-muted">Carregando indicadores.</p>}
      {error && <p className="text-sm text-down">{error}</p>}
      {!loading && visible.length === 0 && (
        <p className="border border-dashed border-line px-4 py-8 text-sm text-muted">
          Nenhum indicador salvo ainda. Marque um card para montar a sua lista.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <IndicatorCard
            key={item.code}
            name={item.name}
            sourceLabel={sourceLabel(item.source)}
            valueLabel={formatValue(item.latestValue, item.unit)}
            referenceLabel={formatDate(item.referenceDate)}
            variationLabel={formatVariation(item.variationPercent)}
            lagLabel={lagLabel(item.frequency, item.variationLag)}
            direction={directionOf(item.variationPercent)}
            favorite={item.favorite}
            href={`/indicadores/${item.code}`}
            onToggleFavorite={() => toggleFavorite(item)}
          />
        ))}
      </div>
    </div>
  )
}
