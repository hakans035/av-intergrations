import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validation schema for updates
const updateEventTypeSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  duration_minutes: z.number().min(5).max(480).optional(),
  location_type: z.enum(['online', 'on_location', 'hybrid']).optional(),
  location_address: z.string().nullable().optional(),
  price_cents: z.number().min(0).optional(),
  deposit_percent: z.number().min(0).max(100).optional(),
  max_attendees: z.number().min(1).optional(),
  is_active: z.boolean().optional(),
  requires_approval: z.boolean().optional(),
  buffer_before_minutes: z.number().min(0).optional(),
  buffer_after_minutes: z.number().min(0).optional(),
  availability: z.array(z.object({
    id: z.string().uuid().optional(),
    day_of_week: z.number().min(0).max(6),
    start_time: z.string(),
    end_time: z.string(),
    is_active: z.boolean().default(true),
  })).optional(),
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

// GET: Get single event type with schedules
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

    // Get event type
    const { data: eventType, error: eventError } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', id)
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

    // Get schedules
    const { data: schedules } = await supabase
      .from('availability_schedules')
      .select('*')
      .eq('event_type_id', id)
      .order('day_of_week');

    // Get slots
    const { data: slots } = await supabase
      .from('event_slots')
      .select('*')
      .eq('event_type_id', id)
      .order('start_time');

    // Get blocked times
    const { data: blockedTimes } = await supabase
      .from('blocked_times')
      .select('*')
      .eq('event_type_id', id)
      .order('start_time');

    return NextResponse.json({
      success: true,
      data: {
        eventType,
        schedules: schedules || [],
        slots: slots || [],
        blockedTimes: blockedTimes || [],
      },
    });
  } catch (error) {
    console.error('[Admin API] Get event type error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

// PUT: Update event type
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
    const validation = updateEventTypeSchema.safeParse(body);

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

    const { availability, ...eventTypeData } = validation.data;
    const supabase = createServiceClient();

    // Update event type
    const { data: eventType, error: eventError } = await supabase
      .from('event_types')
      .update({
        ...eventTypeData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Evenement niet gevonden' },
          { status: 404 }
        );
      }
      if (eventError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'Slug is al in gebruik' },
          { status: 409 }
        );
      }
      throw eventError;
    }

    // Update availability schedules if provided
    if (availability !== undefined) {
      // Delete existing schedules
      await supabase
        .from('availability_schedules')
        .delete()
        .eq('event_type_id', id);

      // Insert new schedules
      if (availability.length > 0) {
        const schedulesToInsert = availability.map((schedule) => ({
          event_type_id: id,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          is_active: schedule.is_active,
        }));

        await supabase
          .from('availability_schedules')
          .insert(schedulesToInsert);
      }
    }

    return NextResponse.json({
      success: true,
      data: eventType,
    });
  } catch (error) {
    console.error('[Admin API] Update event type error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

// DELETE: Delete event type
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

    // Check for existing bookings
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('event_type_id', id)
      .neq('status', 'cancelled');

    if (bookingCount && bookingCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Kan niet verwijderen: er zijn nog ${bookingCount} actieve boekingen`,
        },
        { status: 409 }
      );
    }

    // Delete event type (cascades to schedules, slots, blocked times)
    const { error } = await supabase
      .from('event_types')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Evenement niet gevonden' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Evenement verwijderd',
    });
  } catch (error) {
    console.error('[Admin API] Delete event type error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
