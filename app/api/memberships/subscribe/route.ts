/**
 * Membership Subscription Endpoint
 * Create a new membership subscription
 *
 * @route POST /api/memberships/subscribe
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  badRequestResponse,
} from '@/lib/api/response'
import { authenticateRequest } from '@/lib/auth/middleware'
import { getOrCreateStripeCustomer, createSubscription } from '@/lib/stripe/utils'
import { executeQuerySingle } from '@/lib/db/postgres'
import type { User, MembershipPlan } from '@/lib/db/types'

/**
 * Request body validation schema
 */
const subscribeSchema = z.object({
  membershipPlanId: z.string().uuid('Invalid membership plan ID'),
  trialPeriodDays: z.number().int().min(0).optional(),
})

/**
 * POST /api/memberships/subscribe
 * Create a subscription for a membership plan
 *
 * @authenticated
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult.authenticated || !authResult.user) {
      return unauthorizedResponse(authResult.error)
    }

    const userId = authResult.user.userId

    // Parse request body
    const body = await request.json()
    const validation = subscribeSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message)
    }

    const { membershipPlanId, trialPeriodDays } = validation.data

    // Get user details
    const userQuery = 'SELECT * FROM users WHERE id = $1'
    const userResult = await executeQuerySingle<User>(userQuery, [userId])

    if (userResult.error || !userResult.data) {
      return errorResponse('User not found', 404)
    }

    const user = userResult.data

    // Check if user already has an active subscription
    if (user.membership_status === 'active' && user.stripe_subscription_id) {
      return badRequestResponse(
        'User already has an active subscription. Please cancel or update the existing subscription.'
      )
    }

    // Get membership plan details
    const planQuery = 'SELECT * FROM membership_plans WHERE id = $1 AND active = true'
    const planResult = await executeQuerySingle<MembershipPlan>(planQuery, [membershipPlanId])

    if (planResult.error || !planResult.data) {
      return errorResponse('Membership plan not found or inactive', 404)
    }

    const plan = planResult.data

    // Verify plan has a Stripe price ID
    if (!plan.stripe_price_id) {
      return errorResponse('Membership plan is not configured for subscriptions', 500)
    }

    // Create or retrieve Stripe customer
    const { customer, error: customerError } = await getOrCreateStripeCustomer(
      userId,
      user.email,
      user.full_name,
      user.stripe_customer_id
    )

    if (customerError || !customer) {
      return errorResponse(customerError || 'Failed to create customer', 500)
    }

    // Update user with Stripe customer ID if not already set
    if (!user.stripe_customer_id) {
      const updateUserQuery = 'UPDATE users SET stripe_customer_id = $1 WHERE id = $2'
      await executeQuerySingle(updateUserQuery, [customer.id, userId])
    }

    // Create subscription metadata
    const metadata = {
      user_id: userId,
      membership_plan_id: membershipPlanId,
      plan_name: plan.name,
      plan_slug: plan.slug,
    }

    // Create Stripe subscription
    const { subscription, error: subscriptionError } = await createSubscription({
      customerId: customer.id,
      priceId: plan.stripe_price_id,
      metadata,
      trialPeriodDays,
    })

    if (subscriptionError || !subscription) {
      return errorResponse(subscriptionError || 'Failed to create subscription', 500)
    }

    // Extract client secret from payment intent
    let clientSecret: string | null = null
    if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string') {
      const invoice = subscription.latest_invoice
      if (invoice.payment_intent && typeof invoice.payment_intent !== 'string') {
        clientSecret = invoice.payment_intent.client_secret
      }
    }

    return successResponse({
      subscriptionId: subscription.id,
      clientSecret,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      membershipPlan: {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        price: user.nft_holder ? plan.nft_holder_price : plan.price,
      },
      message: 'Subscription created successfully',
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create subscription',
      500
    )
  }
}

/**
 * GET /api/memberships/subscribe
 * Return method not allowed
 */
export async function GET() {
  return errorResponse('Method not allowed', 405)
}