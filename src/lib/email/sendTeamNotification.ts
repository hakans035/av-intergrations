import { sendEmail } from './resend';
import { renderEmailTemplate } from './renderEmail';
import { TeamNotificationEmail, getTeamNotificationSubject } from './templates/teamNotification';
import type { NotificationType, TeamNotificationEmailProps } from './templates/teamNotification';

// Team email addresses
const TEAM_EMAILS = [
  'hakan@ambitionvalley.nl',
  'ramin@ambitionvalley.nl',
];

export interface SendTeamNotificationParams {
  type: NotificationType;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  qualificationResult?: string;
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
}

/**
 * Send notification email to the team
 */
export async function sendTeamNotification(params: SendTeamNotificationParams): Promise<void> {
  const {
    type,
    leadName,
    leadEmail,
    leadPhone,
    qualificationResult,
    eventTitle,
    eventDate,
    eventTime,
  } = params;

  const timestamp = new Date().toLocaleString('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const emailProps: TeamNotificationEmailProps = {
    type,
    leadName,
    leadEmail,
    leadPhone,
    qualificationResult,
    eventTitle,
    eventDate,
    eventTime,
    timestamp,
  };

  try {
    const { html } = await renderEmailTemplate(
      TeamNotificationEmail,
      emailProps,
      getTeamNotificationSubject(type, leadName)
    );

    const subject = getTeamNotificationSubject(type, leadName);

    // Send to all team members
    const sendPromises = TEAM_EMAILS.map((email) =>
      sendEmail({
        to: email,
        subject,
        html,
        type: 'notification',
      })
    );

    const results = await Promise.allSettled(sendPromises);

    // Log results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        console.log(`[Team Notification] Sent to ${TEAM_EMAILS[index]}`);
      } else {
        const error = result.status === 'rejected' ? result.reason : result.value.error;
        console.error(`[Team Notification] Failed to send to ${TEAM_EMAILS[index]}:`, error);
      }
    });
  } catch (error) {
    console.error('[Team Notification] Error:', error);
  }
}
