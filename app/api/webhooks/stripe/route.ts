/**
 * Stripe Webhook Endpoint
 * Handles all incoming webhook events from Stripe
 *
 * @route POST /api/webhooks/stripe
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripeWebhookSecret } from '@/lib/stripe/config'
import { constructWebhookEvent } from '@/lib/stripe/utils'
import {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from '@/lib/stripe/webhook-handlers'
import type Stripe from 'stripe'

/**
 * Disable body parsing for webhook signature verification
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/stripe
 * Handle incoming Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = getStripeWebhookSecret()
    const { event, error: verifyError } = constructWebhookEvent(body, signature, webhookSecret)

    if (verifyError || !event) {
      console.error('Webhook signature verification failed:', verifyError)
      return NextResponse.json(
        { error: 'Invalid signature', details: verifyError },
        { status: 400 }
      )
    }

    console.log('Received Stripe webhook event:', event.type, event.id)

    // Process the event based on type
    let result: { success: boolean; error: string | null } = { success: true, error: null }

    switch (event.type) {
      // Payment Intent Events
      case 'payment_intent.succeeded':
        result = await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        result = await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      // Subscription Events
      case 'customer.subscription.created':
        result = await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        result = await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        result = await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      // Checkout Session Events (for additional tracking)
      case 'checkout.session.completed':
        console.log('Checkout session completed:', event.data.object)
        // Additional handling can be added here if needed
        break

      // Invoice Events (for subscription billing)
      case 'invoice.paid':
        console.log('Invoice paid:', event.data.object)
        // Additional handling for invoice tracking
        break

      case 'invoice.payment_failed':
        console.log('Invoice payment failed:', event.data.object)
        // Handle failed invoice payments
        break

      // Refund Events
      case 'charge.refunded':
        console.log('Charge refunded:', event.data.object)
        // Additional handling for refunds
        break

      default:
        console.log('Unhandled event type:', event.type)
        return NextResponse.json(
          {
            success: true,
            message: `Unhandled event type: ${event.type}`,
          },
          { status: 200 }
        )
    }

    if (!result.success) {
      console.error('Webhook handler failed:', result.error)
      // Still return 200 to acknowledge receipt, but log the error
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          warning: 'Webhook received but processing failed',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully processed ${event.type}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/stripe
 * Health check endpoint (not used by Stripe)
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'Stripe webhook endpoint is active',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}