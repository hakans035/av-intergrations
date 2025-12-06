import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for event type
const eventTypeSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Alleen kleine letters, nummers en streepjes'),
  title: z.string().min(2),
  description: z.string().optional(),
  duration_minutes: z.number().min(5).max(480).default(30),
  location_type: z.enum(['online', 'on_location', 'hybrid']),
  location_address: z.string().optional(),
  price_cents: z.number().min(0).default(0),
  deposit_percent: z.number().min(0).max(100).default(50),
  max_attendees: z.number().min(1).default(1),
  is_active: z.boolean().default(true),
  requires_approval: z.boolean().default(false),
  buffer_before_minutes: z.number().min(0).default(0),
  buffer_after_minutes: z.number().min(0).default(0),
  availability: z.array(z.object({
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

// GET: List all event types (admin view - includes inactive)
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: 'Niet geautoriseerd' },
      { status: 401 }
    );
  }

  try {
    const supabase = createServiceClient();

    const { data: eventTypes, error } = await supabase
      .from('event_types')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: eventTypes,
    });
  } catch (error) {
    console.error('[Admin API] Get event types error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

// POST: Create new event type
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: 'Niet geautoriseerd' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validation = eventTypeSchema.safeParse(body);

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

    // Create event type
    const { data: eventType, error: eventError } = await supabase
      .from('event_types')
      .insert(eventTypeData)
      .select()
      .single();

    if (eventError) {
      if (eventError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'Slug is al in gebruik' },
          { status: 409 }
        );
      }
      throw eventError;
    }

    // Create availability schedules if provided
    if (availability && availability.length > 0) {
      const schedulesToInsert = availability.map((schedule) => ({
        event_type_id: eventType.id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_active: schedule.is_active,
      }));

      const { error: scheduleError } = await supabase
        .from('availability_schedules')
        .insert(schedulesToInsert);

      if (scheduleError) {
        console.error('[Admin API] Failed to create schedules:', scheduleError);
      }
    }

    return NextResponse.json({
      success: true,
      data: eventType,
    }, { status: 201 });
  } catch (error) {
    console.error('[Admin API] Create event type error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
