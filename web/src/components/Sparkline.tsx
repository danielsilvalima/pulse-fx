type SparklineProps = {
  values: number[]
}

export function Sparkline({ values }: SparklineProps) {
  if (values.length < 2) {
    return <p className="text-sm text-muted">Histórico curto demais para o gráfico.</p>
  }

  const width = 640
  const height = 160
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((value - min) / span) * (height - 16) - 8
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full text-navy" role="img" aria-label="Série histórica">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  )
}
