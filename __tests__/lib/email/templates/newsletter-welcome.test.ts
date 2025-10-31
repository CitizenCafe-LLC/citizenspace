/**
 * Newsletter Welcome Email Template Tests
 */

import {
  generateNewsletterWelcomeHTML,
  generateNewsletterWelcomeText,
  getNewsletterWelcomeSubject,
} from '@/lib/email/templates/newsletter-welcome'
import type { NewsletterWelcomeData } from '@/lib/email/templates/newsletter-welcome'

describe('Newsletter Welcome Email Template', () => {
  const mockData: NewsletterWelcomeData = {
    email: 'subscriber@example.com',
    subscribedAt: '2025-09-29',
  }

  describe('generateNewsletterWelcomeHTML', () => {
    it('should generate valid HTML email', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('Welcome to the CitizenSpace Newsletter')
    })

    it('should include welcome message', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('Thank you for subscribing')
      expect(html).toContain('excited to have you join our community')
    })

    it('should include what to expect section', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('What to Expect')
      expect(html).toContain('Weekly Updates')
      expect(html).toContain('Event Announcements')
      expect(html).toContain('Exclusive Offers')
      expect(html).toContain('Community Highlights')
      expect(html).toContain('Coworking Tips')
    })

    it('should include visit invitation section', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain("Haven't Visited Us Yet")
      expect(html).toContain('Book a tour or reserve a day pass')
      expect(html).toContain('top-rated coworking space')
    })

    it('should include book a visit CTA', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('Book a Visit')
      expect(html).toContain('/book')
    })

    it('should include social media links', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('Stay Connected')
      expect(html).toContain('twitter.com/citizenspace')
      expect(html).toContain('instagram.com/citizenspace')
      expect(html).toContain('linkedin.com/company/citizenspace')
      expect(html).toContain('facebook.com/citizenspace')
    })

    it('should include contact information', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('Have questions or feedback')
      expect(html).toContain('/contact')
    })

    it('should include team signature', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('Welcome aboard')
      expect(html).toContain('The CitizenSpace Team')
    })

    it('should include subscription date', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('2025-09-29')
    })

    it('should include unsubscribe link', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('Unsubscribe')
      expect(html).toContain('/newsletter/unsubscribe')
      expect(html).toContain(encodeURIComponent('subscriber@example.com'))
    })

    it('should include manage preferences link', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('Manage Preferences')
      expect(html).toContain('/newsletter/preferences')
    })

    it('should include main CTA to explore', () => {
      const html = generateNewsletterWelcomeHTML(mockData)

      expect(html).toContain('Explore CitizenSpace')
    })

    it('should properly encode email in URLs', () => {
      const dataWithSpecialChars: NewsletterWelcomeData = {
        email: 'test+tag@example.com',
        subscribedAt: '2025-09-29',
      }

      const html = generateNewsletterWelcomeHTML(dataWithSpecialChars)

      expect(html).toContain(encodeURIComponent('test+tag@example.com'))
    })
  })

  describe('generateNewsletterWelcomeText', () => {
    it('should generate plain text email', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toContain('Welcome to the CitizenSpace Newsletter')
      expect(text).toContain('Thank you for subscribing')
    })

    it('should include what to expect section', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toContain('WHAT TO EXPECT')
      expect(text).toContain('Weekly Updates')
      expect(text).toContain('Event Announcements')
      expect(text).toContain('Exclusive Offers')
      expect(text).toContain('Community Highlights')
      expect(text).toContain('Coworking Tips')
    })

    it('should format what to expect as bullet points', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toMatch(/•\s+Weekly Updates/)
      expect(text).toMatch(/•\s+Event Announcements/)
    })

    it('should include visit invitation', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toContain("HAVEN'T VISITED US YET")
      expect(text).toContain('Book a visit')
      expect(text).toContain('/book')
    })

    it('should include social media links', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toContain('STAY CONNECTED')
      expect(text).toContain('Twitter: https://twitter.com/citizenspace')
      expect(text).toContain('Instagram: https://instagram.com/citizenspace')
      expect(text).toContain('LinkedIn: https://linkedin.com/company/citizenspace')
      expect(text).toContain('Facebook: https://facebook.com/citizenspace')
    })

    it('should include contact information', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toContain('Have questions or feedback')
      expect(text).toContain('/contact')
    })

    it('should include team signature', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toContain('Welcome aboard')
      expect(text).toContain('The CitizenSpace Team')
    })

    it('should include subscription date', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toContain('2025-09-29')
    })

    it('should include unsubscribe link', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toContain('Unsubscribe:')
      expect(text).toContain('/newsletter/unsubscribe')
    })

    it('should include manage preferences link', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toContain('Manage Preferences:')
      expect(text).toContain('/newsletter/preferences')
    })

    it('should be trimmed with no leading/trailing whitespace', () => {
      const text = generateNewsletterWelcomeText(mockData)

      expect(text).toBe(text.trim())
    })
  })

  describe('getNewsletterWelcomeSubject', () => {
    it('should return correct subject line', () => {
      const subject = getNewsletterWelcomeSubject()

      expect(subject).toBe('Welcome to CitizenSpace Newsletter')
    })
  })
})