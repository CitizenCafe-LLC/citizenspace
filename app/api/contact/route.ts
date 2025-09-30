/**
 * Contact Form API Endpoint
 * POST /api/contact - Submit contact form
 */

import { NextRequest } from 'next/server'
import { createdResponse, badRequestResponse, serverErrorResponse } from '@/lib/api/response'
import { applyRateLimit, contactFormRateLimit, addRateLimitHeaders } from '@/lib/middleware/rate-limit'
import {
  validateContactSubmission,
  formatValidationErrors,
  type ContactSubmissionInput,
} from '@/lib/api/validation/contact.validation'
import { createContactSubmission } from '@/lib/db/repositories/contact.repository'
import { sendEmail } from '@/lib/email/service'
import {
  generateContactNotificationHTML,
  generateContactNotificationText,
  getContactNotificationSubject,
  getAdminEmail,
} from '@/lib/email/templates'

/**
 * POST /api/contact
 * Submit a contact form
 * Public endpoint with rate limiting
 */
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, contactFormRateLimit)
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
    const validation = validateContactSubmission(body)
    if (!validation.success) {
      const errorMessage = formatValidationErrors(validation.error)
      return badRequestResponse(errorMessage)
    }

    const data: ContactSubmissionInput = validation.data

    // Create contact submission in database
    const { data: submission, error: dbError } = await createContactSubmission({
      name: data.name,
      email: data.email,
      topic: data.topic,
      message: data.message,
    })

    if (dbError || !submission) {
      console.error('Failed to create contact submission:', dbError)
      return serverErrorResponse('Failed to submit contact form. Please try again.')
    }

    // Send notification email to admin
    try {
      const adminEmail = getAdminEmail()
      const emailData = {
        submissionId: submission.id,
        name: submission.name,
        email: submission.email,
        topic: submission.topic,
        message: submission.message,
        submittedAt: new Date(submission.created_at).toLocaleString('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        }),
      }

      const emailSubject = getContactNotificationSubject(emailData)
      const emailHtml = generateContactNotificationHTML(emailData)
      const emailText = generateContactNotificationText(emailData)

      const emailSent = await sendEmail({
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      })

      if (!emailSent) {
        console.error('Failed to send admin notification email')
        // Don't fail the request if email fails - submission is still saved
      }
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError)
      // Continue - submission is saved even if email fails
    }

    // Create response with rate limit headers
    const response = createdResponse(
      {
        id: submission.id,
        message: 'Thank you for contacting us! We will get back to you soon.',
      },
      'Contact form submitted successfully'
    )

    return addRateLimitHeaders(response, req)
  } catch (error) {
    console.error('Error in POST /api/contact:', error)
    return serverErrorResponse('An unexpected error occurred. Please try again.')
  }
}

/**
 * GET /api/contact
 * Not allowed - contact form is POST only
 */
export async function GET() {
  return badRequestResponse('Method not allowed. Use POST to submit contact form.')
}