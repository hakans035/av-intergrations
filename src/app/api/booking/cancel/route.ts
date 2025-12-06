import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import { createRefund } from '@/integrations/booking/lib/stripe';
import { cancelCalendarEvent } from '@/integrations/booking/lib/microsoft-graph';
import { sendBookingEmails } from '@/lib/email/workflows';

const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().optional(),
  refund: z.boolean().default(true),
});

// POST: Cancel a booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = cancelBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Ongeldige invoer' },
        { status: 400 }
      );
    }

    const { bookingId, reason, refund } = validation.data;
    const supabase = createServiceClient();

    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, event_types(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, message: 'Boeking niet gevonden' },
        { status: 404 }
      );
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Boeking is al geannuleerd' },
        { status: 400 }
      );
    }

    // Cancel calendar event if exists
    if (booking.meeting_id) {
      try {
        await cancelCalendarEvent(booking.meeting_id);
      } catch (calendarError) {
        console.error('[API] Failed to cancel calendar event:', calendarError);
        // Continue with cancellation
      }
    }

    // Process refund if applicable
    let refundResult = null;
    if (
      refund &&
      booking.stripe_payment_intent_id &&
      (booking.payment_status === 'deposit_paid' || booking.payment_status === 'fully_paid')
    ) {
      try {
        refundResult = await createRefund({
          paymentIntentId: booking.stripe_payment_intent_id,
          reason: 'requested_by_customer',
        });
      } catch (refundError) {
        console.error('[API] Failed to process refund:', refundError);
        // Continue with cancellation, but note refund failed
      }
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || null,
        cancelled_at: new Date().toISOString(),
        payment_status: refundResult ? 'refunded' : booking.payment_status,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('[API] Failed to update booking:', updateError);
      throw updateError;
    }

    // Send booking cancellation emails
    try {
      await sendBookingEmails(bookingId, 'booking_cancelled');
      console.log('[API] Booking cancellation emails triggered for:', bookingId);
    } catch (emailError) {
      console.error('[API] Failed to send cancellation emails:', emailError);
      // Don't fail the cancellation
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: updatedBooking,
        refunded: !!refundResult,
        refundAmount: refundResult?.amount,
      },
    });
  } catch (error) {
    console.error('[API] Cancel booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden bij het annuleren' },
      { status: 500 }
    );
  }
}
