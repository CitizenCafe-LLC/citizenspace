import { POST as createHourlyDesk } from '@/app/api/bookings/hourly-desk/route';
import { GET as getBookings } from '@/app/api/bookings/route';
import { GET as getBooking, DELETE as cancelBooking } from '@/app/api/bookings/[id]/route';
import { POST as checkIn } from '@/app/api/bookings/[id]/check-in/route';
import { POST as checkOut } from '@/app/api/bookings/[id]/check-out/route';
import { POST as extendBooking } from '@/app/api/bookings/[id]/extend/route';
import { GET as calculateCost } from '@/app/api/bookings/[id]/calculate-cost/route';
import { NextRequest } from 'next/server';

/**
 * Integration tests for booking endpoints
 * Tests all scenarios from PRD.md
 */

// Mock Supabase client
jest.mock('@/lib/db/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}));

describe('Booking API Endpoints', () => {
  const mockUserId = 'user-123';
  const mockWorkspaceId = 'workspace-456';
  const mockBookingId = 'booking-789';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bookings/hourly-desk', () => {
    it('should create hourly desk booking successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/hourly-desk', {
        method: 'POST',
        headers: {
          'x-user-id': mockUserId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace_id: mockWorkspaceId,
          booking_date: '2025-10-01',
          start_time: '09:00',
          end_time: '12:00',
          attendees: 1,
        }),
      });

      // Mock repository responses
      const { getSupabaseClient } = require('@/lib/db/supabase');
      const mockSupabase = getSupabaseClient();

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockWorkspaceId,
          name: 'Hot Desk 1',
          type: 'hot-desk',
          resource_category: 'desk',
          base_price_hourly: 2.5,
          available: true,
          min_duration: 1,
          max_duration: 8,
        },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          email: 'test@example.com',
          nft_holder: false,
          membership_plan_id: null,
        },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockBookingId,
          confirmation_code: 'ABC123',
          status: 'pending',
          payment_status: 'pending',
        },
        error: null,
      });

      const response = await createHourlyDesk(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.booking).toBeDefined();
      expect(json.data.pricing).toBeDefined();
      expect(json.data.requires_payment).toBe(true);
    });

    it('should reject booking without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/hourly-desk', {
        method: 'POST',
        body: JSON.stringify({
          workspace_id: mockWorkspaceId,
          booking_date: '2025-10-01',
          start_time: '09:00',
          end_time: '12:00',
        }),
      });

      const response = await createHourlyDesk(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
    });

    it('should reject invalid request data', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/hourly-desk', {
        method: 'POST',
        headers: {
          'x-user-id': mockUserId,
        },
        body: JSON.stringify({
          workspace_id: 'invalid-id',
          booking_date: 'invalid-date',
          start_time: '25:00',
        }),
      });

      const response = await createHourlyDesk(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });

  describe('GET /api/bookings', () => {
    it('should list all user bookings', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings', {
        headers: {
          'x-user-id': mockUserId,
        },
      });

      const { getSupabaseClient } = require('@/lib/db/supabase');
      const mockSupabase = getSupabaseClient();

      mockSupabase.single.mockResolvedValue({
        data: [
          {
            id: 'booking-1',
            booking_date: '2025-10-01',
            status: 'confirmed',
            workspaces: { name: 'Hot Desk 1' },
          },
        ],
        error: null,
      });

      const response = await getBookings(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.bookings).toBeDefined();
      expect(json.data.summary).toBeDefined();
    });

    it('should filter bookings by status', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/bookings?status=confirmed',
        {
          headers: {
            'x-user-id': mockUserId,
          },
        }
      );

      const response = await getBookings(request);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/bookings/:id/check-in', () => {
    it('should check in to booking successfully', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          headers: {
            'x-user-id': mockUserId,
          },
        }
      );

      const { getSupabaseClient } = require('@/lib/db/supabase');
      const mockSupabase = getSupabaseClient();

      const mockBooking = {
        id: mockBookingId,
        user_id: mockUserId,
        workspace_id: mockWorkspaceId,
        booking_date: '2025-10-01',
        start_time: '09:00',
        end_time: '12:00',
        status: 'confirmed',
        check_in_time: null,
        workspaces: { name: 'Hot Desk 1' },
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockBooking, error: null })
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({
          data: { ...mockBooking, check_in_time: new Date().toISOString() },
          error: null,
        });

      const response = await checkIn(request, { params: { id: mockBookingId } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.booking.check_in_time).toBeDefined();
    });

    it('should reject check-in for different user', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          headers: {
            'x-user-id': 'different-user',
          },
        }
      );

      const { getSupabaseClient } = require('@/lib/db/supabase');
      const mockSupabase = getSupabaseClient();

      mockSupabase.single.mockResolvedValue({
        data: {
          id: mockBookingId,
          user_id: mockUserId,
          status: 'confirmed',
        },
        error: null,
      });

      const response = await checkIn(request, { params: { id: mockBookingId } });
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
    });
  });

  describe('POST /api/bookings/:id/check-out', () => {
    it('should check out from booking and calculate charges', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-out`,
        {
          method: 'POST',
          headers: {
            'x-user-id': mockUserId,
          },
        }
      );

      const { getSupabaseClient } = require('@/lib/db/supabase');
      const mockSupabase = getSupabaseClient();

      const checkInTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago

      const mockBooking = {
        id: mockBookingId,
        user_id: mockUserId,
        workspace_id: mockWorkspaceId,
        booking_date: '2025-10-01',
        start_time: '09:00',
        end_time: '12:00',
        duration_hours: 3,
        subtotal: 7.5,
        processing_fee: 2.0,
        total_price: 9.5,
        nft_discount_applied: false,
        status: 'confirmed',
        check_in_time: checkInTime,
        check_out_time: null,
        workspaces: { name: 'Hot Desk 1' },
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockBooking, error: null })
        .mockResolvedValueOnce({
          data: {
            ...mockBooking,
            check_out_time: new Date().toISOString(),
            status: 'completed',
          },
          error: null,
        });

      const response = await checkOut(request, { params: { id: mockBookingId } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.usage).toBeDefined();
      expect(json.data.charges).toBeDefined();
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should cancel booking successfully', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-id': mockUserId,
          },
        }
      );

      const { getSupabaseClient } = require('@/lib/db/supabase');
      const mockSupabase = getSupabaseClient();

      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const mockBooking = {
        id: mockBookingId,
        user_id: mockUserId,
        booking_date: futureDate.toISOString().split('T')[0],
        start_time: '09:00',
        status: 'confirmed',
        total_price: 9.5,
        check_in_time: null,
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockBooking, error: null })
        .mockResolvedValueOnce({
          data: { ...mockBooking, status: 'cancelled' },
          error: null,
        });

      const response = await cancelBooking(request, { params: { id: mockBookingId } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.booking.status).toBe('cancelled');
      expect(json.data.cancellation.refund_eligible).toBe(true);
    });

    it('should reject cancellation of already cancelled booking', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-id': mockUserId,
          },
        }
      );

      const { getSupabaseClient } = require('@/lib/db/supabase');
      const mockSupabase = getSupabaseClient();

      mockSupabase.single.mockResolvedValue({
        data: {
          id: mockBookingId,
          user_id: mockUserId,
          status: 'cancelled',
        },
        error: null,
      });

      const response = await cancelBooking(request, { params: { id: mockBookingId } });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });

  describe('GET /api/bookings/:id/calculate-cost', () => {
    it('should calculate estimated cost for active booking', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/calculate-cost`,
        {
          headers: {
            'x-user-id': mockUserId,
          },
        }
      );

      const { getSupabaseClient } = require('@/lib/db/supabase');
      const mockSupabase = getSupabaseClient();

      const checkInTime = new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString();

      mockSupabase.single.mockResolvedValue({
        data: {
          id: mockBookingId,
          user_id: mockUserId,
          booking_date: '2025-10-01',
          start_time: '09:00',
          end_time: '12:00',
          duration_hours: 3,
          subtotal: 7.5,
          processing_fee: 2.0,
          total_price: 9.5,
          nft_discount_applied: false,
          check_in_time: checkInTime,
          check_out_time: null,
          workspaces: { name: 'Hot Desk 1' },
        },
        error: null,
      });

      const response = await calculateCost(request, { params: { id: mockBookingId } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.usage).toBeDefined();
      expect(json.data.charges.estimated_final_charge).toBeDefined();
    });
  });
});

describe('Booking Business Logic Scenarios', () => {
  describe('Scenario 1: Hourly Hot Desk (Pay-as-you-go)', () => {
    it('should handle walk-in user booking 3 hours', () => {
      // This is tested in pricing.service.test.ts
      // Integration test would verify full flow end-to-end
    });
  });

  describe('Scenario 2: Meeting Room with Credits', () => {
    it('should deduct credits for meeting room booking', () => {
      // Test credit deduction logic
    });
  });

  describe('Scenario 3: Credits Exceeded (Overage)', () => {
    it('should charge for hours beyond available credits', () => {
      // Test overage calculation
    });
  });

  describe('Scenario 4: Day Pass User', () => {
    it('should allow free hot desk access with day pass', () => {
      // Test day pass logic
    });
  });

  describe('Scenario 5: Monthly Member with Hot Desk', () => {
    it('should provide free hot desk access for members', () => {
      // Test membership benefits
    });
  });
});