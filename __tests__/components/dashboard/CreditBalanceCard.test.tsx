import React from 'react'
import { render, screen } from '@testing-library/react'
import { CreditBalanceCard } from '@/components/dashboard/CreditBalanceCard'

describe('CreditBalanceCard', () => {
  const mockCredit = {
    type: 'meeting_room_hours' as const,
    total: 10,
    used: 3,
    remaining: 7,
    last_allocated: '2025-10-01T00:00:00Z',
    expires_at: '2025-11-01T00:00:00Z',
  }

  it('renders credit card with correct information', () => {
    render(<CreditBalanceCard credit={mockCredit} />)

    expect(screen.getByText('Meeting Room Hours')).toBeInTheDocument()
    expect(screen.getByText('7 / 10 hours remaining')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument() // Total
    expect(screen.getByText('3')).toBeInTheDocument() // Used
    expect(screen.getByText('7')).toBeInTheDocument() // Remaining
  })

  it('displays correct icon for each credit type', () => {
    const { rerender } = render(<CreditBalanceCard credit={mockCredit} />)
    expect(screen.getByText('🏢')).toBeInTheDocument()

    rerender(
      <CreditBalanceCard
        credit={{ ...mockCredit, type: 'printing_credits' }}
      />
    )
    expect(screen.getByText('🖨️')).toBeInTheDocument()

    rerender(
      <CreditBalanceCard credit={{ ...mockCredit, type: 'guest_passes' }} />
    )
    expect(screen.getByText('👥')).toBeInTheDocument()
  })

  it('shows low balance warning when remaining < 25%', () => {
    const lowBalanceCredit = { ...mockCredit, used: 9, remaining: 1 }
    render(<CreditBalanceCard credit={lowBalanceCredit} />)

    expect(screen.getByText('Low Balance')).toBeInTheDocument()
  })

  it('displays expiration warning for credits expiring soon', () => {
    const expiringCredit = {
      ...mockCredit,
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    }
    render(<CreditBalanceCard credit={expiringCredit} />)

    expect(screen.getByText(/Credits expire on/)).toBeInTheDocument()
  })

  it('does not show expiration warning for credits not expiring soon', () => {
    const notExpiringCredit = {
      ...mockCredit,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    }
    render(<CreditBalanceCard credit={notExpiringCredit} />)

    expect(screen.queryByText(/Credits expire on/)).not.toBeInTheDocument()
  })

  it('displays last allocated date when available', () => {
    render(<CreditBalanceCard credit={mockCredit} />)

    expect(screen.getByText(/Last allocated:/)).toBeInTheDocument()
    expect(screen.getByText('Oct 1, 2025')).toBeInTheDocument()
  })

  it('calculates progress bar percentage correctly', () => {
    render(<CreditBalanceCard credit={mockCredit} />)

    // 7/10 remaining = 70% should be displayed
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  it('handles zero total credits', () => {
    const zeroCredit = { ...mockCredit, total: 0, used: 0, remaining: 0 }
    render(<CreditBalanceCard credit={zeroCredit} />)

    expect(screen.getByText('0 / 0 hours remaining')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})