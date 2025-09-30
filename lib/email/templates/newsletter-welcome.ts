/**
 * Newsletter Welcome Email Template
 * Sent to new newsletter subscribers
 */

import { generateEmailHTML, generateEmailText } from './base'

export interface NewsletterWelcomeData {
  email: string
  subscribedAt: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Generate unsubscribe URL (using email as token for simplicity)
 * In production, you'd want to use a secure token
 */
function generateUnsubscribeUrl(email: string): string {
  const encodedEmail = encodeURIComponent(email)
  return `${APP_URL}/newsletter/unsubscribe?email=${encodedEmail}`
}

/**
 * Generate HTML email for newsletter welcome
 */
export function generateNewsletterWelcomeHTML(data: NewsletterWelcomeData): string {
  const unsubscribeUrl = generateUnsubscribeUrl(data.email)
  const preferencesUrl = `${APP_URL}/newsletter/preferences?email=${encodeURIComponent(data.email)}`

  const content = `
    <h2 style="color: #667eea; margin-top: 0;">Welcome to the CitizenSpace Newsletter!</h2>

    <p style="font-size: 16px; color: #555; line-height: 1.6;">
      Thank you for subscribing to our newsletter! We're excited to have you join our community
      of innovators, entrepreneurs, and creative professionals.
    </p>

    <div style="background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%); padding: 25px; margin: 30px 0; border-radius: 8px; border: 1px solid #667eea44;">
      <h3 style="margin-top: 0; color: #667eea; font-size: 18px;">What to Expect</h3>
      <ul style="color: #555; line-height: 2; margin: 0; padding-left: 20px;">
        <li><strong>Weekly Updates:</strong> Stay informed about new workspace amenities and features</li>
        <li><strong>Event Announcements:</strong> Be the first to know about workshops, networking events, and speaker series</li>
        <li><strong>Exclusive Offers:</strong> Access special promotions and member-only discounts</li>
        <li><strong>Community Highlights:</strong> Stories from our members and the projects they're building</li>
        <li><strong>Coworking Tips:</strong> Best practices for productivity and work-life balance</li>
      </ul>
    </div>

    <div style="background: #f8f9fa; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
      <h3 style="margin-top: 0; color: #333; font-size: 18px;">Haven't Visited Us Yet?</h3>
      <p style="color: #555; margin: 15px 0;">
        Experience the CitizenSpace difference! Book a tour or reserve a day pass to see
        why we're the top-rated coworking space in the city.
      </p>
      <a href="${APP_URL}/book"
         style="display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin-top: 10px;">
        Book a Visit
      </a>
    </div>

    <div style="background: #e8f4f8; padding: 20px; margin: 30px 0; border-radius: 8px; border-left: 4px solid #17a2b8;">
      <h4 style="margin-top: 0; color: #0c5460; font-size: 16px;">Stay Connected</h4>
      <p style="color: #0c5460; margin: 10px 0; line-height: 1.6;">
        Follow us on social media for daily inspiration, member spotlights, and real-time updates:
      </p>
      <div style="margin-top: 15px;">
        <a href="https://twitter.com/citizenspace" style="color: #667eea; text-decoration: none; margin-right: 15px;">Twitter</a>
        <a href="https://instagram.com/citizenspace" style="color: #667eea; text-decoration: none; margin-right: 15px;">Instagram</a>
        <a href="https://linkedin.com/company/citizenspace" style="color: #667eea; text-decoration: none; margin-right: 15px;">LinkedIn</a>
        <a href="https://facebook.com/citizenspace" style="color: #667eea; text-decoration: none;">Facebook</a>
      </div>
    </div>

    <p style="color: #555; font-size: 16px; line-height: 1.6; margin-top: 30px;">
      Have questions or feedback? We'd love to hear from you! Reply to this email
      or visit our <a href="${APP_URL}/contact" style="color: #667eea; text-decoration: none;">contact page</a>.
    </p>

    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      Welcome aboard!<br>
      <strong style="color: #667eea;">The CitizenSpace Team</strong>
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #999; font-size: 12px; text-align: center;">
      You're receiving this email because you subscribed to our newsletter on ${data.subscribedAt}.<br>
      <a href="${preferencesUrl}" style="color: #667eea; text-decoration: none;">Manage Preferences</a> |
      <a href="${unsubscribeUrl}" style="color: #999; text-decoration: none;">Unsubscribe</a>
    </p>
  `

  return generateEmailHTML({
    title: 'Welcome to CitizenSpace Newsletter',
    content,
    ctaText: 'Explore CitizenSpace',
    ctaUrl: APP_URL,
  })
}

/**
 * Generate plain text email for newsletter welcome
 */
export function generateNewsletterWelcomeText(data: NewsletterWelcomeData): string {
  const unsubscribeUrl = generateUnsubscribeUrl(data.email)
  const preferencesUrl = `${APP_URL}/newsletter/preferences?email=${encodeURIComponent(data.email)}`

  const content = `
Welcome to the CitizenSpace Newsletter!

Thank you for subscribing to our newsletter! We're excited to have you join our community
of innovators, entrepreneurs, and creative professionals.

WHAT TO EXPECT
--------------
• Weekly Updates: Stay informed about new workspace amenities and features
• Event Announcements: Be the first to know about workshops, networking events, and speaker series
• Exclusive Offers: Access special promotions and member-only discounts
• Community Highlights: Stories from our members and the projects they're building
• Coworking Tips: Best practices for productivity and work-life balance

HAVEN'T VISITED US YET?
Experience the CitizenSpace difference! Book a tour or reserve a day pass to see
why we're the top-rated coworking space in the city.

Book a visit: ${APP_URL}/book

STAY CONNECTED
Follow us on social media for daily inspiration, member spotlights, and real-time updates:
• Twitter: https://twitter.com/citizenspace
• Instagram: https://instagram.com/citizenspace
• LinkedIn: https://linkedin.com/company/citizenspace
• Facebook: https://facebook.com/citizenspace

Have questions or feedback? We'd love to hear from you! Reply to this email
or visit our contact page: ${APP_URL}/contact

Welcome aboard!
The CitizenSpace Team

---
You're receiving this email because you subscribed to our newsletter on ${data.subscribedAt}.
Manage Preferences: ${preferencesUrl}
Unsubscribe: ${unsubscribeUrl}
  `.trim()

  return generateEmailText({
    title: 'Welcome to CitizenSpace Newsletter',
    content,
    ctaText: 'Explore CitizenSpace',
    ctaUrl: APP_URL,
  })
}

/**
 * Get email subject for newsletter welcome
 */
export function getNewsletterWelcomeSubject(): string {
  return 'Welcome to CitizenSpace Newsletter'
}