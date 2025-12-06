import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { calculateAvailability } from '@/integrations/booking/lib/availability';
import type { EventType, AvailabilitySchedule, EventSlot, BlockedTime, Booking } from '@/integrations/booking/types';

// GET: Get available time slots for an event type
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventTypeId = searchParams.get('eventTypeId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!eventTypeId) {
      return NextResponse.json(
        { success: false, message: 'eventTypeId is vereist' },
        { status: 400 }
      );
    }

    // Default date range: next 30 days
    const startDate = startDateParam ? new Date(startDateParam) : new Date();
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const supabase = createServiceClient();

    // Fetch event type
    const { data: eventType, error: eventError } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', eventTypeId)
      .eq('is_active', true)
      .single();

    if (eventError || !eventType) {
      return NextResponse.json(
        { success: false, message: 'Evenement niet gevonden' },
        { status: 404 }
      );
    }

    // Fetch availability schedules
    const { data: schedules } = await supabase
      .from('availability_schedules')
      .select('*')
      .eq('event_type_id', eventTypeId)
      .eq('is_active', true);

    // Fetch one-time slots
    const { data: slots } = await supabase
      .from('event_slots')
      .select('*')
      .eq('event_type_id', eventTypeId)
      .eq('is_active', true)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    // Fetch blocked times
    const { data: blockedTimes } = await supabase
      .from('blocked_times')
      .select('*')
      .or(`event_type_id.eq.${eventTypeId},event_type_id.is.null`)
      .gte('end_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    // Fetch existing bookings
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('event_type_id', eventTypeId)
      .neq('status', 'cancelled')
      .gte('end_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    // Calculate available slots
    const availableSlots = await calculateAvailability(
      {
        eventType: eventType as EventType,
        schedules: (schedules || []) as AvailabilitySchedule[],
        slots: (slots || []) as EventSlot[],
        blockedTimes: (blockedTimes || []) as BlockedTime[],
        existingBookings: (existingBookings || []) as Booking[],
      },
      startDate,
      endDate,
      true // Check Outlook calendar
    );

    return NextResponse.json({
      success: true,
      data: {
        eventType,
        slots: availableSlots.map((slot) => ({
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
          available: slot.available,
          remainingSeats: slot.remainingSeats,
        })),
      },
    });
  } catch (error) {
    console.error('[API] Availability error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
