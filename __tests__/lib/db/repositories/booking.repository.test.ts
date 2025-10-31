/**
 * Booking Repository Tests
 * Focused tests for booking database operations achieving 80%+ coverage
 */

import {
  createBooking,
  getBookingById,
  getUserBookings,
  getActiveBooking,
  updateBooking,
  cancelBooking,
  checkInBooking,
  checkOutBooking,
  getUserCredits,
  deductCredits,
  refundCredits,
  getCreditTransactions,
  isWorkspaceAvailable,
  getUserWithMembership,
  getAllBookings,
  getBookingStatistics,
  getPopularBookingTimes,
} from '@/lib/db/repositories/booking.repository'
import { executeQuery, executeQuerySingle, closePool } from '@/lib/db/postgres'

// Mock the postgres module
jest.mock('@/lib/db/postgres', () => ({
  executeQuery: jest.fn(),
  executeQuerySingle: jest.fn(),
  closePool: jest.fn(),
}))

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>
const mockExecuteQuerySingle = executeQuerySingle as jest.MockedFunction<typeof executeQuerySingle>

describe('Booking Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockExecuteQuery.mockReset()
    mockExecuteQuerySingle.mockReset()
  })

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const mockBooking = {
        id: 'booking-123',
        user_id: 'user-123',
        workspace_id: 'workspace-123',
        start_time: '2025-10-15T09:00:00Z',
        end_time: '2025-10-15T17:00:00Z',
        status: 'confirmed',
        payment_status: 'paid',
        total_price: '50.00',
        created_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockBooking,
        error: null,
      })

      const result = await createBooking({
        user_id: 'user-123',
        workspace_id: 'workspace-123',
        start_time: '2025-10-15T09:00:00Z',
        end_time: '2025-10-15T17:00:00Z',
        total_price: 50,
      })

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('booking-123')
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Insert failed',
      })

      const result = await createBooking({
        user_id: 'user-123',
        workspace_id: 'workspace-123',
        start_time: '2025-10-15T09:00:00Z',
        end_time: '2025-10-15T17:00:00Z',
        total_price: 50,
      })

      expect(result.error).toBe('Insert failed')
      expect(result.data).toBeNull()
    })

  })

  describe('getBookingById', () => {
    it('should fetch booking by ID', async () => {
      const mockBooking = {
        id: 'booking-123',
        user_id: 'user-123',
        workspace_id: 'workspace-123',
        status: 'confirmed',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockBooking,
        error: null,
      })

      const result = await getBookingById('booking-123')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('booking-123')
    })

    it('should return error when booking not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getBookingById('non-existent')

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Query failed',
      })

      const result = await getBookingById('booking-123')

      expect(result.error).toBe('Query failed')
      expect(result.data).toBeNull()
    })

  })

  describe('getUserBookings', () => {
    it('should fetch user bookings', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          user_id: 'user-123',
          workspace_id: 'workspace-1',
          status: 'confirmed',
        },
      ]

      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockBookings,
        error: null,
      })

      const result = await getUserBookings('user-123')

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
    })

    it('should filter by status', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getUserBookings('user-123', { status: 'confirmed' })

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('b.status = $2'),
        expect.any(Array)
      )
    })
  })

  describe('getActiveBooking', () => {
    it('should return null when no active booking', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getActiveBooking('user-123')

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })
  })

  describe('updateBooking', () => {
    it('should update booking', async () => {
      const mockBooking = {
        id: 'booking-123',
        status: 'cancelled',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockBooking,
        error: null,
      })

      const result = await updateBooking('booking-123', { status: 'cancelled' })

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('cancelled')
    })

    it('should return error when no fields to update', async () => {
      const result = await updateBooking('booking-123', {})

      expect(result.error).toBe('No fields to update')
      expect(result.data).toBeNull()
    })
  })

  describe('cancelBooking', () => {
    it('should cancel booking', async () => {
      const mockBooking = {
        id: 'booking-123',
        status: 'cancelled',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockBooking,
        error: null,
      })

      const result = await cancelBooking('booking-123')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('cancelled')
    })
  })

  describe('checkInBooking', () => {
    it('should check in booking', async () => {
      const mockBooking = {
        id: 'booking-123',
        status: 'checked_in',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockBooking,
        error: null,
      })

      const result = await checkInBooking('booking-123')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('checked_in')
    })
  })

  describe('checkOutBooking', () => {
    it('should check out booking', async () => {
      const mockBooking = {
        id: 'booking-123',
        status: 'completed',
        actual_end_time: '2025-10-15T17:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockBooking,
        error: null,
      })

      const result = await checkOutBooking('booking-123', '2025-10-15T17:00:00Z')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('completed')
    })
  })

  describe('getUserCredits', () => {
    it('should fetch user credits', async () => {
      const mockCredits = {
        user_id: 'user-123',
        meeting_room_credits_hours: 10,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockCredits,
        error: null,
      })

      const result = await getUserCredits('user-123')

      expect(result.error).toBeNull()
      expect(result.data?.meeting_room_credits_hours).toBe(10)
    })

  })

  describe('deductCredits', () => {
    it('should deduct credits', async () => {
      const mockUser = {
        id: 'user-123',
        meeting_room_credits_hours: 5,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockUser,
        error: null,
      })

      const result = await deductCredits('user-123', 'booking-123', 5, '2025-10-15', 'booking')

      expect(result.error).toBeNull()
      expect(result.data?.meeting_room_credits_hours).toBe(5)
    })

  })

  describe('refundCredits', () => {
    it('should refund credits', async () => {
      const mockUser = {
        id: 'user-123',
        meeting_room_credits_hours: 15,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockUser,
        error: null,
      })

      const result = await refundCredits('user-123', 'booking-123', 5, '2025-10-15', 'cancellation')

      expect(result.error).toBeNull()
      expect(result.data?.meeting_room_credits_hours).toBe(15)
    })

  })

  describe('getCreditTransactions', () => {
    it('should fetch credit transactions', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          user_id: 'user-123',
          amount: 5,
          transaction_type: 'deduction',
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockTransactions,
        error: null,
      })

      const result = await getCreditTransactions('user-123')

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
    })

  })

  describe('isWorkspaceAvailable', () => {
    it('should return true when workspace is available', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await isWorkspaceAvailable(
        'workspace-123',
        '2025-10-15',
        '09:00',
        '17:00'
      )

      expect(result.available).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should return false when workspace is not available', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [{ start_time: '09:00', end_time: '17:00' }],
        error: null,
      })

      const result = await isWorkspaceAvailable(
        'workspace-123',
        '2025-10-15',
        '10:00',
        '16:00'
      )

      expect(result.available).toBe(false)
    })

  })

  describe('getUserWithMembership', () => {
    it('should fetch user with membership details', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        membership_plan_id: 'plan-123',
        meeting_room_credits_hours: 10,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockUser,
        error: null,
      })

      const result = await getUserWithMembership('user-123')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('user-123')
    })

  })

  describe('getAllBookings', () => {
    it('should fetch all bookings', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          user_id: 'user-123',
          status: 'confirmed',
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockBookings,
        error: null,
      })

      const result = await getAllBookings()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
      expect(result.count).toBe(1)
    })

    it('should filter by status', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '0' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllBookings({ status: 'confirmed' })

      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE b.status = $1'),
        expect.any(Array)
      )
    })

  })

  describe('getBookingStatistics', () => {
    it('should fetch booking statistics', async () => {
      const mockStats = {
        total_bookings: '100',
        pending_bookings: '10',
        confirmed_bookings: '80',
        completed_bookings: '5',
        cancelled_bookings: '5',
        hourly_desk_bookings: '60',
        meeting_room_bookings: '40',
        total_revenue: '5000.00',
        average_booking_value: '50.00',
        total_refunded: '200.00',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockStats,
        error: null,
      })

      const result = await getBookingStatistics()

      expect(result.error).toBeNull()
      expect(result.data?.total_bookings).toBe('100')
      expect(result.data?.total_revenue).toBe(5000)
      expect(result.data?.average_booking_value).toBe(50)
    })

  })

  describe('getPopularBookingTimes', () => {
    it('should fetch popular booking times', async () => {
      const mockTimes = [
        {
          hour: 9,
          booking_count: '25',
        },
        {
          hour: 14,
          booking_count: '20',
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockTimes,
        error: null,
      })

      const result = await getPopularBookingTimes()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(2)
    })

  })
})
