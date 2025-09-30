/**
 * Booking Confirmation Email Template
 * Sent when a user successfully books a workspace with QR code for check-in
 */

import { generateEmailHTML, generateEmailText } from './base'

export interface BookingConfirmationData {
  customerName: string
  customerEmail: string
  bookingId: string
  confirmationCode: string
  workspaceName: string
  workspaceType: 'desk' | 'room' | 'pod'
  date: string
  startTime: string
  endTime: string
  duration: string
  totalPrice: number
  amenities?: string[]
  specialRequests?: string
  qrCodeUrl?: string
  checkInInstructions?: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Generate booking confirmation email HTML
 */
export function generateBookingConfirmationHTML(
  data: BookingConfirmationData
): string {
  const content = `
    <h2>Booking Confirmed! 🎉</h2>

    <p>Hi ${data.customerName},</p>

    <p>Your workspace booking has been confirmed. We're excited to welcome you to CitizenSpace!</p>

    <div style="background-color: #f9f9f9; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #333;">Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: 600;">Confirmation Code:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 700; font-size: 18px;">${data.confirmationCode}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: 600;">Workspace:</td>
          <td style="padding: 8px 0; color: #333;">${data.workspaceName} (${data.workspaceType})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: 600;">Date:</td>
          <td style="padding: 8px 0; color: #333;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: 600;">Time:</td>
          <td style="padding: 8px 0; color: #333;">${data.startTime} - ${data.endTime} (${data.duration})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: 600;">Total:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 700;">$${data.totalPrice.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    ${
      data.amenities && data.amenities.length > 0
        ? `
    <div style="margin: 20px 0;">
      <h4 style="color: #333; margin-bottom: 10px;">Included Amenities:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #666;">
        ${data.amenities.map((amenity) => `<li style="margin: 5px 0;">${amenity}</li>`).join('')}
      </ul>
    </div>
    `
        : ''
    }

    ${
      data.specialRequests
        ? `
    <div style="background-color: #fff8e1; border-left: 4px solid #ffa726; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h4 style="margin-top: 0; color: #333;">Special Requests:</h4>
      <p style="margin: 0; color: #666;">${data.specialRequests}</p>
    </div>
    `
        : ''
    }

    ${
      data.qrCodeUrl
        ? `
    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h4 style="color: #333; margin-bottom: 15px;">Quick Check-In QR Code</h4>
      <img src="${data.qrCodeUrl}" alt="Check-in QR Code" style="width: 200px; height: 200px; border: 2px solid #667eea; border-radius: 8px;">
      <p style="color: #666; font-size: 14px; margin-top: 15px;">
        Show this QR code at reception for instant check-in
      </p>
    </div>
    `
        : ''
    }

    <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h4 style="margin-top: 0; color: #333;">Check-In Instructions:</h4>
      <p style="margin: 0; color: #666; line-height: 1.8;">
        ${
          data.checkInInstructions ||
          `
        1. Arrive 5-10 minutes before your booking start time<br>
        2. Check in at the reception desk with your confirmation code or QR code<br>
        3. You'll be directed to your reserved workspace<br>
        4. Connect to our high-speed WiFi (network: CitizenSpace-5G)
      `
        }
      </p>
    </div>

    <p style="color: #666;">
      Need to make changes to your booking? Contact our support team or manage your booking online.
    </p>

    <p style="color: #666;">
      We look forward to seeing you!
    </p>
  `

  return generateEmailHTML({
    title: 'Booking Confirmation',
    content,
    ctaText: 'View Booking Details',
    ctaUrl: `${APP_URL}/bookings/${data.bookingId}`,
    footerText:
      'Need help? Contact us at support@citizenspace.com or call (555) 123-4567',
  })
}

/**
 * Generate booking confirmation email plain text
 */
export function generateBookingConfirmationText(
  data: BookingConfirmationData
): string {
  let text = `
Booking Confirmed!

Hi ${data.customerName},

Your workspace booking has been confirmed. We're excited to welcome you to CitizenSpace!

BOOKING DETAILS
---------------
Confirmation Code: ${data.confirmationCode}
Workspace: ${data.workspaceName} (${data.workspaceType})
Date: ${data.date}
Time: ${data.startTime} - ${data.endTime} (${data.duration})
Total: $${data.totalPrice.toFixed(2)}
`

  if (data.amenities && data.amenities.length > 0) {
    text += `\nINCLUDED AMENITIES\n------------------\n`
    text += data.amenities.map((a) => `- ${a}`).join('\n')
    text += '\n'
  }

  if (data.specialRequests) {
    text += `\nSPECIAL REQUESTS\n----------------\n${data.specialRequests}\n`
  }

  if (data.qrCodeUrl) {
    text += `\nQR CODE FOR CHECK-IN\n--------------------\nView your QR code at: ${data.qrCodeUrl}\n`
  }

  text += `
CHECK-IN INSTRUCTIONS
---------------------
${
  data.checkInInstructions ||
  `1. Arrive 5-10 minutes before your booking start time
2. Check in at the reception desk with your confirmation code
3. You'll be directed to your reserved workspace
4. Connect to our high-speed WiFi (network: CitizenSpace-5G)`
}

View Booking Details: ${APP_URL}/bookings/${data.bookingId}

Need to make changes to your booking? Contact our support team or manage your booking online.

We look forward to seeing you!
`

  return generateEmailText({
    title: 'Booking Confirmation',
    content: text,
    footerText:
      'Need help? Contact us at support@citizenspace.com or call (555) 123-4567',
  })
}