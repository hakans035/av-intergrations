import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import { cancelCalendarEvent } from '@/integrations/booking/lib/microsoft-graph';
import { sendBookingEmails } from '@/lib/email/workflows';

const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().optional(),
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

    const { bookingId, reason } = validation.data;
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

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || null,
        cancelled_at: new Date().toISOString(),
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
