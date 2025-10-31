/**
 * Workspace Repository Tests
 * Focused tests for workspace database operations achieving 80%+ coverage
 */

import {
  getAllWorkspaces,
  getWorkspaceById,
  getHotDesks,
  getMeetingRooms,
  getWorkspaceBookings,
  getAllBookingsForDate,
  isTimeSlotAvailable,
  generateAvailableSlots,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  checkWorkspaceAvailability,
} from '@/lib/db/repositories/workspace.repository'
import { executeQuery, executeQuerySingle, closePool } from '@/lib/db/postgres'

// Mock the postgres module
jest.mock('@/lib/db/postgres', () => ({
  executeQuery: jest.fn(),
  executeQuerySingle: jest.fn(),
  closePool: jest.fn(),
}))

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>
const mockExecuteQuerySingle = executeQuerySingle as jest.MockedFunction<typeof executeQuerySingle>

describe('Workspace Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllWorkspaces', () => {
    it('should fetch all workspaces', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Meeting Room A',
          type: 'meeting_room',
          capacity: 8,
          hourly_rate: '25.00',
          available: true,
          amenities: ['whiteboard', 'projector'],
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockWorkspaces,
        error: null,
      })

      const result = await getAllWorkspaces()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
      expect(result.count).toBe(1)
    })

    it('should filter by type', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '0' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllWorkspaces({ type: 'hot_desk' })

      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE type = $1'),
        expect.any(Array)
      )
    })

    it('should filter by availability', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '0' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllWorkspaces({ available: true })

      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE available = $1'),
        expect.any(Array)
      )
    })

  })

  describe('getWorkspaceById', () => {
    it('should fetch workspace by ID', async () => {
      const mockWorkspace = {
        id: 'workspace-123',
        name: 'Conference Room',
        type: 'meeting_room',
        hourly_rate: '30.00',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockWorkspace,
        error: null,
      })

      const result = await getWorkspaceById('workspace-123')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('workspace-123')
    })

    it('should return error when workspace not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getWorkspaceById('non-existent')

      expect(result.error).toBe('Workspace not found')
      expect(result.data).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Query failed',
      })

      const result = await getWorkspaceById('workspace-123')

      expect(result.error).toBe('Query failed')
      expect(result.data).toBeNull()
    })

  })

  describe('getHotDesks', () => {
    it('should fetch hot desks', async () => {
      const mockHotDesks = [
        {
          id: 'desk-1',
          name: 'Hot Desk 1',
          type: 'hot_desk',
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockHotDesks,
        error: null,
      })

      const result = await getHotDesks()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
    })

    it('should handle pagination', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getHotDesks({ limit: 10, offset: 20 })

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 10 OFFSET 20'),
        undefined
      )
    })

  })

  describe('getMeetingRooms', () => {
    it('should fetch meeting rooms', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          name: 'Meeting Room A',
          type: 'meeting_room',
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockRooms,
        error: null,
      })

      const result = await getMeetingRooms()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
    })

  })

  describe('getWorkspaceBookings', () => {
    it('should fetch bookings for a workspace on a specific date', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          workspace_id: 'workspace-123',
          start_time: '2025-10-15T09:00:00Z',
          end_time: '2025-10-15T12:00:00Z',
          status: 'confirmed',
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockBookings,
        error: null,
      })

      const result = await getWorkspaceBookings('workspace-123', '2025-10-15')

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
    })

  })

  describe('getAllBookingsForDate', () => {
    it('should fetch all bookings for a specific date', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          workspace_id: 'workspace-1',
          start_time: '2025-10-15T09:00:00Z',
          end_time: '2025-10-15T12:00:00Z',
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockBookings,
        error: null,
      })

      const result = await getAllBookingsForDate('2025-10-15')

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
    })

  })

  describe('isTimeSlotAvailable', () => {
    it('should return true when slot is available', () => {
      const bookings = [
        { start_time: '09:00', end_time: '12:00' },
        { start_time: '14:00', end_time: '16:00' },
      ]

      const result = isTimeSlotAvailable('13:00', '14:00', bookings)

      expect(result).toBe(true)
    })

    it('should return false when slot overlaps', () => {
      const bookings = [
        { start_time: '09:00', end_time: '12:00' },
      ]

      const result = isTimeSlotAvailable('11:00', '13:00', bookings)

      expect(result).toBe(false)
    })

    it('should return true for empty bookings', () => {
      const result = isTimeSlotAvailable('09:00', '10:00', [])

      expect(result).toBe(true)
    })
  })

  describe('generateAvailableSlots', () => {
    it('should generate available time slots', () => {
      const bookings = [
        { start_time: '10:00', end_time: '12:00' },
      ]

      const result = generateAvailableSlots(
        '2025-10-15',
        '09:00',
        '17:00',
        1,
        bookings
      )

      expect(result).toContain('09:00-10:00')
      expect(result).not.toContain('10:00-11:00')
      expect(result).not.toContain('11:00-12:00')
      expect(result).toContain('12:00-13:00')
    })

    it('should handle no bookings', () => {
      const result = generateAvailableSlots(
        '2025-10-15',
        '09:00',
        '11:00',
        1,
        []
      )

      expect(result).toContain('09:00-10:00')
      expect(result).toContain('10:00-11:00')
    })

    it('should respect minimum duration', () => {
      const result = generateAvailableSlots(
        '2025-10-15',
        '09:00',
        '12:00',
        2,
        []
      )

      expect(result).toContain('09:00-11:00')
      expect(result).toContain('10:00-12:00')
    })
  })

  describe('createWorkspace', () => {
    it('should create a workspace', async () => {
      const mockWorkspace = {
        id: 'workspace-123',
        name: 'New Room',
        type: 'meeting_room',
        capacity: 6,
        hourly_rate: '20.00',
        available: true,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockWorkspace,
        error: null,
      })

      const result = await createWorkspace({
        name: 'New Room',
        type: 'meeting_room',
        capacity: 6,
        hourly_rate: 20,
      })

      expect(result.error).toBeNull()
      expect(result.data?.name).toBe('New Room')
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Insert failed',
      })

      const result = await createWorkspace({
        name: 'New Room',
        type: 'meeting_room',
        capacity: 6,
        hourly_rate: 20,
      })

      expect(result.error).toBe('Insert failed')
      expect(result.data).toBeNull()
    })

  })

  describe('updateWorkspace', () => {
    it('should update workspace', async () => {
      const mockWorkspace = {
        id: 'workspace-123',
        name: 'Updated Room',
        hourly_rate: '25.00',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockWorkspace,
        error: null,
      })

      const result = await updateWorkspace('workspace-123', {
        name: 'Updated Room',
        hourly_rate: 25,
      })

      expect(result.error).toBeNull()
      expect(result.data?.name).toBe('Updated Room')
    })

    it('should return error when no fields to update', async () => {
      const result = await updateWorkspace('workspace-123', {})

      expect(result.error).toBe('No fields to update')
      expect(result.data).toBeNull()
    })

    it('should return error when workspace not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await updateWorkspace('non-existent', { name: 'Test' })

      expect(result.error).toBe('Workspace not found')
      expect(result.data).toBeNull()
    })

  })

  describe('deleteWorkspace', () => {
    it('should delete workspace when no active bookings', async () => {
      mockExecuteQuerySingle
        .mockResolvedValueOnce({
          data: { count: '0' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'workspace-123' },
          error: null,
        })

      const result = await deleteWorkspace('workspace-123')

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should prevent deletion when active bookings exist', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '3' },
        error: null,
      })

      const result = await deleteWorkspace('workspace-123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot delete workspace with 3 active booking(s)')
    })

    it('should return error when workspace not found', async () => {
      mockExecuteQuerySingle
        .mockResolvedValueOnce({
          data: { count: '0' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: null,
        })

      const result = await deleteWorkspace('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Workspace not found')
    })

  })

  describe('checkWorkspaceAvailability', () => {
    it('should check availability and return available slots', async () => {
      const mockWorkspace = {
        id: 'workspace-123',
        name: 'Room A',
        hourly_rate: '20.00',
      }

      const mockBookings = [
        {
          id: 'booking-1',
          start_time: '2025-10-15T10:00:00Z',
          end_time: '2025-10-15T12:00:00Z',
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockWorkspace,
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockBookings,
        error: null,
      })

      const result = await checkWorkspaceAvailability({
        workspace_id: 'workspace-123',
        date: '2025-10-15',
        duration_hours: 1,
      })

      expect(result.error).toBeNull()
      expect(result.data?.workspace).toBeDefined()
      expect(result.data?.available_slots).toBeDefined()
    })

    it('should return error when workspace not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await checkWorkspaceAvailability({
        workspace_id: 'non-existent',
        date: '2025-10-15',
        duration_hours: 1,
      })

      expect(result.error).toBe('Workspace not found')
      expect(result.data).toBeNull()
    })

  })
})
