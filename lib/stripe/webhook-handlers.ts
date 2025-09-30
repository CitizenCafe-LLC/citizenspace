/**
 * Stripe Webhook Event Handlers
 * Handles all Stripe webhook events for payments and subscriptions
 */

import Stripe from 'stripe'
import { updateBooking } from '../db/repositories/booking.repository'
import { executeQuery, executeQuerySingle } from '../db/postgres'
import type { User, MembershipCredit } from '../db/types'
import { sendEmail } from '../email/service'

/**
 * Handle payment_intent.succeeded event
 * Called when a payment is successfully completed
 */
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Processing payment_intent.succeeded:', paymentIntent.id)

    const bookingId = paymentIntent.metadata.booking_id
    const userId = paymentIntent.metadata.user_id

    if (!bookingId) {
      console.warn('No booking_id in payment intent metadata')
      return { success: true, error: null }
    }

    // Update booking status to confirmed and payment status to paid
    const updateResult = await updateBooking(bookingId, {
      status: 'confirmed',
      payment_status: 'paid',
      payment_intent_id: paymentIntent.id,
    })

    if (updateResult.error) {
      console.error('Error updating booking after payment:', updateResult.error)
      return { success: false, error: updateResult.error }
    }

    // Send confirmation email
    if (userId) {
      try {
        await sendBookingConfirmationEmail(bookingId, userId)
      } catch (err) {
        console.error('Error sending confirmation email:', err)
        // Don't fail the webhook if email fails
      }
    }

    console.log('Successfully processed payment for booking:', bookingId)
    return { success: true, error: null }
  } catch (err) {
    console.error('Error handling payment_intent.succeeded:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to handle payment success',
    }
  }
}

/**
 * Handle payment_intent.payment_failed event
 * Called when a payment fails
 */
export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Processing payment_intent.payment_failed:', paymentIntent.id)

    const bookingId = paymentIntent.metadata.booking_id
    const userId = paymentIntent.metadata.user_id

    if (!bookingId) {
      console.warn('No booking_id in payment intent metadata')
      return { success: true, error: null }
    }

    // Update booking payment status to pending (keep status as pending)
    const updateResult = await updateBooking(bookingId, {
      payment_status: 'pending',
    })

    if (updateResult.error) {
      console.error('Error updating booking after payment failure:', updateResult.error)
      return { success: false, error: updateResult.error }
    }

    // Send payment failure notification
    if (userId) {
      try {
        await sendPaymentFailureEmail(bookingId, userId)
      } catch (err) {
        console.error('Error sending payment failure email:', err)
      }
    }

    console.log('Processed payment failure for booking:', bookingId)
    return { success: true, error: null }
  } catch (err) {
    console.error('Error handling payment_intent.payment_failed:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to handle payment failure',
    }
  }
}

/**
 * Handle customer.subscription.created event
 * Called when a new subscription is created
 */
export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Processing customer.subscription.created:', subscription.id)

    const userId = subscription.metadata.user_id
    const membershipPlanId = subscription.metadata.membership_plan_id

    if (!userId || !membershipPlanId) {
      console.warn('Missing user_id or membership_plan_id in subscription metadata')
      return { success: false, error: 'Missing required metadata' }
    }

    // Update user's membership information
    const updateUserQuery = `
      UPDATE users
      SET
        membership_plan_id = $1,
        membership_status = $2,
        membership_start_date = $3,
        membership_end_date = $4,
        stripe_subscription_id = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `

    const startDate = new Date(subscription.current_period_start * 1000).toISOString()
    const endDate = new Date(subscription.current_period_end * 1000).toISOString()

    const userResult = await executeQuerySingle<User>(updateUserQuery, [
      membershipPlanId,
      'active',
      startDate,
      endDate,
      subscription.id,
      userId,
    ])

    if (userResult.error) {
      console.error('Error updating user membership:', userResult.error)
      return { success: false, error: userResult.error }
    }

    // Allocate initial credits
    const creditResult = await allocateCreditsForSubscription(userId, membershipPlanId, startDate, endDate)

    if (creditResult.error) {
      console.error('Error allocating credits:', creditResult.error)
      // Don't fail the webhook if credit allocation fails
    }

    // Send welcome email
    try {
      await sendMembershipWelcomeEmail(userId)
    } catch (err) {
      console.error('Error sending welcome email:', err)
    }

    console.log('Successfully created subscription for user:', userId)
    return { success: true, error: null }
  } catch (err) {
    console.error('Error handling customer.subscription.created:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to handle subscription creation',
    }
  }
}

/**
 * Handle customer.subscription.updated event
 * Called when a subscription is updated or renewed
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Processing customer.subscription.updated:', subscription.id)

    const userId = subscription.metadata.user_id

    if (!userId) {
      console.warn('Missing user_id in subscription metadata')
      return { success: false, error: 'Missing user_id in metadata' }
    }

    // Determine subscription status
    let membershipStatus: 'active' | 'paused' | 'cancelled' = 'active'
    if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
      membershipStatus = 'cancelled'
    } else if (subscription.status === 'paused') {
      membershipStatus = 'paused'
    }

    // Update user's membership information
    const updateUserQuery = `
      UPDATE users
      SET
        membership_status = $1,
        membership_end_date = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `

    const endDate = new Date(subscription.current_period_end * 1000).toISOString()

    const userResult = await executeQuerySingle<User>(updateUserQuery, [
      membershipStatus,
      endDate,
      userId,
    ])

    if (userResult.error) {
      console.error('Error updating user membership:', userResult.error)
      return { success: false, error: userResult.error }
    }

    // Check if this is a renewal (new billing period)
    const user = userResult.data
    if (user && subscription.status === 'active') {
      const currentPeriodStart = new Date(subscription.current_period_start * 1000)
      const now = new Date()
      const timeDiff = Math.abs(now.getTime() - currentPeriodStart.getTime())
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      // If current_period_start is within the last hour, this is a renewal
      if (hoursDiff < 1 && user.membership_plan_id) {
        console.log('Detected subscription renewal, allocating credits')
        const startDate = currentPeriodStart.toISOString()
        const endDate = new Date(subscription.current_period_end * 1000).toISOString()

        await allocateCreditsForSubscription(userId, user.membership_plan_id, startDate, endDate)
      }
    }

    console.log('Successfully updated subscription for user:', userId)
    return { success: true, error: null }
  } catch (err) {
    console.error('Error handling customer.subscription.updated:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to handle subscription update',
    }
  }
}

/**
 * Handle customer.subscription.deleted event
 * Called when a subscription is deleted/cancelled
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Processing customer.subscription.deleted:', subscription.id)

    const userId = subscription.metadata.user_id

    if (!userId) {
      console.warn('Missing user_id in subscription metadata')
      return { success: false, error: 'Missing user_id in metadata' }
    }

    // Update user's membership status to cancelled
    const updateUserQuery = `
      UPDATE users
      SET
        membership_status = 'cancelled',
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `

    const userResult = await executeQuerySingle<User>(updateUserQuery, [userId])

    if (userResult.error) {
      console.error('Error updating user membership:', userResult.error)
      return { success: false, error: userResult.error }
    }

    // Expire any active credits
    const expireCreditsQuery = `
      UPDATE membership_credits
      SET status = 'expired', updated_at = NOW()
      WHERE user_id = $1 AND status = 'active'
    `

    await executeQuery(expireCreditsQuery, [userId])

    // Send cancellation confirmation email
    try {
      await sendMembershipCancellationEmail(userId)
    } catch (err) {
      console.error('Error sending cancellation email:', err)
    }

    console.log('Successfully cancelled subscription for user:', userId)
    return { success: true, error: null }
  } catch (err) {
    console.error('Error handling customer.subscription.deleted:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to handle subscription deletion',
    }
  }
}

/**
 * Allocate credits for a new subscription or renewal
 */
async function allocateCreditsForSubscription(
  userId: string,
  membershipPlanId: string,
  cycleStart: string,
  cycleEnd: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Get membership plan details
    const planQuery = 'SELECT * FROM membership_plans WHERE id = $1'
    const planResult = await executeQuerySingle<{
      meeting_room_credits_hours: number
      printing_credits: number
      guest_passes_per_month: number
    }>(planQuery, [membershipPlanId])

    if (planResult.error || !planResult.data) {
      return { success: false, error: 'Membership plan not found' }
    }

    const plan = planResult.data

    // Allocate meeting room credits
    if (plan.meeting_room_credits_hours > 0) {
      const meetingRoomQuery = `
        INSERT INTO membership_credits (
          user_id, credit_type, allocated_amount, used_amount, remaining_amount,
          billing_cycle_start, billing_cycle_end, status
        ) VALUES ($1, 'meeting-room', $2, 0, $2, $3, $4, 'active')
        ON CONFLICT (user_id, credit_type, billing_cycle_start)
        DO UPDATE SET allocated_amount = $2, remaining_amount = $2, status = 'active'
      `
      await executeQuery(meetingRoomQuery, [
        userId,
        plan.meeting_room_credits_hours,
        cycleStart,
        cycleEnd,
      ])
    }

    // Allocate printing credits
    if (plan.printing_credits > 0) {
      const printingQuery = `
        INSERT INTO membership_credits (
          user_id, credit_type, allocated_amount, used_amount, remaining_amount,
          billing_cycle_start, billing_cycle_end, status
        ) VALUES ($1, 'printing', $2, 0, $2, $3, $4, 'active')
        ON CONFLICT (user_id, credit_type, billing_cycle_start)
        DO UPDATE SET allocated_amount = $2, remaining_amount = $2, status = 'active'
      `
      await executeQuery(printingQuery, [userId, plan.printing_credits, cycleStart, cycleEnd])
    }

    // Allocate guest passes
    if (plan.guest_passes_per_month > 0) {
      const guestPassQuery = `
        INSERT INTO membership_credits (
          user_id, credit_type, allocated_amount, used_amount, remaining_amount,
          billing_cycle_start, billing_cycle_end, status
        ) VALUES ($1, 'guest-pass', $2, 0, $2, $3, $4, 'active')
        ON CONFLICT (user_id, credit_type, billing_cycle_start)
        DO UPDATE SET allocated_amount = $2, remaining_amount = $2, status = 'active'
      `
      await executeQuery(guestPassQuery, [
        userId,
        plan.guest_passes_per_month,
        cycleStart,
        cycleEnd,
      ])
    }

    console.log('Successfully allocated credits for user:', userId)
    return { success: true, error: null }
  } catch (err) {
    console.error('Error allocating credits:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to allocate credits',
    }
  }
}

/**
 * Email helper functions (to be implemented with actual email service)
 */
async function sendBookingConfirmationEmail(bookingId: string, userId: string): Promise<void> {
  // TODO: Implement with actual email service
  console.log('Sending booking confirmation email for booking:', bookingId)
}

async function sendPaymentFailureEmail(bookingId: string, userId: string): Promise<void> {
  // TODO: Implement with actual email service
  console.log('Sending payment failure email for booking:', bookingId)
}

async function sendMembershipWelcomeEmail(userId: string): Promise<void> {
  // TODO: Implement with actual email service
  console.log('Sending membership welcome email to user:', userId)
}

async function sendMembershipCancellationEmail(userId: string): Promise<void> {
  // TODO: Implement with actual email service
  console.log('Sending membership cancellation email to user:', userId)
}