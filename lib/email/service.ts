/**
 * Email Service
 * Handles sending transactional emails using Nodemailer or Resend
 * Supports multiple email providers with fallback to Nodemailer SMTP
 */

import type { Transporter } from 'nodemailer'
import nodemailer from 'nodemailer'

// Import email templates
import {
  generateBookingConfirmationHTML,
  generateBookingConfirmationText,
  generatePaymentReceiptHTML,
  generatePaymentReceiptText,
  generateCreditAllocationHTML,
  generateCreditAllocationText,
  generateOrderReadyHTML,
  generateOrderReadyText,
} from './templates'

import type {
  BookingConfirmationData,
  PaymentReceiptData,
  CreditAllocationData,
  OrderReadyData,
} from './templates'

// Email configuration from environment variables
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp' // 'smtp', 'resend', 'sendgrid'
const RESEND_API_KEY = process.env.RESEND_API_KEY
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const EMAIL_HOST = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com'
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587')
const EMAIL_USER = process.env.EMAIL_USER || process.env.SMTP_USER
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@citizenspace.com'
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'CitizenSpace'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Create reusable transporter
let transporter: Transporter | null = null

/**
 * Initialize email transporter based on configured provider
 */
function getTransporter(): Transporter {
  if (!transporter) {
    // Check if email is configured
    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      console.warn(
        'Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.'
      )
      // Return mock transporter for development
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      })
    } else {
      transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_PORT === 465,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
      })
    }
  }
  return transporter
}

/**
 * Send email using Resend API
 */
async function sendWithResend(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured')
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
        to: [to],
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Resend email sending failed:', error)
    return false
  }
}

/**
 * Send email using SendGrid API
 */
async function sendWithSendGrid(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured')
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
        subject,
        content: [
          { type: 'text/plain', value: text || '' },
          { type: 'text/html', value: html },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('SendGrid API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('SendGrid email sending failed:', error)
    return false
  }
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email using the configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Use configured email provider
    switch (EMAIL_PROVIDER.toLowerCase()) {
      case 'resend':
        return await sendWithResend(options.to, options.subject, options.html, options.text)

      case 'sendgrid':
        return await sendWithSendGrid(options.to, options.subject, options.html, options.text)

      case 'smtp':
      default:
        const transporter = getTransporter()
        await transporter.sendMail({
          from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || '',
        })
        return true
    }
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - CitizenSpace</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">CitizenSpace</h1>
        </div>

        <div style="background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #667eea; margin-top: 0;">Reset Your Password</h2>

          <p>You requested to reset your password for your CitizenSpace account.</p>

          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 14px 30px;
                      text-decoration: none;
                      border-radius: 6px;
                      display: inline-block;
                      font-weight: bold;
                      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
              Reset Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; word-break: break-all; font-size: 14px;">
            ${resetUrl}
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; margin: 0;">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will not be changed.
          </p>

          <p style="color: #999; font-size: 12px; margin-top: 10px;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CitizenSpace. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  const text = `
Reset Your Password - CitizenSpace

You requested to reset your password for your CitizenSpace account.

Click the link below to reset your password. This link will expire in 1 hour.

${resetUrl}

If you didn't request a password reset, you can safely ignore this email.

© ${new Date().getFullYear()} CitizenSpace. All rights reserved.
  `

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - CitizenSpace',
    html,
    text,
  })
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CitizenSpace</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CitizenSpace!</h1>
        </div>

        <div style="background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #667eea; margin-top: 0;">Hi ${name}!</h2>

          <p>Thank you for joining CitizenSpace, where innovation meets community.</p>

          <p>Your account has been successfully created. You can now:</p>

          <ul style="color: #666; line-height: 2;">
            <li>Book hot desks and meeting rooms</li>
            <li>Order from our cafe</li>
            <li>Attend events and workshops</li>
            <li>Connect with our community</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/dashboard"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 14px 30px;
                      text-decoration: none;
                      border-radius: 6px;
                      display: inline-block;
                      font-weight: bold;
                      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
              Get Started
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CitizenSpace. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  const text = `
Welcome to CitizenSpace!

Hi ${name}!

Thank you for joining CitizenSpace, where innovation meets community.

Your account has been successfully created. You can now:
- Book hot desks and meeting rooms
- Order from our cafe
- Attend events and workshops
- Connect with our community

Visit ${APP_URL}/dashboard to get started!

© ${new Date().getFullYear()} CitizenSpace. All rights reserved.
  `

  return sendEmail({
    to: email,
    subject: 'Welcome to CitizenSpace!',
    html,
    text,
  })
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  data: BookingConfirmationData
): Promise<boolean> {
  const html = generateBookingConfirmationHTML(data)
  const text = generateBookingConfirmationText(data)

  return sendEmail({
    to: data.customerEmail,
    subject: `Booking Confirmed - ${data.confirmationCode}`,
    html,
    text,
  })
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(data: PaymentReceiptData): Promise<boolean> {
  const html = generatePaymentReceiptHTML(data)
  const text = generatePaymentReceiptText(data)

  return sendEmail({
    to: data.customerEmail,
    subject: `Payment Receipt - ${data.receiptNumber}`,
    html,
    text,
  })
}

/**
 * Send credit allocation email
 */
export async function sendCreditAllocationEmail(
  data: CreditAllocationData
): Promise<boolean> {
  const html = generateCreditAllocationHTML(data)
  const text = generateCreditAllocationText(data)

  return sendEmail({
    to: data.customerEmail,
    subject: `${data.creditsAllocated} Credits Added to Your Account`,
    html,
    text,
  })
}

/**
 * Send order ready email
 */
export async function sendOrderReadyEmail(data: OrderReadyData): Promise<boolean> {
  const html = generateOrderReadyHTML(data)
  const text = generateOrderReadyText(data)

  return sendEmail({
    to: data.customerEmail,
    subject: `Order Ready for Pickup - #${data.orderNumber}`,
    html,
    text,
  })
}

/**
 * Verify email service is configured
 */
export function isEmailConfigured(): boolean {
  // Check if any email provider is configured
  if (EMAIL_PROVIDER === 'resend') {
    return !!RESEND_API_KEY
  }
  if (EMAIL_PROVIDER === 'sendgrid') {
    return !!SENDGRID_API_KEY
  }
  // Default SMTP check
  return !!(EMAIL_USER && EMAIL_PASSWORD)
}

/**
 * Get current email provider
 */
export function getEmailProvider(): string {
  return EMAIL_PROVIDER
}
