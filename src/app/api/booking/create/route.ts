import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import {
  createBookingWithMeeting,
} from '@/integrations/booking/lib/microsoft-graph';
import { isSlotAvailable } from '@/integrations/booking/lib/availability';
import { sendBookingEmails } from '@/lib/email/workflows';
import { sendTeamNotification } from '@/lib/email/sendTeamNotification';
import type { EventType, Booking, BlockedTime } from '@/integrations/booking/types';

// Validation schema
const createBookingSchema = z.object({
  eventTypeId: z.string().uuid(),
  eventSlotId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  customerName: z.string().min(2, 'Naam is te kort'),
  customerEmail: z.string().email('Ongeldig e-mailadres'),
  customerPhone: z.string().optional(),
  customerNotes: z.string().optional(),
  attendees: z
    .array(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
      })
    )
    .optional(),
  timezone: z.string().default('Europe/Amsterdam'),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json(
        { success: false, message: 'Ongeldige invoer', errors },
        { status: 400 }
      );
    }

    const data = validation.data;
    const supabase = createServiceClient();

    // Fetch event type
    const { data: eventType, error: eventError } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', data.eventTypeId)
      .eq('is_active', true)
      .single();

    if (eventError || !eventType) {
      return NextResponse.json(
        { success: false, message: 'Evenement niet gevonden' },
        { status: 404 }
      );
    }

    // Calculate end time based on booking duration (or full duration if not set)
    const startTime = new Date(data.startTime);
    const bookingDuration = eventType.booking_duration_minutes ?? eventType.duration_minutes;
    const endTime = new Date(
      startTime.getTime() + bookingDuration * 60 * 1000
    );

    // Fetch existing bookings and blocked times for availability check
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('event_type_id', data.eventTypeId)
      .neq('status', 'cancelled')
      .gte('end_time', startTime.toISOString())
      .lte('start_time', endTime.toISOString());

    const { data: blockedTimes } = await supabase
      .from('blocked_times')
      .select('*')
      .or(`event_type_id.eq.${data.eventTypeId},event_type_id.is.null`)
      .gte('end_time', startTime.toISOString())
      .lte('start_time', endTime.toISOString());

    // Check if slot is still available
    const availabilityCheck = await isSlotAvailable(
      eventType as EventType,
      startTime,
      endTime,
      (existingBookings || []) as Booking[],
      (blockedTimes || []) as BlockedTime[]
    );

    if (!availabilityCheck.available) {
      return NextResponse.json(
        { success: false, message: availabilityCheck.reason || 'Dit tijdslot is niet meer beschikbaar' },
        { status: 409 }
      );
    }

    // Determine initial status (confirmed unless requires manual approval)
    const initialStatus = eventType.requires_approval ? 'pending' : 'confirmed';

    // Create booking record - no payment required, invoice sent manually later
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        event_type_id: data.eventTypeId,
        event_slot_id: data.eventSlotId || null,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone || null,
        customer_notes: data.customerNotes || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        timezone: data.timezone,
        total_price_cents: eventType.price_cents || 0,
        deposit_cents: 0,
        payment_status: 'not_required',
        status: initialStatus,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('[API] Failed to create booking:', bookingError);
      throw bookingError;
    }

    // Add attendees if provided (for group bookings)
    if (data.attendees && data.attendees.length > 0) {
      const attendeesToInsert = data.attendees.map((attendee) => ({
        booking_id: booking.id,
        name: attendee.name,
        email: attendee.email,
      }));

      const { error: attendeesError } = await supabase
        .from('booking_attendees')
        .insert(attendeesToInsert);

      if (attendeesError) {
        console.error('[API] Failed to add attendees:', attendeesError);
      }
    }

    // Create calendar event for confirmed bookings
    if (initialStatus === 'confirmed') {
      try {
        const { calendarEvent, meetingUrl } = await createBookingWithMeeting(
          booking as Booking,
          eventType as EventType
        );

        // Update booking with meeting details
        await supabase
          .from('bookings')
          .update({
            meeting_url: meetingUrl,
            meeting_id: calendarEvent.id,
          })
          .eq('id', booking.id);

        booking.meeting_url = meetingUrl;
        booking.meeting_id = calendarEvent.id;
      } catch (calendarError) {
        console.error('[API] Failed to create calendar event:', calendarError);
        // Continue without calendar event - booking is still valid
      }

      // Send booking confirmation emails
      try {
        await sendBookingEmails(booking.id, 'booking_confirmed');
        console.log('[API] Booking confirmation emails triggered for:', booking.id);
      } catch (emailError) {
        console.error('[API] Failed to send booking emails:', emailError);
        // Don't fail the booking creation
      }

      // Send team notification
      const eventDate = startTime.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Europe/Amsterdam',
      });
      const eventTime = startTime.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Amsterdam',
      });

      sendTeamNotification({
        type: 'new_booking',
        leadName: data.customerName,
        leadEmail: data.customerEmail,
        leadPhone: data.customerPhone,
        eventTitle: eventType.title,
        eventDate,
        eventTime,
      }).then(() => {
        console.log('[API] Team notification sent for booking:', booking.id);
      }).catch((err) => {
        console.error('[API] Team notification error:', err);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error('[API] Create booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden bij het maken van de boeking' },
      { status: 500 }
    );
  }
}
