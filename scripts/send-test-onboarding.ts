/**
 * Send test onboarding booking confirmation + lead follow-up emails
 * Usage: npx tsx scripts/send-test-onboarding.ts
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAILS = ['hakan@ambitionvalley.nl', 'ramin@ambitionvalley.nl'];
const FROM_EMAIL = 'Ambition Valley <notifications@ambitionvalley.nl>';

if (!RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY in .env.local');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

function render<P extends object>(Component: React.ComponentType<P>, props: P): string {
  return `<!DOCTYPE html>${renderToStaticMarkup(React.createElement(Component, props))}`;
}

async function main() {
  console.log(`\nSending test emails to ${TO_EMAILS.join(', ')}\n`);

  const { BookingConfirmationEmail, getBookingConfirmationSubject } = await import('../src/lib/email/templates/bookingConfirmation');
  const { LeadFollowUpEmail, getLeadFollowUpSubject } = await import('../src/lib/email/templates/leadFollowUp');

  let sent = 0;

  // 1. Booking Confirmation for a traject (with onboarding form link + Teams link)
  console.log('[1/2] Sending: Booking Confirmation (Private Wealth - with onboarding form)');
  try {
    const subject = getBookingConfirmationSubject('Private Wealth');
    const html = render(BookingConfirmationEmail, {
      customerName: 'Hakan',
      eventTitle: 'Private Wealth',
      eventDate: 'dinsdag 25 februari 2026',
      eventTime: '14:00',
      duration: 60,
      locationType: 'online' as const,
      meetingUrl: 'https://teams.microsoft.com/l/meetup-join/example',
      bookingId: 'test-booking-id',
      cancellationUrl: 'https://check.ambitionvalley.nl/booking/cancel/test-booking-id',
      onboardingFormUrl: 'https://ckbixrvaktizlarmxxvv.supabase.co/storage/v1/object/public/form/form/Onboardingsformulier.docx',
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAILS,
      subject: `[TEST] ${subject}`,
      html,
    });

    if (error) {
      console.error('  ❌ Failed:', error.message);
    } else {
      console.log(`  ✅ Sent (ID: ${data?.id})`);
      sent++;
    }
  } catch (e) {
    console.error('  ❌ Render failed:', e);
  }

  await new Promise(r => setTimeout(r, 1000));

  // 2. Lead Follow-Up ("Heb je nog vragen over je besparingspotentieel?")
  console.log('[2/2] Sending: Lead Follow-Up');
  try {
    const subject = getLeadFollowUpSubject('Hakan');
    const html = render(LeadFollowUpEmail, {
      name: 'Hakan',
      bookingUrl: 'https://check.ambitionvalley.nl/booking',
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAILS,
      subject: `[TEST] ${subject}`,
      html,
    });

    if (error) {
      console.error('  ❌ Failed:', error.message);
    } else {
      console.log(`  ✅ Sent (ID: ${data?.id})`);
      sent++;
    }
  } catch (e) {
    console.error('  ❌ Render failed:', e);
  }

  console.log(`\nDone! Sent: ${sent}/2\n`);
}

main().catch(console.error);
