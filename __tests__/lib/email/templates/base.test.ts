/**
 * Base Email Template Tests
 * Tests the base template generation functions
 */

import { generateEmailHTML, generateEmailText } from '@/lib/email/templates/base'
import type { EmailTemplateProps } from '@/lib/email/templates/base'

describe('Base Email Template', () => {
  const mockData: EmailTemplateProps = {
    title: 'Test Email',
    content: '<p>This is test content</p>',
  }

  describe('generateEmailHTML', () => {
    it('should generate valid HTML email', () => {
      const html = generateEmailHTML(mockData)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('Test Email')
      expect(html).toContain('This is test content')
    })

    it('should include branding header', () => {
      const html = generateEmailHTML(mockData)

      expect(html).toContain('CitizenSpace')
      expect(html).toContain('linear-gradient')
    })

    it('should include footer with current year', () => {
      const html = generateEmailHTML(mockData)
      const currentYear = new Date().getFullYear()

      expect(html).toContain(`${currentYear}`)
      expect(html).toContain('All rights reserved')
    })

    it('should include footer links', () => {
      const html = generateEmailHTML(mockData)

      expect(html).toContain('Visit our website')
      expect(html).toContain('Contact Support')
    })

    it('should include CTA button when provided', () => {
      const dataWithCTA = {
        ...mockData,
        ctaText: 'Click Here',
        ctaUrl: 'https://example.com/action',
      }

      const html = generateEmailHTML(dataWithCTA)

      expect(html).toContain('Click Here')
      expect(html).toContain('https://example.com/action')
      expect(html).toContain('cta-button')
    })

    it('should not include CTA button when not provided', () => {
      const html = generateEmailHTML(mockData)

      expect(html).not.toContain('cta-button')
    })

    it('should include footer text when provided', () => {
      const dataWithFooter = {
        ...mockData,
        footerText: 'This is custom footer text',
      }

      const html = generateEmailHTML(dataWithFooter)

      expect(html).toContain('This is custom footer text')
    })

    it('should not include divider when no footer text', () => {
      const html = generateEmailHTML(mockData)

      // Should not have the divider before footer text
      expect(html.match(/divider/g)?.length || 0).toBeLessThanOrEqual(1)
    })

    it('should include responsive viewport meta tag', () => {
      const html = generateEmailHTML(mockData)

      expect(html).toContain('viewport')
      expect(html).toContain('width=device-width')
    })

    it('should include email styling', () => {
      const html = generateEmailHTML(mockData)

      expect(html).toContain('<style>')
      expect(html).toContain('.email-container')
      expect(html).toContain('.header')
      expect(html).toContain('.content')
      expect(html).toContain('.footer')
    })

    it('should include mobile responsive styles', () => {
      const html = generateEmailHTML(mockData)

      expect(html).toContain('@media only screen and (max-width: 600px)')
    })

    it('should include APP_NAME in header', () => {
      const html = generateEmailHTML(mockData)

      // Should contain app name (default or configured)
      expect(html).toContain('CitizenSpace')
    })

    it('should include APP_URL in footer links', () => {
      const html = generateEmailHTML(mockData)

      // Should contain some URL (default or configured)
      expect(html).toMatch(/href="http/)
      expect(html).toContain('Visit our website')
    })
  })

  describe('generateEmailText', () => {
    it('should generate plain text email', () => {
      const text = generateEmailText(mockData)

      expect(text).toContain('Test Email')
      expect(text).toContain('CitizenSpace')
    })

    it('should strip HTML tags from content', () => {
      const dataWithHTML = {
        ...mockData,
        content: '<p>Hello <strong>world</strong></p>',
      }

      const text = generateEmailText(dataWithHTML)

      expect(text).not.toContain('<p>')
      expect(text).not.toContain('<strong>')
      expect(text).toContain('Hello world')
    })

    it('should include CTA URL when provided', () => {
      const dataWithCTA = {
        ...mockData,
        ctaText: 'Click Here',
        ctaUrl: 'https://example.com/action',
      }

      const text = generateEmailText(dataWithCTA)

      expect(text).toContain('Click Here: https://example.com/action')
    })

    it('should include footer text when provided', () => {
      const dataWithFooter = {
        ...mockData,
        footerText: 'Custom footer',
      }

      const text = generateEmailText(dataWithFooter)

      expect(text).toContain('Custom footer')
    })

    it('should include current year in footer', () => {
      const text = generateEmailText(mockData)
      const currentYear = new Date().getFullYear()

      expect(text).toContain(`${currentYear}`)
    })

    it('should include footer links', () => {
      const text = generateEmailText(mockData)

      expect(text).toContain('Visit our website:')
      expect(text).toContain('Contact Support:')
    })

    it('should normalize whitespace in content', () => {
      const dataWithWhitespace = {
        ...mockData,
        content: '<p>Hello   \n\n   world</p>',
      }

      const text = generateEmailText(dataWithWhitespace)

      expect(text).not.toContain('   ')
      expect(text).toContain('Hello world')
    })

    it('should trim final output', () => {
      const text = generateEmailText(mockData)

      expect(text).toBe(text.trim())
    })
  })
})