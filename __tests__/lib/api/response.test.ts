/**
 * API Response Utilities Tests
 * Tests all API response helper functions for status codes and formatting
 */

import {
  successResponse,
  createdResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  validationErrorResponse,
  serverErrorResponse,
  type ApiResponse,
} from '@/lib/api/response'

describe('API Response Utilities', () => {
  describe('successResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' }
      const result = successResponse(data)

      expect(result.status).toBe(200)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
    })

    it('should create a success response with data and message', () => {
      const data = { id: 1, name: 'Test' }
      const message = 'Operation completed successfully'
      const result = successResponse(data, message)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
      expect(body.message).toBe(message)
    })

    it('should create a success response with pagination metadata', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const meta = {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
      }
      const result = successResponse(data, undefined, meta)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
      expect(body.meta).toEqual(meta)
    })

    it('should handle null data', () => {
      const result = successResponse(null)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toBeNull()
    })

    it('should handle empty array data', () => {
      const data: any[] = []
      const result = successResponse(data)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toEqual([])
    })

    it('should handle complex nested objects', () => {
      const data = {
        user: { id: 1, profile: { name: 'Test', settings: { theme: 'dark' } } },
        items: [1, 2, 3],
      }
      const result = successResponse(data)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
    })

    it('should include all parameters when provided', () => {
      const data = { test: 'value' }
      const message = 'Success message'
      const meta = { page: 2, limit: 10, total: 50, totalPages: 5 }

      const result = successResponse(data, message, meta)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
      expect(body.message).toBe(message)
      expect(body.meta).toEqual(meta)
    })
  })

  describe('createdResponse', () => {
    it('should create a 201 response for new resource', () => {
      const data = { id: 'new-id', name: 'New Resource' }
      const result = createdResponse(data)

      expect(result.status).toBe(201)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
    })

    it('should create a 201 response with message', () => {
      const data = { id: 'new-id' }
      const message = 'Resource created successfully'
      const result = createdResponse(data, message)

      expect(result.status).toBe(201)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
      expect(body.message).toBe(message)
    })

    it('should handle object with nested properties', () => {
      const data = {
        id: 'booking-123',
        workspace: { id: 'ws-1', name: 'Hot Desk A1' },
        user: { id: 'user-1', email: 'test@example.com' },
      }

      const result = createdResponse(data, 'Booking created')

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
      expect(body.message).toBe('Booking created')
    })
  })

  describe('errorResponse', () => {
    it('should create an error response with default 500 status', () => {
      const error = 'Something went wrong'
      const result = errorResponse(error)

      expect(result.status).toBe(500)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should create an error response with custom status', () => {
      const error = 'Custom error'
      const result = errorResponse(error, 418)

      expect(result.status).toBe(418)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle long error messages', () => {
      const error = 'A'.repeat(500)
      const result = errorResponse(error, 400)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle empty string error', () => {
      const error = ''
      const result = errorResponse(error, 400)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe('')
    })
  })

  describe('badRequestResponse', () => {
    it('should create a 400 bad request response', () => {
      const error = 'Invalid request parameters'
      const result = badRequestResponse(error)

      expect(result.status).toBe(400)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle validation error messages', () => {
      const error = 'email: Invalid email address, name: Name is required'
      const result = badRequestResponse(error)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })
  })

  describe('unauthorizedResponse', () => {
    it('should create a 401 unauthorized response with default message', () => {
      const result = unauthorizedResponse()

      expect(result.status).toBe(401)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe('Unauthorized')
    })

    it('should create a 401 unauthorized response with custom message', () => {
      const error = 'Invalid authentication token'
      const result = unauthorizedResponse(error)

      expect(result.status).toBe(401)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle authentication error scenarios', () => {
      const error = 'Session expired. Please log in again.'
      const result = unauthorizedResponse(error)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })
  })

  describe('forbiddenResponse', () => {
    it('should create a 403 forbidden response with default message', () => {
      const result = forbiddenResponse()

      expect(result.status).toBe(403)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe('Forbidden')
    })

    it('should create a 403 forbidden response with custom message', () => {
      const error = 'Insufficient permissions to access this resource'
      const result = forbiddenResponse(error)

      expect(result.status).toBe(403)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle permission denied scenarios', () => {
      const error = 'Admin privileges required'
      const result = forbiddenResponse(error)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })
  })

  describe('notFoundResponse', () => {
    it('should create a 404 not found response with default message', () => {
      const result = notFoundResponse()

      expect(result.status).toBe(404)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe('Resource not found')
    })

    it('should create a 404 not found response with custom message', () => {
      const error = 'Workspace not found'
      const result = notFoundResponse(error)

      expect(result.status).toBe(404)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle specific resource not found messages', () => {
      const error = 'User with ID user-123 not found'
      const result = notFoundResponse(error)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })
  })

  describe('conflictResponse', () => {
    it('should create a 409 conflict response', () => {
      const error = 'Resource already exists'
      const result = conflictResponse(error)

      expect(result.status).toBe(409)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle duplicate resource scenarios', () => {
      const error = 'Email address already registered'
      const result = conflictResponse(error)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle booking conflict scenarios', () => {
      const error = 'Workspace already booked for this time slot'
      const result = conflictResponse(error)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })
  })

  describe('validationErrorResponse', () => {
    it('should create a 422 validation error response', () => {
      const error = 'Validation failed'
      const result = validationErrorResponse(error)

      expect(result.status).toBe(422)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle detailed validation errors', () => {
      const error = 'email: Invalid format, password: Must be at least 8 characters'
      const result = validationErrorResponse(error)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle multiple field validation errors', () => {
      const error = 'name: Required, email: Invalid, phone: Must be 10 digits'
      const result = validationErrorResponse(error)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })
  })

  describe('serverErrorResponse', () => {
    it('should create a 500 server error response with default message', () => {
      const result = serverErrorResponse()

      expect(result.status).toBe(500)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe('Internal server error')
    })

    it('should create a 500 server error response with custom message', () => {
      const error = 'Database connection failed'
      const result = serverErrorResponse(error)

      expect(result.status).toBe(500)
      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle service unavailable scenarios', () => {
      const error = 'Payment service temporarily unavailable'
      const result = serverErrorResponse(error)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })
  })

  describe('ApiResponse Type', () => {
    it('should support generic data types', () => {
      interface User {
        id: string
        email: string
      }

      const response: ApiResponse<User> = {
        success: true,
        data: { id: '1', email: 'test@example.com' },
      }

      expect(response.success).toBe(true)
      expect(response.data?.id).toBe('1')
    })

    it('should support array data types', () => {
      const response: ApiResponse<string[]> = {
        success: true,
        data: ['item1', 'item2'],
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      }

      expect(response.data?.length).toBe(2)
    })

    it('should support optional fields', () => {
      const minimalResponse: ApiResponse = {
        success: true,
      }

      expect(minimalResponse.data).toBeUndefined()
      expect(minimalResponse.error).toBeUndefined()
      expect(minimalResponse.message).toBeUndefined()
      expect(minimalResponse.meta).toBeUndefined()
    })

    it('should support error response structure', () => {
      const errorResp: ApiResponse = {
        success: false,
        error: 'Error message',
      }

      expect(errorResp.success).toBe(false)
      expect(errorResp.error).toBe('Error message')
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in error messages', () => {
      const error = 'Error: <script>alert("xss")</script>'
      const result = errorResponse(error, 400)

      const body = JSON.parse(result.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toBe(error)
    })

    it('should handle unicode characters in messages', () => {
      const message = 'Success: 成功 🎉'
      const result = successResponse({ test: true }, message)

      const body = JSON.parse(result.body as string)
      expect(body.message).toBe(message)
    })

    it('should handle numeric data types', () => {
      const data = 42
      const result = successResponse(data)

      const body = JSON.parse(result.body as string)
      expect(body.data).toBe(42)
    })

    it('should handle boolean data types', () => {
      const data = true
      const result = successResponse(data)

      const body = JSON.parse(result.body as string)
      expect(body.data).toBe(true)
    })

    it('should handle undefined data', () => {
      const data = undefined
      const result = successResponse(data)

      const body = JSON.parse(result.body as string)
      expect(body.data).toBeUndefined()
    })
  })

  describe('Response Consistency', () => {
    it('should always set success to true for success responses', () => {
      const result = successResponse({ test: 'data' })
      const body = JSON.parse(result.body as string)

      expect(body.success).toBe(true)
    })

    it('should always set success to false for error responses', () => {
      const result = errorResponse('Test error')
      const body = JSON.parse(result.body as string)

      expect(body.success).toBe(false)
    })

    it('should never include error field in success responses', () => {
      const result = successResponse({ test: 'data' })
      const body = JSON.parse(result.body as string)

      expect(body).not.toHaveProperty('error')
      expect(body).toHaveProperty('data')
      expect(body.success).toBe(true)
    })

    it('should never include data field in error responses', () => {
      const result = errorResponse('Test error')
      const body = JSON.parse(result.body as string)

      expect(body).not.toHaveProperty('data')
      expect(body).toHaveProperty('error')
      expect(body.success).toBe(false)
    })
  })

  describe('Status Code Correctness', () => {
    it('should use correct status codes for all response types', () => {
      const tests = [
        { fn: successResponse, args: [{}], expectedStatus: 200 },
        { fn: createdResponse, args: [{}], expectedStatus: 201 },
        { fn: badRequestResponse, args: ['error'], expectedStatus: 400 },
        { fn: unauthorizedResponse, args: [], expectedStatus: 401 },
        { fn: forbiddenResponse, args: [], expectedStatus: 403 },
        { fn: notFoundResponse, args: [], expectedStatus: 404 },
        { fn: conflictResponse, args: ['error'], expectedStatus: 409 },
        { fn: validationErrorResponse, args: ['error'], expectedStatus: 422 },
        { fn: serverErrorResponse, args: [], expectedStatus: 500 },
      ]

      tests.forEach(({ fn, args, expectedStatus }) => {
        const result = (fn as any)(...args)
        expect(result.status).toBe(expectedStatus)
      })
    })
  })
})
