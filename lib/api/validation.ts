import { z } from 'zod'

/**
 * Validation schemas for workspace API endpoints
 */

// Workspace type enum
const workspaceTypeSchema = z.enum([
  'hot-desk',
  'focus-room',
  'collaborate-room',
  'boardroom',
  'communications-pod',
])

// Resource category enum
const resourceCategorySchema = z.enum(['desk', 'meeting-room'])

// Workspace filters schema
export const workspaceFiltersSchema = z.object({
  type: workspaceTypeSchema.optional(),
  resource_category: resourceCategorySchema.optional(),
  min_capacity: z.coerce.number().int().positive().optional(),
  max_capacity: z.coerce.number().int().positive().optional(),
  min_price: z.coerce.number().positive().optional(),
  max_price: z.coerce.number().positive().optional(),
  amenities: z
    .string()
    .optional()
    .transform(val => (val ? val.split(',').map(a => a.trim()) : undefined)),
  available: z.coerce.boolean().optional(),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Availability query schema
export const availabilityQuerySchema = z.object({
  workspace_id: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')
    .optional(),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')
    .optional(),
  duration_hours: z.coerce.number().positive().optional(),
  resource_category: resourceCategorySchema.optional(),
})

// UUID validation
export const uuidSchema = z.string().uuid('Invalid workspace ID format')

/**
 * Validate request parameters
 * @throws {z.ZodError} if validation fails
 */
export function validateParams<T>(schema: z.ZodSchema<T>, params: unknown): T {
  return schema.parse(params)
}

/**
 * Safe parameter validation that returns error object instead of throwing
 */
export function safeValidateParams<T>(
  schema: z.ZodSchema<T>,
  params: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(params)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Format Zod errors into readable message
  const errorMessages = result.error.errors
    .map(err => {
      const path = err.path.join('.')
      return `${path}: ${err.message}`
    })
    .join(', ')

  return { success: false, error: errorMessages }
}

/**
 * Validate date is not in the past
 */
export function validateFutureDate(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

/**
 * Validate time range
 */
export function validateTimeRange(startTime: string, endTime: string): boolean {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  return start < end
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Calculate duration in hours between two times
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  return (end - start) / 60
}
