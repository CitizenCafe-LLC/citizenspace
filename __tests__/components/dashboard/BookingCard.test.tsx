import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BookingCard } from '@/components/dashboard/BookingCard'
import { toast } from 'sonner'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

global.fetch = jest.fn()

describe('BookingCard', () => {
  const mockBooking = {
    id: 'booking-1',
    workspace_id: 'ws-1',
    workspace_name: 'Hot Desk 1',
    booking_date: '2025-10-15',
    start_time: '09:00',
    end_time: '17:00',
    status: 'confirmed' as const,
    total_price: 50.0,
    qr_code: 'https://example.com/qr.png',
  }

  const mockOnUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  it('renders booking card with correct information', () => {
    render(<BookingCard booking={mockBooking} onUpdate={mockOnUpdate} />)

    expect(screen.getByText('Hot Desk 1')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('$50.00')).toBeInTheDocument()
  })

  it('shows correct status badge for different statuses', () => {
    const { rerender } = render(<BookingCard booking={mockBooking} />)
    expect(screen.getByText('Confirmed')).toBeInTheDocument()

    rerender(<BookingCard booking={{ ...mockBooking, status: 'cancelled' }} />)
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('allows cancelling a confirmed booking', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<BookingCard booking={mockBooking} onUpdate={mockOnUpdate} />)

    // Open dropdown menu
    const menuButton = screen.getAllByRole('button')[0]
    fireEvent.click(menuButton)

    // Click cancel option
    const cancelButton = screen.getByText('Cancel Booking')
    fireEvent.click(cancelButton)

    // Confirm in dialog
    await waitFor(() => {
      const confirmButton = screen.getByText('Yes, cancel')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/bookings/booking-1', {
        method: 'DELETE',
      })
      expect(toast.success).toHaveBeenCalledWith('Booking cancelled successfully')
      expect(mockOnUpdate).toHaveBeenCalled()
    })
  })

  it('handles cancel error gracefully', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Cancellation failed' }),
    })

    render(<BookingCard booking={mockBooking} onUpdate={mockOnUpdate} />)

    const menuButton = screen.getAllByRole('button')[0]
    fireEvent.click(menuButton)

    const cancelButton = screen.getByText('Cancel Booking')
    fireEvent.click(cancelButton)

    await waitFor(() => {
      const confirmButton = screen.getByText('Yes, cancel')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Cancellation failed')
      expect(mockOnUpdate).not.toHaveBeenCalled()
    })
  })

  it('allows extending a checked-in booking', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    const checkedInBooking = { ...mockBooking, status: 'checked_in' as const }
    render(<BookingCard booking={checkedInBooking} onUpdate={mockOnUpdate} />)

    const menuButton = screen.getAllByRole('button')[0]
    fireEvent.click(menuButton)

    const extendButton = screen.getByText('Extend Booking')
    fireEvent.click(extendButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/bookings/booking-1/extend', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: 1 }),
      })
      expect(toast.success).toHaveBeenCalledWith('Booking extended by 1 hour')
      expect(mockOnUpdate).toHaveBeenCalled()
    })
  })

  it('displays QR code dialog for upcoming bookings', async () => {
    render(<BookingCard booking={mockBooking} />)

    const menuButton = screen.getAllByRole('button')[0]
    fireEvent.click(menuButton)

    const qrButton = screen.getByText('View QR Code')
    fireEvent.click(qrButton)

    await waitFor(() => {
      expect(screen.getByText('Check-in QR Code')).toBeInTheDocument()
      expect(screen.getByAltText('Booking QR Code')).toHaveAttribute(
        'src',
        'https://example.com/qr.png'
      )
    })
  })

  it('does not show cancel option for completed bookings', () => {
    const completedBooking = { ...mockBooking, status: 'completed' as const }
    render(<BookingCard booking={completedBooking} />)

    const menuButton = screen.getAllByRole('button')[0]
    fireEvent.click(menuButton)

    expect(screen.queryByText('Cancel Booking')).not.toBeInTheDocument()
  })
})