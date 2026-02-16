/**
 * Send all email templates to a test recipient
 * Usage: npx tsx scripts/send-all-emails.ts
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = 'ramin@ambitionvalley.nl';
const FROM_EMAIL = 'Ambition Valley <notifications@ambitionvalley.nl>';

if (!RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY in .env.local');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

async function sendTestEmail(subject: string, html: string, index: number) {
  console.log(`[${index + 1}/9] Sending: ${subject}`);
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [TO_EMAIL],
    subject: `[TEST] ${subject}`,
    html,
  });

  if (error) {
    console.error(`  ❌ Failed:`, error.message);
    return false;
  }
  console.log(`  ✅ Sent (ID: ${data?.id})`);
  return true;
}

function render<P extends object>(Component: React.ComponentType<P>, props: P): string {
  return `<!DOCTYPE html>${renderToStaticMarkup(React.createElement(Component, props))}`;
}

async function main() {
  console.log(`\nSending all 9 email templates to ${TO_EMAIL}\n`);

  // Dynamic imports to handle path aliases
  const { BookingConfirmationEmail, getBookingConfirmationSubject } = await import('../src/lib/email/templates/bookingConfirmation');
  const { BookingCancellationEmail, getBookingCancellationSubject } = await import('../src/lib/email/templates/bookingCancellation');
  const { BookingReminderEmail, getBookingReminderSubject } = await import('../src/lib/email/templates/bookingReminder');
  const { CalculatorReportEmail, getEmailSubject } = await import('../src/lib/email/templates/calculatorReport');
  const { FormSubmissionEmail, getFormEmailSubject } = await import('../src/lib/email/templates/formSubmission');
  const { IntakeFollowUpEmail, getIntakeFollowUpSubject } = await import('../src/lib/email/templates/intakeFollowUp');
  const { LeadFollowUpEmail, getLeadFollowUpSubject } = await import('../src/lib/email/templates/leadFollowUp');
  const { TeamNotificationEmail, getTeamNotificationSubject } = await import('../src/lib/email/templates/teamNotification');

  let sent = 0;
  let failed = 0;

  // 1. Booking Confirmation
  try {
    const subject = getBookingConfirmationSubject('Gratis Intake Gesprek');
    const html = render(BookingConfirmationEmail, {
      customerName: 'Ramin',
      eventTitle: 'Gratis Intake Gesprek',
      eventDate: 'dinsdag 18 februari 2026',
      eventTime: '14:00',
      duration: 30,
      locationType: 'online' as const,
      meetingUrl: 'https://teams.microsoft.com/l/meetup-join/test',
      bookingId: 'test-booking-001',
      cancellationUrl: 'https://check.ambitionvalley.nl/booking/cancel/test-booking-001',
      showInvoiceNotice: false,
    });
    (await sendTestEmail(subject, html, 0)) ? sent++ : failed++;
  } catch (e) { console.error('  ❌ Render failed:', e); failed++; }

  // Small delay between emails
  await new Promise(r => setTimeout(r, 1000));

  // 2. Booking Cancellation
  try {
    const subject = getBookingCancellationSubject();
    const html = render(BookingCancellationEmail, {
      customerName: 'Ramin',
      eventTitle: 'Gratis Intake Gesprek',
      eventDate: 'dinsdag 18 februari 2026',
      eventTime: '14:00',
    });
    (await sendTestEmail(subject, html, 1)) ? sent++ : failed++;
  } catch (e) { console.error('  ❌ Render failed:', e); failed++; }

  await new Promise(r => setTimeout(r, 1000));

  // 3. Booking Reminder
  try {
    const subject = getBookingReminderSubject('Gratis Intake Gesprek', 1);
    const html = render(BookingReminderEmail, {
      customerName: 'Ramin',
      eventTitle: 'Gratis Intake Gesprek',
      eventDate: 'dinsdag 18 februari 2026',
      eventTime: '14:00',
      duration: 30,
      locationType: 'online' as const,
      meetingUrl: 'https://teams.microsoft.com/l/meetup-join/test',
      daysUntil: 1,
      cancellationUrl: 'https://check.ambitionvalley.nl/booking/cancel/test-booking-001',
    });
    (await sendTestEmail(subject, html, 2)) ? sent++ : failed++;
  } catch (e) { console.error('  ❌ Render failed:', e); failed++; }

  await new Promise(r => setTimeout(r, 1000));

  // 4. Calculator Report (Sparen vs Beleggen)
  try {
    const subject = getEmailSubject('sparen-vs-beleggen');
    const html = render(CalculatorReportEmail, {
      summary: {
        calculatorType: 'sparen-vs-beleggen' as const,
        eindkapitaalBeleggen: 158432,
        eindkapitaalSparen: 112500,
        verschil: 45932,
      },
    });
    (await sendTestEmail(subject, html, 3)) ? sent++ : failed++;
  } catch (e) { console.error('  ❌ Render failed:', e); failed++; }

  await new Promise(r => setTimeout(r, 1000));

  // 5. Form Submission
  try {
    const subject = getFormEmailSubject();
    const html = render(FormSubmissionEmail, {
      name: 'Ramin',
      email: 'ramin@ambitionvalley.nl',
      qualificationResult: 'qualified' as const,
      formId: 'test-form-001',
      answers: {
        q1: { question: 'Wat is uw naam?', answer: 'Ramin' },
        q2: { question: 'Wat is uw e-mailadres?', answer: 'ramin@ambitionvalley.nl' },
        q3: { question: 'Wat is uw beroep?', answer: 'Ondernemer' },
        q4: { question: 'Heeft u een eigen BV?', answer: 'Ja' },
        q5: { question: 'Wat is uw jaarlijkse omzet?', answer: '€100.000 - €250.000' },
      },
    });
    (await sendTestEmail(subject, html, 4)) ? sent++ : failed++;
  } catch (e) { console.error('  ❌ Render failed:', e); failed++; }

  await new Promise(r => setTimeout(r, 1000));

  // 6. Intake Follow-Up
  try {
    const subject = getIntakeFollowUpSubject();
    const html = render(IntakeFollowUpEmail, {
      customerName: 'Ramin',
      eventTitle: 'Gratis Intake Gesprek',
      trajectenUrl: 'https://check.ambitionvalley.nl/booking/trajecten',
    });
    (await sendTestEmail(subject, html, 5)) ? sent++ : failed++;
  } catch (e) { console.error('  ❌ Render failed:', e); failed++; }

  await new Promise(r => setTimeout(r, 1000));

  // 7. Lead Follow-Up
  try {
    const subject = getLeadFollowUpSubject('Ramin');
    const html = render(LeadFollowUpEmail, {
      name: 'Ramin',
      bookingUrl: 'https://check.ambitionvalley.nl/booking',
    });
    (await sendTestEmail(subject, html, 6)) ? sent++ : failed++;
  } catch (e) { console.error('  ❌ Render failed:', e); failed++; }

  await new Promise(r => setTimeout(r, 1000));

  // 8. Team Notification (New Lead)
  try {
    const subject = getTeamNotificationSubject('new_lead', 'Ramin');
    const html = render(TeamNotificationEmail, {
      type: 'new_lead' as const,
      leadName: 'Ramin',
      leadEmail: 'ramin@ambitionvalley.nl',
      leadPhone: '+31 6 12345678',
      qualificationResult: 'qualified',
      timestamp: new Date().toISOString(),
    });
    (await sendTestEmail(subject, html, 7)) ? sent++ : failed++;
  } catch (e) { console.error('  ❌ Render failed:', e); failed++; }

  console.log(`\nDone! Sent: ${sent}, Failed: ${failed}\n`);
}

main().catch(console.error);
