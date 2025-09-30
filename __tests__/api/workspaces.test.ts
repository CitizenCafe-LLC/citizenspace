/**
 * Integration tests for Workspace Management APIs
 * Tests cover all endpoints with various scenarios
 * Target: 80%+ code coverage
 */

import { NextRequest } from 'next/server'
import { GET as getWorkspaces } from '@/app/api/workspaces/route'
import { GET as getWorkspaceById } from '@/app/api/workspaces/[id]/route'
import { GET as getHotDesks } from '@/app/api/workspaces/hot-desks/route'
import { GET as getMeetingRooms } from '@/app/api/workspaces/meeting-rooms/route'
import { GET as checkAvailability } from '@/app/api/workspaces/availability/route'

// Mock the Supabase client
jest.mock('@/lib/db/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn((table: string) => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          eq: jest.fn(),
          in: jest.fn(),
          order: jest.fn(),
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(),
          contains: jest.fn(),
          eq: jest.fn(),
          order: jest.fn(),
          range: jest.fn(),
        })),
        lte: jest.fn(() => ({
          contains: jest.fn(),
          eq: jest.fn(),
          order: jest.fn(),
          range: jest.fn(),
        })),
        contains: jest.fn(() => ({ eq: jest.fn(), order: jest.fn(), range: jest.fn() })),
        order: jest.fn(() => ({ range: jest.fn() })),
        range: jest.fn(),
        in: jest.fn(() => ({ order: jest.fn() })),
      })),
    })),
  })),
}))

// Mock repository functions
jest.mock('@/lib/db/repositories/workspace.repository')

import * as workspaceRepo from '@/lib/db/repositories/workspace.repository'

// Helper to create mock NextRequest
function createMockRequest(url: string): NextRequest {
  const fullUrl = new URL(url, 'http://localhost:3000')
  return {
    nextUrl: {
      searchParams: fullUrl.searchParams,
    },
    url: fullUrl.toString(),
    method: 'GET',
  } as NextRequest
}

// Mock workspace data
const mockWorkspaces = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Hot Desk 1',
    type: 'hot-desk' as const,
    resource_category: 'desk' as const,
    description: 'Comfortable hot desk with power outlets',
    capacity: 1,
    base_price_hourly: 2.5,
    requires_credits: false,
    min_duration: 1,
    max_duration: 8,
    amenities: ['WiFi', 'Power', 'Monitor'],
    images: ['/images/desk1.jpg'],
    available: true,
    floor_location: 'Main Floor',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    name: 'Focus Room',
    type: 'focus-room' as const,
    resource_category: 'meeting-room' as const,
    description: 'Private room for focused work',
    capacity: 4,
    base_price_hourly: 15.0,
    requires_credits: true,
    min_duration: 1,
    max_duration: 4,
    amenities: ['WiFi', 'Whiteboard', 'Monitor', 'Conference Phone'],
    images: ['/images/room1.jpg'],
    available: true,
    floor_location: 'Second Floor',
    created_at: '2025-01-01T00:00:00Z',
  },
]

const mockBookings = [
  {
    id: '323e4567-e89b-12d3-a456-426614174002',
    workspace_id: '123e4567-e89b-12d3-a456-426614174000',
    booking_date: '2025-10-01',
    start_time: '09:00',
    end_time: '11:00',
    status: 'confirmed' as const,
  },
  {
    id: '423e4567-e89b-12d3-a456-426614174003',
    workspace_id: '123e4567-e89b-12d3-a456-426614174000',
    booking_date: '2025-10-01',
    start_time: '14:00',
    end_time: '16:00',
    status: 'confirmed' as const,
  },
]

describe('Workspace Management APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/workspaces', () => {
    it('should return all workspaces with pagination', async () => {
      ;(workspaceRepo.getAllWorkspaces as jest.Mock).mockResolvedValue({
        data: mockWorkspaces,
        error: null,
        count: 2,
      })

      const request = createMockRequest('/api/workspaces?page=1&limit=20')
      const response = await getWorkspaces(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.meta).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      })
    })

    it('should filter workspaces by type', async () => {
      ;(workspaceRepo.getAllWorkspaces as jest.Mock).mockResolvedValue({
        data: [mockWorkspaces[0]],
        error: null,
        count: 1,
      })

      const request = createMockRequest('/api/workspaces?type=hot-desk')
      const response = await getWorkspaces(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].type).toBe('hot-desk')
    })

    it('should filter workspaces by capacity range', async () => {
      ;(workspaceRepo.getAllWorkspaces as jest.Mock).mockResolvedValue({
        data: [mockWorkspaces[1]],
        error: null,
        count: 1,
      })

      const request = createMockRequest('/api/workspaces?min_capacity=2&max_capacity=5')
      const response = await getWorkspaces(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data[0].capacity).toBeGreaterThanOrEqual(2)
      expect(data.data[0].capacity).toBeLessThanOrEqual(5)
    })

    it('should filter workspaces by price range', async () => {
      ;(workspaceRepo.getAllWorkspaces as jest.Mock).mockResolvedValue({
        data: [mockWorkspaces[0]],
        error: null,
        count: 1,
      })

      const request = createMockRequest('/api/workspaces?min_price=2&max_price=5')
      const response = await getWorkspaces(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data[0].base_price_hourly).toBeGreaterThanOrEqual(2)
      expect(data.data[0].base_price_hourly).toBeLessThanOrEqual(5)
    })

    it('should filter workspaces by amenities', async () => {
      ;(workspaceRepo.getAllWorkspaces as jest.Mock).mockResolvedValue({
        data: [mockWorkspaces[1]],
        error: null,
        count: 1,
      })

      const request = createMockRequest('/api/workspaces?amenities=Whiteboard,Monitor')
      const response = await getWorkspaces(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data[0].amenities).toContain('Whiteboard')
      expect(data.data[0].amenities).toContain('Monitor')
    })

    it('should return 400 for invalid pagination parameters', async () => {
      const request = createMockRequest('/api/workspaces?page=-1')
      const response = await getWorkspaces(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid pagination')
    })

    it('should return 500 on database error', async () => {
      ;(workspaceRepo.getAllWorkspaces as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Database connection failed',
        count: 0,
      })

      const request = createMockRequest('/api/workspaces')
      const response = await getWorkspaces(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/workspaces/:id', () => {
    it('should return workspace by ID', async () => {
      ;(workspaceRepo.getWorkspaceById as jest.Mock).mockResolvedValue({
        data: mockWorkspaces[0],
        error: null,
      })

      const request = createMockRequest(`/api/workspaces/${mockWorkspaces[0].id}`)
      const response = await getWorkspaceById(request, { params: { id: mockWorkspaces[0].id } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe(mockWorkspaces[0].id)
      expect(data.data.name).toBe('Hot Desk 1')
    })

    it('should return 404 for non-existent workspace', async () => {
      ;(workspaceRepo.getWorkspaceById as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      })

      const request = createMockRequest('/api/workspaces/123e4567-e89b-12d3-a456-426614174999')
      const response = await getWorkspaceById(request, {
        params: { id: '123e4567-e89b-12d3-a456-426614174999' },
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('not found')
    })

    it('should return 400 for invalid UUID', async () => {
      const request = createMockRequest('/api/workspaces/invalid-id')
      const response = await getWorkspaceById(request, { params: { id: 'invalid-id' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid')
    })
  })

  describe('GET /api/workspaces/hot-desks', () => {
    it('should return only hot desks', async () => {
      ;(workspaceRepo.getHotDesks as jest.Mock).mockResolvedValue({
        data: [mockWorkspaces[0]],
        error: null,
        count: 1,
      })

      const request = createMockRequest('/api/workspaces/hot-desks')
      const response = await getHotDesks(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].resource_category).toBe('desk')
    })

    it('should paginate hot desks', async () => {
      ;(workspaceRepo.getHotDesks as jest.Mock).mockResolvedValue({
        data: [mockWorkspaces[0]],
        error: null,
        count: 10,
      })

      const request = createMockRequest('/api/workspaces/hot-desks?page=2&limit=5')
      const response = await getHotDesks(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.meta.page).toBe(2)
      expect(data.meta.limit).toBe(5)
      expect(data.meta.totalPages).toBe(2)
    })
  })

  describe('GET /api/workspaces/meeting-rooms', () => {
    it('should return only meeting rooms', async () => {
      ;(workspaceRepo.getMeetingRooms as jest.Mock).mockResolvedValue({
        data: [mockWorkspaces[1]],
        error: null,
        count: 1,
      })

      const request = createMockRequest('/api/workspaces/meeting-rooms')
      const response = await getMeetingRooms(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].resource_category).toBe('meeting-room')
    })
  })

  describe('GET /api/workspaces/availability', () => {
    it('should check availability for specific workspace and time slot', async () => {
      ;(workspaceRepo.checkWorkspaceAvailability as jest.Mock).mockResolvedValue({
        data: [
          {
            workspace: mockWorkspaces[0],
            is_available: true,
            slots: [{ start_time: '09:00', end_time: '12:00', available: true }],
            total_available_hours: 3,
          },
        ],
        error: null,
      })

      const request = createMockRequest(
        '/api/workspaces/availability?date=2025-10-01&workspace_id=123e4567-e89b-12d3-a456-426614174000&start_time=09:00&end_time=12:00'
      )
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.workspaces[0].is_available).toBe(true)
      expect(data.data.summary.available_workspaces).toBe(1)
    })

    it('should return all available slots for a date', async () => {
      ;(workspaceRepo.checkWorkspaceAvailability as jest.Mock).mockResolvedValue({
        data: [
          {
            workspace: mockWorkspaces[0],
            is_available: true,
            slots: [
              { start_time: '07:00', end_time: '09:00', available: true },
              { start_time: '11:00', end_time: '14:00', available: true },
              { start_time: '16:00', end_time: '22:00', available: true },
            ],
            total_available_hours: 11,
          },
        ],
        error: null,
      })

      const request = createMockRequest('/api/workspaces/availability?date=2025-10-01')
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.workspaces[0].available_slots).toHaveLength(3)
      expect(data.data.workspaces[0].total_available_hours).toBe(11)
    })

    it('should return 400 for date in the past', async () => {
      const request = createMockRequest('/api/workspaces/availability?date=2020-01-01')
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('future')
    })

    it('should return 400 for missing required date parameter', async () => {
      const request = createMockRequest('/api/workspaces/availability')
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid parameters')
    })

    it('should return 400 for invalid date format', async () => {
      const request = createMockRequest('/api/workspaces/availability?date=2025/10/01')
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('YYYY-MM-DD')
    })

    it('should return 400 for invalid time format', async () => {
      const request = createMockRequest(
        '/api/workspaces/availability?date=2025-10-01&start_time=9am&end_time=5pm'
      )
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('HH:MM')
    })

    it('should return 400 when end time is before start time', async () => {
      const request = createMockRequest(
        '/api/workspaces/availability?date=2025-10-01&start_time=15:00&end_time=09:00'
      )
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('after start time')
    })

    it('should return 400 for times outside business hours', async () => {
      const request = createMockRequest(
        '/api/workspaces/availability?date=2025-10-01&start_time=06:00&end_time=09:00'
      )
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('7:00 AM and 10:00 PM')
    })

    it('should filter by resource category', async () => {
      ;(workspaceRepo.checkWorkspaceAvailability as jest.Mock).mockResolvedValue({
        data: [
          {
            workspace: mockWorkspaces[1],
            is_available: true,
            slots: [],
            total_available_hours: 0,
          },
        ],
        error: null,
      })

      const request = createMockRequest(
        '/api/workspaces/availability?date=2025-10-01&resource_category=meeting-room'
      )
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.workspaces[0].workspace.resource_category).toBe('meeting-room')
    })
  })

  describe('Availability Logic - Double Booking Prevention', () => {
    it('should prevent double booking for overlapping time slots', async () => {
      ;(workspaceRepo.checkWorkspaceAvailability as jest.Mock).mockResolvedValue({
        data: [
          {
            workspace: mockWorkspaces[0],
            is_available: false,
            slots: [],
            total_available_hours: 0,
          },
        ],
        error: null,
      })

      // Try to book 09:00-11:00 when it's already booked
      const request = createMockRequest(
        '/api/workspaces/availability?date=2025-10-01&workspace_id=123e4567-e89b-12d3-a456-426614174000&start_time=09:00&end_time=11:00'
      )
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.workspaces[0].is_available).toBe(false)
    })

    it('should allow booking in gap between existing bookings', async () => {
      ;(workspaceRepo.checkWorkspaceAvailability as jest.Mock).mockResolvedValue({
        data: [
          {
            workspace: mockWorkspaces[0],
            is_available: true,
            slots: [{ start_time: '11:00', end_time: '14:00', available: true }],
            total_available_hours: 3,
          },
        ],
        error: null,
      })

      // Book 11:00-14:00 which is between 09:00-11:00 and 14:00-16:00
      const request = createMockRequest(
        '/api/workspaces/availability?date=2025-10-01&workspace_id=123e4567-e89b-12d3-a456-426614174000&start_time=11:00&end_time=14:00'
      )
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.workspaces[0].is_available).toBe(true)
    })
  })
})
