/**
 * Tests for Stripe Webhook Handlers
 */

import {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from '@/lib/stripe/webhook-handlers'
import * as bookingRepository from '@/lib/db/repositories/booking.repository'
import * as postgres from '@/lib/db/postgres'
import type Stripe from 'stripe'

// Mock dependencies
jest.mock('@/lib/db/repositories/booking.repository')
jest.mock('@/lib/db/postgres')
jest.mock('@/lib/email/service')

// Suppress console logs during tests
const originalConsoleLog = console.log
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

describe('Stripe Webhook Handlers', () => {
  beforeAll(() => {
    console.log = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()
  })

  afterAll(() => {
    console.log = originalConsoleLog
    console.warn = originalConsoleWarn
    console.error = originalConsoleError
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('handlePaymentIntentSucceeded', () => {
    const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
      id: 'pi_test_123',
      metadata: {
        booking_id: 'booking-123',
        user_id: 'user-123',
      },
    }

    it('should update booking status to confirmed and paid', async () => {
      const mockUpdateBooking = jest.spyOn(bookingRepository, 'updateBooking')
      mockUpdateBooking.mockResolvedValue({ data: {} as any, error: null })

      const result = await handlePaymentIntentSucceeded(mockPaymentIntent as Stripe.PaymentIntent)

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(mockUpdateBooking).toHaveBeenCalledWith('booking-123', {
        status: 'confirmed',
        payment_status: 'paid',
        payment_intent_id: 'pi_test_123',
      })
    })

    it('should handle missing booking_id in metadata', async () => {
      const paymentIntentNoBooking: Partial<Stripe.PaymentIntent> = {
        id: 'pi_test_123',
        metadata: {},
      }

      const result = await handlePaymentIntentSucceeded(
        paymentIntentNoBooking as Stripe.PaymentIntent
      )

      expect(result.success).toBe(true)
      expect(bookingRepository.updateBooking).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const mockUpdateBooking = jest.spyOn(bookingRepository, 'updateBooking')
      mockUpdateBooking.mockResolvedValue({ data: null, error: 'Database error' })

      const result = await handlePaymentIntentSucceeded(mockPaymentIntent as Stripe.PaymentIntent)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('handlePaymentIntentFailed', () => {
    const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
      id: 'pi_test_123',
      metadata: {
        booking_id: 'booking-123',
        user_id: 'user-123',
      },
    }

    it('should update booking payment status to pending', async () => {
      const mockUpdateBooking = jest.spyOn(bookingRepository, 'updateBooking')
      mockUpdateBooking.mockResolvedValue({ data: {} as any, error: null })

      const result = await handlePaymentIntentFailed(mockPaymentIntent as Stripe.PaymentIntent)

      expect(result.success).toBe(true)
      expect(mockUpdateBooking).toHaveBeenCalledWith('booking-123', {
        payment_status: 'pending',
      })
    })

    it('should handle missing booking_id in metadata', async () => {
      const paymentIntentNoBooking: Partial<Stripe.PaymentIntent> = {
        id: 'pi_test_123',
        metadata: {},
      }

      const result = await handlePaymentIntentFailed(
        paymentIntentNoBooking as Stripe.PaymentIntent
      )

      expect(result.success).toBe(true)
      expect(bookingRepository.updateBooking).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const mockUpdateBooking = jest.spyOn(bookingRepository, 'updateBooking')
      mockUpdateBooking.mockResolvedValue({ data: null, error: 'Database error' })

      const result = await handlePaymentIntentFailed(mockPaymentIntent as Stripe.PaymentIntent)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('should handle unexpected errors', async () => {
      const mockUpdateBooking = jest.spyOn(bookingRepository, 'updateBooking')
      mockUpdateBooking.mockRejectedValue(new Error('Unexpected error'))

      const result = await handlePaymentIntentFailed(mockPaymentIntent as Stripe.PaymentIntent)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unexpected error')
    })

    it('should handle non-Error exceptions', async () => {
      const mockUpdateBooking = jest.spyOn(bookingRepository, 'updateBooking')
      mockUpdateBooking.mockRejectedValue('String error')

      const result = await handlePaymentIntentFailed(mockPaymentIntent as Stripe.PaymentIntent)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to handle payment failure')
    })
  })

  describe('handleSubscriptionCreated', () => {
    const mockSubscription: Partial<Stripe.Subscription> = {
      id: 'sub_test_123',
      current_period_start: 1609459200, // 2021-01-01
      current_period_end: 1612137600, // 2021-02-01
      metadata: {
        user_id: 'user-123',
        membership_plan_id: 'plan-123',
      },
    }

    it('should create subscription and allocate credits', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      const mockExecuteQuery = jest.spyOn(postgres, 'executeQuery')

      // Mock user update
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: { id: 'user-123' } as any,
        error: null,
      })

      // Mock plan fetch
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: {
          meeting_room_credits_hours: 10,
          printing_credits: 100,
          guest_passes_per_month: 2,
        } as any,
        error: null,
      })

      // Mock credit allocation queries
      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      const result = await handleSubscriptionCreated(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(true)
      expect(mockExecuteQuerySingle).toHaveBeenCalled()
    })

    it('should handle missing metadata', async () => {
      const subscriptionNoMetadata: Partial<Stripe.Subscription> = {
        id: 'sub_test_123',
        metadata: {},
      }

      const result = await handleSubscriptionCreated(
        subscriptionNoMetadata as Stripe.Subscription
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Missing')
    })

    it('should handle missing user_id only', async () => {
      const subscriptionNoUserId: Partial<Stripe.Subscription> = {
        id: 'sub_test_123',
        metadata: {
          membership_plan_id: 'plan-123',
        },
      }

      const result = await handleSubscriptionCreated(
        subscriptionNoUserId as Stripe.Subscription
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Missing required metadata')
    })

    it('should handle missing membership_plan_id only', async () => {
      const subscriptionNoPlanId: Partial<Stripe.Subscription> = {
        id: 'sub_test_123',
        metadata: {
          user_id: 'user-123',
        },
      }

      const result = await handleSubscriptionCreated(
        subscriptionNoPlanId as Stripe.Subscription
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Missing required metadata')
    })

    it('should handle user update errors', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'User update failed',
      })

      const result = await handleSubscriptionCreated(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User update failed')
    })

    it('should succeed even if credit allocation fails', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      const mockExecuteQuery = jest.spyOn(postgres, 'executeQuery')

      // Mock user update success
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: { id: 'user-123' } as any,
        error: null,
      })

      // Mock plan fetch failure
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: null,
        error: 'Plan not found',
      })

      const result = await handleSubscriptionCreated(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(true)
    })

    it('should allocate only meeting room credits when other credits are zero', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      const mockExecuteQuery = jest.spyOn(postgres, 'executeQuery')

      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: { id: 'user-123' } as any,
        error: null,
      })

      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: {
          meeting_room_credits_hours: 5,
          printing_credits: 0,
          guest_passes_per_month: 0,
        } as any,
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      const result = await handleSubscriptionCreated(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(true)
      expect(mockExecuteQuery).toHaveBeenCalledTimes(1) // Only meeting room credits
    })

    it('should handle unexpected errors', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockRejectedValue(new Error('Database connection failed'))

      const result = await handleSubscriptionCreated(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
    })

    it('should handle non-Error exceptions', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockRejectedValue('String error')

      const result = await handleSubscriptionCreated(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to handle subscription creation')
    })
  })

  describe('handleSubscriptionUpdated', () => {
    const mockSubscription: Partial<Stripe.Subscription> = {
      id: 'sub_test_123',
      status: 'active',
      current_period_start: 1609459200,
      current_period_end: 1612137600,
      cancel_at_period_end: false,
      metadata: {
        user_id: 'user-123',
      },
    }

    it('should update user membership status', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockResolvedValue({
        data: { id: 'user-123', membership_plan_id: 'plan-123' } as any,
        error: null,
      })

      const result = await handleSubscriptionUpdated(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(true)
      expect(mockExecuteQuerySingle).toHaveBeenCalled()
    })

    it('should detect renewal and allocate credits', async () => {
      const recentStart = Math.floor(Date.now() / 1000) - 1800 // 30 minutes ago
      const subscriptionRenewed: Partial<Stripe.Subscription> = {
        ...mockSubscription,
        current_period_start: recentStart,
        current_period_end: recentStart + 2592000, // +30 days
      }

      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      const mockExecuteQuery = jest.spyOn(postgres, 'executeQuery')

      // Mock user query
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: { id: 'user-123', membership_plan_id: 'plan-123' } as any,
        error: null,
      })

      // Mock plan query
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: { meeting_room_credits_hours: 10 } as any,
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      const result = await handleSubscriptionUpdated(subscriptionRenewed as Stripe.Subscription)

      expect(result.success).toBe(true)
    })

    it('should handle missing user_id in metadata', async () => {
      const subscriptionNoUserId: Partial<Stripe.Subscription> = {
        id: 'sub_test_123',
        metadata: {},
      }

      const result = await handleSubscriptionUpdated(
        subscriptionNoUserId as Stripe.Subscription
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Missing user_id in metadata')
    })

    it('should set status to cancelled when cancel_at_period_end is true', async () => {
      const cancelledSubscription: Partial<Stripe.Subscription> = {
        ...mockSubscription,
        cancel_at_period_end: true,
      }

      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockResolvedValue({
        data: { id: 'user-123' } as any,
        error: null,
      })

      const result = await handleSubscriptionUpdated(
        cancelledSubscription as Stripe.Subscription
      )

      expect(result.success).toBe(true)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['cancelled'])
      )
    })

    it('should set status to cancelled when subscription status is canceled', async () => {
      const cancelledSubscription: Partial<Stripe.Subscription> = {
        ...mockSubscription,
        status: 'canceled',
      }

      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockResolvedValue({
        data: { id: 'user-123' } as any,
        error: null,
      })

      const result = await handleSubscriptionUpdated(
        cancelledSubscription as Stripe.Subscription
      )

      expect(result.success).toBe(true)
    })

    it('should set status to paused when subscription is paused', async () => {
      const pausedSubscription: Partial<Stripe.Subscription> = {
        ...mockSubscription,
        status: 'paused',
      }

      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockResolvedValue({
        data: { id: 'user-123' } as any,
        error: null,
      })

      const result = await handleSubscriptionUpdated(pausedSubscription as Stripe.Subscription)

      expect(result.success).toBe(true)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['paused'])
      )
    })

    it('should handle database errors', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const result = await handleSubscriptionUpdated(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('should not allocate credits when renewal is detected but no membership_plan_id', async () => {
      const recentStart = Math.floor(Date.now() / 1000) - 1800
      const subscriptionRenewed: Partial<Stripe.Subscription> = {
        ...mockSubscription,
        current_period_start: recentStart,
        current_period_end: recentStart + 2592000,
      }

      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockResolvedValue({
        data: { id: 'user-123' } as any, // No membership_plan_id
        error: null,
      })

      const result = await handleSubscriptionUpdated(subscriptionRenewed as Stripe.Subscription)

      expect(result.success).toBe(true)
    })

    it('should not allocate credits when period start is not recent', async () => {
      const oldStart = Math.floor(Date.now() / 1000) - 7200 // 2 hours ago
      const subscriptionOld: Partial<Stripe.Subscription> = {
        ...mockSubscription,
        current_period_start: oldStart,
        current_period_end: oldStart + 2592000,
      }

      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockResolvedValue({
        data: { id: 'user-123', membership_plan_id: 'plan-123' } as any,
        error: null,
      })

      const result = await handleSubscriptionUpdated(subscriptionOld as Stripe.Subscription)

      expect(result.success).toBe(true)
      // Should only call once for user update, not for credit allocation
      expect(mockExecuteQuerySingle).toHaveBeenCalledTimes(1)
    })

    it('should handle unexpected errors', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockRejectedValue(new Error('Connection error'))

      const result = await handleSubscriptionUpdated(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Connection error')
    })

    it('should handle non-Error exceptions', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockRejectedValue('String error')

      const result = await handleSubscriptionUpdated(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to handle subscription update')
    })
  })

  describe('handleSubscriptionDeleted', () => {
    const mockSubscription: Partial<Stripe.Subscription> = {
      id: 'sub_test_123',
      metadata: {
        user_id: 'user-123',
      },
    }

    it('should cancel subscription and expire credits', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      const mockExecuteQuery = jest.spyOn(postgres, 'executeQuery')

      mockExecuteQuerySingle.mockResolvedValue({
        data: { id: 'user-123' } as any,
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      const result = await handleSubscriptionDeleted(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(true)
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('expired'),
        expect.any(Array)
      )
    })

    it('should handle missing user_id in metadata', async () => {
      const subscriptionNoUserId: Partial<Stripe.Subscription> = {
        id: 'sub_test_123',
        metadata: {},
      }

      const result = await handleSubscriptionDeleted(
        subscriptionNoUserId as Stripe.Subscription
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Missing user_id in metadata')
    })

    it('should handle user update errors', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'User not found',
      })

      const result = await handleSubscriptionDeleted(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })

    it('should succeed even if credit expiration fails', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      const mockExecuteQuery = jest.spyOn(postgres, 'executeQuery')

      mockExecuteQuerySingle.mockResolvedValue({
        data: { id: 'user-123' } as any,
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: null,
        error: 'Failed to expire credits',
      })

      const result = await handleSubscriptionDeleted(mockSubscription as Stripe.Subscription)

      // Should still succeed as credit expiration is not critical
      expect(result.success).toBe(true)
    })

    it('should handle unexpected errors', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockRejectedValue(new Error('Database error'))

      const result = await handleSubscriptionDeleted(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('should handle non-Error exceptions', async () => {
      const mockExecuteQuerySingle = jest.spyOn(postgres, 'executeQuerySingle')
      mockExecuteQuerySingle.mockRejectedValue('String error')

      const result = await handleSubscriptionDeleted(mockSubscription as Stripe.Subscription)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to handle subscription deletion')
    })
  })
})