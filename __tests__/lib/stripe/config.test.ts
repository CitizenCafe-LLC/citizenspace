/**
 * Tests for Stripe Configuration
 */

import {
  calculateProcessingFee,
  dollarsToCents,
  centsToDollars,
  formatStripeAmount,
  STRIPE_CONFIG,
} from '@/lib/stripe/config'

describe('Stripe Configuration', () => {
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
  })
})