/**
 * Tests for OrderQueue component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OrderQueue } from '@/components/admin/OrderQueue'

const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customer: { name: 'John Doe', email: 'john@example.com' },
    items: [
      { id: 'i1', name: 'Cappuccino', quantity: 1 },
      { id: 'i2', name: 'Croissant', quantity: 2 },
    ],
    status: 'pending' as const,
    total: 12.5,
    createdAt: new Date('2025-09-29T10:00:00'),
    updatedAt: new Date('2025-09-29T10:00:00'),
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customer: { name: 'Jane Smith', email: 'jane@example.com' },
    items: [{ id: 'i3', name: 'Latte', quantity: 1 }],
    status: 'preparing' as const,
    total: 5.0,
    createdAt: new Date('2025-09-29T09:30:00'),
    updatedAt: new Date('2025-09-29T09:35:00'),
  },
]

describe('OrderQueue', () => {
  const mockOnUpdateStatus = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders order queue with tabs', () => {
    render(
      <OrderQueue
        orders={mockOrders}
        onUpdateStatus={mockOnUpdateStatus}
        autoRefresh={false}
      />
    )

    expect(screen.getByText('Order Queue')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Pending/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Preparing/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Ready/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Completed/i })).toBeInTheDocument()
  })

  it('displays pending orders count badge', () => {
    render(
      <OrderQueue
        orders={mockOrders}
        onUpdateStatus={mockOnUpdateStatus}
        autoRefresh={false}
      />
    )

    const pendingTab = screen.getByRole('tab', { name: /Pending/i })
    expect(pendingTab).toHaveTextContent('1')
  })

  it('shows order details in pending tab', () => {
    render(
      <OrderQueue
        orders={mockOrders}
        onUpdateStatus={mockOnUpdateStatus}
        autoRefresh={false}
      />
    )

    expect(screen.getByText('Order #ORD-001')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('1x Cappuccino')).toBeInTheDocument()
    expect(screen.getByText('2x Croissant')).toBeInTheDocument()
    expect(screen.getByText('$12.50')).toBeInTheDocument()
  })

  it('updates order status when button clicked', async () => {
    render(
      <OrderQueue
        orders={mockOrders}
        onUpdateStatus={mockOnUpdateStatus}
        autoRefresh={false}
      />
    )

    const updateButton = screen.getByRole('button', { name: /Mark as preparing/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(mockOnUpdateStatus).toHaveBeenCalledWith('1', 'preparing')
    })
  })

  it('switches to preparing tab and shows correct orders', () => {
    render(
      <OrderQueue
        orders={mockOrders}
        onUpdateStatus={mockOnUpdateStatus}
        autoRefresh={false}
      />
    )

    const preparingTab = screen.getByRole('tab', { name: /Preparing/i })
    fireEvent.click(preparingTab)

    expect(screen.getByText('Order #ORD-002')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('shows empty state when no orders in tab', () => {
    render(
      <OrderQueue
        orders={mockOrders}
        onUpdateStatus={mockOnUpdateStatus}
        autoRefresh={false}
      />
    )

    const readyTab = screen.getByRole('tab', { name: /Ready/i })
    fireEvent.click(readyTab)

    expect(screen.getByText('No ready orders')).toBeInTheDocument()
  })

  it('displays correct status badge colors', () => {
    const { container } = render(
      <OrderQueue
        orders={mockOrders}
        onUpdateStatus={mockOnUpdateStatus}
        autoRefresh={false}
      />
    )

    const pendingBadge = screen.getByText('pending')
    expect(pendingBadge).toHaveClass('bg-yellow-500')
  })

  it('handles auto-refresh when enabled', async () => {
    jest.useFakeTimers()

    render(
      <OrderQueue
        orders={mockOrders}
        onUpdateStatus={mockOnUpdateStatus}
        autoRefresh={true}
        refreshInterval={1000}
      />
    )

    // Fast-forward time
    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(screen.getByText('Auto-refreshed')).toBeInTheDocument()
    })

    jest.useRealTimers()
  })
})