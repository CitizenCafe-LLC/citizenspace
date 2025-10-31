/**
 * Tests for BookingsList component
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingsList } from '@/components/admin/BookingsList'

const mockBookings = [
  {
    id: '1',
    workspaceName: 'Hot Desk #1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    startTime: new Date('2025-09-30T09:00:00'),
    endTime: new Date('2025-09-30T17:00:00'),
    status: 'upcoming' as const,
    total: 45.0,
  },
  {
    id: '2',
    workspaceName: 'Meeting Room A',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    startTime: new Date('2025-09-29T14:00:00'),
    endTime: new Date('2025-09-29T16:00:00'),
    status: 'active' as const,
    total: 80.0,
  },
  {
    id: '3',
    workspaceName: 'Private Office',
    userName: 'Mike Johnson',
    userEmail: 'mike@example.com',
    startTime: new Date('2025-09-28T10:00:00'),
    endTime: new Date('2025-09-28T15:00:00'),
    status: 'completed' as const,
    total: 120.0,
  },
]

describe('BookingsList', () => {
  const mockHandlers = {
    onView: jest.fn(),
    onEdit: jest.fn(),
    onCancel: jest.fn(),
    onExport: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders bookings table with data', () => {
    render(<BookingsList bookings={mockBookings} {...mockHandlers} />)

    expect(screen.getByText('Hot Desk #1')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('displays all status badges correctly', () => {
    render(<BookingsList bookings={mockBookings} {...mockHandlers} />)

    expect(screen.getByText('upcoming')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
  })

  it('filters bookings by search query', () => {
    render(<BookingsList bookings={mockBookings} {...mockHandlers} />)

    const searchInput = screen.getByPlaceholderText(/Search by name/i)
    fireEvent.change(searchInput, { target: { value: 'John' } })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('filters bookings by status', () => {
    render(<BookingsList bookings={mockBookings} {...mockHandlers} />)

    const statusFilter = screen.getByRole('combobox')
    fireEvent.click(statusFilter)

    const upcomingOption = screen.getByText('Upcoming')
    fireEvent.click(upcomingOption)

    expect(screen.getByText('Hot Desk #1')).toBeInTheDocument()
    expect(screen.queryByText('Meeting Room A')).not.toBeInTheDocument()
  })

  it('calls onView when view button clicked', async () => {
    const user = userEvent.setup()
    render(<BookingsList bookings={mockBookings} {...mockHandlers} />)

    // Get all ghost variant buttons (these are the dropdown triggers)
    const allButtons = screen.getAllByRole('button')
    // The dropdown triggers come after the status select and export button
    // Find buttons that are size icon (the three-dot menu buttons)
    const dropdownButtons = allButtons.filter(
      (btn) => btn.className.includes('h-10 w-10') || btn.getAttribute('data-state') === 'closed'
    )

    // Click the first dropdown trigger
    await user.click(dropdownButtons[0])

    // Wait for and find the View Details menu item
    const viewButton = await screen.findByRole('menuitem', { name: /view details/i })
    await user.click(viewButton)

    expect(mockHandlers.onView).toHaveBeenCalledWith('1')
  })

  it('calls onExport when export button clicked', () => {
    render(<BookingsList bookings={mockBookings} {...mockHandlers} />)

    const exportButton = screen.getByRole('button', { name: /Export CSV/i })
    fireEvent.click(exportButton)

    expect(mockHandlers.onExport).toHaveBeenCalled()
  })

  it('shows pagination controls when more than 10 items', () => {
    const manyBookings = Array.from({ length: 15 }, (_, i) => ({
      ...mockBookings[0],
      id: `${i}`,
      workspaceName: `Desk ${i}`,
    }))

    render(<BookingsList bookings={manyBookings} {...mockHandlers} />)

    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument()
  })

  it('displays correct total amounts', () => {
    render(<BookingsList bookings={mockBookings} {...mockHandlers} />)

    expect(screen.getByText('$45.00')).toBeInTheDocument()
    expect(screen.getByText('$80.00')).toBeInTheDocument()
    expect(screen.getByText('$120.00')).toBeInTheDocument()
  })

  it('shows empty state when no bookings match filters', () => {
    render(<BookingsList bookings={mockBookings} {...mockHandlers} />)

    const searchInput = screen.getByPlaceholderText(/Search by name/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No bookings found')).toBeInTheDocument()
  })
})