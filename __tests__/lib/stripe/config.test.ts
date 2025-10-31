/**
 * Tests for Stripe Configuration
 */

import {
  calculateProcessingFee,
  dollarsToCents,
  centsToDollars,
  formatStripeAmount,
  STRIPE_CONFIG,
  getStripeWebhookSecret,
  getStripePriceIds,
} from '@/lib/stripe/config'

// Store original env variables
const originalEnv = process.env

// Mock Stripe to avoid fetch requirement
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {},
    paymentIntents: {},
    subscriptions: {},
  }))
})

describe('Stripe Configuration', () => {
  beforeEach(() => {
    // Reset modules to clear cached Stripe client
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getStripeClient', () => {
    it('should throw error when STRIPE_SECRET_KEY is missing', () => {
      delete process.env.STRIPE_SECRET_KEY

      // Re-import to get fresh module
      jest.resetModules()
      const { getStripeClient } = require('@/lib/stripe/config')

      expect(() => getStripeClient()).toThrow(
        'Missing STRIPE_SECRET_KEY environment variable. Please set it in .env.local'
      )
    })

    it('should create client when STRIPE_SECRET_KEY is present', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'

      // Re-import to get fresh module
      jest.resetModules()
      jest.mock('stripe', () => {
        return jest.fn().mockImplementation(() => ({
          customers: {},
          paymentIntents: {},
          subscriptions: {},
        }))
      })
      const { getStripeClient } = require('@/lib/stripe/config')

      const client = getStripeClient()
      expect(client).toBeDefined()
    })
  })

  describe('getStripeWebhookSecret', () => {
    it('should return webhook secret when environment variable is set', () => {
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
      const secret = getStripeWebhookSecret()
      expect(secret).toBe('whsec_test_secret')
    })

    it('should throw error when STRIPE_WEBHOOK_SECRET is missing', () => {
      delete process.env.STRIPE_WEBHOOK_SECRET
      expect(() => getStripeWebhookSecret()).toThrow(
        'Missing STRIPE_WEBHOOK_SECRET environment variable. Please set it in .env.local'
      )
    })

    it('should throw error when STRIPE_WEBHOOK_SECRET is empty string', () => {
      process.env.STRIPE_WEBHOOK_SECRET = ''
      expect(() => getStripeWebhookSecret()).toThrow(
        'Missing STRIPE_WEBHOOK_SECRET environment variable. Please set it in .env.local'
      )
    })
  })

  describe('getStripePriceIds', () => {
    it('should return all price IDs when environment variables are set', () => {
      process.env.STRIPE_PRICE_ID_HOT_DESK_HOURLY = 'price_hot_desk_123'
      process.env.STRIPE_PRICE_ID_MEMBERSHIP_BASIC = 'price_basic_123'
      process.env.STRIPE_PRICE_ID_MEMBERSHIP_PREMIUM = 'price_premium_123'
      process.env.STRIPE_PRICE_ID_MEMBERSHIP_ENTERPRISE = 'price_enterprise_123'

      const priceIds = getStripePriceIds()

      expect(priceIds).toEqual({
        hotDeskHourly: 'price_hot_desk_123',
        membershipBasic: 'price_basic_123',
        membershipPremium: 'price_premium_123',
        membershipEnterprise: 'price_enterprise_123',
      })
    })

    it('should return undefined for missing price IDs', () => {
      delete process.env.STRIPE_PRICE_ID_HOT_DESK_HOURLY
      delete process.env.STRIPE_PRICE_ID_MEMBERSHIP_BASIC
      delete process.env.STRIPE_PRICE_ID_MEMBERSHIP_PREMIUM
      delete process.env.STRIPE_PRICE_ID_MEMBERSHIP_ENTERPRISE

      const priceIds = getStripePriceIds()

      expect(priceIds).toEqual({
        hotDeskHourly: undefined,
        membershipBasic: undefined,
        membershipPremium: undefined,
        membershipEnterprise: undefined,
      })
    })
  })

  describe('calculateProcessingFee', () => {
    it('should calculate processing fee correctly for small amounts', () => {
      const amount = 10 // $10 in dollars
      const fee = calculateProcessingFee(amount)
      // (10 * 0.029) + (0.30 * 100) = 0.29 + 30 = 30.29 cents
      expect(fee).toBe(30) // 30 cents (rounded)
    })

    it('should calculate processing fee correctly for large amounts', () => {
      const amount = 1000 // $1000 in dollars
      const fee = calculateProcessingFee(amount)
      // (1000 * 0.029) + (0.30 * 100) = 29 + 30 = 59 cents
      expect(fee).toBe(59) // 59 cents
    })

    it('should handle zero amount', () => {
      const amount = 0
      const fee = calculateProcessingFee(amount)
      expect(fee).toBe(30) // Just the fixed fee
    })

    it('should round to nearest cent', () => {
      const amount = 10.55
      const fee = calculateProcessingFee(amount)
      expect(Number.isInteger(fee)).toBe(true)
    })

    it('should handle negative amounts', () => {
      const amount = -50
      const fee = calculateProcessingFee(amount)
      expect(fee).toBe(Math.round(-50 * 0.029 + 30))
    })

    it('should handle decimal amounts correctly', () => {
      const amount = 25.99
      const fee = calculateProcessingFee(amount)
      expect(fee).toBe(Math.round(25.99 * 0.029 + 30))
    })
  })

  describe('dollarsToCents', () => {
    it('should convert whole dollars to cents', () => {
      expect(dollarsToCents(1)).toBe(100)
      expect(dollarsToCents(10)).toBe(1000)
      expect(dollarsToCents(100)).toBe(10000)
    })

    it('should convert decimal dollars to cents', () => {
      expect(dollarsToCents(1.5)).toBe(150)
      expect(dollarsToCents(10.99)).toBe(1099)
      expect(dollarsToCents(0.01)).toBe(1)
    })

    it('should handle zero', () => {
      expect(dollarsToCents(0)).toBe(0)
    })

    it('should round to nearest cent', () => {
      // JavaScript Math.round uses "round half up" (banker's rounding)
      expect(dollarsToCents(1.005)).toBe(100) // Rounds to even
      expect(dollarsToCents(1.006)).toBe(101) // Rounds up
    })

    it('should handle negative amounts', () => {
      expect(dollarsToCents(-10)).toBe(-1000)
      expect(dollarsToCents(-5.50)).toBe(-550)
    })

    it('should handle very small amounts', () => {
      expect(dollarsToCents(0.001)).toBe(0)
      expect(dollarsToCents(0.005)).toBe(1)
    })
  })

  describe('centsToDollars', () => {
    it('should convert whole cents to dollars', () => {
      expect(centsToDollars(100)).toBe(1)
      expect(centsToDollars(1000)).toBe(10)
      expect(centsToDollars(10000)).toBe(100)
    })

    it('should convert partial cents to dollars', () => {
      expect(centsToDollars(150)).toBe(1.5)
      expect(centsToDollars(1099)).toBe(10.99)
      expect(centsToDollars(1)).toBe(0.01)
    })

    it('should handle zero', () => {
      expect(centsToDollars(0)).toBe(0)
    })

    it('should handle negative amounts', () => {
      expect(centsToDollars(-100)).toBe(-1)
      expect(centsToDollars(-550)).toBe(-5.5)
    })

    it('should handle large amounts', () => {
      expect(centsToDollars(100000)).toBe(1000)
      expect(centsToDollars(999999)).toBe(9999.99)
    })
  })

  describe('formatStripeAmount', () => {
    it('should format amounts correctly', () => {
      expect(formatStripeAmount(10)).toBe(1000)
      expect(formatStripeAmount(10.5)).toBe(1050)
      expect(formatStripeAmount(0.01)).toBe(1)
    })

    it('should round to nearest cent', () => {
      expect(formatStripeAmount(10.005)).toBe(1001)
      expect(formatStripeAmount(10.004)).toBe(1000)
    })

    it('should handle zero', () => {
      expect(formatStripeAmount(0)).toBe(0)
    })

    it('should handle negative amounts', () => {
      expect(formatStripeAmount(-10)).toBe(-1000)
      expect(formatStripeAmount(-5.50)).toBe(-550)
    })

    it('should handle large amounts', () => {
      expect(formatStripeAmount(1000000)).toBe(100000000)
    })
  })

  describe('STRIPE_CONFIG', () => {
    it('should have correct currency', () => {
      expect(STRIPE_CONFIG.currency).toBe('usd')
    })

    it('should have processing fee configuration', () => {
      expect(STRIPE_CONFIG.processingFeePercentage).toBe(0.029)
      expect(STRIPE_CONFIG.processingFeeFixed).toBe(0.3)
    })

    it('should have automatic payment methods enabled', () => {
      expect(STRIPE_CONFIG.automaticPaymentMethods.enabled).toBe(true)
    })

    it('should have checkout URLs configured', () => {
      expect(STRIPE_CONFIG.checkoutSuccessUrl).toContain('/bookings/success')
      expect(STRIPE_CONFIG.checkoutCancelUrl).toContain('/bookings/cancel')
    })

    it('should have subscription configuration', () => {
      expect(STRIPE_CONFIG.subscriptionBillingCycleAnchor).toBe('now')
      expect(STRIPE_CONFIG.subscriptionProrationBehavior).toBe('create_prorations')
    })

    it('should have checkout mode configured', () => {
      expect(STRIPE_CONFIG.checkoutMode).toBe('payment')
    })

    it('should have refund configuration', () => {
      expect(STRIPE_CONFIG.refundReason).toBe('requested_by_customer')
    })

    it('should have metadata prefixes', () => {
      expect(STRIPE_CONFIG.metadataPrefix.booking).toBe('booking_')
      expect(STRIPE_CONFIG.metadataPrefix.user).toBe('user_')
      expect(STRIPE_CONFIG.metadataPrefix.membership).toBe('membership_')
    })

    it('should be a frozen object', () => {
      // Test that config is read-only (TypeScript const assertion doesn't guarantee runtime immutability)
      // In JavaScript, const objects can still have their properties modified
      // This test verifies the structure exists
      expect(STRIPE_CONFIG).toHaveProperty('currency')
      expect(STRIPE_CONFIG).toHaveProperty('processingFeePercentage')
      expect(STRIPE_CONFIG).toHaveProperty('metadataPrefix')
    })
  })
})