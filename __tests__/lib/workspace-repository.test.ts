/**
 * Unit tests for workspace repository functions
 */

import {
  isTimeSlotAvailable,
  generateAvailableSlots,
} from '@/lib/db/repositories/workspace.repository';
import { Booking, Workspace } from '@/lib/db/types';

describe('Workspace Repository', () => {
  const mockWorkspace: Workspace = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Workspace',
    type: 'hot-desk',
    resource_category: 'desk',
    description: 'Test description',
    capacity: 1,
    base_price_hourly: 2.5,
    requires_credits: false,
    min_duration: 1,
    max_duration: 8,
    amenities: ['WiFi'],
    images: [],
    available: true,
    floor_location: 'Main',
    created_at: '2025-01-01T00:00:00Z',
  };

  const mockBookings: Partial<Booking>[] = [
    {
      id: '1',
      workspace_id: mockWorkspace.id,
      booking_date: '2025-10-01',
      start_time: '09:00',
      end_time: '11:00',
      status: 'confirmed',
    },
    {
      id: '2',
      workspace_id: mockWorkspace.id,
      booking_date: '2025-10-01',
      start_time: '14:00',
      end_time: '16:00',
      status: 'confirmed',
    },
  ];

  describe('isTimeSlotAvailable', () => {
    it('should return true when no bookings exist', () => {
      const result = isTimeSlotAvailable([], '09:00', '17:00');
      expect(result).toBe(true);
    });

    it('should return false when time slot overlaps with booking', () => {
      const result = isTimeSlotAvailable(
        mockBookings as Booking[],
        '09:00',
        '10:00'
      );
      expect(result).toBe(false);
    });

    it('should return false when time slot partially overlaps at start', () => {
      const result = isTimeSlotAvailable(
        mockBookings as Booking[],
        '08:00',
        '09:30'
      );
      expect(result).toBe(false);
    });

    it('should return false when time slot partially overlaps at end', () => {
      const result = isTimeSlotAvailable(
        mockBookings as Booking[],
        '10:30',
        '12:00'
      );
      expect(result).toBe(false);
    });

    it('should return false when time slot completely contains booking', () => {
      const result = isTimeSlotAvailable(
        mockBookings as Booking[],
        '08:00',
        '12:00'
      );
      expect(result).toBe(false);
    });

    it('should return false when booking completely contains time slot', () => {
      const result = isTimeSlotAvailable(
        mockBookings as Booking[],
        '09:30',
        '10:30'
      );
      expect(result).toBe(false);
    });

    it('should return true when time slot is in gap between bookings', () => {
      const result = isTimeSlotAvailable(
        mockBookings as Booking[],
        '11:00',
        '14:00'
      );
      expect(result).toBe(true);
    });

    it('should return true when time slot is before all bookings', () => {
      const result = isTimeSlotAvailable(
        mockBookings as Booking[],
        '07:00',
        '09:00'
      );
      expect(result).toBe(true);
    });

    it('should return true when time slot is after all bookings', () => {
      const result = isTimeSlotAvailable(
        mockBookings as Booking[],
        '16:00',
        '18:00'
      );
      expect(result).toBe(true);
    });

    it('should handle edge case: slot ends exactly when booking starts', () => {
      const result = isTimeSlotAvailable(
        mockBookings as Booking[],
        '08:00',
        '09:00'
      );
      expect(result).toBe(true);
    });

    it('should handle edge case: slot starts exactly when booking ends', () => {
      const result = isTimeSlotAvailable(
        mockBookings as Booking[],
        '11:00',
        '12:00'
      );
      expect(result).toBe(true);
    });
  });

  describe('generateAvailableSlots', () => {
    it('should generate full day slot when no bookings', () => {
      const slots = generateAvailableSlots(mockWorkspace, [], '2025-10-01');

      expect(slots).toHaveLength(1);
      expect(slots[0].available).toBe(true);
      expect(slots[0].start_time).toBe('07:00');
      expect(slots[0].end_time).toBe('22:00');
    });

    it('should split day into available and unavailable slots', () => {
      const slots = generateAvailableSlots(
        mockWorkspace,
        mockBookings as Booking[],
        '2025-10-01'
      );

      // Should have: available before first booking, first booking, gap between, second booking, available after
      expect(slots.length).toBeGreaterThan(0);

      const availableSlots = slots.filter(s => s.available);
      const unavailableSlots = slots.filter(s => !s.available);

      expect(availableSlots.length).toBeGreaterThan(0);
      expect(unavailableSlots.length).toBe(2); // Two bookings
    });

    it('should respect minimum duration for available slots', () => {
      const bookings: Partial<Booking>[] = [
        {
          id: '1',
          workspace_id: mockWorkspace.id,
          booking_date: '2025-10-01',
          start_time: '09:00',
          end_time: '09:30', // Only 30 min gap before next
        },
        {
          id: '2',
          workspace_id: mockWorkspace.id,
          booking_date: '2025-10-01',
          start_time: '10:00',
          end_time: '16:00',
        },
      ];

      const slots = generateAvailableSlots(
        mockWorkspace,
        bookings as Booking[],
        '2025-10-01',
        1 // Minimum 1 hour
      );

      const availableSlots = slots.filter(s => s.available);

      // The 30-minute gap should not appear as available slot
      const shortGap = availableSlots.find(
        s => s.start_time === '09:30' && s.end_time === '10:00'
      );
      expect(shortGap).toBeUndefined();
    });

    it('should include workspace information in slots', () => {
      const slots = generateAvailableSlots(
        mockWorkspace,
        mockBookings as Booking[],
        '2025-10-01'
      );

      slots.forEach(slot => {
        expect(slot.workspace_id).toBe(mockWorkspace.id);
        expect(slot.workspace_name).toBe(mockWorkspace.name);
      });
    });

    it('should handle bookings at day boundaries', () => {
      const bookings: Partial<Booking>[] = [
        {
          id: '1',
          workspace_id: mockWorkspace.id,
          booking_date: '2025-10-01',
          start_time: '07:00',
          end_time: '08:00',
        },
        {
          id: '2',
          workspace_id: mockWorkspace.id,
          booking_date: '2025-10-01',
          start_time: '21:00',
          end_time: '22:00',
        },
      ];

      const slots = generateAvailableSlots(
        mockWorkspace,
        bookings as Booking[],
        '2025-10-01'
      );

      const availableSlots = slots.filter(s => s.available);
      expect(availableSlots.length).toBeGreaterThan(0);

      // Should have a long available slot in the middle
      const midDaySlot = availableSlots.find(
        s => s.start_time === '08:00' && s.end_time === '21:00'
      );
      expect(midDaySlot).toBeDefined();
    });

    it('should sort bookings by start time', () => {
      const unsortedBookings: Partial<Booking>[] = [
        {
          id: '2',
          workspace_id: mockWorkspace.id,
          booking_date: '2025-10-01',
          start_time: '14:00',
          end_time: '16:00',
        },
        {
          id: '1',
          workspace_id: mockWorkspace.id,
          booking_date: '2025-10-01',
          start_time: '09:00',
          end_time: '11:00',
        },
      ];

      const slots = generateAvailableSlots(
        mockWorkspace,
        unsortedBookings as Booking[],
        '2025-10-01'
      );

      // Slots should still be generated correctly despite unsorted input
      expect(slots.length).toBeGreaterThan(0);
    });
  });
});