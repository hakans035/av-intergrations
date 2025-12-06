import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for updating a workflow
const updateWorkflowSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht').optional(),
  slug: z.string().min(1, 'Slug is verplicht').regex(/^[a-z0-9-]+$/, 'Slug mag alleen kleine letters, cijfers en streepjes bevatten').optional(),
  description: z.string().nullable().optional(),
  eventTypeId: z.string().uuid().nullable().optional(),
  triggerType: z.enum(['booking_confirmed', 'booking_cancelled', 'before_event', 'after_event']).optional(),
  triggerOffsetMinutes: z.number().optional(),
  emailSubject: z.string().min(1, 'Onderwerp is verplicht').optional(),
  emailTemplate: z.string().min(1, 'Template is verplicht').optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get a single workflow
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: workflow, error } = await supabase
      .from('email_workflows')
      .select(`
        *,
        event_types (
          id,
          slug,
          title
        )
      `)
      .eq('id', id)
      .single();

    if (error || !workflow) {
      return NextResponse.json(
        { success: false, message: 'Workflow niet gevonden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error('[API] Get workflow error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

// PATCH: Update a workflow
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateWorkflowSchema.safeParse(body);

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

    // Check if workflow exists
    const { data: existing, error: existingError } = await supabase
      .from('email_workflows')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { success: false, message: 'Workflow niet gevonden' },
        { status: 404 }
      );
    }

    // Check if new slug already exists (if changing slug)
    if (data.slug && data.slug !== existing.slug) {
      const { data: slugExists } = await supabase
        .from('email_workflows')
        .select('id')
        .eq('slug', data.slug)
        .neq('id', id)
        .single();

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'Een workflow met deze slug bestaat al' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.eventTypeId !== undefined) updateData.event_type_id = data.eventTypeId;
    if (data.triggerType !== undefined) updateData.trigger_type = data.triggerType;
    if (data.triggerOffsetMinutes !== undefined) updateData.trigger_offset_minutes = data.triggerOffsetMinutes;
    if (data.emailSubject !== undefined) updateData.email_subject = data.emailSubject;
    if (data.emailTemplate !== undefined) updateData.email_template = data.emailTemplate;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    // Update the workflow
    const { data: workflow, error } = await supabase
      .from('email_workflows')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        event_types (
          id,
          slug,
          title
        )
      `)
      .single();

    if (error) {
      console.error('[API] Error updating workflow:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error('[API] Update workflow error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a workflow
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    // Check if workflow exists
    const { data: existing, error: existingError } = await supabase
      .from('email_workflows')
      .select('id')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { success: false, message: 'Workflow niet gevonden' },
        { status: 404 }
      );
    }

    // Delete the workflow
    const { error } = await supabase
      .from('email_workflows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API] Error deleting workflow:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow verwijderd',
    });
  } catch (error) {
    console.error('[API] Delete workflow error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
