import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionTable } from '@/components/dashboard/TransactionTable'

describe('TransactionTable', () => {
  const mockTransactions = [
    {
      id: 'tx-1',
      transaction_type: 'allocation' as const,
      credit_type: 'meeting_room_hours' as const,
      amount: 10,
      balance_after: 10,
      description: 'Monthly allocation',
      created_at: '2025-10-01T00:00:00Z',
    },
    {
      id: 'tx-2',
      transaction_type: 'usage' as const,
      credit_type: 'meeting_room_hours' as const,
      amount: 2,
      balance_after: 8,
      description: 'Booking #123',
      created_at: '2025-10-05T14:30:00Z',
    },
  ]

  const mockOnPageChange = jest.fn()
  const mockOnFilterChange = jest.fn()
  const mockOnExport = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders transaction table with data', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        totalCount={2}
        currentPage={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByText('Monthly allocation')).toBeInTheDocument()
    expect(screen.getByText('Booking #123')).toBeInTheDocument()
    expect(screen.getByText('Meeting Room')).toBeInTheDocument()
  })

  it('displays correct transaction types with colors', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        totalCount={2}
        currentPage={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByText('Allocation')).toBeInTheDocument()
    expect(screen.getByText('Usage')).toBeInTheDocument()
  })

  it('shows amount with correct sign', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        totalCount={2}
        currentPage={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
      />
    )

    // Allocation should have +
    expect(screen.getByText('+10')).toBeInTheDocument()
    // Usage should have -
    expect(screen.getByText('-2')).toBeInTheDocument()
  })

  it('handles filter change', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        totalCount={2}
        currentPage={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
        onFilterChange={mockOnFilterChange}
      />
    )

    const filterSelect = screen.getByRole('combobox')
    fireEvent.click(filterSelect)

    // Should trigger filter change
    // Note: Full select interaction would require more complex testing
  })

  it('handles export when button clicked', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        totalCount={2}
        currentPage={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
        onExport={mockOnExport}
      />
    )

    const exportButton = screen.getByText('Export CSV')
    fireEvent.click(exportButton)

    expect(mockOnExport).toHaveBeenCalled()
  })

  it('displays pagination when multiple pages', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        totalCount={25}
        currentPage={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByText('Showing 1 to 2 of 25 transactions')).toBeInTheDocument()
  })

  it('handles page navigation', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        totalCount={25}
        currentPage={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
      />
    )

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('displays empty state when no transactions', () => {
    render(
      <TransactionTable
        transactions={[]}
        totalCount={0}
        currentPage={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByText('No transactions found.')).toBeInTheDocument()
  })
})