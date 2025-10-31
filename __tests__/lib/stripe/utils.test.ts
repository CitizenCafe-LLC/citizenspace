/**
 * Tests for Stripe Utility Functions
 */

import type Stripe from 'stripe'
import {
  getOrCreateStripeCustomer,
  createPaymentIntent,
  createCheckoutSession,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  createRefund,
  getPaymentIntent,
  getSubscription,
  constructWebhookEvent,
  getCustomerPaymentMethods,
} from '@/lib/stripe/utils'
import * as config from '@/lib/stripe/config'

// Mock the Stripe config module
jest.mock('@/lib/stripe/config')

describe('Stripe Utility Functions', () => {
  let mockStripeClient: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Create comprehensive mock Stripe client
    mockStripeClient = {
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
      subscriptions: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
      },
      refunds: {
        create: jest.fn(),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
      paymentMethods: {
        list: jest.fn(),
      },
    }

    // Mock getStripeClient to return our mock
    ;(config.getStripeClient as jest.Mock).mockReturnValue(mockStripeClient)
  })

  describe('getOrCreateStripeCustomer', () => {
    const userId = 'user-123'
    const email = 'test@example.com'
    const name = 'Test User'

    it('should retrieve existing customer when valid ID is provided', async () => {
      const mockCustomer = {
        id: 'cus_existing',
        email,
        name,
        deleted: false,
      } as Stripe.Customer

      mockStripeClient.customers.retrieve.mockResolvedValue(mockCustomer)

      const result = await getOrCreateStripeCustomer(userId, email, name, 'cus_existing')

      expect(result.customer).toEqual(mockCustomer)
      expect(result.error).toBeNull()
      expect(mockStripeClient.customers.retrieve).toHaveBeenCalledWith('cus_existing')
      expect(mockStripeClient.customers.create).not.toHaveBeenCalled()
    })

    it('should create new customer when existing customer is deleted', async () => {
      const deletedCustomer = { id: 'cus_deleted', deleted: true }
      const newCustomer = {
        id: 'cus_new',
        email,
        name,
        metadata: { user_id: userId },
      } as Stripe.Customer

      mockStripeClient.customers.retrieve.mockResolvedValue(deletedCustomer)
      mockStripeClient.customers.create.mockResolvedValue(newCustomer)

      const result = await getOrCreateStripeCustomer(userId, email, name, 'cus_deleted')

      expect(result.customer).toEqual(newCustomer)
      expect(result.error).toBeNull()
      expect(mockStripeClient.customers.create).toHaveBeenCalledWith({
        email,
        name,
        metadata: { user_id: userId },
      })
    })

    it('should create new customer when no existing ID is provided', async () => {
      const newCustomer = {
        id: 'cus_new',
        email,
        name,
        metadata: { user_id: userId },
      } as Stripe.Customer

      mockStripeClient.customers.create.mockResolvedValue(newCustomer)

      const result = await getOrCreateStripeCustomer(userId, email, name)

      expect(result.customer).toEqual(newCustomer)
      expect(result.error).toBeNull()
      expect(mockStripeClient.customers.create).toHaveBeenCalledWith({
        email,
        name,
        metadata: { user_id: userId },
      })
    })

    it('should create new customer when retrieve fails', async () => {
      const newCustomer = {
        id: 'cus_new',
        email,
        name,
        metadata: { user_id: userId },
      } as Stripe.Customer

      mockStripeClient.customers.retrieve.mockRejectedValue(new Error('Customer not found'))
      mockStripeClient.customers.create.mockResolvedValue(newCustomer)

      const result = await getOrCreateStripeCustomer(userId, email, name, 'cus_invalid')

      expect(result.customer).toEqual(newCustomer)
      expect(result.error).toBeNull()
      expect(mockStripeClient.customers.create).toHaveBeenCalled()
    })

    it('should return error when customer creation fails', async () => {
      const error = new Error('Stripe API error')
      mockStripeClient.customers.create.mockRejectedValue(error)

      const result = await getOrCreateStripeCustomer(userId, email, name)

      expect(result.customer).toBeNull()
      expect(result.error).toBe('Stripe API error')
    })

    it('should handle non-Error exceptions', async () => {
      mockStripeClient.customers.create.mockRejectedValue('String error')

      const result = await getOrCreateStripeCustomer(userId, email, name)

      expect(result.customer).toBeNull()
      expect(result.error).toBe('Failed to create Stripe customer')
    })
  })

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 5000,
        currency: 'usd',
      } as Stripe.PaymentIntent

      mockStripeClient.paymentIntents.create.mockResolvedValue(mockPaymentIntent)
      ;(config.STRIPE_CONFIG as any) = {
        currency: 'usd',
        automaticPaymentMethods: { enabled: true },
      }

      const result = await createPaymentIntent(5000, 'cus_123', {
        booking_id: 'booking-123',
      })

      expect(result.paymentIntent).toEqual(mockPaymentIntent)
      expect(result.error).toBeNull()
      expect(mockStripeClient.paymentIntents.create).toHaveBeenCalledWith({
        amount: 5000,
        currency: 'usd',
        customer: 'cus_123',
        metadata: { booking_id: 'booking-123' },
        automatic_payment_methods: { enabled: true },
      })
    })

    it('should handle payment intent creation errors', async () => {
      const error = new Error('Payment failed')
      mockStripeClient.paymentIntents.create.mockRejectedValue(error)

      const result = await createPaymentIntent(5000, 'cus_123', {})

      expect(result.paymentIntent).toBeNull()
      expect(result.error).toBe('Payment failed')
    })

    it('should handle non-Error exceptions in payment intent creation', async () => {
      mockStripeClient.paymentIntents.create.mockRejectedValue('Unknown error')

      const result = await createPaymentIntent(5000, 'cus_123', {})

      expect(result.paymentIntent).toBeNull()
      expect(result.error).toBe('Failed to create payment intent')
    })
  })

  describe('createCheckoutSession', () => {
    it('should create checkout session successfully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      } as Stripe.Checkout.Session

      mockStripeClient.checkout.sessions.create.mockResolvedValue(mockSession)

      const params = {
        customerId: 'cus_123',
        amount: 5000,
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        metadata: { booking_id: 'booking-123' },
        lineItems: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: 'Hot Desk Booking' },
              unit_amount: 5000,
            },
            quantity: 1,
          },
        ],
      }

      const result = await createCheckoutSession(params)

      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
      expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: params.lineItems,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata,
        payment_intent_data: {
          metadata: params.metadata,
        },
      })
    })

    it('should handle checkout session creation errors', async () => {
      const error = new Error('Session creation failed')
      mockStripeClient.checkout.sessions.create.mockRejectedValue(error)

      const params = {
        customerId: 'cus_123',
        amount: 5000,
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        metadata: {},
        lineItems: [],
      }

      const result = await createCheckoutSession(params)

      expect(result.session).toBeNull()
      expect(result.error).toBe('Session creation failed')
    })

    it('should handle non-Error exceptions in checkout session creation', async () => {
      mockStripeClient.checkout.sessions.create.mockRejectedValue('Unknown error')

      const params = {
        customerId: 'cus_123',
        amount: 5000,
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        metadata: {},
        lineItems: [],
      }

      const result = await createCheckoutSession(params)

      expect(result.session).toBeNull()
      expect(result.error).toBe('Failed to create checkout session')
    })
  })

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
      } as Stripe.Subscription

      mockStripeClient.subscriptions.create.mockResolvedValue(mockSubscription)

      const params = {
        customerId: 'cus_123',
        priceId: 'price_123',
        metadata: { membership_plan_id: 'plan-123' },
      }

      const result = await createSubscription(params)

      expect(result.subscription).toEqual(mockSubscription)
      expect(result.error).toBeNull()
      expect(mockStripeClient.subscriptions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        items: [{ price: 'price_123' }],
        metadata: params.metadata,
        trial_period_days: undefined,
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
        },
        expand: ['latest_invoice.payment_intent'],
      })
    })

    it('should create subscription with trial period', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'trialing',
      } as Stripe.Subscription

      mockStripeClient.subscriptions.create.mockResolvedValue(mockSubscription)

      const params = {
        customerId: 'cus_123',
        priceId: 'price_123',
        metadata: {},
        trialPeriodDays: 14,
      }

      const result = await createSubscription(params)

      expect(result.subscription).toEqual(mockSubscription)
      expect(result.error).toBeNull()
      expect(mockStripeClient.subscriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          trial_period_days: 14,
        })
      )
    })

    it('should handle subscription creation errors', async () => {
      const error = new Error('Subscription failed')
      mockStripeClient.subscriptions.create.mockRejectedValue(error)

      const params = {
        customerId: 'cus_123',
        priceId: 'price_123',
        metadata: {},
      }

      const result = await createSubscription(params)

      expect(result.subscription).toBeNull()
      expect(result.error).toBe('Subscription failed')
    })

    it('should handle non-Error exceptions in subscription creation', async () => {
      mockStripeClient.subscriptions.create.mockRejectedValue('Unknown error')

      const params = {
        customerId: 'cus_123',
        priceId: 'price_123',
        metadata: {},
      }

      const result = await createSubscription(params)

      expect(result.subscription).toBeNull()
      expect(result.error).toBe('Failed to create subscription')
    })
  })

  describe('updateSubscription', () => {
    it('should update subscription metadata only', async () => {
      const mockSubscription = {
        id: 'sub_123',
        metadata: { updated: 'true' },
      } as Stripe.Subscription

      mockStripeClient.subscriptions.update.mockResolvedValue(mockSubscription)

      const result = await updateSubscription('sub_123', {
        metadata: { updated: 'true' },
      })

      expect(result.subscription).toEqual(mockSubscription)
      expect(result.error).toBeNull()
      expect(mockStripeClient.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        metadata: { updated: 'true' },
        cancel_at_period_end: undefined,
      })
    })

    it('should update subscription with new price', async () => {
      const currentSubscription = {
        id: 'sub_123',
        items: {
          data: [{ id: 'si_123' }],
        },
      } as Stripe.Subscription

      const updatedSubscription = {
        id: 'sub_123',
        items: {
          data: [{ id: 'si_123', price: { id: 'price_new' } }],
        },
      } as Stripe.Subscription

      mockStripeClient.subscriptions.retrieve.mockResolvedValue(currentSubscription)
      mockStripeClient.subscriptions.update.mockResolvedValue(updatedSubscription)
      ;(config.STRIPE_CONFIG as any) = {
        subscriptionProrationBehavior: 'create_prorations',
      }

      const result = await updateSubscription('sub_123', {
        priceId: 'price_new',
      })

      expect(result.subscription).toEqual(updatedSubscription)
      expect(result.error).toBeNull()
      expect(mockStripeClient.subscriptions.retrieve).toHaveBeenCalledWith('sub_123')
      expect(mockStripeClient.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        metadata: undefined,
        cancel_at_period_end: undefined,
        items: [
          {
            id: 'si_123',
            price: 'price_new',
          },
        ],
        proration_behavior: 'create_prorations',
      })
    })

    it('should update subscription to cancel at period end', async () => {
      const mockSubscription = {
        id: 'sub_123',
        cancel_at_period_end: true,
      } as Stripe.Subscription

      mockStripeClient.subscriptions.update.mockResolvedValue(mockSubscription)

      const result = await updateSubscription('sub_123', {
        cancelAtPeriodEnd: true,
      })

      expect(result.subscription).toEqual(mockSubscription)
      expect(result.error).toBeNull()
      expect(mockStripeClient.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        metadata: undefined,
        cancel_at_period_end: true,
      })
    })

    it('should handle subscription update errors', async () => {
      const error = new Error('Update failed')
      mockStripeClient.subscriptions.retrieve.mockRejectedValue(error)

      const result = await updateSubscription('sub_123', { priceId: 'price_new' })

      expect(result.subscription).toBeNull()
      expect(result.error).toBe('Update failed')
    })

    it('should handle non-Error exceptions in subscription update', async () => {
      mockStripeClient.subscriptions.update.mockRejectedValue('Unknown error')

      const result = await updateSubscription('sub_123', { metadata: {} })

      expect(result.subscription).toBeNull()
      expect(result.error).toBe('Failed to update subscription')
    })
  })

  describe('cancelSubscription', () => {
    it('should cancel subscription immediately when requested', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'canceled',
      } as Stripe.Subscription

      mockStripeClient.subscriptions.cancel.mockResolvedValue(mockSubscription)

      const result = await cancelSubscription('sub_123', true)

      expect(result.subscription).toEqual(mockSubscription)
      expect(result.error).toBeNull()
      expect(mockStripeClient.subscriptions.cancel).toHaveBeenCalledWith('sub_123')
      expect(mockStripeClient.subscriptions.update).not.toHaveBeenCalled()
    })

    it('should cancel subscription at period end by default', async () => {
      const mockSubscription = {
        id: 'sub_123',
        cancel_at_period_end: true,
      } as Stripe.Subscription

      mockStripeClient.subscriptions.update.mockResolvedValue(mockSubscription)

      const result = await cancelSubscription('sub_123')

      expect(result.subscription).toEqual(mockSubscription)
      expect(result.error).toBeNull()
      expect(mockStripeClient.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: true,
      })
      expect(mockStripeClient.subscriptions.cancel).not.toHaveBeenCalled()
    })

    it('should cancel subscription at period end when explicitly false', async () => {
      const mockSubscription = {
        id: 'sub_123',
        cancel_at_period_end: true,
      } as Stripe.Subscription

      mockStripeClient.subscriptions.update.mockResolvedValue(mockSubscription)

      const result = await cancelSubscription('sub_123', false)

      expect(result.subscription).toEqual(mockSubscription)
      expect(result.error).toBeNull()
      expect(mockStripeClient.subscriptions.update).toHaveBeenCalled()
    })

    it('should handle subscription cancellation errors', async () => {
      const error = new Error('Cancel failed')
      mockStripeClient.subscriptions.cancel.mockRejectedValue(error)

      const result = await cancelSubscription('sub_123', true)

      expect(result.subscription).toBeNull()
      expect(result.error).toBe('Cancel failed')
    })

    it('should handle non-Error exceptions in subscription cancellation', async () => {
      mockStripeClient.subscriptions.update.mockRejectedValue('Unknown error')

      const result = await cancelSubscription('sub_123', false)

      expect(result.subscription).toBeNull()
      expect(result.error).toBe('Failed to cancel subscription')
    })
  })

  describe('createRefund', () => {
    it('should create full refund successfully', async () => {
      const mockRefund = {
        id: 'ref_123',
        amount: 5000,
      } as Stripe.Refund

      mockStripeClient.refunds.create.mockResolvedValue(mockRefund)
      ;(config.STRIPE_CONFIG as any) = {
        refundReason: 'requested_by_customer',
      }

      const result = await createRefund('pi_123')

      expect(result.refund).toEqual(mockRefund)
      expect(result.error).toBeNull()
      expect(mockStripeClient.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: undefined,
        reason: 'requested_by_customer',
      })
    })

    it('should create partial refund', async () => {
      const mockRefund = {
        id: 'ref_123',
        amount: 2500,
      } as Stripe.Refund

      mockStripeClient.refunds.create.mockResolvedValue(mockRefund)
      ;(config.STRIPE_CONFIG as any) = {
        refundReason: 'requested_by_customer',
      }

      const result = await createRefund('pi_123', 2500)

      expect(result.refund).toEqual(mockRefund)
      expect(result.error).toBeNull()
      expect(mockStripeClient.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: 2500,
        reason: 'requested_by_customer',
      })
    })

    it('should create refund with custom reason', async () => {
      const mockRefund = {
        id: 'ref_123',
        amount: 5000,
      } as Stripe.Refund

      mockStripeClient.refunds.create.mockResolvedValue(mockRefund)

      const result = await createRefund('pi_123', undefined, 'fraudulent')

      expect(result.refund).toEqual(mockRefund)
      expect(result.error).toBeNull()
      expect(mockStripeClient.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: undefined,
        reason: 'fraudulent',
      })
    })

    it('should handle refund creation errors', async () => {
      const error = new Error('Refund failed')
      mockStripeClient.refunds.create.mockRejectedValue(error)

      const result = await createRefund('pi_123')

      expect(result.refund).toBeNull()
      expect(result.error).toBe('Refund failed')
    })

    it('should handle non-Error exceptions in refund creation', async () => {
      mockStripeClient.refunds.create.mockRejectedValue('Unknown error')

      const result = await createRefund('pi_123')

      expect(result.refund).toBeNull()
      expect(result.error).toBe('Failed to create refund')
    })
  })

  describe('getPaymentIntent', () => {
    it('should retrieve payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 5000,
      } as Stripe.PaymentIntent

      mockStripeClient.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent)

      const result = await getPaymentIntent('pi_123')

      expect(result.paymentIntent).toEqual(mockPaymentIntent)
      expect(result.error).toBeNull()
      expect(mockStripeClient.paymentIntents.retrieve).toHaveBeenCalledWith('pi_123')
    })

    it('should handle payment intent retrieval errors', async () => {
      const error = new Error('Not found')
      mockStripeClient.paymentIntents.retrieve.mockRejectedValue(error)

      const result = await getPaymentIntent('pi_invalid')

      expect(result.paymentIntent).toBeNull()
      expect(result.error).toBe('Not found')
    })

    it('should handle non-Error exceptions in payment intent retrieval', async () => {
      mockStripeClient.paymentIntents.retrieve.mockRejectedValue('Unknown error')

      const result = await getPaymentIntent('pi_123')

      expect(result.paymentIntent).toBeNull()
      expect(result.error).toBe('Failed to retrieve payment intent')
    })
  })

  describe('getSubscription', () => {
    it('should retrieve subscription successfully', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
      } as Stripe.Subscription

      mockStripeClient.subscriptions.retrieve.mockResolvedValue(mockSubscription)

      const result = await getSubscription('sub_123')

      expect(result.subscription).toEqual(mockSubscription)
      expect(result.error).toBeNull()
      expect(mockStripeClient.subscriptions.retrieve).toHaveBeenCalledWith('sub_123')
    })

    it('should handle subscription retrieval errors', async () => {
      const error = new Error('Not found')
      mockStripeClient.subscriptions.retrieve.mockRejectedValue(error)

      const result = await getSubscription('sub_invalid')

      expect(result.subscription).toBeNull()
      expect(result.error).toBe('Not found')
    })

    it('should handle non-Error exceptions in subscription retrieval', async () => {
      mockStripeClient.subscriptions.retrieve.mockRejectedValue('Unknown error')

      const result = await getSubscription('sub_123')

      expect(result.subscription).toBeNull()
      expect(result.error).toBe('Failed to retrieve subscription')
    })
  })

  describe('constructWebhookEvent', () => {
    it('should construct webhook event successfully with string payload', async () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
      } as Stripe.Event

      mockStripeClient.webhooks.constructEvent.mockReturnValue(mockEvent)

      const payload = JSON.stringify({ id: 'evt_123' })
      const signature = 'sig_test'
      const webhookSecret = 'whsec_test'

      const result = constructWebhookEvent(payload, signature, webhookSecret)

      expect(result.event).toEqual(mockEvent)
      expect(result.error).toBeNull()
      expect(mockStripeClient.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        webhookSecret
      )
    })

    it('should construct webhook event successfully with Buffer payload', async () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
      } as Stripe.Event

      mockStripeClient.webhooks.constructEvent.mockReturnValue(mockEvent)

      const payload = Buffer.from(JSON.stringify({ id: 'evt_123' }))
      const signature = 'sig_test'
      const webhookSecret = 'whsec_test'

      const result = constructWebhookEvent(payload, signature, webhookSecret)

      expect(result.event).toEqual(mockEvent)
      expect(result.error).toBeNull()
    })

    it('should handle invalid webhook signature', async () => {
      const error = new Error('Invalid signature')
      mockStripeClient.webhooks.constructEvent.mockImplementation(() => {
        throw error
      })

      const payload = JSON.stringify({ id: 'evt_123' })
      const signature = 'invalid_sig'
      const webhookSecret = 'whsec_test'

      const result = constructWebhookEvent(payload, signature, webhookSecret)

      expect(result.event).toBeNull()
      expect(result.error).toBe('Invalid signature')
    })

    it('should handle non-Error exceptions in webhook construction', async () => {
      mockStripeClient.webhooks.constructEvent.mockImplementation(() => {
        throw 'Unknown error'
      })

      const payload = JSON.stringify({ id: 'evt_123' })
      const signature = 'sig_test'
      const webhookSecret = 'whsec_test'

      const result = constructWebhookEvent(payload, signature, webhookSecret)

      expect(result.event).toBeNull()
      expect(result.error).toBe('Invalid webhook signature')
    })
  })

  describe('getCustomerPaymentMethods', () => {
    it('should retrieve payment methods successfully', async () => {
      const mockPaymentMethods = [
        { id: 'pm_123', type: 'card' },
        { id: 'pm_456', type: 'card' },
      ] as Stripe.PaymentMethod[]

      mockStripeClient.paymentMethods.list.mockResolvedValue({
        data: mockPaymentMethods,
      })

      const result = await getCustomerPaymentMethods('cus_123')

      expect(result.paymentMethods).toEqual(mockPaymentMethods)
      expect(result.error).toBeNull()
      expect(mockStripeClient.paymentMethods.list).toHaveBeenCalledWith({
        customer: 'cus_123',
        type: 'card',
      })
    })

    it('should return empty array when customer has no payment methods', async () => {
      mockStripeClient.paymentMethods.list.mockResolvedValue({
        data: [],
      })

      const result = await getCustomerPaymentMethods('cus_123')

      expect(result.paymentMethods).toEqual([])
      expect(result.error).toBeNull()
    })

    it('should handle payment methods retrieval errors', async () => {
      const error = new Error('Not found')
      mockStripeClient.paymentMethods.list.mockRejectedValue(error)

      const result = await getCustomerPaymentMethods('cus_invalid')

      expect(result.paymentMethods).toBeNull()
      expect(result.error).toBe('Not found')
    })

    it('should handle non-Error exceptions in payment methods retrieval', async () => {
      mockStripeClient.paymentMethods.list.mockRejectedValue('Unknown error')

      const result = await getCustomerPaymentMethods('cus_123')

      expect(result.paymentMethods).toBeNull()
      expect(result.error).toBe('Failed to retrieve payment methods')
    })
  })
})