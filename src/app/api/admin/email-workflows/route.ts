import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for creating a workflow
const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  slug: z.string().min(1, 'Slug is verplicht').regex(/^[a-z0-9-]+$/, 'Slug mag alleen kleine letters, cijfers en streepjes bevatten'),
  description: z.string().optional(),
  eventTypeId: z.string().uuid().nullable().optional(),
  triggerType: z.enum(['booking_confirmed', 'booking_cancelled', 'before_event', 'after_event']),
  triggerOffsetMinutes: z.number().default(0),
  emailSubject: z.string().min(1, 'Onderwerp is verplicht'),
  emailTemplate: z.string().min(1, 'Template is verplicht'),
  isActive: z.boolean().default(true),
});

// GET: List all email workflows
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventTypeId = searchParams.get('eventTypeId');
    const triggerType = searchParams.get('triggerType');
    const isActive = searchParams.get('isActive');

    const supabase = createServiceClient();

    let query = supabase
      .from('email_workflows')
      .select(`
        *,
        event_types (
          id,
          slug,
          title
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (eventTypeId) {
      query = query.eq('event_type_id', eventTypeId);
    }
    if (triggerType) {
      query = query.eq('trigger_type', triggerType);
    }
    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API] Error fetching workflows:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('[API] List workflows error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

// POST: Create a new email workflow
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createWorkflowSchema.safeParse(body);

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

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('email_workflows')
      .select('id')
      .eq('slug', data.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Een workflow met deze slug bestaat al' },
        { status: 400 }
      );
    }

    // Create the workflow
    const { data: workflow, error } = await supabase
      .from('email_workflows')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        event_type_id: data.eventTypeId || null,
        trigger_type: data.triggerType,
        trigger_offset_minutes: data.triggerOffsetMinutes,
        email_subject: data.emailSubject,
        email_template: data.emailTemplate,
        is_active: data.isActive,
      })
      .select()
      .single();

    if (error) {
      console.error('[API] Error creating workflow:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error('[API] Create workflow error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
