/**
 * Newsletter Subscription API Endpoint
 * POST /api/newsletter/subscribe - Subscribe to newsletter
 */

import { NextRequest } from 'next/server'
import { createdResponse, successResponse, badRequestResponse, serverErrorResponse } from '@/lib/api/response'
import { applyRateLimit, newsletterRateLimit, addRateLimitHeaders } from '@/lib/middleware/rate-limit'
import {
  validateNewsletterSubscription,
  formatValidationErrors,
  type NewsletterSubscriptionInput,
} from '@/lib/api/validation/contact.validation'
import { createNewsletterSubscriber } from '@/lib/db/repositories/newsletter.repository'
import { sendEmail } from '@/lib/email/service'
import {
  generateNewsletterWelcomeHTML,
  generateNewsletterWelcomeText,
  getNewsletterWelcomeSubject,
} from '@/lib/email/templates'

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 * Public endpoint with rate limiting
 */
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, newsletterRateLimit)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Parse request body
    let body: unknown
    try {
      body = await req.json()
    } catch (error) {
      return badRequestResponse('Invalid JSON in request body')
    }

    // Validate request data
    const validation = validateNewsletterSubscription(body)
    if (!validation.success) {
      const errorMessage = formatValidationErrors(validation.error)
      return badRequestResponse(errorMessage)
    }

    const data: NewsletterSubscriptionInput = validation.data

    // Create newsletter subscription in database
    const {
      data: subscriber,
      error: dbError,
      already_subscribed,
    } = await createNewsletterSubscriber({
      email: data.email,
      preferences: data.preferences,
    })

    if (dbError || !subscriber) {
      console.error('Failed to create newsletter subscriber:', dbError)
      return serverErrorResponse('Failed to subscribe to newsletter. Please try again.')
    }

    // If already subscribed, return success message without sending welcome email
    if (already_subscribed) {
      const response = successResponse(
        {
          email: subscriber.email,
          message: 'You are already subscribed to our newsletter.',
        },
        'Already subscribed'
      )
      return addRateLimitHeaders(response, req)
    }

    // Send welcome email to new subscriber
    try {
      const emailData = {
        email: subscriber.email,
        subscribedAt: new Date(subscriber.subscribed_at).toLocaleString('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        }),
      }

      const emailSubject = getNewsletterWelcomeSubject()
      const emailHtml = generateNewsletterWelcomeHTML(emailData)
      const emailText = generateNewsletterWelcomeText(emailData)

      const emailSent = await sendEmail({
        to: subscriber.email,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      })

      if (!emailSent) {
        console.error('Failed to send welcome email to subscriber')
        // Don't fail the request if email fails - subscription is still saved
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Continue - subscription is saved even if email fails
    }

    // Create response with rate limit headers
    const response = createdResponse(
      {
        email: subscriber.email,
        message:
          'Thank you for subscribing! Check your inbox for a welcome email with more information.',
      },
      'Newsletter subscription successful'
    )

    return addRateLimitHeaders(response, req)
  } catch (error) {
    console.error('Error in POST /api/newsletter/subscribe:', error)
    return serverErrorResponse('An unexpected error occurred. Please try again.')
  }
}

/**
 * GET /api/newsletter/subscribe
 * Not allowed - subscription is POST only
 */
export async function GET() {
  return badRequestResponse('Method not allowed. Use POST to subscribe to newsletter.')
}