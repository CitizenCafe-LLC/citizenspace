/**
 * Stripe Utility Functions
 * Helper functions for working with Stripe API
 */

import Stripe from 'stripe'
import { getStripeClient, STRIPE_CONFIG } from './config'

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string,
  existingCustomerId?: string | null
): Promise<{ customer: Stripe.Customer | null; error: string | null }> {
  try {
    const stripe = getStripeClient()

    // If customer ID exists, retrieve the customer
    if (existingCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(existingCustomerId)
        if (!customer.deleted) {
          return { customer: customer as Stripe.Customer, error: null }
        }
      } catch (err) {
        console.warn('Failed to retrieve existing customer, creating new one:', err)
      }
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        user_id: userId,
      },
    })

    return { customer, error: null }
  } catch (err) {
    console.error('Error creating/retrieving Stripe customer:', err)
    return {
      customer: null,
      error: err instanceof Error ? err.message : 'Failed to create Stripe customer',
    }
  }
}

/**
 * Create a payment intent for one-time payments
 */
export async function createPaymentIntent(
  amount: number,
  customerId: string,
  metadata: Record<string, string>
): Promise<{ paymentIntent: Stripe.PaymentIntent | null; error: string | null }> {
  try {
    const stripe = getStripeClient()

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: STRIPE_CONFIG.currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: STRIPE_CONFIG.automaticPaymentMethods,
    })

    return { paymentIntent, error: null }
  } catch (err) {
    console.error('Error creating payment intent:', err)
    return {
      paymentIntent: null,
      error: err instanceof Error ? err.message : 'Failed to create payment intent',
    }
  }
}

/**
 * Create a Stripe Checkout Session for one-time payments
 */
export async function createCheckoutSession(params: {
  customerId: string
  amount: number
  successUrl: string
  cancelUrl: string
  metadata: Record<string, string>
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
}): Promise<{ session: Stripe.Checkout.Session | null; error: string | null }> {
  try {
    const stripe = getStripeClient()

    const session = await stripe.checkout.sessions.create({
      customer: params.customerId,
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

    return { session, error: null }
  } catch (err) {
    console.error('Error creating checkout session:', err)
    return {
      session: null,
      error: err instanceof Error ? err.message : 'Failed to create checkout session',
    }
  }
}

/**
 * Create a subscription for recurring payments
 */
export async function createSubscription(params: {
  customerId: string
  priceId: string
  metadata: Record<string, string>
  trialPeriodDays?: number
}): Promise<{ subscription: Stripe.Subscription | null; error: string | null }> {
  try {
    const stripe = getStripeClient()

    const subscription = await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: params.metadata,
      trial_period_days: params.trialPeriodDays,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
      },
      expand: ['latest_invoice.payment_intent'],
    })

    return { subscription, error: null }
  } catch (err) {
    console.error('Error creating subscription:', err)
    return {
      subscription: null,
      error: err instanceof Error ? err.message : 'Failed to create subscription',
    }
  }
}

/**
 * Update an existing subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  params: {
    priceId?: string
    metadata?: Record<string, string>
    cancelAtPeriodEnd?: boolean
  }
): Promise<{ subscription: Stripe.Subscription | null; error: string | null }> {
  try {
    const stripe = getStripeClient()

    const updateParams: Stripe.SubscriptionUpdateParams = {
      metadata: params.metadata,
      cancel_at_period_end: params.cancelAtPeriodEnd,
    }

    if (params.priceId) {
      // Get current subscription to update items
      const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId)
      updateParams.items = [
        {
          id: currentSubscription.items.data[0].id,
          price: params.priceId,
        },
      ]
      updateParams.proration_behavior = STRIPE_CONFIG.subscriptionProrationBehavior
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, updateParams)

    return { subscription, error: null }
  } catch (err) {
    console.error('Error updating subscription:', err)
    return {
      subscription: null,
      error: err instanceof Error ? err.message : 'Failed to update subscription',
    }
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<{ subscription: Stripe.Subscription | null; error: string | null }> {
  try {
    const stripe = getStripeClient()

    const subscription = cancelImmediately
      ? await stripe.subscriptions.cancel(subscriptionId)
      : await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })

    return { subscription, error: null }
  } catch (err) {
    console.error('Error canceling subscription:', err)
    return {
      subscription: null,
      error: err instanceof Error ? err.message : 'Failed to cancel subscription',
    }
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<{ refund: Stripe.Refund | null; error: string | null }> {
  try {
    const stripe = getStripeClient()

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason: (reason as Stripe.RefundCreateParams.Reason) || STRIPE_CONFIG.refundReason,
    })

    return { refund, error: null }
  } catch (err) {
    console.error('Error creating refund:', err)
    return {
      refund: null,
      error: err instanceof Error ? err.message : 'Failed to create refund',
    }
  }
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<{ paymentIntent: Stripe.PaymentIntent | null; error: string | null }> {
  try {
    const stripe = getStripeClient()
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return { paymentIntent, error: null }
  } catch (err) {
    console.error('Error retrieving payment intent:', err)
    return {
      paymentIntent: null,
      error: err instanceof Error ? err.message : 'Failed to retrieve payment intent',
    }
  }
}

/**
 * Retrieve a subscription
 */
export async function getSubscription(
  subscriptionId: string
): Promise<{ subscription: Stripe.Subscription | null; error: string | null }> {
  try {
    const stripe = getStripeClient()
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return { subscription, error: null }
  } catch (err) {
    console.error('Error retrieving subscription:', err)
    return {
      subscription: null,
      error: err instanceof Error ? err.message : 'Failed to retrieve subscription',
    }
  }
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): { event: Stripe.Event | null; error: string | null } {
  try {
    const stripe = getStripeClient()
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    return { event, error: null }
  } catch (err) {
    console.error('Error verifying webhook signature:', err)
    return {
      event: null,
      error: err instanceof Error ? err.message : 'Invalid webhook signature',
    }
  }
}

/**
 * Get customer's payment methods
 */
export async function getCustomerPaymentMethods(
  customerId: string
): Promise<{ paymentMethods: Stripe.PaymentMethod[] | null; error: string | null }> {
  try {
    const stripe = getStripeClient()
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })
    return { paymentMethods: paymentMethods.data, error: null }
  } catch (err) {
    console.error('Error retrieving payment methods:', err)
    return {
      paymentMethods: null,
      error: err instanceof Error ? err.message : 'Failed to retrieve payment methods',
    }
  }
}