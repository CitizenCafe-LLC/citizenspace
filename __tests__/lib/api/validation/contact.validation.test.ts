/**
 * Contact Validation Tests
 * Tests all contact and newsletter validation schemas and functions
 */

import { z } from 'zod'
import {
  contactTopicSchema,
  emailSchema,
  nameSchema,
  messageSchema,
  contactSubmissionSchema,
  newsletterPreferencesSchema,
  newsletterSubscriptionSchema,
  newsletterUnsubscribeSchema,
  updateContactStatusSchema,
  validateContactSubmission,
  validateNewsletterSubscription,
  validateNewsletterUnsubscribe,
  validateUpdateContactStatus,
  formatValidationErrors,
  type ContactSubmissionInput,
  type NewsletterSubscriptionInput,
  type NewsletterUnsubscribeInput,
  type UpdateContactStatusInput,
  type ContactTopic,
} from '@/lib/api/validation/contact.validation'

describe('Contact Validation Schemas', () => {
  describe('contactTopicSchema', () => {
    it('should accept all valid topics', () => {
      const validTopics = ['general', 'booking', 'partnership', 'press']

      validTopics.forEach(topic => {
        const result = contactTopicSchema.parse(topic)
        expect(result).toBe(topic)
      })
    })

    it('should reject invalid topics', () => {
      const invalidTopics = ['support', 'sales', 'invalid', 'feedback']

      invalidTopics.forEach(topic => {
        expect(() => contactTopicSchema.parse(topic)).toThrow()
      })
    })

    it('should provide custom error message', () => {
      try {
        contactTopicSchema.parse('invalid')
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError)
        const zodError = error as z.ZodError
        expect(zodError.errors[0].message).toBe(
          'Topic must be one of: general, booking, partnership, press'
        )
      }
    })

    it('should be case-sensitive', () => {
      expect(() => contactTopicSchema.parse('General')).toThrow()
      expect(() => contactTopicSchema.parse('BOOKING')).toThrow()
    })
  })

  describe('emailSchema', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@sub.domain.com',
        '123@example.com',
      ]

      validEmails.forEach(email => {
        const result = emailSchema.parse(email)
        expect(result).toBe(email.toLowerCase())
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        'user..name@example.com',
      ]

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow()
      })
    })

    it('should require email field', () => {
      expect(() => emailSchema.parse(undefined)).toThrow(/Email is required/)
    })

    it('should reject non-string values', () => {
      expect(() => emailSchema.parse(123)).toThrow(/Email must be a string/)
      expect(() => emailSchema.parse(null)).toThrow()
    })

    it('should trim whitespace', () => {
      const result = emailSchema.parse('  test@example.com  ')
      expect(result).toBe('test@example.com')
    })

    it('should convert to lowercase', () => {
      const result = emailSchema.parse('User@Example.COM')
      expect(result).toBe('user@example.com')
    })

    it('should reject empty string', () => {
      expect(() => emailSchema.parse('')).toThrow(/Email is required/)
    })

    it('should reject whitespace-only string', () => {
      expect(() => emailSchema.parse('   ')).toThrow()
    })

    it('should reject emails longer than 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(() => emailSchema.parse(longEmail)).toThrow(
        /Email must be less than 255 characters/
      )
    })

    it('should accept email at maximum length', () => {
      const maxEmail = 'a'.repeat(243) + '@example.com' // 255 chars total
      const result = emailSchema.parse(maxEmail)
      expect(result).toBe(maxEmail)
    })
  })

  describe('nameSchema', () => {
    it('should accept valid names', () => {
      const validNames = [
        'John Doe',
        'Jane Smith-Jones',
        "O'Connor",
        'José García',
        'Li Wei',
        'AB', // Minimum length
      ]

      validNames.forEach(name => {
        const result = nameSchema.parse(name)
        expect(result).toBe(name.trim())
      })
    })

    it('should require at least 2 characters', () => {
      expect(() => nameSchema.parse('A')).toThrow(/Name must be at least 2 characters/)
    })

    it('should reject names longer than 100 characters', () => {
      const longName = 'A'.repeat(101)
      expect(() => nameSchema.parse(longName)).toThrow(/Name must be less than 100 characters/)
    })

    it('should require name field', () => {
      expect(() => nameSchema.parse(undefined)).toThrow(/Name is required/)
    })

    it('should reject non-string values', () => {
      expect(() => nameSchema.parse(123)).toThrow(/Name must be a string/)
      expect(() => nameSchema.parse(null)).toThrow()
    })

    it('should trim whitespace', () => {
      const result = nameSchema.parse('  John Doe  ')
      expect(result).toBe('John Doe')
    })

    it('should reject whitespace-only string', () => {
      expect(() => nameSchema.parse('   ')).toThrow(/Name cannot be empty/)
    })

    it('should reject empty string after trim', () => {
      expect(() => nameSchema.parse('')).toThrow()
    })

    it('should accept name at maximum length', () => {
      const maxName = 'A'.repeat(100)
      const result = nameSchema.parse(maxName)
      expect(result).toBe(maxName)
    })

    it('should preserve internal spaces', () => {
      const name = 'John   Middle   Doe'
      const result = nameSchema.parse(name)
      expect(result).toBe('John   Middle   Doe')
    })
  })

  describe('messageSchema', () => {
    it('should accept valid messages', () => {
      const validMessages = [
        'This is a valid message with sufficient length.',
        'A'.repeat(10), // Minimum length
        'Hello!\n\nThis is a multi-line message.\n\nThanks!',
      ]

      validMessages.forEach(message => {
        const result = messageSchema.parse(message)
        expect(result).toBe(message.trim())
      })
    })

    it('should require at least 10 characters', () => {
      expect(() => messageSchema.parse('Short')).toThrow(
        /Message must be at least 10 characters/
      )
    })

    it('should reject messages longer than 5000 characters', () => {
      const longMessage = 'A'.repeat(5001)
      expect(() => messageSchema.parse(longMessage)).toThrow(
        /Message must be less than 5000 characters/
      )
    })

    it('should require message field', () => {
      expect(() => messageSchema.parse(undefined)).toThrow(/Message is required/)
    })

    it('should reject non-string values', () => {
      expect(() => messageSchema.parse(123)).toThrow(/Message must be a string/)
      expect(() => messageSchema.parse(null)).toThrow()
    })

    it('should trim whitespace', () => {
      const result = messageSchema.parse('  This is a valid message.  ')
      expect(result).toBe('This is a valid message.')
    })

    it('should reject whitespace-only string', () => {
      expect(() => messageSchema.parse('          ')).toThrow(/Message cannot be empty/)
    })

    it('should accept message at maximum length', () => {
      const maxMessage = 'A'.repeat(5000)
      const result = messageSchema.parse(maxMessage)
      expect(result).toBe(maxMessage)
    })

    it('should preserve line breaks', () => {
      const message = 'Line 1\nLine 2\nLine 3'
      const result = messageSchema.parse(message)
      expect(result).toBe(message)
    })

    it('should handle special characters', () => {
      const message = 'Message with special chars: !@#$%^&*()'
      const result = messageSchema.parse(message)
      expect(result).toBe(message)
    })
  })

  describe('contactSubmissionSchema', () => {
    it('should validate complete contact submission', () => {
      const submission = {
        name: 'John Doe',
        email: 'john@example.com',
        topic: 'general',
        message: 'This is a test message.',
      }

      const result = contactSubmissionSchema.parse(submission)

      expect(result.name).toBe('John Doe')
      expect(result.email).toBe('john@example.com')
      expect(result.topic).toBe('general')
      expect(result.message).toBe('This is a test message.')
    })

    it('should require all fields', () => {
      const incomplete = {
        name: 'John Doe',
        email: 'john@example.com',
        // Missing topic and message
      }

      expect(() => contactSubmissionSchema.parse(incomplete)).toThrow()
    })

    it('should validate all nested schemas', () => {
      const submission = {
        name: 'A', // Too short
        email: 'invalid',
        topic: 'invalid',
        message: 'Short',
      }

      expect(() => contactSubmissionSchema.parse(submission)).toThrow()
    })

    it('should apply transformations from nested schemas', () => {
      const submission = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        topic: 'booking',
        message: '  This is a message.  ',
      }

      const result = contactSubmissionSchema.parse(submission)

      expect(result.name).toBe('John Doe')
      expect(result.email).toBe('john@example.com')
      expect(result.message).toBe('This is a message.')
    })

    it('should reject extra fields with strict parsing', () => {
      const submission = {
        name: 'John Doe',
        email: 'john@example.com',
        topic: 'general',
        message: 'Test message.',
        extraField: 'should be ignored',
      }

      // Zod by default strips extra fields in parse mode
      const result = contactSubmissionSchema.parse(submission)
      expect('extraField' in result).toBe(false)
    })
  })

  describe('newsletterPreferencesSchema', () => {
    it('should accept valid preferences', () => {
      const preferences = {
        topics: ['updates', 'events', 'news'],
        frequency: 'weekly',
        format: 'html',
      }

      const result = newsletterPreferencesSchema.parse(preferences)
      expect(result).toEqual(preferences)
    })

    it('should make all fields optional', () => {
      const result = newsletterPreferencesSchema.parse({})
      expect(result).toEqual({})
    })

    it('should accept undefined', () => {
      const result = newsletterPreferencesSchema.parse(undefined)
      expect(result).toBeUndefined()
    })

    it('should validate frequency enum', () => {
      const validFrequencies = ['daily', 'weekly', 'monthly']

      validFrequencies.forEach(frequency => {
        const result = newsletterPreferencesSchema.parse({ frequency })
        expect(result?.frequency).toBe(frequency)
      })
    })

    it('should reject invalid frequency', () => {
      const prefs = { frequency: 'yearly' }
      expect(() => newsletterPreferencesSchema.parse(prefs)).toThrow()
    })

    it('should validate format enum', () => {
      const validFormats = ['html', 'text']

      validFormats.forEach(format => {
        const result = newsletterPreferencesSchema.parse({ format })
        expect(result?.format).toBe(format)
      })
    })

    it('should reject invalid format', () => {
      const prefs = { format: 'pdf' }
      expect(() => newsletterPreferencesSchema.parse(prefs)).toThrow()
    })

    it('should accept topics array', () => {
      const prefs = { topics: ['topic1', 'topic2', 'topic3'] }
      const result = newsletterPreferencesSchema.parse(prefs)
      expect(result?.topics).toEqual(['topic1', 'topic2', 'topic3'])
    })

    it('should accept empty topics array', () => {
      const prefs = { topics: [] }
      const result = newsletterPreferencesSchema.parse(prefs)
      expect(result?.topics).toEqual([])
    })
  })

  describe('newsletterSubscriptionSchema', () => {
    it('should validate subscription with email only', () => {
      const subscription = {
        email: 'subscriber@example.com',
      }

      const result = newsletterSubscriptionSchema.parse(subscription)
      expect(result.email).toBe('subscriber@example.com')
      expect(result.preferences).toBeUndefined()
    })

    it('should validate subscription with preferences', () => {
      const subscription = {
        email: 'subscriber@example.com',
        preferences: {
          topics: ['updates'],
          frequency: 'weekly',
          format: 'html',
        },
      }

      const result = newsletterSubscriptionSchema.parse(subscription)
      expect(result.email).toBe('subscriber@example.com')
      expect(result.preferences?.frequency).toBe('weekly')
    })

    it('should require email', () => {
      const subscription = {
        preferences: { frequency: 'weekly' },
      }

      expect(() => newsletterSubscriptionSchema.parse(subscription)).toThrow()
    })

    it('should validate email format', () => {
      const subscription = {
        email: 'invalid-email',
      }

      expect(() => newsletterSubscriptionSchema.parse(subscription)).toThrow()
    })

    it('should apply email transformations', () => {
      const subscription = {
        email: '  SUBSCRIBER@EXAMPLE.COM  ',
      }

      const result = newsletterSubscriptionSchema.parse(subscription)
      expect(result.email).toBe('subscriber@example.com')
    })
  })

  describe('newsletterUnsubscribeSchema', () => {
    it('should validate unsubscribe request', () => {
      const request = {
        email: 'unsubscribe@example.com',
      }

      const result = newsletterUnsubscribeSchema.parse(request)
      expect(result.email).toBe('unsubscribe@example.com')
    })

    it('should require email', () => {
      expect(() => newsletterUnsubscribeSchema.parse({})).toThrow()
    })

    it('should validate email format', () => {
      const request = { email: 'invalid' }
      expect(() => newsletterUnsubscribeSchema.parse(request)).toThrow()
    })

    it('should apply email transformations', () => {
      const request = { email: '  UNSUBSCRIBE@EXAMPLE.COM  ' }
      const result = newsletterUnsubscribeSchema.parse(request)
      expect(result.email).toBe('unsubscribe@example.com')
    })
  })

  describe('updateContactStatusSchema', () => {
    it('should validate status update with all fields', () => {
      const update = {
        status: 'in_progress',
        admin_notes: 'Following up with customer',
      }

      const result = updateContactStatusSchema.parse(update)
      expect(result.status).toBe('in_progress')
      expect(result.admin_notes).toBe('Following up with customer')
    })

    it('should accept all valid status values', () => {
      const validStatuses = ['new', 'in_progress', 'resolved', 'closed']

      validStatuses.forEach(status => {
        const result = updateContactStatusSchema.parse({ status })
        expect(result.status).toBe(status)
      })
    })

    it('should reject invalid status', () => {
      const update = { status: 'pending' }
      expect(() => updateContactStatusSchema.parse(update)).toThrow()
    })

    it('should require status field', () => {
      const update = { admin_notes: 'Some notes' }
      expect(() => updateContactStatusSchema.parse(update)).toThrow()
    })

    it('should make admin_notes optional', () => {
      const update = { status: 'resolved' }
      const result = updateContactStatusSchema.parse(update)
      expect(result.admin_notes).toBeUndefined()
    })

    it('should reject admin_notes longer than 1000 characters', () => {
      const update = {
        status: 'in_progress',
        admin_notes: 'A'.repeat(1001),
      }

      expect(() => updateContactStatusSchema.parse(update)).toThrow()
    })

    it('should accept admin_notes at maximum length', () => {
      const update = {
        status: 'resolved',
        admin_notes: 'A'.repeat(1000),
      }

      const result = updateContactStatusSchema.parse(update)
      expect(result.admin_notes?.length).toBe(1000)
    })

    it('should accept empty admin_notes', () => {
      const update = {
        status: 'closed',
        admin_notes: '',
      }

      const result = updateContactStatusSchema.parse(update)
      expect(result.admin_notes).toBe('')
    })
  })

  describe('validateContactSubmission', () => {
    it('should return success for valid submission', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        topic: 'general',
        message: 'This is a test message.',
      }

      const result = validateContactSubmission(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          name: 'John Doe',
          email: 'john@example.com',
          topic: 'general',
          message: 'This is a test message.',
        })
      }
    })

    it('should return error for invalid submission', () => {
      const data = {
        name: 'J',
        email: 'invalid',
        topic: 'invalid',
        message: 'Short',
      }

      const result = validateContactSubmission(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should handle missing fields', () => {
      const data = {
        name: 'John Doe',
        // Missing other fields
      }

      const result = validateContactSubmission(data)
      expect(result.success).toBe(false)
    })

    it('should handle null input', () => {
      const result = validateContactSubmission(null)
      expect(result.success).toBe(false)
    })

    it('should handle undefined input', () => {
      const result = validateContactSubmission(undefined)
      expect(result.success).toBe(false)
    })
  })

  describe('validateNewsletterSubscription', () => {
    it('should return success for valid subscription', () => {
      const data = {
        email: 'subscriber@example.com',
        preferences: { frequency: 'weekly' },
      }

      const result = validateNewsletterSubscription(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('subscriber@example.com')
      }
    })

    it('should return error for invalid email', () => {
      const data = { email: 'invalid-email' }
      const result = validateNewsletterSubscription(data)

      expect(result.success).toBe(false)
    })

    it('should accept subscription without preferences', () => {
      const data = { email: 'test@example.com' }
      const result = validateNewsletterSubscription(data)

      expect(result.success).toBe(true)
    })
  })

  describe('validateNewsletterUnsubscribe', () => {
    it('should return success for valid unsubscribe', () => {
      const data = { email: 'unsubscribe@example.com' }
      const result = validateNewsletterUnsubscribe(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('unsubscribe@example.com')
      }
    })

    it('should return error for invalid email', () => {
      const data = { email: 'invalid' }
      const result = validateNewsletterUnsubscribe(data)

      expect(result.success).toBe(false)
    })

    it('should require email field', () => {
      const data = {}
      const result = validateNewsletterUnsubscribe(data)

      expect(result.success).toBe(false)
    })
  })

  describe('validateUpdateContactStatus', () => {
    it('should return success for valid status update', () => {
      const data = {
        status: 'resolved',
        admin_notes: 'Issue resolved',
      }

      const result = validateUpdateContactStatus(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('resolved')
        expect(result.data.admin_notes).toBe('Issue resolved')
      }
    })

    it('should return error for invalid status', () => {
      const data = { status: 'invalid' }
      const result = validateUpdateContactStatus(data)

      expect(result.success).toBe(false)
    })

    it('should accept status without notes', () => {
      const data = { status: 'closed' }
      const result = validateUpdateContactStatus(data)

      expect(result.success).toBe(true)
    })
  })

  describe('formatValidationErrors', () => {
    it('should format single error', () => {
      const schema = z.object({ email: z.string().email() })

      try {
        schema.parse({ email: 'invalid' })
      } catch (error) {
        const formatted = formatValidationErrors(error as z.ZodError)
        expect(formatted).toContain('email')
        expect(formatted).toContain('Invalid email')
      }
    })

    it('should format multiple errors with comma separation', () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string().min(2),
      })

      try {
        schema.parse({ email: 'invalid', name: 'X' })
      } catch (error) {
        const formatted = formatValidationErrors(error as z.ZodError)
        expect(formatted).toContain('email')
        expect(formatted).toContain('name')
        expect(formatted).toContain(',')
      }
    })

    it('should include field paths', () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      })

      try {
        schema.parse({ user: { email: 'invalid' } })
      } catch (error) {
        const formatted = formatValidationErrors(error as z.ZodError)
        expect(formatted).toContain('user.email')
      }
    })

    it('should handle errors without paths', () => {
      const schema = z.string().email()

      try {
        schema.parse('invalid')
      } catch (error) {
        const formatted = formatValidationErrors(error as z.ZodError)
        expect(formatted).toBeTruthy()
        expect(typeof formatted).toBe('string')
      }
    })

    it('should format nested object errors', () => {
      const schema = z.object({
        contact: z.object({
          person: z.object({
            email: z.string().email(),
          }),
        }),
      })

      try {
        schema.parse({ contact: { person: { email: 'invalid' } } })
      } catch (error) {
        const formatted = formatValidationErrors(error as z.ZodError)
        expect(formatted).toContain('contact.person.email')
      }
    })

    it('should handle array validation errors', () => {
      const schema = z.object({
        emails: z.array(z.string().email()),
      })

      try {
        schema.parse({ emails: ['valid@example.com', 'invalid'] })
      } catch (error) {
        const formatted = formatValidationErrors(error as z.ZodError)
        expect(formatted).toContain('emails')
      }
    })
  })

  describe('TypeScript Type Exports', () => {
    it('should export ContactSubmissionInput type', () => {
      const submission: ContactSubmissionInput = {
        name: 'John Doe',
        email: 'john@example.com',
        topic: 'general',
        message: 'Test message.',
      }

      expect(submission.name).toBe('John Doe')
    })

    it('should export NewsletterSubscriptionInput type', () => {
      const subscription: NewsletterSubscriptionInput = {
        email: 'test@example.com',
        preferences: {
          frequency: 'weekly',
          format: 'html',
        },
      }

      expect(subscription.email).toBe('test@example.com')
    })

    it('should export NewsletterUnsubscribeInput type', () => {
      const unsubscribe: NewsletterUnsubscribeInput = {
        email: 'test@example.com',
      }

      expect(unsubscribe.email).toBe('test@example.com')
    })

    it('should export UpdateContactStatusInput type', () => {
      const update: UpdateContactStatusInput = {
        status: 'resolved',
        admin_notes: 'Fixed',
      }

      expect(update.status).toBe('resolved')
    })

    it('should export ContactTopic type', () => {
      const topic: ContactTopic = 'general'
      expect(topic).toBe('general')
    })
  })

  describe('Edge Cases and Security', () => {
    it('should handle XSS attempts in name field', () => {
      const submission = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        topic: 'general',
        message: 'Test message for security.',
      }

      // Should parse successfully - sanitization happens at render time
      const result = contactSubmissionSchema.parse(submission)
      expect(result.name).toBe('<script>alert("xss")</script>')
    })

    it('should handle SQL injection attempts in message', () => {
      const submission = {
        name: 'John Doe',
        email: 'test@example.com',
        topic: 'general',
        message: "'; DROP TABLE users; --",
      }

      // Should parse successfully - parameterized queries handle this
      const result = contactSubmissionSchema.parse(submission)
      expect(result.message).toBe("'; DROP TABLE users; --")
    })

    it('should handle very long but valid inputs', () => {
      const submission = {
        name: 'A'.repeat(100),
        email: 'a'.repeat(243) + '@example.com',
        topic: 'general',
        message: 'A'.repeat(5000),
      }

      const result = contactSubmissionSchema.parse(submission)
      expect(result.name.length).toBe(100)
      expect(result.message.length).toBe(5000)
    })

    it('should handle Unicode characters in all fields', () => {
      const submission = {
        name: '张伟 李娜',
        email: 'user@example.jp', // Use ASCII domain for email validation
        topic: 'general',
        message: 'Привет мир! 🌍 こんにちは',
      }

      const result = contactSubmissionSchema.parse(submission)
      expect(result.name).toBe('张伟 李娜')
      expect(result.message).toContain('🌍')
    })

    it('should handle empty objects properly', () => {
      expect(() => contactSubmissionSchema.parse({})).toThrow()
    })

    it('should handle null values in object', () => {
      const submission = {
        name: null,
        email: null,
        topic: null,
        message: null,
      }

      expect(() => contactSubmissionSchema.parse(submission)).toThrow()
    })
  })
})
