/**
 * Stripe Configuration
 * Central configuration for Stripe API integration
 */

import Stripe from 'stripe'

/**
 * Stripe API client singleton
 */
let stripeClient: Stripe | null = null

/**
 * Get or create Stripe client instance
 */
export function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient
  }

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable. Please set it in .env.local')
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
    appInfo: {
      name: 'CitizenSpace',
      version: '1.0.0',
    },
  })

  return stripeClient
}

/**
 * Stripe webhook secret for signature verification
 */
export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error(
      'Missing STRIPE_WEBHOOK_SECRET environment variable. Please set it in .env.local'
    )
  }

  return webhookSecret
}

/**
 * Stripe configuration constants
 */
export const STRIPE_CONFIG = {
  // Currency
  currency: 'usd',

  // Payment processing fee (percentage)
  processingFeePercentage: 0.029, // 2.9%
  processingFeeFixed: 0.3, // $0.30

  // Subscription configuration
  subscriptionBillingCycleAnchor: 'now' as const,
  subscriptionProrationBehavior: 'create_prorations' as const,

  // Payment intent configuration
  automaticPaymentMethods: {
    enabled: true,
  },

  // Checkout session configuration
  checkoutMode: 'payment' as const,
  checkoutSuccessUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/bookings/success?session_id={CHECKOUT_SESSION_ID}`
    : 'http://localhost:3000/bookings/success?session_id={CHECKOUT_SESSION_ID}',
  checkoutCancelUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/bookings/cancel`
    : 'http://localhost:3000/bookings/cancel',

  // Refund configuration
  refundReason: 'requested_by_customer' as const,

  // Metadata prefixes
  metadataPrefix: {
    booking: 'booking_',
    user: 'user_',
    membership: 'membership_',
  },
} as const

/**
 * Calculate Stripe processing fee
 */
export function calculateProcessingFee(amount: number): number {
  return Math.round(
    amount * STRIPE_CONFIG.processingFeePercentage + STRIPE_CONFIG.processingFeeFixed * 100
  )
}

/**
 * Convert dollars to cents for Stripe
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Convert cents to dollars from Stripe
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}

/**
 * Format amount for Stripe (in cents)
 */
export function formatStripeAmount(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Get Stripe price IDs from environment
 */
export function getStripePriceIds() {
  return {
    hotDeskHourly: process.env.STRIPE_PRICE_ID_HOT_DESK_HOURLY,
    membershipBasic: process.env.STRIPE_PRICE_ID_MEMBERSHIP_BASIC,
    membershipPremium: process.env.STRIPE_PRICE_ID_MEMBERSHIP_PREMIUM,
    membershipEnterprise: process.env.STRIPE_PRICE_ID_MEMBERSHIP_ENTERPRISE,
  }
}