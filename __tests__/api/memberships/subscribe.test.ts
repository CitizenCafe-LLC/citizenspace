/**
 * Tests for Membership Subscription Endpoint
 */

import { POST } from '@/app/api/memberships/subscribe/route'
import { NextRequest } from 'next/server'
import * as authMiddleware from '@/lib/auth/middleware'
import * as stripeUtils from '@/lib/stripe/utils'
import * as postgres from '@/lib/db/postgres'

// Mock dependencies
jest.mock('@/lib/auth/middleware')
jest.mock('@/lib/stripe/utils')
jest.mock('@/lib/db/postgres')

describe('POST /api/memberships/subscribe', () => {
  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'user',
    nftHolder: false,
  }

  const mockDbUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    stripe_customer_id: null,
    membership_status: null,
    stripe_subscription_id: null,
    nft_holder: false,
  }

  const mockMembershipPlan = {
    id: 'plan-123',
    name: 'Premium Plan',
    slug: 'premium',
    price: 99,
    nft_holder_price: 49.5,
    stripe_price_id: 'price_test_123',
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock authentication
    ;(authMiddleware.authenticateRequest as jest.Mock).mockResolvedValue({
      authenticated: true,
      user: mockUser,
    })
  })

  it('should create subscription successfully', async () => {
    // Mock user retrieval
    ;(postgres.executeQuerySingle as jest.Mock)
      .mockResolvedValueOnce({
        data: mockDbUser,
        error: null,
      })
      // Mock plan retrieval
      .mockResolvedValueOnce({
        data: mockMembershipPlan,
        error: null,
      })
      // Mock user update
      .mockResolvedValueOnce({
        data: {},
        error: null,
      })

    // Mock Stripe customer creation
    ;(stripeUtils.getOrCreateStripeCustomer as jest.Mock).mockResolvedValue({
      customer: { id: 'cus_test_123' },
      error: null,
    })

    // Mock subscription creation
    ;(stripeUtils.createSubscription as jest.Mock).mockResolvedValue({
      subscription: {
        id: 'sub_test_123',
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        trial_end: null,
        latest_invoice: {
          payment_intent: {
            client_secret: 'pi_test_secret',
          },
        },
      },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/memberships/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membershipPlanId: 'plan-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.subscriptionId).toBe('sub_test_123')
    expect(data.data.clientSecret).toBe('pi_test_secret')
  })

  it('should reject if user already has active subscription', async () => {
    ;(postgres.executeQuerySingle as jest.Mock).mockResolvedValueOnce({
      data: {
        ...mockDbUser,
        membership_status: 'active',
        stripe_subscription_id: 'sub_existing_123',
      },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/memberships/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membershipPlanId: 'plan-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('already has an active subscription')
  })

  it('should reject if membership plan not found', async () => {
    ;(postgres.executeQuerySingle as jest.Mock)
      .mockResolvedValueOnce({
        data: mockDbUser,
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: null,
      })

    const request = new NextRequest('http://localhost:3000/api/memberships/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membershipPlanId: 'plan-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should reject if plan has no Stripe price ID', async () => {
    ;(postgres.executeQuerySingle as jest.Mock)
      .mockResolvedValueOnce({
        data: mockDbUser,
        error: null,
      })
      .mockResolvedValueOnce({
        data: { ...mockMembershipPlan, stripe_price_id: null },
        error: null,
      })

    const request = new NextRequest('http://localhost:3000/api/memberships/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membershipPlanId: 'plan-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })

  it('should validate request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/memberships/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membershipPlanId: 'invalid-uuid',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('should handle trial period', async () => {
    ;(postgres.executeQuerySingle as jest.Mock)
      .mockResolvedValueOnce({
        data: mockDbUser,
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockMembershipPlan,
        error: null,
      })
      .mockResolvedValueOnce({
        data: {},
        error: null,
      })

    ;(stripeUtils.getOrCreateStripeCustomer as jest.Mock).mockResolvedValue({
      customer: { id: 'cus_test_123' },
      error: null,
    })

    ;(stripeUtils.createSubscription as jest.Mock).mockResolvedValue({
      subscription: {
        id: 'sub_test_123',
        status: 'trialing',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        trial_end: 1610064000,
        latest_invoice: null,
      },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/memberships/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membershipPlanId: 'plan-123',
        trialPeriodDays: 7,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.trialEnd).toBeTruthy()
  })
})