import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { IndicatorCard } from './IndicatorCard'

describe('IndicatorCard', () => {
  it('shows the latest value, reference date and variation', async () => {
    const onToggleFavorite = vi.fn()
    render(
      <MemoryRouter>
        <IndicatorCard
          name="Dólar PTAX"
          sourceLabel="BCB PTAX"
          valueLabel="R$ 5,5000"
          referenceLabel="09/03/2026"
          variationLabel="+10,00%"
          lagLabel="5 pregões com dado"
          direction="up"
          favorite={false}
          href="/indicadores/usd-brl"
          onToggleFavorite={onToggleFavorite}
        />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'Dólar PTAX' })).toHaveAttribute(
      'href',
      '/indicadores/usd-brl'
    )
    expect(screen.getByText('R$ 5,5000')).toBeInTheDocument()
    expect(screen.getByText('09/03/2026')).toBeInTheDocument()
    expect(screen.getByText('+10,00%')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Marcar Dólar PTAX como favorito' }))
    expect(onToggleFavorite).toHaveBeenCalledOnce()
  })
})
