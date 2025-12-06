import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import { createRefund } from '@/integrations/booking/lib/stripe';
import { cancelCalendarEvent, createBookingWithMeeting } from '@/integrations/booking/lib/microsoft-graph';
import type { EventType, Booking } from '@/integrations/booking/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validation schema for updates
const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  cancellation_reason: z.string().optional(),
  customer_notes: z.string().optional(),
  refund: z.boolean().optional(),
});

// Check admin authorization
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  return token === process.env.ADMIN_API_TOKEN;
}

// GET: Get single booking with details
export async function GET(request: Request, { params }: RouteParams) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: 'Niet geautoriseerd' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, event_types(*), booking_attendees(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Boeking niet gevonden' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('[Admin API] Get booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

// PUT: Update booking (status changes, notes, etc.)
export async function PUT(request: Request, { params }: RouteParams) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: 'Niet geautoriseerd' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Ongeldige invoer' },
        { status: 400 }
      );
    }

    const { status, cancellation_reason, customer_notes, refund } = validation.data;
    const supabase = createServiceClient();

    // Get current booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, event_types(*)')
      .eq('id', id)
      .single();

    if (fetchError || !currentBooking) {
      return NextResponse.json(
        { success: false, message: 'Boeking niet gevonden' },
        { status: 404 }
      );
    }

    const eventType = currentBooking.event_types as EventType;
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Handle status changes
    if (status && status !== currentBooking.status) {
      updates.status = status;

      // Handle cancellation
      if (status === 'cancelled') {
        updates.cancellation_reason = cancellation_reason || null;
        updates.cancelled_at = new Date().toISOString();

        // Cancel calendar event
        if (currentBooking.meeting_id) {
          try {
            await cancelCalendarEvent(currentBooking.meeting_id);
          } catch (calendarError) {
            console.error('[Admin API] Failed to cancel calendar event:', calendarError);
          }
        }

        // Process refund if requested
        if (refund && currentBooking.stripe_payment_intent_id) {
          try {
            await createRefund({
              paymentIntentId: currentBooking.stripe_payment_intent_id,
              reason: 'requested_by_customer',
            });
            updates.payment_status = 'refunded';
          } catch (refundError) {
            console.error('[Admin API] Failed to process refund:', refundError);
          }
        }
      }

      // Handle confirmation (create calendar event if needed)
      if (status === 'confirmed' && currentBooking.status === 'pending') {
        if (!currentBooking.meeting_id) {
          try {
            const { calendarEvent, meetingUrl } = await createBookingWithMeeting(
              currentBooking as Booking,
              eventType
            );
            updates.meeting_url = meetingUrl;
            updates.meeting_id = calendarEvent.id;
          } catch (calendarError) {
            console.error('[Admin API] Failed to create calendar event:', calendarError);
          }
        }
      }
    }

    if (customer_notes !== undefined) {
      updates.customer_notes = customer_notes;
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select('*, event_types(*)')
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    console.error('[Admin API] Update booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

// DELETE: Delete booking (admin only, for cleanup)
export async function DELETE(request: Request, { params }: RouteParams) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: 'Niet geautoriseerd' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const supabase = createServiceClient();

    // Get booking first to cancel calendar event
    const { data: booking } = await supabase
      .from('bookings')
      .select('meeting_id')
      .eq('id', id)
      .single();

    if (booking?.meeting_id) {
      try {
        await cancelCalendarEvent(booking.meeting_id);
      } catch {
        // Continue with deletion
      }
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Boeking niet gevonden' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Boeking verwijderd',
    });
  } catch (error) {
    console.error('[Admin API] Delete booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
