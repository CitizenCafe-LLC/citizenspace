/**
 * Contact Form Notification Email Template
 * Sent to admin when a contact form is submitted
 */

import { generateEmailHTML, generateEmailText } from './base'

export interface ContactNotificationData {
  submissionId: string
  name: string
  email: string
  topic: 'general' | 'booking' | 'partnership' | 'press'
  message: string
  submittedAt: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@citizenspace.com'

/**
 * Get topic label for display
 */
function getTopicLabel(topic: string): string {
  const labels: Record<string, string> = {
    general: 'General Inquiry',
    booking: 'Booking Question',
    partnership: 'Partnership Opportunity',
    press: 'Press Inquiry',
  }
  return labels[topic] || topic
}

/**
 * Generate HTML email for contact form notification
 */
export function generateContactNotificationHTML(data: ContactNotificationData): string {
  const topicLabel = getTopicLabel(data.topic)
  const dashboardUrl = `${APP_URL}/admin/contact/${data.submissionId}`

  const content = `
    <h2 style="color: #667eea; margin-top: 0;">New Contact Form Submission</h2>

    <p style="font-size: 16px; color: #555;">
      You have received a new contact form submission from your website.
    </p>

    <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #333; font-size: 18px;">Submission Details</h3>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: bold; width: 120px;">Name:</td>
          <td style="padding: 8px 0; color: #333;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td>
          <td style="padding: 8px 0; color: #333;">
            <a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">
              ${data.email}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: bold;">Topic:</td>
          <td style="padding: 8px 0; color: #333;">
            <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px;">
              ${topicLabel}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0; color: #333;">${data.submittedAt}</td>
        </tr>
      </table>
    </div>

    <div style="background: #ffffff; border: 1px solid #e0e0e0; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <h4 style="margin-top: 0; color: #333;">Message:</h4>
      <p style="color: #555; line-height: 1.6; white-space: pre-wrap; margin: 0;">
        ${data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </p>
    </div>

    <div style="margin: 30px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>Action Required:</strong> Please respond to this inquiry within 24 hours to maintain excellent customer service.
      </p>
    </div>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      You can reply directly to this email or manage this submission in your admin dashboard.
    </p>
  `

  return generateEmailHTML({
    title: `New Contact: ${topicLabel}`,
    content,
    ctaText: 'View in Dashboard',
    ctaUrl: dashboardUrl,
    footerText: 'This is an automated notification from your CitizenSpace contact form.',
  })
}

/**
 * Generate plain text email for contact form notification
 */
export function generateContactNotificationText(data: ContactNotificationData): string {
  const topicLabel = getTopicLabel(data.topic)
  const dashboardUrl = `${APP_URL}/admin/contact/${data.submissionId}`

  const content = `
New Contact Form Submission

You have received a new contact form submission from your website.

SUBMISSION DETAILS
------------------
Name: ${data.name}
Email: ${data.email}
Topic: ${topicLabel}
Date: ${data.submittedAt}

MESSAGE
-------
${data.message}

ACTION REQUIRED
Please respond to this inquiry within 24 hours to maintain excellent customer service.

You can reply directly to this email or manage this submission in your admin dashboard:
${dashboardUrl}

This is an automated notification from your CitizenSpace contact form.
  `.trim()

  return generateEmailText({
    title: `New Contact: ${topicLabel}`,
    content,
    ctaText: 'View in Dashboard',
    ctaUrl: dashboardUrl,
    footerText: 'This is an automated notification from your CitizenSpace contact form.',
  })
}

/**
 * Get email subject for contact notification
 */
export function getContactNotificationSubject(data: ContactNotificationData): string {
  const topicLabel = getTopicLabel(data.topic)
  return `New Contact Form Submission - ${topicLabel}`
}

/**
 * Get admin email address for contact notifications
 */
export function getAdminEmail(): string {
  return ADMIN_EMAIL
}