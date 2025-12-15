import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendEmail, renderEmailTemplate, LeadFollowUpEmail, getLeadFollowUpSubject } from '@/lib/email';

// This cron runs daily at 10:00 Amsterdam time (9:00 UTC in summer, 8:00 UTC in winter)
// It sends follow-up emails to leads who:
// 1. Submitted the form 24-48 hours ago
// 2. Haven't booked an appointment yet
// 3. Haven't received a follow-up email yet

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[Lead Follow-up] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Lead Follow-up] Starting cron job...');

  try {
    const supabase = createServiceClient();

    // Get submissions from 24-48 hours ago that haven't received follow-up
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Fetch form submissions that need follow-up
    const { data: submissions, error: fetchError } = await supabase
      .from('form_submissions')
      .select('id, name, email, created_at, followup_email_sent_at')
      .not('email', 'is', null)
      .is('followup_email_sent_at', null)
      .gte('created_at', fortyEightHoursAgo.toISOString())
      .lte('created_at', twentyFourHoursAgo.toISOString())
      .limit(50);

    if (fetchError) {
      console.error('[Lead Follow-up] Error fetching submissions:', fetchError);
      throw fetchError;
    }

    if (!submissions || submissions.length === 0) {
      console.log('[Lead Follow-up] No submissions need follow-up');
      return NextResponse.json({ success: true, processed: 0 });
    }

    console.log(`[Lead Follow-up] Found ${submissions.length} submissions to check`);

    // Get all bookings to check which leads have already booked
    const emails = submissions.map(s => s.email).filter(Boolean) as string[];
    const { data: bookings } = await supabase
      .from('bookings')
      .select('customer_email')
      .in('customer_email', emails)
      .neq('status', 'cancelled');

    const bookedEmails = new Set(bookings?.map(b => b.customer_email) || []);

    let sentCount = 0;
    let skippedCount = 0;

    const bookingUrl = 'https://check.ambitionvalley.nl/booking';

    for (const submission of submissions) {
      const email = submission.email as string;

      // Skip if they already booked
      if (bookedEmails.has(email)) {
        console.log(`[Lead Follow-up] Skipping ${email} - already booked`);
        skippedCount++;
        continue;
      }

      // Send follow-up email
      try {
        const name = (submission.name as string) || '';
        const { html } = await renderEmailTemplate(
          LeadFollowUpEmail,
          { name, bookingUrl },
          getLeadFollowUpSubject(name)
        );

        const result = await sendEmail({
          to: email,
          subject: getLeadFollowUpSubject(name),
          html,
        });

        if (result.success) {
          // Mark as sent
          await supabase
            .from('form_submissions')
            .update({ followup_email_sent_at: new Date().toISOString() })
            .eq('id', submission.id);

          console.log(`[Lead Follow-up] Sent to ${email}`);
          sentCount++;
        } else {
          console.error(`[Lead Follow-up] Failed to send to ${email}:`, result.error);
        }
      } catch (emailError) {
        console.error(`[Lead Follow-up] Error sending to ${email}:`, emailError);
      }

      // Small delay between emails
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[Lead Follow-up] Complete. Sent: ${sentCount}, Skipped: ${skippedCount}`);

    return NextResponse.json({
      success: true,
      processed: submissions.length,
      sent: sentCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error('[Lead Follow-up] Cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
