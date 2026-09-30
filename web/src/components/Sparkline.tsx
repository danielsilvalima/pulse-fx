import { useState } from 'react'
import { formatDate, formatValue } from '../lib/format'
import type { Unit } from '../types'

type HistoryPoint = {
  date: string
  value: number
}

type SparklineProps = {
  points: HistoryPoint[]
  unit: Unit
}

const WIDTH = 640
const HEIGHT = 168
const PAD_X = 16
const PAD_Y = 16

export function Sparkline({ points, unit }: SparklineProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (points.length < 2) {
    return <p className="text-sm text-muted">Histórico curto demais para o gráfico.</p>
  }

  const min = Math.min(...points.map((point) => point.value))
  const max = Math.max(...points.map((point) => point.value))
  const span = max - min || 1
  const lastIndex = points.length - 1
  const selected = activeIndex ?? lastIndex
  const active = points[selected]

  const xOf = (index: number) =>
    PAD_X + (index / lastIndex) * (WIDTH - PAD_X * 2)
  const yOf = (value: number) =>
    HEIGHT - PAD_Y - ((value - min) / span) * (HEIGHT - PAD_Y * 2)

  const line = points
    .map((point, index) => `${xOf(index).toFixed(1)},${yOf(point.value).toFixed(1)}`)
    .join(' ')

  function indexFromClientX(svg: SVGSVGElement, clientX: number) {
    const rect = svg.getBoundingClientRect()
    const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width
    const x = ratio * WIDTH
    const plot = WIDTH - PAD_X * 2
    const index = Math.round(((x - PAD_X) / plot) * lastIndex)
    return Math.min(lastIndex, Math.max(0, index))
  }

  return (
    <div className="grid gap-2">
      <p className="text-xs text-muted tabular-nums">Máximo {formatValue(max, unit)}</p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-44 w-full cursor-crosshair text-navy outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy"
        role="img"
        tabIndex={0}
        aria-label={`${formatDate(active.date)}, ${formatValue(active.value, unit)}`}
        onMouseMove={(event) => setActiveIndex(indexFromClientX(event.currentTarget, event.clientX))}
        onMouseLeave={() => setActiveIndex(null)}
        onFocus={() => setActiveIndex(lastIndex)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            setActiveIndex(Math.min(lastIndex, selected + 1))
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            setActiveIndex(Math.max(0, selected - 1))
          }
        }}
      >
        <polyline fill="none" stroke="currentColor" strokeWidth="2" points={line} />
        <circle cx={xOf(lastIndex)} cy={yOf(points[lastIndex].value)} r="5" fill="currentColor" />
        {selected !== lastIndex && (
          <circle
            cx={xOf(selected)}
            cy={yOf(active.value)}
            r="5"
            className="fill-card stroke-current"
            strokeWidth="2"
          />
        )}
      </svg>
      <div className="flex items-start justify-between gap-4 text-xs text-muted tabular-nums">
        <span>Mínimo {formatValue(min, unit)}</span>
        <span>
          {formatDate(points[0].date)} — {formatDate(points[lastIndex].date)}
        </span>
      </div>
      <p className="text-sm text-ink tabular-nums">
        {formatDate(active.date)} · {formatValue(active.value, unit)}
      </p>
      <p className="text-xs text-muted">
        Janela de {formatValue(min, unit)} a {formatValue(max, unit)}. Passe o cursor ou use as setas
        no gráfico.
      </p>
    </div>
  )
}
