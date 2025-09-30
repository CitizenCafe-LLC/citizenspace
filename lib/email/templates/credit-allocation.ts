/**
 * Credit Allocation Email Template
 * Sent when monthly membership credits are allocated to a user's account
 */

import { generateEmailHTML, generateEmailText } from './base'

export interface CreditAllocationData {
  customerName: string
  customerEmail: string
  membershipTier: string
  creditsAllocated: number
  currentBalance: number
  allocationDate: string
  expirationDate?: string
  creditBreakdown?: Array<{
    type: string
    amount: number
    description: string
  }>
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Generate credit allocation email HTML
 */
export function generateCreditAllocationHTML(
  data: CreditAllocationData
): string {
  const content = `
    <h2>Your Credits Have Been Allocated! 💰</h2>

    <p>Hi ${data.customerName},</p>

    <p>Great news! Your monthly membership credits have been added to your account.</p>

    <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center;">
      <h3 style="margin-top: 0; color: #333;">New Credits Added</h3>
      <div style="font-size: 48px; font-weight: 700; color: #4caf50; margin: 15px 0;">
        +${data.creditsAllocated}
      </div>
      <p style="margin: 0; color: #666; font-size: 18px;">credits</p>
    </div>

    <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; color: #666; font-weight: 600;">Membership Tier:</td>
          <td style="padding: 12px 0; color: #333; font-weight: 700; text-align: right;">${data.membershipTier}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #666; font-weight: 600; border-top: 1px solid #ddd;">Credits Allocated:</td>
          <td style="padding: 12px 0; color: #4caf50; font-weight: 700; text-align: right; border-top: 1px solid #ddd;">+${data.creditsAllocated}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #666; font-weight: 600; border-top: 1px solid #ddd;">Current Balance:</td>
          <td style="padding: 12px 0; color: #333; font-weight: 700; font-size: 20px; text-align: right; border-top: 1px solid #ddd;">${data.currentBalance} credits</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #666; font-weight: 600; border-top: 1px solid #ddd;">Allocation Date:</td>
          <td style="padding: 12px 0; color: #333; text-align: right; border-top: 1px solid #ddd;">${data.allocationDate}</td>
        </tr>
        ${
          data.expirationDate
            ? `
        <tr>
          <td style="padding: 12px 0; color: #666; font-weight: 600; border-top: 1px solid #ddd;">Credits Expire:</td>
          <td style="padding: 12px 0; color: #ff9800; text-align: right; border-top: 1px solid #ddd;">${data.expirationDate}</td>
        </tr>
        `
            : ''
        }
      </table>
    </div>

    ${
      data.creditBreakdown && data.creditBreakdown.length > 0
        ? `
    <div style="margin: 20px 0;">
      <h4 style="color: #333; margin-bottom: 15px;">Credit Breakdown</h4>
      <div style="background-color: #f9f9f9; border-radius: 8px; padding: 15px;">
        ${data.creditBreakdown
          .map(
            (item) => `
          <div style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #333;">${item.type}</strong>
                <div style="color: #666; font-size: 14px; margin-top: 4px;">${item.description}</div>
              </div>
              <div style="color: #4caf50; font-weight: 700; font-size: 18px;">+${item.amount}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
    `
        : ''
    }

    <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h4 style="margin-top: 0; color: #333;">How to Use Your Credits</h4>
      <ul style="margin: 10px 0; padding-left: 20px; color: #666; line-height: 1.8;">
        <li>Book hot desks, meeting rooms, and private pods</li>
        <li>Apply credits automatically at checkout</li>
        <li>Credits are applied before any payment is charged</li>
        <li>Unused credits ${data.expirationDate ? `expire on ${data.expirationDate}` : 'roll over to the next month'}</li>
      </ul>
    </div>

    <p style="color: #666;">
      Ready to use your credits? Start booking your workspace now!
    </p>

    <p style="color: #666; font-size: 14px;">
      You can view your full credit history and balance in your account dashboard.
    </p>
  `

  return generateEmailHTML({
    title: 'Credits Allocated',
    content,
    ctaText: 'Book a Workspace',
    ctaUrl: `${APP_URL}/book`,
    footerText:
      'Questions about your credits? Contact support@citizenspace.com',
  })
}

/**
 * Generate credit allocation email plain text
 */
export function generateCreditAllocationText(
  data: CreditAllocationData
): string {
  let text = `
Your Credits Have Been Allocated!

Hi ${data.customerName},

Great news! Your monthly membership credits have been added to your account.

NEW CREDITS ADDED: +${data.creditsAllocated} credits

ACCOUNT SUMMARY
---------------
Membership Tier: ${data.membershipTier}
Credits Allocated: +${data.creditsAllocated}
Current Balance: ${data.currentBalance} credits
Allocation Date: ${data.allocationDate}
${data.expirationDate ? `Credits Expire: ${data.expirationDate}` : ''}
`

  if (data.creditBreakdown && data.creditBreakdown.length > 0) {
    text += `\nCREDIT BREAKDOWN\n----------------\n`
    data.creditBreakdown.forEach((item) => {
      text += `${item.type}: +${item.amount}\n  ${item.description}\n`
    })
  }

  text += `
HOW TO USE YOUR CREDITS
-----------------------
- Book hot desks, meeting rooms, and private pods
- Apply credits automatically at checkout
- Credits are applied before any payment is charged
- Unused credits ${data.expirationDate ? `expire on ${data.expirationDate}` : 'roll over to the next month'}

Ready to use your credits? Start booking your workspace now!
Book a Workspace: ${APP_URL}/book

You can view your full credit history and balance in your account dashboard.
View Dashboard: ${APP_URL}/account/credits
`

  return generateEmailText({
    title: 'Credits Allocated',
    content: text,
    footerText: 'Questions about your credits? Contact support@citizenspace.com',
  })
}