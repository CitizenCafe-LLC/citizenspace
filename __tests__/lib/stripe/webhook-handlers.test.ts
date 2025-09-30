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

describe('Stripe Webhook Handlers', () => {
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
        expect.stringContaining('expire'),
        expect.any(Array)
      )
    })
  })
})