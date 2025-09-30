/**
 * Tests for Payment Intent Creation Endpoint
 */

import { POST } from '@/app/api/payments/create-intent/route'
import { NextRequest } from 'next/server'
import * as authMiddleware from '@/lib/auth/middleware'
import * as stripeUtils from '@/lib/stripe/utils'
import * as bookingRepository from '@/lib/db/repositories/booking.repository'
import * as postgres from '@/lib/db/postgres'

// Mock dependencies
jest.mock('@/lib/auth/middleware')
jest.mock('@/lib/stripe/utils')
jest.mock('@/lib/db/repositories/booking.repository')
jest.mock('@/lib/db/postgres')

describe('POST /api/payments/create-intent', () => {
  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'user',
    nftHolder: false,
  }

  const mockBooking = {
    id: 'booking-123',
    user_id: 'user-123',
    workspace_id: 'workspace-123',
    booking_type: 'hourly-desk',
    booking_date: '2025-01-01',
    total_price: 50,
    payment_status: 'pending',
    status: 'pending',
  }

  const mockDbUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    stripe_customer_id: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock authentication
    ;(authMiddleware.authenticateRequest as jest.Mock).mockResolvedValue({
      authenticated: true,
      user: mockUser,
    })
  })

  it('should create payment intent successfully', async () => {
    // Mock booking retrieval
    ;(bookingRepository.getBookingById as jest.Mock).mockResolvedValue({
      data: mockBooking,
      error: null,
    })

    // Mock user retrieval
    ;(postgres.executeQuerySingle as jest.Mock).mockResolvedValue({
      data: mockDbUser,
      error: null,
    })

    // Mock Stripe customer creation
    ;(stripeUtils.getOrCreateStripeCustomer as jest.Mock).mockResolvedValue({
      customer: { id: 'cus_test_123' },
      error: null,
    })

    // Mock payment intent creation
    ;(stripeUtils.createPaymentIntent as jest.Mock).mockResolvedValue({
      paymentIntent: {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        currency: 'usd',
      },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'booking-123',
        amount: 50,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.clientSecret).toBe('pi_test_123_secret_abc')
    expect(data.data.paymentIntentId).toBe('pi_test_123')
  })

  it('should reject unauthorized requests', async () => {
    ;(authMiddleware.authenticateRequest as jest.Mock).mockResolvedValue({
      authenticated: false,
      error: 'Invalid token',
    })

    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'booking-123',
        amount: 50,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('should validate request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'invalid-id',
        amount: -10,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('should reject if booking does not belong to user', async () => {
    ;(bookingRepository.getBookingById as jest.Mock).mockResolvedValue({
      data: { ...mockBooking, user_id: 'other-user-123' },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'booking-123',
        amount: 50,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
  })

  it('should reject if booking is already paid', async () => {
    ;(bookingRepository.getBookingById as jest.Mock).mockResolvedValue({
      data: { ...mockBooking, payment_status: 'paid' },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'booking-123',
        amount: 50,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('already paid')
  })

  it('should handle Stripe errors', async () => {
    ;(bookingRepository.getBookingById as jest.Mock).mockResolvedValue({
      data: mockBooking,
      error: null,
    })

    ;(postgres.executeQuerySingle as jest.Mock).mockResolvedValue({
      data: mockDbUser,
      error: null,
    })

    ;(stripeUtils.getOrCreateStripeCustomer as jest.Mock).mockResolvedValue({
      customer: { id: 'cus_test_123' },
      error: null,
    })

    ;(stripeUtils.createPaymentIntent as jest.Mock).mockResolvedValue({
      paymentIntent: null,
      error: 'Stripe API error',
    })

    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'booking-123',
        amount: 50,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})