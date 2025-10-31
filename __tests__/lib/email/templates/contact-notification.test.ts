/**
 * Contact Notification Email Template Tests
 */

import {
  generateContactNotificationHTML,
  generateContactNotificationText,
  getContactNotificationSubject,
  getAdminEmail,
} from '@/lib/email/templates/contact-notification'
import type { ContactNotificationData } from '@/lib/email/templates/contact-notification'

describe('Contact Notification Email Template', () => {
  const mockData: ContactNotificationData = {
    submissionId: 'contact-123',
    name: 'John Smith',
    email: 'john@example.com',
    topic: 'general',
    message: 'I would like to learn more about your coworking space.',
    submittedAt: '2025-09-29 10:30 AM',
  }

  describe('generateContactNotificationHTML', () => {
    it('should generate valid HTML email', () => {
      const html = generateContactNotificationHTML(mockData)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('New Contact Form Submission')
    })

    it('should include submission details', () => {
      const html = generateContactNotificationHTML(mockData)

      expect(html).toContain('John Smith')
      expect(html).toContain('john@example.com')
      expect(html).toContain('2025-09-29 10:30 AM')
    })

    it('should include topic label for general inquiry', () => {
      const html = generateContactNotificationHTML(mockData)

      expect(html).toContain('General Inquiry')
    })

    it('should include topic label for booking', () => {
      const bookingData: ContactNotificationData = {
        ...mockData,
        topic: 'booking',
      }

      const html = generateContactNotificationHTML(bookingData)

      expect(html).toContain('Booking Question')
    })

    it('should include topic label for partnership', () => {
      const partnershipData: ContactNotificationData = {
        ...mockData,
        topic: 'partnership',
      }

      const html = generateContactNotificationHTML(partnershipData)

      expect(html).toContain('Partnership Opportunity')
    })

    it('should include topic label for press', () => {
      const pressData: ContactNotificationData = {
        ...mockData,
        topic: 'press',
      }

      const html = generateContactNotificationHTML(pressData)

      expect(html).toContain('Press Inquiry')
    })

    it('should include message content', () => {
      const html = generateContactNotificationHTML(mockData)

      expect(html).toContain('I would like to learn more')
    })

    it('should escape HTML in message', () => {
      const dataWithHTML: ContactNotificationData = {
        ...mockData,
        message: '<script>alert("xss")</script>',
      }

      const html = generateContactNotificationHTML(dataWithHTML)

      expect(html).toContain('&lt;script&gt;')
      expect(html).toContain('&gt;')
      expect(html).not.toContain('<script>')
    })

    it('should preserve line breaks in message', () => {
      const dataWithLineBreaks: ContactNotificationData = {
        ...mockData,
        message: 'Line 1\nLine 2\nLine 3',
      }

      const html = generateContactNotificationHTML(dataWithLineBreaks)

      expect(html).toContain('white-space: pre-wrap')
    })

    it('should include clickable email link', () => {
      const html = generateContactNotificationHTML(mockData)

      expect(html).toContain('mailto:john@example.com')
    })

    it('should include action required notice', () => {
      const html = generateContactNotificationHTML(mockData)

      expect(html).toContain('Action Required')
      expect(html).toContain('respond to this inquiry within 24 hours')
    })

    it('should include CTA to view in dashboard', () => {
      const html = generateContactNotificationHTML(mockData)

      expect(html).toContain('View in Dashboard')
      expect(html).toContain('/admin/contact/contact-123')
    })

    it('should include automated notification message', () => {
      const html = generateContactNotificationHTML(mockData)

      expect(html).toContain('automated notification')
    })
  })

  describe('generateContactNotificationText', () => {
    it('should generate plain text email', () => {
      const text = generateContactNotificationText(mockData)

      expect(text).toContain('New Contact Form Submission')
      expect(text).toContain('John Smith')
    })

    it('should include submission details', () => {
      const text = generateContactNotificationText(mockData)

      expect(text).toContain('SUBMISSION DETAILS')
      expect(text).toContain('Name: John Smith')
      expect(text).toContain('Email: john@example.com')
      expect(text).toContain('Topic: General Inquiry')
      expect(text).toContain('Date: 2025-09-29 10:30 AM')
    })

    it('should include message content', () => {
      const text = generateContactNotificationText(mockData)

      expect(text).toContain('MESSAGE')
      expect(text).toContain('I would like to learn more')
    })

    it('should include action required notice', () => {
      const text = generateContactNotificationText(mockData)

      expect(text).toContain('ACTION REQUIRED')
      expect(text).toContain('respond to this inquiry within 24 hours')
    })

    it('should include dashboard URL', () => {
      const text = generateContactNotificationText(mockData)

      expect(text).toContain('/admin/contact/contact-123')
    })

    it('should include automated notification message', () => {
      const text = generateContactNotificationText(mockData)

      expect(text).toContain('automated notification')
    })

    it('should format sections properly', () => {
      const text = generateContactNotificationText(mockData)

      expect(text).toContain('SUBMISSION DETAILS')
      expect(text).toContain('------------------')
      expect(text).toContain('MESSAGE')
      expect(text).toContain('-------')
    })
  })

  describe('getContactNotificationSubject', () => {
    it('should return subject with topic for general inquiry', () => {
      const subject = getContactNotificationSubject(mockData)

      expect(subject).toBe('New Contact Form Submission - General Inquiry')
    })

    it('should return subject with topic for booking', () => {
      const bookingData: ContactNotificationData = {
        ...mockData,
        topic: 'booking',
      }

      const subject = getContactNotificationSubject(bookingData)

      expect(subject).toBe('New Contact Form Submission - Booking Question')
    })

    it('should return subject with topic for partnership', () => {
      const partnershipData: ContactNotificationData = {
        ...mockData,
        topic: 'partnership',
      }

      const subject = getContactNotificationSubject(partnershipData)

      expect(subject).toBe('New Contact Form Submission - Partnership Opportunity')
    })

    it('should return subject with topic for press', () => {
      const pressData: ContactNotificationData = {
        ...mockData,
        topic: 'press',
      }

      const subject = getContactNotificationSubject(pressData)

      expect(subject).toBe('New Contact Form Submission - Press Inquiry')
    })
  })

  describe('getAdminEmail', () => {
    it('should return admin email', () => {
      const email = getAdminEmail()

      expect(email).toBeDefined()
      expect(typeof email).toBe('string')
      expect(email).toContain('@')
    })

    it('should return default admin email when not configured', () => {
      const email = getAdminEmail()

      expect(email).toBe('admin@citizenspace.com')
    })
  })
})