import { NextResponse } from 'next/server'

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, message?: string, meta?: ApiResponse['meta']) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message,
      meta,
    },
    { status: 200 }
  )
}

/**
 * Create a created resource response (201)
 */
export function createdResponse<T>(data: T, message?: string) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message,
    },
    { status: 201 }
  )
}

/**
 * Create an error response
 */
export function errorResponse(error: string, status: number = 500) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error,
    },
    { status }
  )
}

/**
 * Create a bad request response (400)
 */
export function badRequestResponse(error: string) {
  return errorResponse(error, 400)
}

/**
 * Create an unauthorized response (401)
 */
export function unauthorizedResponse(error: string = 'Unauthorized') {
  return errorResponse(error, 401)
}

/**
 * Create a forbidden response (403)
 */
export function forbiddenResponse(error: string = 'Forbidden') {
  return errorResponse(error, 403)
}

/**
 * Create a not found response (404)
 */
export function notFoundResponse(error: string = 'Resource not found') {
  return errorResponse(error, 404)
}

/**
 * Create a conflict response (409)
 */
export function conflictResponse(error: string) {
  return errorResponse(error, 409)
}

/**
 * Create a validation error response (422)
 */
export function validationErrorResponse(error: string) {
  return errorResponse(error, 422)
}

/**
 * Create an internal server error response (500)
 */
export function serverErrorResponse(error: string = 'Internal server error') {
  return errorResponse(error, 500)
}
