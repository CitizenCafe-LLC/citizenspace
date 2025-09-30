/**
 * Order Ready Email Template
 * Sent when a cafe order is ready for pickup
 */

import { generateEmailHTML, generateEmailText } from './base'

export interface OrderReadyData {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate: string
  items: Array<{
    name: string
    quantity: number
    customizations?: string
  }>
  pickupLocation: string
  pickupInstructions?: string
  estimatedWaitTime?: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Generate order ready email HTML
 */
export function generateOrderReadyHTML(data: OrderReadyData): string {
  const content = `
    <h2>Your Order is Ready! ☕</h2>

    <p>Hi ${data.customerName},</p>

    <p>Great news! Your cafe order is ready for pickup.</p>

    <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center;">
      <h3 style="margin: 0; color: #333; font-size: 24px;">Order #${data.orderNumber}</h3>
      <p style="margin: 10px 0 0 0; color: #4caf50; font-size: 18px; font-weight: 600;">Ready for Pickup!</p>
    </div>

    <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <h4 style="margin-top: 0; color: #333;">Pickup Location</h4>
      <p style="margin: 5px 0; color: #666; font-size: 16px; font-weight: 600;">
        📍 ${data.pickupLocation}
      </p>
      ${
        data.pickupInstructions
          ? `
      <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
        ${data.pickupInstructions}
      </p>
      `
          : ''
      }
    </div>

    <div style="margin: 20px 0;">
      <h4 style="color: #333; margin-bottom: 15px;">Your Order</h4>
      <div style="background-color: #f9f9f9; border-radius: 8px; padding: 15px;">
        ${data.items
          .map(
            (item, index) => `
          <div style="padding: 12px 0; ${index !== data.items.length - 1 ? 'border-bottom: 1px solid #e0e0e0;' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="flex: 1;">
                <strong style="color: #333; font-size: 16px;">${item.name}</strong>
                ${
                  item.customizations
                    ? `
                <div style="color: #666; font-size: 14px; margin-top: 4px; font-style: italic;">
                  ${item.customizations}
                </div>
                `
                    : ''
                }
              </div>
              <div style="color: #667eea; font-weight: 700; font-size: 16px; margin-left: 15px;">
                x${item.quantity}
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>

    ${
      data.estimatedWaitTime
        ? `
    <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #666;">
        <strong>⏱️ Estimated wait time:</strong> ${data.estimatedWaitTime}
      </p>
    </div>
    `
        : ''
    }

    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f0f0f0; border-radius: 8px;">
      <p style="margin: 0; color: #333; font-size: 18px; font-weight: 600;">
        Please pick up your order within 15 minutes
      </p>
      <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
        to ensure optimal freshness and temperature
      </p>
    </div>

    <p style="color: #666;">
      Show this email or your order number at the pickup counter. Our team is ready to serve you!
    </p>

    <p style="color: #666; font-size: 14px;">
      Questions or concerns? Don't hesitate to ask our cafe staff.
    </p>
  `

  return generateEmailHTML({
    title: 'Order Ready',
    content,
    ctaText: 'View Order Details',
    ctaUrl: `${APP_URL}/orders/${data.orderNumber}`,
    footerText: 'Enjoy your order! Thank you for supporting our cafe.',
  })
}

/**
 * Generate order ready email plain text
 */
export function generateOrderReadyText(data: OrderReadyData): string {
  let text = `
Your Order is Ready!

Hi ${data.customerName},

Great news! Your cafe order is ready for pickup.

ORDER #${data.orderNumber}
Status: Ready for Pickup!

PICKUP LOCATION
---------------
${data.pickupLocation}
${data.pickupInstructions ? `\n${data.pickupInstructions}` : ''}

YOUR ORDER
----------
`

  data.items.forEach((item) => {
    text += `${item.name} x${item.quantity}\n`
    if (item.customizations) {
      text += `  ${item.customizations}\n`
    }
  })

  if (data.estimatedWaitTime) {
    text += `\nEstimated wait time: ${data.estimatedWaitTime}\n`
  }

  text += `
IMPORTANT: Please pick up your order within 15 minutes to ensure optimal freshness and temperature.

Show this email or your order number at the pickup counter. Our team is ready to serve you!

View Order Details: ${APP_URL}/orders/${data.orderNumber}

Questions or concerns? Don't hesitate to ask our cafe staff.
`

  return generateEmailText({
    title: 'Order Ready',
    content: text,
    footerText: 'Enjoy your order! Thank you for supporting our cafe.',
  })
}