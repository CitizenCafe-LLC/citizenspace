/**
 * Tests for Stripe Webhook Endpoint
 */

import { POST } from '@/app/api/webhooks/stripe/route'
import { NextRequest } from 'next/server'
import * as stripeUtils from '@/lib/stripe/utils'
import * as webhookHandlers from '@/lib/stripe/webhook-handlers'
import type Stripe from 'stripe'

// Mock dependencies
jest.mock('@/lib/stripe/utils')
jest.mock('@/lib/stripe/webhook-handlers')
jest.mock('@/lib/stripe/config', () => ({
  getStripeWebhookSecret: jest.fn().mockReturnValue('whsec_test_secret'),
}))

describe('POST /api/webhooks/stripe', () => {
  const mockSignature = 't=1234567890,v1=test_signature'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle payment_intent.succeeded event', async () => {
    const mockEvent: Partial<Stripe.Event> = {
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: { booking_id: 'booking-123' },
        } as Stripe.PaymentIntent,
      },
    }

    ;(stripeUtils.constructWebhookEvent as jest.Mock).mockReturnValue({
      event: mockEvent,
      error: null,
    })

    ;(webhookHandlers.handlePaymentIntentSucceeded as jest.Mock).mockResolvedValue({
      success: true,
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(webhookHandlers.handlePaymentIntentSucceeded).toHaveBeenCalled()
  })

  it('should handle payment_intent.payment_failed event', async () => {
    const mockEvent: Partial<Stripe.Event> = {
      id: 'evt_test_123',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: { booking_id: 'booking-123' },
        } as Stripe.PaymentIntent,
      },
    }

    ;(stripeUtils.constructWebhookEvent as jest.Mock).mockReturnValue({
      event: mockEvent,
      error: null,
    })

    ;(webhookHandlers.handlePaymentIntentFailed as jest.Mock).mockResolvedValue({
      success: true,
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(webhookHandlers.handlePaymentIntentFailed).toHaveBeenCalled()
  })

  it('should handle customer.subscription.created event', async () => {
    const mockEvent: Partial<Stripe.Event> = {
      id: 'evt_test_123',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test_123',
          metadata: { user_id: 'user-123', membership_plan_id: 'plan-123' },
        } as Stripe.Subscription,
      },
    }

    ;(stripeUtils.constructWebhookEvent as jest.Mock).mockReturnValue({
      event: mockEvent,
      error: null,
    })

    ;(webhookHandlers.handleSubscriptionCreated as jest.Mock).mockResolvedValue({
      success: true,
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(webhookHandlers.handleSubscriptionCreated).toHaveBeenCalled()
  })

  it('should reject requests with invalid signature', async () => {
    ;(stripeUtils.constructWebhookEvent as jest.Mock).mockReturnValue({
      event: null,
      error: 'Invalid signature',
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'invalid_signature',
      },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid signature')
  })

  it('should reject requests without signature header', async () => {
    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing signature')
  })

  it('should handle unhandled event types gracefully', async () => {
    const mockEvent: Partial<Stripe.Event> = {
      id: 'evt_test_123',
      type: 'customer.updated',
      data: {
        object: {} as any,
      },
    }

    ;(stripeUtils.constructWebhookEvent as jest.Mock).mockReturnValue({
      event: mockEvent,
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('Unhandled event type')
  })

  it('should still return 200 even if handler fails', async () => {
    const mockEvent: Partial<Stripe.Event> = {
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: { booking_id: 'booking-123' },
        } as Stripe.PaymentIntent,
      },
    }

    ;(stripeUtils.constructWebhookEvent as jest.Mock).mockReturnValue({
      event: mockEvent,
      error: null,
    })

    ;(webhookHandlers.handlePaymentIntentSucceeded as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Processing failed',
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    // Return 200 to acknowledge receipt but indicate failure
    expect(response.status).toBe(200)
    expect(data.success).toBe(false)
    expect(data.warning).toBeTruthy()
  })

  it('should handle subscription.updated event', async () => {
    const mockEvent: Partial<Stripe.Event> = {
      id: 'evt_test_123',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_test_123',
          metadata: { user_id: 'user-123' },
        } as Stripe.Subscription,
      },
    }

    ;(stripeUtils.constructWebhookEvent as jest.Mock).mockReturnValue({
      event: mockEvent,
      error: null,
    })

    ;(webhookHandlers.handleSubscriptionUpdated as jest.Mock).mockResolvedValue({
      success: true,
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(webhookHandlers.handleSubscriptionUpdated).toHaveBeenCalled()
  })

  it('should handle subscription.deleted event', async () => {
    const mockEvent: Partial<Stripe.Event> = {
      id: 'evt_test_123',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_test_123',
          metadata: { user_id: 'user-123' },
        } as Stripe.Subscription,
      },
    }

    ;(stripeUtils.constructWebhookEvent as jest.Mock).mockReturnValue({
      event: mockEvent,
      error: null,
    })

    ;(webhookHandlers.handleSubscriptionDeleted as jest.Mock).mockResolvedValue({
      success: true,
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(webhookHandlers.handleSubscriptionDeleted).toHaveBeenCalled()
  })
})