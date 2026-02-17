import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { triggerWorkflowEmails, getActiveWorkflows, wasEmailAlreadySent, type BookingWithEventType } from '@/lib/email/workflows';

// Vercel Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  try {
    // Verify cron secret in production
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${CRON_SECRET}`) {
        console.log('[Cron] Unauthorized cron request');
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('[Cron] Starting email scheduler job');
    const supabase = createServiceClient();
    const now = new Date();

    let remindersSent = 0;
    let remindersFailed = 0;
    let followUpsSent = 0;
    let followUpsFailed = 0;

    // ============================================
    // PART 1: Send reminder emails (before_event)
    // ============================================

    // Get all active before_event workflows to find max offset
    const { data: beforeWorkflows } = await supabase
      .from('email_workflows')
      .select('*')
      .eq('trigger_type', 'before_event')
      .eq('is_active', true);

    if (beforeWorkflows && beforeWorkflows.length > 0) {
      // Find the max offset to look ahead (e.g., 7 days = -10080 minutes)
      const maxOffsetMinutes = Math.min(...beforeWorkflows.map(w => w.trigger_offset_minutes ?? 0));
      const lookAheadMs = Math.abs(maxOffsetMinutes) * 60 * 1000;

      // Get upcoming bookings within the look-ahead window
      const futureDate = new Date(now.getTime() + lookAheadMs);

      const { data: upcomingBookings, error: upcomingError } = await supabase
        .from('bookings')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          start_time,
          end_time,
          timezone,
          meeting_url,
          total_price_cents,
          deposit_cents,
          payment_status,
          status,
          event_type_id,
          event_types (
            id,
            slug,
            title,
            description,
            duration_minutes,
            location_type,
            location_address
          )
        `)
        .eq('status', 'confirmed')
        .gte('start_time', now.toISOString())
        .lte('start_time', futureDate.toISOString());

      if (upcomingError) {
        console.error('[Cron] Error fetching upcoming bookings:', upcomingError);
      } else if (upcomingBookings) {
        console.log(`[Cron] Found ${upcomingBookings.length} upcoming bookings to check`);

        for (const booking of upcomingBookings) {
          const bookingData = booking as unknown as BookingWithEventType;
          const bookingStartTime = new Date(bookingData.start_time);
          const minutesUntilEvent = (bookingStartTime.getTime() - now.getTime()) / (60 * 1000);

          // Get active workflows for this booking's event type
          const workflows = await getActiveWorkflows(bookingData.event_type_id, 'before_event');

          for (const workflow of workflows) {
            // Check if it's time to send this reminder
            // trigger_offset_minutes is negative (e.g., -4320 for 3 days before)
            const triggerMinutes = Math.abs(workflow.trigger_offset_minutes);

            // Allow a 30-minute window for the cron job to catch reminders
            if (minutesUntilEvent <= triggerMinutes && minutesUntilEvent > (triggerMinutes - 30)) {
              // Check if already sent
              const alreadySent = await wasEmailAlreadySent(bookingData.id, workflow.id);
              if (!alreadySent) {
                const result = await triggerWorkflowEmails(bookingData, 'before_event');
                remindersSent += result.sent;
                remindersFailed += result.failed;
              }
            }
          }
        }
      }
    }

    // ============================================
    // PART 2: Send follow-up emails (after_event)
    // ============================================

    // Get all active after_event workflows
    const { data: afterWorkflows } = await supabase
      .from('email_workflows')
      .select('*')
      .eq('trigger_type', 'after_event')
      .eq('is_active', true);

    if (afterWorkflows && afterWorkflows.length > 0) {
      // Get all confirmed bookings whose end_time has passed (status-based, no time window)
      const { data: completedBookings, error: completedError } = await supabase
        .from('bookings')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          start_time,
          end_time,
          timezone,
          meeting_url,
          total_price_cents,
          deposit_cents,
          payment_status,
          status,
          event_type_id,
          event_types (
            id,
            slug,
            title,
            description,
            duration_minutes,
            location_type,
            location_address
          )
        `)
        .eq('status', 'confirmed')
        .lte('end_time', now.toISOString());

      if (completedError) {
        console.error('[Cron] Error fetching completed bookings:', completedError);
      } else if (completedBookings) {
        console.log(`[Cron] Found ${completedBookings.length} recently completed bookings to check`);

        for (const booking of completedBookings) {
          const bookingData = booking as unknown as BookingWithEventType;

          // Get active workflows for this booking's event type
          const workflows = await getActiveWorkflows(bookingData.event_type_id, 'after_event');

          for (const workflow of workflows) {
            // For now, we only handle immediate follow-ups (trigger_offset_minutes = 0)
            if (workflow.trigger_offset_minutes === 0) {
              // Check if already sent
              const alreadySent = await wasEmailAlreadySent(bookingData.id, workflow.id);
              if (!alreadySent) {
                const result = await triggerWorkflowEmails(bookingData, 'after_event');
                followUpsSent += result.sent;
                followUpsFailed += result.failed;

                // Mark booking as completed if not already
                if (bookingData.status === 'confirmed') {
                  await supabase
                    .from('bookings')
                    .update({
                      status: 'completed',
                      completed_at: now.toISOString()
                    })
                    .eq('id', bookingData.id);
                }
              }
            }
          }
        }
      }
    }

    const summary = {
      success: true,
      timestamp: now.toISOString(),
      reminders: { sent: remindersSent, failed: remindersFailed },
      followUps: { sent: followUpsSent, failed: followUpsFailed },
      totalSent: remindersSent + followUpsSent,
      totalFailed: remindersFailed + followUpsFailed,
    };

    console.log('[Cron] Email scheduler completed:', summary);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[Cron] Email scheduler error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Email scheduler error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Support POST as well for manual triggers
export async function POST(request: Request) {
  return GET(request);
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing
