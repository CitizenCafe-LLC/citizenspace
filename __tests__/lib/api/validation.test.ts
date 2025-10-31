/**
 * API Validation Utilities Tests
 * Tests workspace validation schemas and helper functions
 */

import { z } from 'zod'
import {
  workspaceFiltersSchema,
  paginationSchema,
  availabilityQuerySchema,
  uuidSchema,
  validateParams,
  safeValidateParams,
  validateFutureDate,
  validateTimeRange,
  timeToMinutes,
  calculateDuration,
} from '@/lib/api/validation'

describe('API Validation Utilities', () => {
  describe('workspaceFiltersSchema', () => {
    it('should validate valid workspace filters', () => {
      const validFilters = {
        type: 'hot-desk',
        resource_category: 'desk',
        min_capacity: '2',
        max_capacity: '10',
        min_price: '50',
        max_price: '200',
        amenities: 'WiFi,Power Outlet',
        available: 'true',
      }

      const result = workspaceFiltersSchema.parse(validFilters)

      expect(result.type).toBe('hot-desk')
      expect(result.resource_category).toBe('desk')
      expect(result.min_capacity).toBe(2)
      expect(result.max_capacity).toBe(10)
      expect(result.min_price).toBe(50)
      expect(result.max_price).toBe(200)
      expect(result.amenities).toEqual(['WiFi', 'Power Outlet'])
      expect(result.available).toBe(true)
    })

    it('should accept all valid workspace types', () => {
      const types = ['hot-desk', 'focus-room', 'collaborate-room', 'boardroom', 'communications-pod']

      types.forEach(type => {
        const result = workspaceFiltersSchema.parse({ type })
        expect(result.type).toBe(type)
      })
    })

    it('should accept all valid resource categories', () => {
      const categories = ['desk', 'meeting-room']

      categories.forEach(resource_category => {
        const result = workspaceFiltersSchema.parse({ resource_category })
        expect(result.resource_category).toBe(resource_category)
      })
    })

    it('should reject invalid workspace type', () => {
      const invalidFilters = { type: 'invalid-type' }

      expect(() => workspaceFiltersSchema.parse(invalidFilters)).toThrow()
    })

    it('should reject invalid resource category', () => {
      const invalidFilters = { resource_category: 'invalid-category' }

      expect(() => workspaceFiltersSchema.parse(invalidFilters)).toThrow()
    })

    it('should coerce string numbers to integers for capacity', () => {
      const filters = { min_capacity: '5', max_capacity: '15' }
      const result = workspaceFiltersSchema.parse(filters)

      expect(result.min_capacity).toBe(5)
      expect(result.max_capacity).toBe(15)
      expect(typeof result.min_capacity).toBe('number')
    })

    it('should coerce string numbers to numbers for price', () => {
      const filters = { min_price: '100.50', max_price: '500.75' }
      const result = workspaceFiltersSchema.parse(filters)

      expect(result.min_price).toBe(100.5)
      expect(result.max_price).toBe(500.75)
    })

    it('should reject negative capacity values', () => {
      const filters = { min_capacity: '-5' }

      expect(() => workspaceFiltersSchema.parse(filters)).toThrow()
    })

    it('should reject negative price values', () => {
      const filters = { min_price: '-100' }

      expect(() => workspaceFiltersSchema.parse(filters)).toThrow()
    })

    it('should reject zero capacity values', () => {
      const filters = { min_capacity: '0' }

      expect(() => workspaceFiltersSchema.parse(filters)).toThrow()
    })

    it('should reject zero price values', () => {
      const filters = { min_price: '0' }

      expect(() => workspaceFiltersSchema.parse(filters)).toThrow()
    })

    it('should parse amenities string into array', () => {
      const filters = { amenities: 'WiFi, Standing Desk, Monitor, Coffee' }
      const result = workspaceFiltersSchema.parse(filters)

      expect(result.amenities).toEqual(['WiFi', 'Standing Desk', 'Monitor', 'Coffee'])
    })

    it('should trim whitespace from amenities', () => {
      const filters = { amenities: '  WiFi  ,  Monitor  ,  Power  ' }
      const result = workspaceFiltersSchema.parse(filters)

      expect(result.amenities).toEqual(['WiFi', 'Monitor', 'Power'])
    })

    it('should handle single amenity without comma', () => {
      const filters = { amenities: 'WiFi' }
      const result = workspaceFiltersSchema.parse(filters)

      expect(result.amenities).toEqual(['WiFi'])
    })

    it('should handle empty amenities string', () => {
      const filters = { amenities: '' }
      const result = workspaceFiltersSchema.parse(filters)

      expect(result.amenities).toBeUndefined()
    })

    it('should coerce boolean strings to boolean', () => {
      const filters1 = { available: 'true' }
      const filters2 = { available: true }
      const filters3 = { available: '1' }
      const filters4 = { available: 1 }
      const filters5 = { available: '' }

      expect(workspaceFiltersSchema.parse(filters1).available).toBe(true)
      expect(workspaceFiltersSchema.parse(filters2).available).toBe(true)
      expect(workspaceFiltersSchema.parse(filters3).available).toBe(true)
      // In JavaScript/Zod, Number(1) converts to true, Number(0) to false
      // But '0' as string converts to Number(0) = 0 which is falsy, so coerces to false
      // Actually, the zod coerce.boolean() uses Boolean() constructor which treats any non-empty string as true
      expect(workspaceFiltersSchema.parse(filters4).available).toBe(true)
      expect(workspaceFiltersSchema.parse(filters5).available).toBe(false)
    })

    it('should accept empty filters object', () => {
      const result = workspaceFiltersSchema.parse({})

      expect(result).toEqual({})
    })

    it('should make all fields optional', () => {
      const result = workspaceFiltersSchema.parse({})

      expect(result.type).toBeUndefined()
      expect(result.resource_category).toBeUndefined()
      expect(result.min_capacity).toBeUndefined()
    })
  })

  describe('paginationSchema', () => {
    it('should validate valid pagination parameters', () => {
      const params = {
        page: '2',
        limit: '50',
        sortBy: 'name',
        sortOrder: 'asc',
      }

      const result = paginationSchema.parse(params)

      expect(result.page).toBe(2)
      expect(result.limit).toBe(50)
      expect(result.sortBy).toBe('name')
      expect(result.sortOrder).toBe('asc')
    })

    it('should use default values when not provided', () => {
      const result = paginationSchema.parse({})

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.sortBy).toBe('created_at')
      expect(result.sortOrder).toBe('desc')
    })

    it('should coerce page string to number', () => {
      const params = { page: '5' }
      const result = paginationSchema.parse(params)

      expect(result.page).toBe(5)
      expect(typeof result.page).toBe('number')
    })

    it('should coerce limit string to number', () => {
      const params = { limit: '100' }
      const result = paginationSchema.parse(params)

      expect(result.limit).toBe(100)
      expect(typeof result.limit).toBe('number')
    })

    it('should reject page less than 1', () => {
      const params = { page: '0' }

      expect(() => paginationSchema.parse(params)).toThrow()
    })

    it('should reject negative page', () => {
      const params = { page: '-1' }

      expect(() => paginationSchema.parse(params)).toThrow()
    })

    it('should reject limit greater than 100', () => {
      const params = { limit: '101' }

      expect(() => paginationSchema.parse(params)).toThrow()
    })

    it('should reject negative limit', () => {
      const params = { limit: '-10' }

      expect(() => paginationSchema.parse(params)).toThrow()
    })

    it('should reject zero limit', () => {
      const params = { limit: '0' }

      expect(() => paginationSchema.parse(params)).toThrow()
    })

    it('should accept both asc and desc sort orders', () => {
      const result1 = paginationSchema.parse({ sortOrder: 'asc' })
      const result2 = paginationSchema.parse({ sortOrder: 'desc' })

      expect(result1.sortOrder).toBe('asc')
      expect(result2.sortOrder).toBe('desc')
    })

    it('should reject invalid sort order', () => {
      const params = { sortOrder: 'invalid' }

      expect(() => paginationSchema.parse(params)).toThrow()
    })

    it('should accept custom sortBy field', () => {
      const params = { sortBy: 'price' }
      const result = paginationSchema.parse(params)

      expect(result.sortBy).toBe('price')
    })

    it('should handle numeric page and limit', () => {
      const params = { page: 3, limit: 25 }
      const result = paginationSchema.parse(params)

      expect(result.page).toBe(3)
      expect(result.limit).toBe(25)
    })

    it('should accept limit at maximum boundary (100)', () => {
      const params = { limit: '100' }
      const result = paginationSchema.parse(params)

      expect(result.limit).toBe(100)
    })
  })

  describe('availabilityQuerySchema', () => {
    it('should validate complete availability query', () => {
      const query = {
        workspace_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2025-10-15',
        start_time: '09:00',
        end_time: '17:00',
        duration_hours: '8',
        resource_category: 'desk',
      }

      const result = availabilityQuerySchema.parse(query)

      expect(result.workspace_id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(result.date).toBe('2025-10-15')
      expect(result.start_time).toBe('09:00')
      expect(result.end_time).toBe('17:00')
      expect(result.duration_hours).toBe(8)
      expect(result.resource_category).toBe('desk')
    })

    it('should require date field', () => {
      const query = {}

      expect(() => availabilityQuerySchema.parse(query)).toThrow()
    })

    it('should validate date format YYYY-MM-DD', () => {
      const validQuery = { date: '2025-12-31' }
      const result = availabilityQuerySchema.parse(validQuery)

      expect(result.date).toBe('2025-12-31')
    })

    it('should reject invalid date format', () => {
      const invalidFormats = [
        { date: '25-12-2025' }, // DD-MM-YYYY
        { date: '12/25/2025' }, // MM/DD/YYYY
        { date: '2025/12/25' }, // YYYY/MM/DD
        { date: '25-Dec-2025' }, // DD-Mon-YYYY
        { date: 'invalid' },
      ]

      invalidFormats.forEach(query => {
        expect(() => availabilityQuerySchema.parse(query)).toThrow()
      })
    })

    it('should validate time format HH:MM', () => {
      const query = { date: '2025-10-15', start_time: '14:30', end_time: '18:45' }
      const result = availabilityQuerySchema.parse(query)

      expect(result.start_time).toBe('14:30')
      expect(result.end_time).toBe('18:45')
    })

    it('should reject invalid time format', () => {
      const invalidTimes = [
        { date: '2025-10-15', start_time: '9:00' }, // Missing leading zero
        { date: '2025-10-15', start_time: '09:0' }, // Missing minute digit
        { date: '2025-10-15', start_time: '9:30 AM' }, // AM/PM format
        // Note: Regex doesn't validate hour/minute ranges, only format
      ]

      invalidTimes.forEach(query => {
        expect(() => availabilityQuerySchema.parse(query)).toThrow()
      })
    })

    it('should validate UUID format for workspace_id', () => {
      const query = {
        date: '2025-10-15',
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
      }

      const result = availabilityQuerySchema.parse(query)
      expect(result.workspace_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    })

    it('should reject invalid UUID format', () => {
      const query = {
        date: '2025-10-15',
        workspace_id: 'not-a-uuid',
      }

      expect(() => availabilityQuerySchema.parse(query)).toThrow()
    })

    it('should make workspace_id optional', () => {
      const query = { date: '2025-10-15' }
      const result = availabilityQuerySchema.parse(query)

      expect(result.workspace_id).toBeUndefined()
    })

    it('should coerce duration_hours to number', () => {
      const query = { date: '2025-10-15', duration_hours: '4.5' }
      const result = availabilityQuerySchema.parse(query)

      expect(result.duration_hours).toBe(4.5)
      expect(typeof result.duration_hours).toBe('number')
    })

    it('should reject negative duration', () => {
      const query = { date: '2025-10-15', duration_hours: '-2' }

      expect(() => availabilityQuerySchema.parse(query)).toThrow()
    })

    it('should reject zero duration', () => {
      const query = { date: '2025-10-15', duration_hours: '0' }

      expect(() => availabilityQuerySchema.parse(query)).toThrow()
    })

    it('should make all fields except date optional', () => {
      const result = availabilityQuerySchema.parse({ date: '2025-10-15' })

      expect(result.start_time).toBeUndefined()
      expect(result.end_time).toBeUndefined()
      expect(result.duration_hours).toBeUndefined()
      expect(result.resource_category).toBeUndefined()
    })
  })

  describe('uuidSchema', () => {
    it('should validate valid UUID', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
        'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
      ]

      validUUIDs.forEach(uuid => {
        const result = uuidSchema.parse(uuid)
        expect(result).toBe(uuid)
      })
    })

    it('should reject invalid UUID format', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123',
        '123e4567-e89b-12d3-a456', // Incomplete
        '123e4567-e89b-12d3-a456-426614174000-extra', // Too long
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Invalid characters
      ]

      invalidUUIDs.forEach(uuid => {
        expect(() => uuidSchema.parse(uuid)).toThrow(/Invalid workspace ID format/)
      })
    })

    it('should provide custom error message', () => {
      try {
        uuidSchema.parse('invalid-uuid')
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError)
        expect((error as z.ZodError).errors[0].message).toBe('Invalid workspace ID format')
      }
    })
  })

  describe('validateParams', () => {
    const testSchema = z.object({
      name: z.string(),
      age: z.number(),
    })

    it('should validate valid parameters', () => {
      const params = { name: 'John', age: 30 }
      const result = validateParams(testSchema, params)

      expect(result).toEqual(params)
    })

    it('should throw ZodError for invalid parameters', () => {
      const params = { name: 'John', age: 'invalid' }

      expect(() => validateParams(testSchema, params)).toThrow(z.ZodError)
    })

    it('should throw ZodError for missing required fields', () => {
      const params = { name: 'John' }

      expect(() => validateParams(testSchema, params)).toThrow(z.ZodError)
    })

    it('should validate nested objects', () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      })

      const params = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      }

      const result = validateParams(nestedSchema, params)
      expect(result).toEqual(params)
    })

    it('should validate arrays', () => {
      const arraySchema = z.object({
        items: z.array(z.string()),
      })

      const params = { items: ['item1', 'item2', 'item3'] }
      const result = validateParams(arraySchema, params)

      expect(result).toEqual(params)
    })
  })

  describe('safeValidateParams', () => {
    const testSchema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    })

    it('should return success with valid data', () => {
      const params = { email: 'test@example.com', age: 25 }
      const result = safeValidateParams(testSchema, params)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(params)
      }
    })

    it('should return error object for invalid data', () => {
      const params = { email: 'invalid-email', age: 15 }
      const result = safeValidateParams(testSchema, params)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeTruthy()
        expect(typeof result.error).toBe('string')
      }
    })

    it('should format multiple validation errors', () => {
      const params = { email: 'invalid', age: 10 }
      const result = safeValidateParams(testSchema, params)

      if (!result.success) {
        expect(result.error).toContain('email:')
        expect(result.error).toContain('age:')
      }
    })

    it('should include field paths in error messages', () => {
      const nestedSchema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      })

      const params = { user: { email: 'invalid' } }
      const result = safeValidateParams(nestedSchema, params)

      if (!result.success) {
        expect(result.error).toContain('user.email')
      }
    })

    it('should handle missing required fields', () => {
      const params = { email: 'test@example.com' }
      const result = safeValidateParams(testSchema, params)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('age')
      }
    })

    it('should join multiple errors with comma', () => {
      const params = { email: '', age: -5 }
      const result = safeValidateParams(testSchema, params)

      if (!result.success) {
        expect(result.error).toContain(',')
      }
    })

    it('should handle empty object when required fields missing', () => {
      const result = safeValidateParams(testSchema, {})

      expect(result.success).toBe(false)
    })
  })

  describe('validateFutureDate', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const dateString = futureDate.toISOString().split('T')[0]

      const result = validateFutureDate(dateString)
      expect(result).toBe(true)
    })

    it('should return true for today', () => {
      const today = new Date()
      const dateString = today.toISOString().split('T')[0]

      const result = validateFutureDate(dateString)
      expect(result).toBe(true)
    })

    it('should return false for past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)
      const dateString = pastDate.toISOString().split('T')[0]

      const result = validateFutureDate(dateString)
      expect(result).toBe(false)
    })

    it('should handle YYYY-MM-DD format', () => {
      const result = validateFutureDate('2025-12-31')
      expect(result).toBe(true)
    })

    it('should handle ISO format', () => {
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + 1)
      const result = validateFutureDate(futureDate.toISOString())
      expect(result).toBe(true)
    })
  })

  describe('validateTimeRange', () => {
    it('should return true for valid time range', () => {
      const result = validateTimeRange('09:00', '17:00')
      expect(result).toBe(true)
    })

    it('should return false when start time is after end time', () => {
      const result = validateTimeRange('17:00', '09:00')
      expect(result).toBe(false)
    })

    it('should return false when start time equals end time', () => {
      const result = validateTimeRange('12:00', '12:00')
      expect(result).toBe(false)
    })

    it('should handle times spanning midnight (same day)', () => {
      const result = validateTimeRange('23:00', '01:00')
      expect(result).toBe(false) // Same day, so 01:00 < 23:00
    })

    it('should handle 24-hour format', () => {
      const result = validateTimeRange('00:00', '23:59')
      expect(result).toBe(true)
    })

    it('should handle times with minutes', () => {
      const result = validateTimeRange('09:30', '17:45')
      expect(result).toBe(true)
    })

    it('should handle close time ranges', () => {
      const result = validateTimeRange('09:00', '09:01')
      expect(result).toBe(true)
    })
  })

  describe('timeToMinutes', () => {
    it('should convert midnight to 0 minutes', () => {
      const result = timeToMinutes('00:00')
      expect(result).toBe(0)
    })

    it('should convert morning time correctly', () => {
      const result = timeToMinutes('09:30')
      expect(result).toBe(570) // 9 * 60 + 30
    })

    it('should convert noon correctly', () => {
      const result = timeToMinutes('12:00')
      expect(result).toBe(720) // 12 * 60
    })

    it('should convert afternoon time correctly', () => {
      const result = timeToMinutes('17:45')
      expect(result).toBe(1065) // 17 * 60 + 45
    })

    it('should convert end of day correctly', () => {
      const result = timeToMinutes('23:59')
      expect(result).toBe(1439) // 23 * 60 + 59
    })

    it('should handle single digit minutes', () => {
      const result = timeToMinutes('10:05')
      expect(result).toBe(605) // 10 * 60 + 5
    })

    it('should handle zero minutes', () => {
      const result = timeToMinutes('15:00')
      expect(result).toBe(900) // 15 * 60
    })
  })

  describe('calculateDuration', () => {
    it('should calculate duration for 8-hour workday', () => {
      const result = calculateDuration('09:00', '17:00')
      expect(result).toBe(8)
    })

    it('should calculate duration for 1 hour', () => {
      const result = calculateDuration('14:00', '15:00')
      expect(result).toBe(1)
    })

    it('should calculate duration with fractional hours', () => {
      const result = calculateDuration('09:30', '11:00')
      expect(result).toBe(1.5)
    })

    it('should calculate duration for 30 minutes', () => {
      const result = calculateDuration('10:00', '10:30')
      expect(result).toBe(0.5)
    })

    it('should calculate duration for 15 minutes', () => {
      const result = calculateDuration('12:00', '12:15')
      expect(result).toBe(0.25)
    })

    it('should calculate full day duration', () => {
      const result = calculateDuration('00:00', '23:59')
      expect(result).toBeCloseTo(23.983, 2)
    })

    it('should calculate late night hours', () => {
      const result = calculateDuration('22:30', '23:30')
      expect(result).toBe(1)
    })

    it('should handle precise time calculations', () => {
      const result = calculateDuration('09:15', '17:45')
      expect(result).toBe(8.5)
    })

    it('should return negative for reversed times', () => {
      const result = calculateDuration('17:00', '09:00')
      expect(result).toBe(-8)
    })
  })

  describe('Integration Tests', () => {
    it('should validate complete workspace booking flow', () => {
      // 1. Validate filters
      const filters = workspaceFiltersSchema.parse({
        type: 'hot-desk',
        min_capacity: '1',
        max_capacity: '2',
        available: 'true',
      })

      expect(filters.type).toBe('hot-desk')

      // 2. Validate pagination
      const pagination = paginationSchema.parse({
        page: '1',
        limit: '20',
      })

      expect(pagination.page).toBe(1)

      // 3. Validate availability query
      const availability = availabilityQuerySchema.parse({
        date: '2025-10-15',
        start_time: '09:00',
        end_time: '17:00',
      })

      expect(availability.date).toBe('2025-10-15')

      // 4. Validate time range
      const isValidRange = validateTimeRange(availability.start_time!, availability.end_time!)
      expect(isValidRange).toBe(true)

      // 5. Calculate duration
      const duration = calculateDuration(availability.start_time!, availability.end_time!)
      expect(duration).toBe(8)
    })

    it('should handle validation errors gracefully in booking flow', () => {
      // Invalid date format
      const dateResult = safeValidateParams(availabilityQuerySchema, {
        date: 'invalid-date',
      })

      expect(dateResult.success).toBe(false)

      // Invalid time range
      const isValidRange = validateTimeRange('17:00', '09:00')
      expect(isValidRange).toBe(false)

      // Invalid workspace type
      const filterResult = safeValidateParams(workspaceFiltersSchema, {
        type: 'invalid-type',
      })

      expect(filterResult.success).toBe(false)
    })
  })
})
