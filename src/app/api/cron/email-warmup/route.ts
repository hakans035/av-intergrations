import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';

// Warmup email addresses - add your own Gmail, Outlook, Yahoo accounts
const WARMUP_EMAILS = [
  // Microsoft/Outlook accounts
  'hakan@ambitionvalley.nl',
  'ramin@ambitionvalley.nl',
  // Add your personal emails here:
  // 'your.gmail@gmail.com',
  // 'your.outlook@outlook.com',
  // 'your.yahoo@yahoo.com',
];

// Warmup schedule (emails per day based on days since start)
function getEmailsPerDay(daysSinceStart: number): number {
  if (daysSinceStart <= 3) return 3;      // Day 1-3: 3 emails/day
  if (daysSinceStart <= 7) return 5;      // Day 4-7: 5 emails/day
  if (daysSinceStart <= 14) return 10;    // Week 2: 10 emails/day
  return 15;                               // Week 3+: 15 emails/day
}

// Warmup start date - set this to when you start warmup
const WARMUP_START_DATE = new Date('2025-12-07'); // Today

// Different email subjects to avoid pattern detection
const EMAIL_SUBJECTS = [
  'Informatie over onze diensten - Ambition Valley',
  'Update van Ambition Valley',
  'Nieuws van het Ambition Valley team',
  'Belangrijke informatie - Ambition Valley',
  'Uw persoonlijke update van Ambition Valley',
];

// Different email content variations
const EMAIL_CONTENTS = [
  {
    greeting: 'Beste',
    body: 'Bedankt voor uw interesse in Ambition Valley. Wij helpen ondernemers met het optimaliseren van hun fiscale situatie en het opbouwen van vermogen.',
    cta: 'Bekijk onze website voor meer informatie over hoe wij u kunnen helpen.',
  },
  {
    greeting: 'Hallo',
    body: 'Bij Ambition Valley geloven we dat elke ondernemer recht heeft op de beste fiscale begeleiding. Onze experts staan klaar om u te helpen.',
    cta: 'Neem gerust contact met ons op voor een vrijblijvend gesprek.',
  },
  {
    greeting: 'Goedendag',
    body: 'Wist u dat veel ondernemers onnodig teveel belasting betalen? Bij Ambition Valley helpen we u om dit te voorkomen met slimme strategieën.',
    cta: 'Ontdek hoe wij u kunnen helpen met een gratis intake gesprek.',
  },
];

function generateWarmupEmail(variation: number): string {
  const content = EMAIL_CONTENTS[variation % EMAIL_CONTENTS.length];

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <tr>
            <td style="background-color: #307cf1; padding: 28px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 22px; font-weight: bold; margin: 0;">AMBITION VALLEY</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <p style="font-size: 16px; color: #1e344b; margin-top: 0; margin-bottom: 16px;">
                ${content.greeting},
              </p>
              <p style="font-size: 15px; color: #64748b; margin-bottom: 24px; line-height: 1.7;">
                ${content.body}
              </p>
              <p style="font-size: 15px; color: #64748b; margin-bottom: 24px; line-height: 1.7;">
                ${content.cta}
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <a href="https://ambitionvalley.nl" style="display: inline-block; padding: 14px 28px; background-color: #307cf1; color: #ffffff; text-decoration: none; border-radius: 100px; font-size: 15px; font-weight: bold;">
                      Bezoek onze website
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 4px;">
                Met vriendelijke groet,
              </p>
              <p style="font-size: 14px; font-weight: bold; color: #1e344b; margin: 0;">
                Het Ambition Valley Team
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 28px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 13px; color: #64748b; margin: 0;">
                <a href="mailto:info@ambitionvalley.nl" style="color: #307cf1; text-decoration: none;">info@ambitionvalley.nl</a>
                <span style="margin: 0 8px; color: #cbd5e1;">|</span>
                <a href="https://www.ambitionvalley.nl" style="color: #307cf1; text-decoration: none;">www.ambitionvalley.nl</a>
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const daysSinceStart = Math.floor((now.getTime() - WARMUP_START_DATE.getTime()) / (1000 * 60 * 60 * 24));

    // Check if warmup is still active (run for 21 days)
    if (daysSinceStart > 21) {
      return NextResponse.json({
        success: true,
        message: 'Warmup period completed (21 days)',
        daysSinceStart,
      });
    }

    if (daysSinceStart < 0) {
      return NextResponse.json({
        success: true,
        message: 'Warmup has not started yet',
        startsIn: Math.abs(daysSinceStart) + ' days',
      });
    }

    const emailsToSend = getEmailsPerDay(daysSinceStart);
    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    // Send emails to warmup addresses
    for (let i = 0; i < emailsToSend; i++) {
      const emailAddress = WARMUP_EMAILS[i % WARMUP_EMAILS.length];
      const subjectVariation = EMAIL_SUBJECTS[(daysSinceStart + i) % EMAIL_SUBJECTS.length];
      const contentVariation = (daysSinceStart + i) % EMAIL_CONTENTS.length;

      const result = await sendEmail({
        to: emailAddress,
        subject: subjectVariation,
        html: generateWarmupEmail(contentVariation),
        type: 'notification',
      });

      results.push({
        email: emailAddress,
        success: result.success,
        error: result.error,
      });

      // Add small delay between emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`[Email Warmup] Day ${daysSinceStart}: Sent ${successCount}/${emailsToSend} emails`);

    return NextResponse.json({
      success: true,
      daysSinceStart,
      emailsTarget: emailsToSend,
      sent: successCount,
      failed: failCount,
      results,
    });
  } catch (error) {
    console.error('[Email Warmup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to run warmup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
