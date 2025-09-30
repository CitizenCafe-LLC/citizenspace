/**
 * Validation schemas for contact and newsletter endpoints
 */

import { z } from 'zod'

/**
 * Contact topic enum
 */
export const contactTopicSchema = z.enum(['general', 'booking', 'partnership', 'press'], {
  errorMap: () => ({
    message: 'Topic must be one of: general, booking, partnership, press',
  }),
})

/**
 * Email validation schema
 * Using a comprehensive regex pattern for email validation
 */
export const emailSchema = z
  .string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string',
  })
  .trim() // Trim first
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()

/**
 * Name validation schema
 */
export const nameSchema = z
  .string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  })
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .trim()
  .refine(val => val.length > 0, 'Name cannot be empty')

/**
 * Message validation schema
 */
export const messageSchema = z
  .string({
    required_error: 'Message is required',
    invalid_type_error: 'Message must be a string',
  })
  .min(10, 'Message must be at least 10 characters')
  .max(5000, 'Message must be less than 5000 characters')
  .trim()
  .refine(val => val.length > 0, 'Message cannot be empty')

/**
 * Contact form submission schema
 */
export const contactSubmissionSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  topic: contactTopicSchema,
  message: messageSchema,
})

/**
 * Newsletter preferences schema
 */
export const newsletterPreferencesSchema = z
  .object({
    topics: z.array(z.string()).optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    format: z.enum(['html', 'text']).optional(),
  })
  .optional()

/**
 * Newsletter subscription schema
 */
export const newsletterSubscriptionSchema = z.object({
  email: emailSchema,
  preferences: newsletterPreferencesSchema,
})

/**
 * Newsletter unsubscribe schema
 */
export const newsletterUnsubscribeSchema = z.object({
  email: emailSchema,
})

/**
 * Update contact submission status schema (for admin)
 */
export const updateContactStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']),
  admin_notes: z.string().max(1000).optional(),
})

/**
 * Type exports for TypeScript
 */
export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>
export type NewsletterSubscriptionInput = z.infer<typeof newsletterSubscriptionSchema>
export type NewsletterUnsubscribeInput = z.infer<typeof newsletterUnsubscribeSchema>
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>
export type ContactTopic = z.infer<typeof contactTopicSchema>

/**
 * Validate contact submission data
 */
export function validateContactSubmission(data: unknown) {
  return contactSubmissionSchema.safeParse(data)
}

/**
 * Validate newsletter subscription data
 */
export function validateNewsletterSubscription(data: unknown) {
  return newsletterSubscriptionSchema.safeParse(data)
}

/**
 * Validate newsletter unsubscribe data
 */
export function validateNewsletterUnsubscribe(data: unknown) {
  return newsletterUnsubscribeSchema.safeParse(data)
}

/**
 * Validate update contact status data
 */
export function validateUpdateContactStatus(data: unknown) {
  return updateContactStatusSchema.safeParse(data)
}

/**
 * Format validation errors into a readable string
 */
export function formatValidationErrors(errors: z.ZodError): string {
  return errors.errors
    .map(err => {
      const path = err.path.join('.')
      return path ? `${path}: ${err.message}` : err.message
    })
    .join(', ')
}