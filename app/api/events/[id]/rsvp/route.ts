/**
 * POST /api/events/:id/rsvp - RSVP to an event
 * Handles capacity tracking, waitlist, and payment for paid events
 */

import { NextRequest } from 'next/server'
import {
  successResponse,
  createdResponse,
  errorResponse,
  badRequestResponse,
  notFoundResponse,
  conflictResponse,
  serverErrorResponse,
} from '@/lib/api/response'
import {
  getEventById,
  checkEventCapacity,
  createRSVP,
  getUserEventRSVP,
} from '@/lib/db/repositories/events.repository'
import { requireAuth } from '@/middleware/auth'
import { createPaymentIntent, getOrCreateStripeCustomer } from '@/lib/stripe/utils'
import { dollarsToCents } from '@/lib/stripe/config'

interface RSVPRequestBody {
  guest_name?: string
  guest_email?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params

    if (!eventId) {
      return badRequestResponse('Event ID is required')
    }

    // Require authentication
    const auth = await requireAuth(request)
    if (!auth.authorized || !auth.user) {
      return auth.response
    }

    const userId = auth.user.userId
    const userEmail = auth.user.email
    const userName = auth.user.full_name || auth.user.email

    // Parse request body
    let body: RSVPRequestBody = {}
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (err) {
      return badRequestResponse('Invalid JSON in request body')
    }

    // Check if event exists
    const eventResult = await getEventById(eventId)

    if (eventResult.error) {
      console.error('Error fetching event:', eventResult.error)
      return serverErrorResponse('Failed to fetch event')
    }

    if (!eventResult.data) {
      return notFoundResponse('Event not found')
    }

    const event = eventResult.data

    // Check if user already has an RSVP
    const existingRSVPResult = await getUserEventRSVP(userId, eventId)

    if (existingRSVPResult.error) {
      console.error('Error checking existing RSVP:', existingRSVPResult.error)
      return serverErrorResponse('Failed to check existing RSVP')
    }

    if (existingRSVPResult.data) {
      const status = existingRSVPResult.data.status
      if (status === 'confirmed' || status === 'waitlist') {
        return conflictResponse('You have already RSVPed to this event')
      }
    }

    // Check event capacity
    const capacityCheck = await checkEventCapacity(eventId)

    if (capacityCheck.error) {
      console.error('Error checking capacity:', capacityCheck.error)
      return serverErrorResponse('Failed to check event capacity')
    }

    // Determine RSVP status based on capacity
    let rsvpStatus: 'confirmed' | 'waitlist' = 'confirmed'
    let paymentIntentId: string | undefined
    let clientSecret: string | undefined

    if (!capacityCheck.hasCapacity) {
      // Event is at capacity - add to waitlist
      rsvpStatus = 'waitlist'
    }

    // Handle payment for paid events (only if confirmed, not waitlist)
    if (rsvpStatus === 'confirmed' && event.price > 0) {
      // Create or get Stripe customer
      const customerResult = await getOrCreateStripeCustomer(
        userId,
        userEmail,
        userName,
        auth.user.stripe_customer_id || null
      )

      if (customerResult.error || !customerResult.customer) {
        console.error('Error creating Stripe customer:', customerResult.error)
        return serverErrorResponse('Failed to create payment customer')
      }

      const customerId = customerResult.customer.id

      // Create payment intent
      const amountInCents = dollarsToCents(event.price)

      const paymentResult = await createPaymentIntent(amountInCents, customerId, {
        event_id: eventId,
        user_id: userId,
        event_title: event.title,
        event_slug: event.slug,
      })

      if (paymentResult.error || !paymentResult.paymentIntent) {
        console.error('Error creating payment intent:', paymentResult.error)
        return serverErrorResponse('Failed to create payment intent')
      }

      paymentIntentId = paymentResult.paymentIntent.id
      clientSecret = paymentResult.paymentIntent.client_secret || undefined

      // Create RSVP with pending payment status
      const rsvpResult = await createRSVP({
        event_id: eventId,
        user_id: userId,
        status: rsvpStatus,
        payment_status: 'pending',
        payment_intent_id: paymentIntentId,
        guest_name: body.guest_name,
        guest_email: body.guest_email,
      })

      if (rsvpResult.error) {
        console.error('Error creating RSVP:', rsvpResult.error)
        return serverErrorResponse('Failed to create RSVP')
      }

      return createdResponse(
        {
          rsvp: rsvpResult.data,
          event: {
            id: event.id,
            title: event.title,
            slug: event.slug,
            start_time: event.start_time,
            end_time: event.end_time,
            location: event.location,
            price: event.price,
          },
          payment: {
            required: true,
            amount: event.price,
            payment_intent_id: paymentIntentId,
            client_secret: clientSecret,
          },
          message: 'Payment required to confirm your RSVP',
        },
        'RSVP created successfully. Please complete payment.'
      )
    }

    // Free event or waitlist - create RSVP without payment
    const rsvpResult = await createRSVP({
      event_id: eventId,
      user_id: userId,
      status: rsvpStatus,
      payment_status: null,
      guest_name: body.guest_name,
      guest_email: body.guest_email,
    })

    if (rsvpResult.error) {
      console.error('Error creating RSVP:', rsvpResult.error)
      return serverErrorResponse('Failed to create RSVP')
    }

    const message =
      rsvpStatus === 'waitlist'
        ? 'Event is at capacity. You have been added to the waitlist.'
        : 'RSVP confirmed successfully!'

    return createdResponse(
      {
        rsvp: rsvpResult.data,
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location,
          price: event.price,
        },
        payment: {
          required: false,
        },
        message,
      },
      message
    )
  } catch (error) {
    console.error('Error in POST /api/events/:id/rsvp:', error)
    return serverErrorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    )
  }
}

/**
 * DELETE /api/events/:id/rsvp - Cancel RSVP to an event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params

    if (!eventId) {
      return badRequestResponse('Event ID is required')
    }

    // Require authentication
    const auth = await requireAuth(request)
    if (!auth.authorized || !auth.user) {
      return auth.response
    }

    const userId = auth.user.userId

    // Check if RSVP exists
    const existingRSVPResult = await getUserEventRSVP(userId, eventId)

    if (existingRSVPResult.error) {
      console.error('Error checking existing RSVP:', existingRSVPResult.error)
      return serverErrorResponse('Failed to check existing RSVP')
    }

    if (!existingRSVPResult.data) {
      return notFoundResponse('RSVP not found')
    }

    const rsvp = existingRSVPResult.data

    // Cancel the RSVP (import cancelRSVP)
    const { cancelRSVP } = await import('@/lib/db/repositories/events.repository')
    const cancelResult = await cancelRSVP(rsvp.id, userId)

    if (cancelResult.error) {
      console.error('Error canceling RSVP:', cancelResult.error)
      return serverErrorResponse('Failed to cancel RSVP')
    }

    // TODO: Handle refund for paid events if within refund window
    // This would require checking the event start time and payment status

    return successResponse(
      {
        rsvp: cancelResult.data,
        message: 'RSVP cancelled successfully',
      },
      'RSVP cancelled successfully'
    )
  } catch (error) {
    console.error('Error in DELETE /api/events/:id/rsvp:', error)
    return serverErrorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    )
  }
}