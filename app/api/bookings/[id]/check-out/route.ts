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
  checkOutBooking,
} from '@/lib/db/repositories/booking.repository';
import {
  calculateActualDuration,
  calculateFinalCharge,
} from '@/lib/services/pricing.service';

/**
 * POST /api/bookings/:id/check-out
 * Check out from a booking and calculate final charges
 *
 * Authorization: Required (must be booking owner)
 */

export async function POST(
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
      return unauthorizedResponse('You do not have permission to check out from this booking');
    }

    // 3. Verify booking is checked in
    if (!booking.check_in_time) {
      return badRequestResponse('Must check in before checking out');
    }

    // 4. Check if already checked out
    if (booking.check_out_time) {
      return badRequestResponse('Already checked out from this booking');
    }

    // 5. Calculate actual duration and final charge
    const actualDurationHours = calculateActualDuration(
      booking.check_in_time,
      new Date().toISOString()
    );

    const finalChargeResult = calculateFinalCharge(
      booking.duration_hours,
      actualDurationHours,
      booking.subtotal,
      booking.processing_fee,
      booking.nft_discount_applied
    );

    // 6. Perform check-out
    const { data: updatedBooking, error: checkOutError } = await checkOutBooking(
      bookingId,
      actualDurationHours,
      finalChargeResult.finalCharge
    );

    if (checkOutError || !updatedBooking) {
      console.error('Error checking out:', checkOutError);
      return serverErrorResponse('Failed to check out');
    }

    // 7. Handle refunds or additional charges
    // TODO: Integrate with Stripe for refunds/additional charges
    const requiresAdditionalPayment = finalChargeResult.overageCharge > 0;
    const requiresRefund = finalChargeResult.refundAmount > 0;

    return successResponse(
      {
        booking: {
          id: updatedBooking.id,
          confirmation_code: updatedBooking.confirmation_code,
          workspace: booking.workspaces,
          check_in_time: updatedBooking.check_in_time,
          check_out_time: updatedBooking.check_out_time,
          status: updatedBooking.status,
        },
        usage: {
          booked_hours: booking.duration_hours,
          actual_hours: actualDurationHours,
          description: finalChargeResult.description,
        },
        charges: {
          initial_charge: booking.total_price,
          final_charge: finalChargeResult.finalCharge,
          refund_amount: finalChargeResult.refundAmount,
          overage_charge: finalChargeResult.overageCharge,
        },
        requires_additional_payment: requiresAdditionalPayment,
        requires_refund: requiresRefund,
        // TODO: Add payment_intent_client_secret for overage charges when Stripe is integrated
      },
      'Checked out successfully'
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/bookings/:id/check-out:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}