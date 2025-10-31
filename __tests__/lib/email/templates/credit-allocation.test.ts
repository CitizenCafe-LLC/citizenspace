/**
 * Credit Allocation Email Template Tests
 */

import {
  generateCreditAllocationHTML,
  generateCreditAllocationText,
} from '@/lib/email/templates/credit-allocation'
import type { CreditAllocationData } from '@/lib/email/templates/credit-allocation'

describe('Credit Allocation Email Template', () => {
  const mockData: CreditAllocationData = {
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
    membershipTier: 'Premium',
    creditsAllocated: 50,
    currentBalance: 75,
    allocationDate: '2025-10-01',
    expirationDate: '2025-10-31',
  }

  describe('generateCreditAllocationHTML', () => {
    it('should generate valid HTML email', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('Credits Have Been Allocated')
    })

    it('should include customer name', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('Bob Johnson')
    })

    it('should display credits allocated prominently', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('+50')
      expect(html).toContain('credits')
      expect(html).toContain('New Credits Added')
    })

    it('should include membership tier', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('Premium')
      expect(html).toContain('Membership Tier')
    })

    it('should include current balance', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('75 credits')
      expect(html).toContain('Current Balance')
    })

    it('should include allocation date', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('2025-10-01')
      expect(html).toContain('Allocation Date')
    })

    it('should include expiration date when provided', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('2025-10-31')
      expect(html).toContain('Credits Expire')
    })

    it('should not show expiration when not provided', () => {
      const dataWithoutExpiration = {
        ...mockData,
        expirationDate: undefined,
      }

      const html = generateCreditAllocationHTML(dataWithoutExpiration)

      expect(html).not.toContain('Credits Expire')
    })

    it('should include credit breakdown when provided', () => {
      const dataWithBreakdown = {
        ...mockData,
        creditBreakdown: [
          { type: 'Base Membership', amount: 40, description: 'Monthly allocation' },
          { type: 'Bonus Credits', amount: 10, description: 'Referral bonus' },
        ],
      }

      const html = generateCreditAllocationHTML(dataWithBreakdown)

      expect(html).toContain('Credit Breakdown')
      expect(html).toContain('Base Membership')
      expect(html).toContain('Monthly allocation')
      expect(html).toContain('+40')
      expect(html).toContain('Bonus Credits')
      expect(html).toContain('Referral bonus')
      expect(html).toContain('+10')
    })

    it('should not show breakdown section when not provided', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).not.toContain('Credit Breakdown')
    })

    it('should include how to use credits section', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('How to Use Your Credits')
      expect(html).toContain('Book hot desks')
      expect(html).toContain('meeting rooms')
      expect(html).toContain('private pods')
      expect(html).toContain('automatically at checkout')
    })

    it('should include expiration info in usage section when date provided', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('expire on 2025-10-31')
    })

    it('should mention rollover when no expiration date', () => {
      const dataWithoutExpiration = {
        ...mockData,
        expirationDate: undefined,
      }

      const html = generateCreditAllocationHTML(dataWithoutExpiration)

      expect(html).toContain('roll over to the next month')
    })

    it('should include CTA to book workspace', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('Book a Workspace')
      expect(html).toContain('/book')
    })

    it('should include support contact', () => {
      const html = generateCreditAllocationHTML(mockData)

      expect(html).toContain('support@citizenspace.com')
    })

    it('should handle different membership tiers', () => {
      const premiumMember = { ...mockData, membershipTier: 'Enterprise' }

      const html = generateCreditAllocationHTML(premiumMember)

      expect(html).toContain('Enterprise')
    })

    it('should display large credit amounts correctly', () => {
      const largeAllocation = {
        ...mockData,
        creditsAllocated: 500,
        currentBalance: 1250,
      }

      const html = generateCreditAllocationHTML(largeAllocation)

      expect(html).toContain('+500')
      expect(html).toContain('1250 credits')
    })
  })

  describe('generateCreditAllocationText', () => {
    it('should generate plain text email', () => {
      const text = generateCreditAllocationText(mockData)

      expect(text).toContain('Your Credits Have Been Allocated')
      expect(text).toContain('Bob Johnson')
    })

    it('should include credits allocated', () => {
      const text = generateCreditAllocationText(mockData)

      expect(text).toContain('NEW CREDITS ADDED: +50 credits')
    })

    it('should include account summary', () => {
      const text = generateCreditAllocationText(mockData)

      expect(text).toContain('ACCOUNT SUMMARY')
      expect(text).toContain('Membership Tier: Premium')
      expect(text).toContain('Credits Allocated: +50')
      expect(text).toContain('Current Balance: 75 credits')
      expect(text).toContain('Allocation Date: 2025-10-01')
      expect(text).toContain('Credits Expire: 2025-10-31')
    })

    it('should include credit breakdown when provided', () => {
      const dataWithBreakdown = {
        ...mockData,
        creditBreakdown: [
          { type: 'Base Membership', amount: 40, description: 'Monthly allocation' },
          { type: 'Bonus Credits', amount: 10, description: 'Referral bonus' },
        ],
      }

      const text = generateCreditAllocationText(dataWithBreakdown)

      expect(text).toContain('CREDIT BREAKDOWN')
      expect(text).toContain('Base Membership: +40')
      expect(text).toContain('Monthly allocation')
      expect(text).toContain('Bonus Credits: +10')
      expect(text).toContain('Referral bonus')
    })

    it('should include how to use credits', () => {
      const text = generateCreditAllocationText(mockData)

      expect(text).toContain('HOW TO USE YOUR CREDITS')
      expect(text).toContain('Book hot desks, meeting rooms, and private pods')
      expect(text).toContain('Apply credits automatically at checkout')
    })

    it('should include expiration info', () => {
      const text = generateCreditAllocationText(mockData)

      expect(text).toContain('expire on 2025-10-31')
    })

    it('should mention rollover when no expiration', () => {
      const dataWithoutExpiration = {
        ...mockData,
        expirationDate: undefined,
      }

      const text = generateCreditAllocationText(dataWithoutExpiration)

      expect(text).toContain('roll over to the next month')
    })

    it('should include booking URL', () => {
      const text = generateCreditAllocationText(mockData)

      expect(text).toContain('Book a Workspace')
      expect(text).toContain('/book')
    })

    it('should include account dashboard URL', () => {
      const text = generateCreditAllocationText(mockData)

      expect(text).toContain('View Dashboard')
      expect(text).toContain('/account/credits')
    })

    it('should include support contact', () => {
      const text = generateCreditAllocationText(mockData)

      expect(text).toContain('support@citizenspace.com')
    })
  })
})