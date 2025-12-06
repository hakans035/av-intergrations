// ICS Calendar File Generator
// Creates .ics files for calendar invites that can be attached to emails

export interface ICSEventParams {
  uid: string;
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  location?: string;
  meetingUrl?: string;
  organizerName: string;
  organizerEmail: string;
  attendeeName: string;
  attendeeEmail: string;
}

/**
 * Format a date for ICS format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escape special characters for ICS format
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate an ICS calendar file content
 */
export function generateICS(params: ICSEventParams): string {
  const {
    uid,
    title,
    description,
    startTime,
    endTime,
    location,
    meetingUrl,
    organizerName,
    organizerEmail,
    attendeeName,
    attendeeEmail,
  } = params;

  const now = formatICSDate(new Date().toISOString());
  const start = formatICSDate(startTime);
  const end = formatICSDate(endTime);

  // Build description with meeting URL if available
  let fullDescription = escapeICS(description);
  if (meetingUrl) {
    fullDescription += `\\n\\nDeelnemen aan meeting: ${meetingUrl}`;
  }

  // Build location string
  let locationString = location || '';
  if (meetingUrl && !location) {
    locationString = 'Online Meeting (Microsoft Teams)';
  } else if (meetingUrl && location) {
    locationString = `${location} / Online Meeting`;
  }

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ambition Valley//Booking System//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}@ambitionvalley.nl`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${fullDescription}`,
    `ORGANIZER;CN=${escapeICS(organizerName)}:mailto:${organizerEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=FALSE;CN=${escapeICS(attendeeName)}:mailto:${attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
  ];

  // Add location if available
  if (locationString) {
    icsLines.push(`LOCATION:${escapeICS(locationString)}`);
  }

  // Add URL if available (for Teams meeting link)
  if (meetingUrl) {
    icsLines.push(`URL:${meetingUrl}`);
  }

  // Add reminder (15 minutes before)
  icsLines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Herinnering: ${escapeICS(title)}`,
    'END:VALARM'
  );

  icsLines.push('END:VEVENT', 'END:VCALENDAR');

  return icsLines.join('\r\n');
}

/**
 * Generate ICS file as a Buffer for email attachment
 */
export function generateICSBuffer(params: ICSEventParams): Buffer {
  const icsContent = generateICS(params);
  return Buffer.from(icsContent, 'utf-8');
}
