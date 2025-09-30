import { NextRequest } from 'next/server';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api/response';
import {
  getBookingById,
  cancelBooking,
} from '@/lib/db/repositories/booking.repository';

/**
 * GET /api/bookings/:id
 * Get booking details by ID
 *
 * Authorization: Required (must be booking owner)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse('Authentication required');
    }

    const bookingId = params.id;

    // Get booking details
    const { data: booking, error: bookingError } = await getBookingById(bookingId);
    if (bookingError || !booking) {
      return notFoundResponse('Booking not found');
    }

    // Verify ownership
    if (booking.user_id !== userId) {
      return unauthorizedResponse('You do not have permission to view this booking');
    }

    // Calculate booking status details
    const now = new Date();
    const bookingStart = new Date(`${booking.booking_date}T${booking.start_time}`);
    const bookingEnd = new Date(`${booking.booking_date}T${booking.end_time}`);

    const isUpcoming = bookingStart > now;
    const isActive = booking.check_in_time && !booking.check_out_time;
    const isPast = bookingEnd < now || booking.status === 'completed';

    return successResponse(
      {
        booking,
        status_info: {
          is_upcoming: isUpcoming,
          is_active: isActive,
          is_past: isPast,
          can_check_in: isUpcoming && bookingStart.getTime() - now.getTime() < 15 * 60 * 1000,
          can_cancel: booking.status !== 'cancelled' && booking.status !== 'completed',
          can_extend: isActive,
        },
      },
      'Booking retrieved successfully'
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/bookings/:id:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}

/**
 * DELETE /api/bookings/:id
 * Cancel a booking
 *
 * Authorization: Required (must be booking owner)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return unauthorizedResponse('Authentication required');
    }

    const bookingId = params.id;

    // 1. Get booking details
    const { data: booking, error: bookingError } = await getBookingById(bookingId);
    if (bookingError || !booking) {
      return notFoundResponse('Booking not found');
    }

    // 2. Verify ownership
    if (booking.user_id !== userId) {
      return unauthorizedResponse('You do not have permission to cancel this booking');
    }

    // 3. Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return badRequestResponse('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      return badRequestResponse('Cannot cancel a completed booking');
    }

    // 4. Check if booking has been checked in
    if (booking.check_in_time && !booking.check_out_time) {
      return badRequestResponse('Cannot cancel an active booking. Please check out first.');
    }

    // 5. Calculate cancellation policy (24 hours before = full refund)
    const now = new Date();
    const bookingStart = new Date(`${booking.booking_date}T${booking.start_time}`);
    const hoursUntilBooking = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    const refundEligible = hoursUntilBooking > 24;
    const refundAmount = refundEligible ? booking.total_price : 0;

    // 6. Cancel booking
    const { data: cancelledBooking, error: cancelError } = await cancelBooking(bookingId);

    if (cancelError || !cancelledBooking) {
      console.error('Error cancelling booking:', cancelError);
      return serverErrorResponse('Failed to cancel booking');
    }

    // TODO: Process refund via Stripe if eligible

    return successResponse(
      {
        booking: {
          id: cancelledBooking.id,
          confirmation_code: cancelledBooking.confirmation_code,
          status: cancelledBooking.status,
        },
        cancellation: {
          cancelled_at: new Date().toISOString(),
          refund_eligible: refundEligible,
          refund_amount: refundAmount,
          cancellation_policy:
            hoursUntilBooking > 24
              ? 'Full refund (cancelled more than 24 hours before booking)'
              : 'No refund (cancelled less than 24 hours before booking)',
        },
      },
      'Booking cancelled successfully'
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/bookings/:id:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}