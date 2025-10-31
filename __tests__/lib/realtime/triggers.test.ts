/**
 * Tests for Server-side Event Triggers
 */

import {
  triggerBookingCreated,
  triggerBookingUpdated,
  triggerBookingCancelled,
  triggerBookingCheckedIn,
  triggerBookingCheckedOut,
  triggerOrderCreated,
  triggerOrderStatusChanged,
  triggerOrderReady,
  triggerAvailabilityChanged,
  triggerWorkspaceOccupied,
  triggerWorkspaceFreed,
  triggerMultipleEvents,
} from '@/lib/realtime/triggers';

// Mock Pusher client
const mockTrigger = jest.fn().mockResolvedValue(undefined);
const mockGetPusherServer = jest.fn(() => ({
  trigger: mockTrigger,
}));

jest.mock('@/lib/realtime/client', () => ({
  getPusherServer: () => mockGetPusherServer(),
  isPusherConfigured: jest.fn(() => true),
}));

describe('Real-time Event Triggers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Booking Events', () => {
    describe('triggerBookingCreated', () => {
      it('should trigger event on bookings and user channels', async () => {
        const payload = {
          bookingId: 'booking-123',
          workspaceId: 'workspace-456',
          userId: 'user-789',
          startTime: '2025-01-01T10:00:00Z',
          endTime: '2025-01-01T12:00:00Z',
          type: 'hot_desk' as const,
        };

        const result = await triggerBookingCreated(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledTimes(2);
        expect(mockTrigger).toHaveBeenCalledWith('bookings', 'booking:created', payload);
        expect(mockTrigger).toHaveBeenCalledWith('private-user-user-789', 'booking:created', payload);
      });

      it('should handle trigger failures', async () => {
        mockTrigger.mockRejectedValueOnce(new Error('Network error'));

        const payload = {
          bookingId: 'booking-123',
          workspaceId: 'workspace-456',
          userId: 'user-789',
          startTime: '2025-01-01T10:00:00Z',
          endTime: '2025-01-01T12:00:00Z',
          type: 'hot_desk' as const,
        };

        const result = await triggerBookingCreated(payload);

        expect(result).toBe(false);
      });
    });

    describe('triggerBookingUpdated', () => {
      it('should trigger event on bookings channel', async () => {
        const payload = {
          bookingId: 'booking-123',
          workspaceId: 'workspace-456',
          status: 'confirmed' as const,
          updatedAt: '2025-01-01T10:00:00Z',
        };

        const result = await triggerBookingUpdated(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledWith('bookings', 'booking:updated', payload);
      });
    });

    describe('triggerBookingCancelled', () => {
      it('should trigger event on bookings and user channels', async () => {
        const payload = {
          bookingId: 'booking-123',
          workspaceId: 'workspace-456',
          userId: 'user-789',
          cancelledAt: '2025-01-01T10:00:00Z',
        };

        const result = await triggerBookingCancelled(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledTimes(2);
      });
    });

    describe('triggerBookingCheckedIn', () => {
      it('should trigger event on bookings and user channels', async () => {
        const payload = {
          bookingId: 'booking-123',
          workspaceId: 'workspace-456',
          userId: 'user-789',
          checkedInAt: '2025-01-01T10:00:00Z',
        };

        const result = await triggerBookingCheckedIn(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledTimes(2);
      });
    });

    describe('triggerBookingCheckedOut', () => {
      it('should trigger event on bookings and user channels', async () => {
        const payload = {
          bookingId: 'booking-123',
          workspaceId: 'workspace-456',
          userId: 'user-789',
          checkedOutAt: '2025-01-01T12:00:00Z',
          actualEndTime: '2025-01-01T12:00:00Z',
        };

        const result = await triggerBookingCheckedOut(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Order Events', () => {
    describe('triggerOrderCreated', () => {
      it('should trigger event on orders, user, and admin channels', async () => {
        const payload = {
          orderId: 'order-123',
          userId: 'user-789',
          status: 'pending' as const,
          itemCount: 3,
          total: 25.50,
        };

        const result = await triggerOrderCreated(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledTimes(3);
        expect(mockTrigger).toHaveBeenCalledWith('orders', 'order:created', payload);
        expect(mockTrigger).toHaveBeenCalledWith('private-user-user-789', 'order:created', payload);
        expect(mockTrigger).toHaveBeenCalledWith('private-admin', 'order:created', payload);
      });
    });

    describe('triggerOrderStatusChanged', () => {
      it('should trigger event on orders and user channels', async () => {
        const payload = {
          orderId: 'order-123',
          userId: 'user-789',
          oldStatus: 'pending',
          newStatus: 'preparing' as const,
          updatedAt: '2025-01-01T10:00:00Z',
        };

        const result = await triggerOrderStatusChanged(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledTimes(2);
      });
    });

    describe('triggerOrderReady', () => {
      it('should trigger event on orders and user channels', async () => {
        const payload = {
          orderId: 'order-123',
          userId: 'user-789',
          orderNumber: '#123',
          readyAt: '2025-01-01T10:00:00Z',
        };

        const result = await triggerOrderReady(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Availability Events', () => {
    describe('triggerAvailabilityChanged', () => {
      it('should trigger event on availability channel', async () => {
        const payload = {
          workspaceId: 'workspace-456',
          available: true,
          capacity: 10,
          occupied: 5,
        };

        const result = await triggerAvailabilityChanged(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledWith('availability', 'availability:changed', payload);
      });
    });

    describe('triggerWorkspaceOccupied', () => {
      it('should trigger event on availability channel', async () => {
        const payload = {
          workspaceId: 'workspace-456',
          bookingId: 'booking-123',
          occupiedUntil: '2025-01-01T12:00:00Z',
        };

        const result = await triggerWorkspaceOccupied(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledWith('availability', 'workspace:occupied', payload);
      });
    });

    describe('triggerWorkspaceFreed', () => {
      it('should trigger event on availability channel', async () => {
        const payload = {
          workspaceId: 'workspace-456',
          freedAt: '2025-01-01T12:00:00Z',
          nextBooking: {
            bookingId: 'booking-789',
            startTime: '2025-01-01T14:00:00Z',
          },
        };

        const result = await triggerWorkspaceFreed(payload);

        expect(result).toBe(true);
        expect(mockTrigger).toHaveBeenCalledWith('availability', 'workspace:freed', payload);
      });
    });
  });

  describe('triggerMultipleEvents', () => {
    it('should trigger multiple events in batch', async () => {
      const events = [
        {
          channel: 'bookings',
          event: 'booking:created' as const,
          data: { bookingId: 'booking-1' },
        },
        {
          channel: 'orders',
          event: 'order:created' as const,
          data: { orderId: 'order-1' },
        },
      ];

      const results = await triggerMultipleEvents(events);

      expect(results).toEqual([true, true]);
      expect(mockTrigger).toHaveBeenCalledTimes(2);
    });

    it('should handle batch trigger failures', async () => {
      mockTrigger.mockRejectedValueOnce(new Error('Network error'));

      const events = [
        {
          channel: 'bookings',
          event: 'booking:created' as const,
          data: { bookingId: 'booking-1' },
        },
      ];

      const results = await triggerMultipleEvents(events);

      expect(results).toEqual([false]);
    });
  });

  describe('Pusher not configured', () => {
    beforeEach(() => {
      const { isPusherConfigured } = require('@/lib/realtime/client');
      isPusherConfigured.mockReturnValue(false);
    });

    it('should return false when Pusher not configured', async () => {
      const payload = {
        bookingId: 'booking-123',
        workspaceId: 'workspace-456',
        status: 'confirmed' as const,
        updatedAt: '2025-01-01T10:00:00Z',
      };

      const result = await triggerBookingUpdated(payload);

      expect(result).toBe(false);
      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });
});
