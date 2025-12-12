import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getCheckoutSession } from '@/integrations/booking/lib/stripe';
import { createBookingWithMeeting } from '@/integrations/booking/lib/microsoft-graph';
import type { EventType, Booking } from '@/integrations/booking/types';

// POST: Confirm booking after successful payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is vereist' },
        { status: 400 }
      );
    }

    // Verify checkout session with Stripe
    const session = await getCheckoutSession(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, message: 'Betaling niet voltooid' },
        { status: 400 }
      );
    }

    const bookingId = session.metadata?.booking_id;
    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Boeking niet gevonden' },
        { status: 400 }
      );
    }

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

    // Check if already confirmed
    if (booking.status === 'confirmed') {
      return NextResponse.json({
        success: true,
        data: { booking, alreadyConfirmed: true },
      });
    }

    const eventType = booking.event_types as EventType;
    const isDepositOnly = session.metadata?.deposit_only === 'true';

    // Update payment status
    const paymentStatus = isDepositOnly ? 'deposit_paid' : 'fully_paid';

    // Determine booking status
    const bookingStatus = eventType.requires_approval ? 'pending' : 'confirmed';

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: paymentStatus,
        status: bookingStatus,
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('[API] Failed to update booking:', updateError);
      throw updateError;
    }

    // If confirmed, create calendar event and Teams meeting
    if (bookingStatus === 'confirmed') {
      try {
        const { calendarEvent, meetingUrl } = await createBookingWithMeeting(
          updatedBooking as Booking,
          eventType
        );

        // Update booking with meeting details
        await supabase
          .from('bookings')
          .update({
            meeting_url: meetingUrl,
            meeting_id: calendarEvent.id,
          })
          .eq('id', bookingId);

        updatedBooking.meeting_url = meetingUrl;
        updatedBooking.meeting_id = calendarEvent.id;
      } catch (calendarError) {
        console.error('[API] Failed to create calendar event:', calendarError);
        // Don't fail the confirmation - booking is still valid
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: updatedBooking,
        eventType,
        meetingUrl: updatedBooking.meeting_url,
      },
    });
  } catch (error) {
    console.error('[API] Confirm booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

// GET: Check booking status by session ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is vereist' },
        { status: 400 }
      );
    }

    // Verify checkout session with Stripe
    const session = await getCheckoutSession(sessionId);
    const bookingId = session.metadata?.booking_id;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Boeking niet gevonden' },
        { status: 404 }
      );
    }

    const supabase = createServiceClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, event_types(*)')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { success: false, message: 'Boeking niet gevonden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        booking,
        eventType: booking.event_types,
        paymentStatus: session.payment_status,
      },
    });
  } catch (error) {
    console.error('[API] Get booking status error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
