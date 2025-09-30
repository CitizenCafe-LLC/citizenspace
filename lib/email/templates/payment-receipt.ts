/**
 * Payment Receipt Email Template
 * Sent after successful payment with itemized transaction details
 */

import { generateEmailHTML, generateEmailText } from './base'

export interface PaymentReceiptData {
  customerName: string
  customerEmail: string
  receiptNumber: string
  transactionId: string
  paymentDate: string
  paymentMethod: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax?: number
  discount?: number
  discountCode?: string
  total: number
  billingAddress?: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    country: string
  }
  receiptUrl?: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Generate payment receipt email HTML
 */
export function generatePaymentReceiptHTML(data: PaymentReceiptData): string {
  const content = `
    <h2>Payment Receipt 💳</h2>

    <p>Hi ${data.customerName},</p>

    <p>Thank you for your payment! Here's your receipt for your records.</p>

    <div style="background-color: #f9f9f9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #333;">Receipt Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: 600;">Receipt Number:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 700;">${data.receiptNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: 600;">Transaction ID:</td>
          <td style="padding: 8px 0; color: #333; font-family: monospace; font-size: 12px;">${data.transactionId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: 600;">Date:</td>
          <td style="padding: 8px 0; color: #333;">${data.paymentDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: 600;">Payment Method:</td>
          <td style="padding: 8px 0; color: #333;">${data.paymentMethod}</td>
        </tr>
      </table>
    </div>

    <div style="margin: 30px 0;">
      <h3 style="color: #333; margin-bottom: 15px;">Itemized Charges</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
        <thead>
          <tr style="background-color: #667eea; color: white;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items
            .map(
              (item, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
              <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.description}</td>
              <td style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity}</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">$${item.unitPrice.toFixed(2)}</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd; font-weight: 600;">$${item.total.toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd; font-weight: 600;">Subtotal:</td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd; font-weight: 600;">$${data.subtotal.toFixed(2)}</td>
          </tr>
          ${
            data.discount
              ? `
          <tr>
            <td colspan="3" style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd; color: #4caf50;">
              Discount ${data.discountCode ? `(${data.discountCode})` : ''}:
            </td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd; color: #4caf50; font-weight: 600;">
              -$${data.discount.toFixed(2)}
            </td>
          </tr>
          `
              : ''
          }
          ${
            data.tax
              ? `
          <tr>
            <td colspan="3" style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Tax:</td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">$${data.tax.toFixed(2)}</td>
          </tr>
          `
              : ''
          }
          <tr style="background-color: #f0f0f0;">
            <td colspan="3" style="padding: 12px; text-align: right; font-weight: 700; font-size: 18px; color: #333;">Total Paid:</td>
            <td style="padding: 12px; text-align: right; font-weight: 700; font-size: 18px; color: #4caf50;">$${data.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${
      data.billingAddress
        ? `
    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h4 style="margin-top: 0; color: #333;">Billing Address</h4>
      <p style="margin: 5px 0; color: #666;">
        ${data.billingAddress.line1}<br>
        ${data.billingAddress.line2 ? `${data.billingAddress.line2}<br>` : ''}
        ${data.billingAddress.city}, ${data.billingAddress.state} ${data.billingAddress.zip}<br>
        ${data.billingAddress.country}
      </p>
    </div>
    `
        : ''
    }

    <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #666;">
        <strong>Payment Status:</strong> Your payment has been successfully processed and confirmed.
      </p>
    </div>

    <p style="color: #666;">
      This receipt serves as proof of payment. Please keep it for your records.
    </p>

    <p style="color: #666; font-size: 14px;">
      Questions about this charge? Contact our billing support team and reference your receipt number.
    </p>
  `

  return generateEmailHTML({
    title: 'Payment Receipt',
    content,
    ctaText: data.receiptUrl ? 'Download Receipt' : 'View Account',
    ctaUrl: data.receiptUrl || `${APP_URL}/account/billing`,
    footerText:
      'For billing inquiries, contact billing@citizenspace.com or call (555) 123-4567',
  })
}

/**
 * Generate payment receipt email plain text
 */
export function generatePaymentReceiptText(data: PaymentReceiptData): string {
  let text = `
Payment Receipt

Hi ${data.customerName},

Thank you for your payment! Here's your receipt for your records.

RECEIPT SUMMARY
---------------
Receipt Number: ${data.receiptNumber}
Transaction ID: ${data.transactionId}
Date: ${data.paymentDate}
Payment Method: ${data.paymentMethod}

ITEMIZED CHARGES
----------------
`

  data.items.forEach((item) => {
    text += `${item.description}\n`
    text += `  Qty: ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}\n`
  })

  text += `\nSubtotal: $${data.subtotal.toFixed(2)}\n`

  if (data.discount) {
    text += `Discount ${data.discountCode ? `(${data.discountCode})` : ''}: -$${data.discount.toFixed(2)}\n`
  }

  if (data.tax) {
    text += `Tax: $${data.tax.toFixed(2)}\n`
  }

  text += `\nTOTAL PAID: $${data.total.toFixed(2)}\n`

  if (data.billingAddress) {
    text += `\nBILLING ADDRESS\n---------------\n`
    text += `${data.billingAddress.line1}\n`
    if (data.billingAddress.line2) {
      text += `${data.billingAddress.line2}\n`
    }
    text += `${data.billingAddress.city}, ${data.billingAddress.state} ${data.billingAddress.zip}\n`
    text += `${data.billingAddress.country}\n`
  }

  text += `\nPayment Status: Your payment has been successfully processed and confirmed.

This receipt serves as proof of payment. Please keep it for your records.

${data.receiptUrl ? `Download Receipt: ${data.receiptUrl}` : `View Account: ${APP_URL}/account/billing`}

Questions about this charge? Contact our billing support team and reference your receipt number.
`

  return generateEmailText({
    title: 'Payment Receipt',
    content: text,
    footerText:
      'For billing inquiries, contact billing@citizenspace.com or call (555) 123-4567',
  })
}