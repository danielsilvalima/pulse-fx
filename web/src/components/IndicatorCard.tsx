import { Link } from 'react-router-dom'
import type { Direction } from '../types'

const variationColor: Record<Direction, string> = {
  up: 'text-up',
  down: 'text-down',
  flat: 'text-ink',
  none: 'text-muted',
}

type IndicatorCardProps = {
  name: string
  sourceLabel: string
  valueLabel: string
  referenceLabel: string
  variationLabel: string
  lagLabel: string
  direction: Direction
  favorite: boolean
  href: string
  onToggleFavorite: () => void
}

export function IndicatorCard({
  name,
  sourceLabel,
  valueLabel,
  referenceLabel,
  variationLabel,
  lagLabel,
  direction,
  favorite,
  href,
  onToggleFavorite,
}: IndicatorCardProps) {
  return (
    <article className="flex h-full flex-col border border-line bg-card">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div>
          <p className="text-xs tracking-wide text-muted uppercase">{sourceLabel}</p>
          <h2 className="mt-1 font-serif text-2xl leading-tight text-navy">
            <Link to={href} className="hover:underline">
              {name}
            </Link>
          </h2>
        </div>
        <button
          type="button"
          aria-pressed={favorite}
          aria-label={favorite ? `Remover ${name} dos favoritos` : `Marcar ${name} como favorito`}
          onClick={onToggleFavorite}
          className="border border-line px-2 py-1 text-sm text-navy"
        >
          {favorite ? 'Salvo' : 'Salvar'}
        </button>
      </div>
      <p className="mt-6 px-4 font-sans text-3xl tracking-tight text-ink tabular-nums">{valueLabel}</p>
      <dl className="mt-auto grid gap-2 px-4 pt-4 pb-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Referência</dt>
          <dd className="tabular-nums">{referenceLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Variação</dt>
          <dd className={`tabular-nums ${variationColor[direction]}`}>{variationLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Base</dt>
          <dd>{lagLabel}</dd>
        </div>
      </dl>
    </article>
  )
}
