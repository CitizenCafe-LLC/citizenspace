import React from 'react'
import { render, screen } from '@testing-library/react'
import { OrderTracker } from '@/components/menu/OrderTracker'

describe('OrderTracker', () => {
  it('renders all status steps', () => {
    render(<OrderTracker status="pending" />)

    expect(screen.getByText('Order Placed')).toBeInTheDocument()
    expect(screen.getByText('Preparing')).toBeInTheDocument()
    expect(screen.getByText('Ready')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('highlights current status', () => {
    render(<OrderTracker status="preparing" />)

    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('displays estimated time when provided', () => {
    render(<OrderTracker status="preparing" estimatedTime={15} />)

    expect(screen.getByText('15 minutes')).toBeInTheDocument()
    expect(screen.getByText('Estimated ready time')).toBeInTheDocument()
  })

  it('does not show estimated time for completed orders', () => {
    render(<OrderTracker status="completed" estimatedTime={15} />)

    expect(screen.queryByText('Estimated ready time')).not.toBeInTheDocument()
  })

  it('shows cancelled status', () => {
    render(<OrderTracker status="cancelled" />)

    expect(screen.getByText('Cancelled')).toBeInTheDocument()
    expect(screen.getByText('This order has been cancelled')).toBeInTheDocument()
  })

  it('marks completed steps with checkmark', () => {
    const { container } = render(<OrderTracker status="ready" />)

    // Should have checkmarks for pending and preparing steps
    const checkmarks = container.querySelectorAll('.lucide-check-circle-2')
    expect(checkmarks.length).toBeGreaterThan(0)
  })
})