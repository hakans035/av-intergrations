import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET: Get single event type by slug with availability schedules
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = createServiceClient();

    // Get event type
    const { data: eventType, error: eventError } = await supabase
      .from('event_types')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Evenement niet gevonden' },
          { status: 404 }
        );
      }
      throw eventError;
    }

    // Get availability schedules
    const { data: schedules, error: scheduleError } = await supabase
      .from('availability_schedules')
      .select('*')
      .eq('event_type_id', eventType.id)
      .eq('is_active', true)
      .order('day_of_week');

    if (scheduleError) {
      console.error('[API] Failed to fetch schedules:', scheduleError);
    }

    // Get one-time slots
    const { data: slots, error: slotsError } = await supabase
      .from('event_slots')
      .select('*')
      .eq('event_type_id', eventType.id)
      .eq('is_active', true)
      .gte('start_time', new Date().toISOString())
      .order('start_time');

    if (slotsError) {
      console.error('[API] Failed to fetch slots:', slotsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        eventType,
        schedules: schedules || [],
        slots: slots || [],
      },
    });
  } catch (error) {
    console.error('[API] Event type error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
