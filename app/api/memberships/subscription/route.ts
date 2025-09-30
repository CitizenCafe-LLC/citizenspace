/**
 * Membership Subscription Management Endpoint
 * Update or cancel an existing subscription
 *
 * @route PATCH /api/memberships/subscription - Update subscription
 * @route DELETE /api/memberships/subscription - Cancel subscription
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
import { updateSubscription, cancelSubscription, getSubscription } from '@/lib/stripe/utils'
import { executeQuerySingle } from '@/lib/db/postgres'
import type { User, MembershipPlan } from '@/lib/db/types'

/**
 * Update subscription schema
 */
const updateSubscriptionSchema = z.object({
  newPlanId: z.string().uuid('Invalid plan ID').optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
})

/**
 * Cancel subscription schema
 */
const cancelSubscriptionSchema = z.object({
  cancelImmediately: z.boolean().optional().default(false),
})

/**
 * GET /api/memberships/subscription
 * Get current subscription details
 *
 * @authenticated
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult.authenticated || !authResult.user) {
      return unauthorizedResponse(authResult.error)
    }

    const userId = authResult.user.userId

    // Get user with subscription details
    const userQuery = `
      SELECT u.*, mp.*
      FROM users u
      LEFT JOIN membership_plans mp ON u.membership_plan_id = mp.id
      WHERE u.id = $1
    `
    const userResult = await executeQuerySingle<User & { stripe_subscription_id?: string }>(
      userQuery,
      [userId]
    )

    if (userResult.error || !userResult.data) {
      return errorResponse('User not found', 404)
    }

    const user = userResult.data

    if (!user.stripe_subscription_id) {
      return successResponse({
        hasSubscription: false,
        message: 'No active subscription found',
      })
    }

    // Get subscription from Stripe
    const { subscription, error: subscriptionError } = await getSubscription(
      user.stripe_subscription_id
    )

    if (subscriptionError || !subscription) {
      return errorResponse(subscriptionError || 'Failed to retrieve subscription', 500)
    }

    return successResponse({
      hasSubscription: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      membershipPlan: user.membership_plan_id
        ? {
            id: user.membership_plan_id,
            name: (user as any).name,
            slug: (user as any).slug,
            price: user.nft_holder ? (user as any).nft_holder_price : (user as any).price,
          }
        : null,
    })
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to retrieve subscription',
      500
    )
  }
}

/**
 * PATCH /api/memberships/subscription
 * Update an existing subscription
 *
 * @authenticated
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult.authenticated || !authResult.user) {
      return unauthorizedResponse(authResult.error)
    }

    const userId = authResult.user.userId

    // Parse request body
    const body = await request.json()
    const validation = updateSubscriptionSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message)
    }

    const { newPlanId, cancelAtPeriodEnd } = validation.data

    // Get user details
    const userQuery = 'SELECT * FROM users WHERE id = $1'
    const userResult = await executeQuerySingle<User & { stripe_subscription_id?: string }>(
      userQuery,
      [userId]
    )

    if (userResult.error || !userResult.data) {
      return errorResponse('User not found', 404)
    }

    const user = userResult.data

    if (!user.stripe_subscription_id) {
      return badRequestResponse('No active subscription found')
    }

    // Build update parameters
    const updateParams: {
      priceId?: string
      metadata?: Record<string, string>
      cancelAtPeriodEnd?: boolean
    } = {}

    if (cancelAtPeriodEnd !== undefined) {
      updateParams.cancelAtPeriodEnd = cancelAtPeriodEnd
    }

    if (newPlanId) {
      // Get new plan details
      const planQuery = 'SELECT * FROM membership_plans WHERE id = $1 AND active = true'
      const planResult = await executeQuerySingle<MembershipPlan>(planQuery, [newPlanId])

      if (planResult.error || !planResult.data) {
        return errorResponse('Membership plan not found or inactive', 404)
      }

      const plan = planResult.data

      if (!plan.stripe_price_id) {
        return errorResponse('Membership plan is not configured for subscriptions', 500)
      }

      updateParams.priceId = plan.stripe_price_id
      updateParams.metadata = {
        user_id: userId,
        membership_plan_id: newPlanId,
        plan_name: plan.name,
        plan_slug: plan.slug,
      }
    }

    // Update subscription in Stripe
    const { subscription, error: updateError } = await updateSubscription(
      user.stripe_subscription_id,
      updateParams
    )

    if (updateError || !subscription) {
      return errorResponse(updateError || 'Failed to update subscription', 500)
    }

    return successResponse({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      message: 'Subscription updated successfully',
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update subscription',
      500
    )
  }
}

/**
 * DELETE /api/memberships/subscription
 * Cancel an existing subscription
 *
 * @authenticated
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult.authenticated || !authResult.user) {
      return unauthorizedResponse(authResult.error)
    }

    const userId = authResult.user.userId

    // Parse request body
    const body = await request.json()
    const validation = cancelSubscriptionSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message)
    }

    const { cancelImmediately } = validation.data

    // Get user details
    const userQuery = 'SELECT * FROM users WHERE id = $1'
    const userResult = await executeQuerySingle<User & { stripe_subscription_id?: string }>(
      userQuery,
      [userId]
    )

    if (userResult.error || !userResult.data) {
      return errorResponse('User not found', 404)
    }

    const user = userResult.data

    if (!user.stripe_subscription_id) {
      return badRequestResponse('No active subscription found')
    }

    // Cancel subscription in Stripe
    const { subscription, error: cancelError } = await cancelSubscription(
      user.stripe_subscription_id,
      cancelImmediately
    )

    if (cancelError || !subscription) {
      return errorResponse(cancelError || 'Failed to cancel subscription', 500)
    }

    return successResponse({
      subscriptionId: subscription.id,
      status: subscription.status,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      message: cancelImmediately
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of the billing period',
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to cancel subscription',
      500
    )
  }
}