import React from 'react';
import { createServiceClient } from '@/lib/supabase';
import { sendEmail } from './index';
import {
  BookingConfirmationEmail,
  getBookingConfirmationSubject,
  BookingCancellationEmail,
  getBookingCancellationSubject,
} from './index';
import { BookingReminderEmail, getBookingReminderSubject } from './templates/bookingReminder';
import { IntakeFollowUpEmail, getIntakeFollowUpSubject } from './templates/intakeFollowUp';
import { generateICSBuffer, type ICSEventParams } from './ics';

// Types
export interface EmailWorkflow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  event_type_id: string | null;
  trigger_type: 'booking_confirmed' | 'booking_cancelled' | 'before_event' | 'after_event';
  trigger_offset_minutes: number;
  email_subject: string;
  email_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingWithEventType {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  start_time: string;
  end_time: string;
  timezone: string;
  meeting_url: string | null;
  total_price_cents: number;
  deposit_cents: number;
  payment_status: string;
  status: string;
  event_type_id: string;
  event_types: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    location_type: string;
    location_address: string | null;
  };
}

export interface EmailLog {
  id: string;
  booking_id: string | null;
  workflow_id: string | null;
  recipient_email: string;
  email_subject: string;
  status: 'pending' | 'sent' | 'failed';
  resend_message_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

// Template registry
type TemplateType = 'booking_confirmation' | 'booking_cancellation' | 'booking_reminder' | 'intake_follow_up' | 'traject_follow_up';

// Get active workflows for a trigger type
export async function getActiveWorkflows(
  eventTypeId: string,
  triggerType: EmailWorkflow['trigger_type']
): Promise<EmailWorkflow[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('email_workflows')
    .select('*')
    .eq('is_active', true)
    .eq('trigger_type', triggerType)
    .or(`event_type_id.eq.${eventTypeId},event_type_id.is.null`);

  if (error) {
    console.error('[EmailWorkflow] Error fetching workflows:', error);
    return [];
  }

  return data as EmailWorkflow[];
}

// Check if email was already sent
export async function wasEmailAlreadySent(
  bookingId: string,
  workflowId: string
): Promise<boolean> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('email_logs')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('workflow_id', workflowId)
    .eq('status', 'sent')
    .limit(1);

  return (data?.length ?? 0) > 0;
}

// Log email sending attempt
export async function logEmailSent(params: {
  bookingId: string;
  workflowId: string;
  recipientEmail: string;
  emailSubject: string;
  status: 'pending' | 'sent' | 'failed';
  resendMessageId?: string;
  errorMessage?: string;
}): Promise<void> {
  const supabase = createServiceClient();

  await supabase.from('email_logs').insert({
    booking_id: params.bookingId,
    workflow_id: params.workflowId,
    recipient_email: params.recipientEmail,
    email_subject: params.emailSubject,
    status: params.status,
    resend_message_id: params.resendMessageId || null,
    error_message: params.errorMessage || null,
    sent_at: params.status === 'sent' ? new Date().toISOString() : null,
  });
}

// Format date for Dutch locale
function formatDate(dateString: string, timezone: string = 'Europe/Amsterdam'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  });
}

// Format time for Dutch locale
function formatTime(dateString: string, timezone: string = 'Europe/Amsterdam'): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });
}

// Format price
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

// Calculate days until event
function getDaysUntil(startTime: string): number {
  const now = new Date();
  const eventDate = new Date(startTime);
  const diffTime = eventDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Render email template based on type
async function renderTemplate(
  templateType: TemplateType,
  booking: BookingWithEventType
): Promise<{ html: string; subject: string; attachments?: Array<{ filename: string; content: Buffer }> } | null> {
  // Dynamic import to avoid build issues with react-dom/server
  const { renderToStaticMarkup } = await import('react-dom/server');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://check.ambitionvalley.nl';
  const cancellationUrl = `${baseUrl}/booking/cancel/${booking.id}`;
  const trajectenUrl = `${baseUrl}/booking/trajecten`;

  const eventDate = formatDate(booking.start_time, booking.timezone);
  const eventTime = formatTime(booking.start_time, booking.timezone);

  switch (templateType) {
    case 'booking_confirmation': {
      // Show invoice notice only for paid bookings (trajecten)
      const showInvoiceNotice = booking.total_price_cents > 0;

      const props = {
        customerName: booking.customer_name,
        eventTitle: booking.event_types.title,
        eventDate,
        eventTime,
        duration: booking.event_types.duration_minutes,
        locationType: booking.event_types.location_type as 'online' | 'on_location' | 'hybrid',
        locationAddress: booking.event_types.location_address || undefined,
        meetingUrl: booking.meeting_url || undefined,
        bookingId: booking.id,
        cancellationUrl,
        showInvoiceNotice,
      };
      const html = `<!DOCTYPE html>${renderToStaticMarkup(React.createElement(BookingConfirmationEmail, props))}`;

      // Generate ICS calendar file attachment
      const icsParams: ICSEventParams = {
        uid: booking.id,
        title: `${booking.event_types.title} - Ambition Valley`,
        description: booking.event_types.description || `Afspraak met Ambition Valley: ${booking.event_types.title}`,
        startTime: booking.start_time,
        endTime: booking.end_time,
        location: booking.event_types.location_address || undefined,
        meetingUrl: booking.meeting_url || undefined,
        organizerName: 'Ambition Valley',
        organizerEmail: 'info@ambitionvalley.nl',
        attendeeName: booking.customer_name,
        attendeeEmail: booking.customer_email,
      };
      const icsBuffer = generateICSBuffer(icsParams);

      return {
        html,
        subject: getBookingConfirmationSubject(booking.event_types.title),
        attachments: [{ filename: 'invite.ics', content: icsBuffer }],
      };
    }

    case 'booking_cancellation': {
      const props = {
        customerName: booking.customer_name,
        eventTitle: booking.event_types.title,
        eventDate,
        eventTime,
      };
      const html = `<!DOCTYPE html>${renderToStaticMarkup(React.createElement(BookingCancellationEmail, props))}`;
      return { html, subject: getBookingCancellationSubject() };
    }

    case 'booking_reminder': {
      const daysUntil = getDaysUntil(booking.start_time);
      const props = {
        customerName: booking.customer_name,
        eventTitle: booking.event_types.title,
        eventDate,
        eventTime,
        duration: booking.event_types.duration_minutes,
        locationType: booking.event_types.location_type as 'online' | 'on_location' | 'hybrid',
        locationAddress: booking.event_types.location_address || undefined,
        meetingUrl: booking.meeting_url || undefined,
        daysUntil,
        cancellationUrl,
      };
      const html = `<!DOCTYPE html>${renderToStaticMarkup(React.createElement(BookingReminderEmail, props))}`;
      return { html, subject: getBookingReminderSubject(booking.event_types.title, daysUntil) };
    }

    case 'intake_follow_up': {
      const props = {
        customerName: booking.customer_name,
        eventTitle: booking.event_types.title,
        trajectenUrl,
      };
      const html = `<!DOCTYPE html>${renderToStaticMarkup(React.createElement(IntakeFollowUpEmail, props))}`;
      return { html, subject: getIntakeFollowUpSubject() };
    }

    case 'traject_follow_up': {
      // Use the same follow-up template but could be customized
      const props = {
        customerName: booking.customer_name,
        eventTitle: booking.event_types.title,
        trajectenUrl,
      };
      const html = `<!DOCTYPE html>${renderToStaticMarkup(React.createElement(IntakeFollowUpEmail, props))}`;
      return { html, subject: `Bedankt voor uw sessie - ${booking.event_types.title}` };
    }

    default:
      console.warn(`[EmailWorkflow] Unknown template type: ${templateType}`);
      return null;
  }
}

// Trigger workflow emails for a booking
export async function triggerWorkflowEmails(
  booking: BookingWithEventType,
  triggerType: EmailWorkflow['trigger_type']
): Promise<{ sent: number; failed: number }> {
  console.log(`[EmailWorkflow] Triggering ${triggerType} emails for booking ${booking.id}`);

  const workflows = await getActiveWorkflows(booking.event_type_id, triggerType);
  console.log(`[EmailWorkflow] Found ${workflows.length} active workflows`);

  let sent = 0;
  let failed = 0;

  for (const workflow of workflows) {
    try {
      // Check if already sent
      const alreadySent = await wasEmailAlreadySent(booking.id, workflow.id);
      if (alreadySent) {
        console.log(`[EmailWorkflow] Email already sent for workflow ${workflow.slug}, skipping`);
        continue;
      }

      // Render template
      const rendered = await renderTemplate(workflow.email_template as TemplateType, booking);
      if (!rendered) {
        console.error(`[EmailWorkflow] Failed to render template ${workflow.email_template}`);
        failed++;
        continue;
      }

      // Use workflow subject or template default
      const subject = workflow.email_subject || rendered.subject;

      // Send email with optional attachments (e.g., ICS calendar file)
      const result = await sendEmail({
        to: booking.customer_email,
        subject,
        html: rendered.html,
        attachments: rendered.attachments,
      });

      if (result.success) {
        await logEmailSent({
          bookingId: booking.id,
          workflowId: workflow.id,
          recipientEmail: booking.customer_email,
          emailSubject: subject,
          status: 'sent',
          resendMessageId: result.messageId,
        });
        sent++;
        console.log(`[EmailWorkflow] Email sent successfully for workflow ${workflow.slug}`);
      } else {
        await logEmailSent({
          bookingId: booking.id,
          workflowId: workflow.id,
          recipientEmail: booking.customer_email,
          emailSubject: subject,
          status: 'failed',
          errorMessage: result.error,
        });
        failed++;
        console.error(`[EmailWorkflow] Failed to send email for workflow ${workflow.slug}:`, result.error);
      }
    } catch (error) {
      console.error(`[EmailWorkflow] Error processing workflow ${workflow.slug}:`, error);
      failed++;
    }
  }

  return { sent, failed };
}

// Get booking with event type for email sending
export async function getBookingWithEventType(bookingId: string): Promise<BookingWithEventType | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
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
    .eq('id', bookingId)
    .single();

  if (error || !data) {
    console.error('[EmailWorkflow] Error fetching booking:', error);
    return null;
  }

  return data as unknown as BookingWithEventType;
}

// Main function to send booking emails (called from API routes)
export async function sendBookingEmails(
  bookingId: string,
  triggerType: EmailWorkflow['trigger_type']
): Promise<{ success: boolean; sent: number; failed: number }> {
  const booking = await getBookingWithEventType(bookingId);

  if (!booking) {
    console.error(`[EmailWorkflow] Booking not found: ${bookingId}`);
    return { success: false, sent: 0, failed: 0 };
  }

  const result = await triggerWorkflowEmails(booking, triggerType);

  return {
    success: result.failed === 0,
    sent: result.sent,
    failed: result.failed,
  };
}
