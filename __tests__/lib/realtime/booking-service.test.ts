/**
 * Tests for Booking Real-time Service
 * Validates integration between booking operations and real-time events
 */

import * as bookingService from '@/lib/realtime/booking-service'
import * as bookingRepo from '@/lib/db/repositories/booking.repository'
import { realtimeEvents } from '@/lib/realtime/events'

// Mock dependencies
jest.mock('@/lib/db/repositories/booking.repository')
jest.mock('@/lib/realtime/events')

describe('Booking Real-time Service', () => {
  const mockBookingData = {
    id: 'booking-123',
    user_id: 'user-456',
    workspace_id: 'workspace-789',
    booking_type: 'meeting-room' as const,
    booking_date: '2025-10-27',
    start_time: '09:00',
    end_time: '10:00',
    duration_hours: 1,
    attendees: 4,
    subtotal: 50,
    discount_amount: 5,
    nft_discount_applied: true,
    processing_fee: 1.5,
    total_price: 46.5,
    status: 'confirmed' as const,
    payment_status: 'paid' as const,
    payment_method: 'card' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    workspaces: {
      name: 'Conference Room A',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createBookingWithRealtime', () => {
    it('should create booking and broadcast event on success', async () => {
      const createParams: bookingRepo.CreateBookingParams = {
        user_id: 'user-456',
        workspace_id: 'workspace-789',
        booking_type: 'meeting-room',
        booking_date: '2025-10-27',
        start_time: '09:00',
        end_time: '10:00',
        duration_hours: 1,
        attendees: 4,
        subtotal: 50,
        discount_amount: 5,
        nft_discount_applied: true,
        processing_fee: 1.5,
        total_price: 46.5,
        payment_method: 'card',
      }

      ;(bookingRepo.createBooking as jest.Mock).mockResolvedValue({
        data: mockBookingData,
        error: null,
      })

      const result = await bookingService.createBookingWithRealtime(createParams)

      expect(result.data).toEqual(mockBookingData)
      expect(result.error).toBeNull()
      expect(realtimeEvents.booking.bookingCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockBookingData.id,
          user_id: mockBookingData.user_id,
          workspace_id: mockBookingData.workspace_id,
        })
      )
      expect(realtimeEvents.availability.seatOccupied).toHaveBeenCalledWith(
        createParams.workspace_id,
        expect.any(String),
        createParams.booking_date
      )
    })

    it('should not broadcast event on failure', async () => {
      const createParams: bookingRepo.CreateBookingParams = {
        user_id: 'user-456',
        workspace_id: 'workspace-789',
        booking_type: 'meeting-room',
        booking_date: '2025-10-27',
        start_time: '09:00',
        end_time: '10:00',
        duration_hours: 1,
        attendees: 4,
        subtotal: 50,
        discount_amount: 0,
        nft_discount_applied: false,
        processing_fee: 1.5,
        total_price: 51.5,
        payment_method: 'card',
      }

      ;(bookingRepo.createBooking as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const result = await bookingService.createBookingWithRealtime(createParams)

      expect(result.error).toBe('Database error')
      expect(realtimeEvents.booking.bookingCreated).not.toHaveBeenCalled()
      expect(realtimeEvents.availability.seatOccupied).not.toHaveBeenCalled()
    })
  })

  describe('updateBookingWithRealtime', () => {
    it('should broadcast confirmed event when status is confirmed', async () => {
      ;(bookingRepo.updateBooking as jest.Mock).mockResolvedValue({
        data: mockBookingData,
        error: null,
      })

      const result = await bookingService.updateBookingWithRealtime('booking-123', {
        status: 'confirmed',
      })

      expect(result.data).toEqual(mockBookingData)
      expect(realtimeEvents.booking.bookingConfirmed).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockBookingData.id,
          status: 'confirmed',
        })
      )
    })

    it('should broadcast cancelled event and update availability when status is cancelled', async () => {
      const cancelledBooking = { ...mockBookingData, status: 'cancelled' as const }

      ;(bookingRepo.updateBooking as jest.Mock).mockResolvedValue({
        data: cancelledBooking,
        error: null,
      })

      const result = await bookingService.updateBookingWithRealtime('booking-123', {
        status: 'cancelled',
      })

      expect(realtimeEvents.booking.bookingCancelled).toHaveBeenCalled()
      expect(realtimeEvents.availability.seatAvailable).toHaveBeenCalledWith(
        cancelledBooking.workspace_id,
        expect.any(String),
        cancelledBooking.booking_date
      )
    })

    it('should broadcast check-in event when check_in_time is provided', async () => {
      ;(bookingRepo.updateBooking as jest.Mock).mockResolvedValue({
        data: mockBookingData,
        error: null,
      })

      const checkInTime = new Date().toISOString()
      await bookingService.updateBookingWithRealtime('booking-123', {
        check_in_time: checkInTime,
      })

      expect(realtimeEvents.booking.bookingCheckedIn).toHaveBeenCalled()
    })

    it('should broadcast check-out event and update availability when check_out_time is provided', async () => {
      const completedBooking = { ...mockBookingData, status: 'completed' as const }

      ;(bookingRepo.updateBooking as jest.Mock).mockResolvedValue({
        data: completedBooking,
        error: null,
      })

      const checkOutTime = new Date().toISOString()
      await bookingService.updateBookingWithRealtime('booking-123', {
        check_out_time: checkOutTime,
      })

      expect(realtimeEvents.booking.bookingCheckedOut).toHaveBeenCalled()
      expect(realtimeEvents.availability.seatAvailable).toHaveBeenCalled()
    })
  })

  describe('cancelBookingWithRealtime', () => {
    it('should cancel booking and broadcast event', async () => {
      ;(bookingRepo.getBookingById as jest.Mock).mockResolvedValue({
        data: mockBookingData,
        error: null,
      })

      const cancelledBooking = { ...mockBookingData, status: 'cancelled' as const }
      ;(bookingRepo.cancelBooking as jest.Mock).mockResolvedValue({
        data: cancelledBooking,
        error: null,
      })

      const result = await bookingService.cancelBookingWithRealtime('booking-123')

      expect(result.data).toEqual(cancelledBooking)
      expect(realtimeEvents.booking.bookingCancelled).toHaveBeenCalled()
      expect(realtimeEvents.availability.seatAvailable).toHaveBeenCalled()
    })

    it('should return error if booking not found', async () => {
      ;(bookingRepo.getBookingById as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Not found',
      })

      const result = await bookingService.cancelBookingWithRealtime('booking-123')

      expect(result.error).toBe('Booking not found')
      expect(realtimeEvents.booking.bookingCancelled).not.toHaveBeenCalled()
    })
  })

  describe('checkInBookingWithRealtime', () => {
    it('should check in booking and broadcast event', async () => {
      ;(bookingRepo.checkInBooking as jest.Mock).mockResolvedValue({
        data: mockBookingData,
        error: null,
      })

      const result = await bookingService.checkInBookingWithRealtime('booking-123')

      expect(result.data).toEqual(mockBookingData)
      expect(realtimeEvents.booking.bookingCheckedIn).toHaveBeenCalled()
    })

    it('should not broadcast event on failure', async () => {
      ;(bookingRepo.checkInBooking as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Check-in failed',
      })

      await bookingService.checkInBookingWithRealtime('booking-123')

      expect(realtimeEvents.booking.bookingCheckedIn).not.toHaveBeenCalled()
    })
  })

  describe('checkOutBookingWithRealtime', () => {
    it('should check out booking and broadcast event', async () => {
      ;(bookingRepo.getBookingById as jest.Mock).mockResolvedValue({
        data: mockBookingData,
        error: null,
      })

      const completedBooking = { ...mockBookingData, status: 'completed' as const }
      ;(bookingRepo.checkOutBooking as jest.Mock).mockResolvedValue({
        data: completedBooking,
        error: null,
      })

      const result = await bookingService.checkOutBookingWithRealtime('booking-123', 1.5, 75)

      expect(result.data).toEqual(completedBooking)
      expect(realtimeEvents.booking.bookingCheckedOut).toHaveBeenCalled()
      expect(realtimeEvents.availability.seatAvailable).toHaveBeenCalled()
    })

    it('should return error if booking not found', async () => {
      ;(bookingRepo.getBookingById as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Not found',
      })

      const result = await bookingService.checkOutBookingWithRealtime('booking-123', 1.5, 75)

      expect(result.error).toBe('Booking not found')
      expect(realtimeEvents.booking.bookingCheckedOut).not.toHaveBeenCalled()
    })
  })

  describe('updateWorkspaceAvailabilityForDate', () => {
    it('should calculate and broadcast availability update', async () => {
      const mockBookings = [
        { ...mockBookingData, id: 'booking-1', status: 'confirmed' as const },
        { ...mockBookingData, id: 'booking-2', status: 'confirmed' as const },
        { ...mockBookingData, id: 'booking-3', status: 'cancelled' as const },
      ]

      ;(bookingRepo.getUserBookings as jest.Mock).mockResolvedValue({
        data: mockBookings,
        error: null,
      })

      await bookingService.updateWorkspaceAvailabilityForDate(
        'workspace-789',
        'Conference Room A',
        '2025-10-27'
      )

      expect(realtimeEvents.availability.availabilityUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          workspace_id: 'workspace-789',
          workspace_name: 'Conference Room A',
          date: '2025-10-27',
          available_slots: expect.any(Number),
          is_available: expect.any(Boolean),
        })
      )
    })
  })
})
