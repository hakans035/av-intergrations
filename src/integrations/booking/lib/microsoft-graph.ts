// Microsoft Graph Integration for Outlook Calendar and Teams
// Provides calendar availability checking, event creation, and Teams meeting links

import type { Booking, EventType, OutlookFreeBusy, TeamsOnlineMeeting, CalendarEvent } from '../types';

// ============================================
// Configuration
// ============================================

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';
const TOKEN_ENDPOINT = 'https://login.microsoftonline.com';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

// ============================================
// Token Management
// ============================================

/**
 * Get Microsoft Graph access token using client credentials flow
 * Tokens are cached and automatically refreshed before expiry
 */
export async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token (with 5 minute buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.accessToken;
  }

  // Support both naming conventions for env vars
  const clientId = process.env.MICROSOFT_CLIENT_ID || process.env.MS_GRAPH_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET || process.env.MS_GRAPH_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_TENANT_ID || process.env.MS_GRAPH_TENANT_ID || 'common';

  if (!clientId || !clientSecret) {
    throw new Error('Microsoft Graph credentials not configured');
  }

  const tokenUrl = `${TOKEN_ENDPOINT}/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data: TokenResponse = await response.json();

  // Cache the token
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

// ============================================
// Calendar Availability
// ============================================

interface FreeBusyRequest {
  schedules: string[];
  startTime: {
    dateTime: string;
    timeZone: string;
  };
  endTime: {
    dateTime: string;
    timeZone: string;
  };
  availabilityViewInterval: number;
}

interface FreeBusyResponse {
  value: Array<{
    scheduleId: string;
    availabilityView: string;
    scheduleItems: Array<{
      status: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
    }>;
  }>;
}

/**
 * Get calendar availability for users
 * Returns busy time slots within the specified date range
 * Checks both primary and secondary calendars if configured
 */
export async function getAvailability(
  startDate: Date,
  endDate: Date,
  userEmail?: string,
  timezone: string = 'Europe/Amsterdam'
): Promise<OutlookFreeBusy[]> {
  const accessToken = await getAccessToken();
  const primaryEmail = userEmail || process.env.MICROSOFT_USER_EMAIL || process.env.MS_GRAPH_USER_EMAIL;
  const secondaryEmail = process.env.MICROSOFT_USER_EMAIL_SECONDARY;

  if (!primaryEmail) {
    throw new Error('User email not configured for calendar availability');
  }

  // Build list of schedules to check (primary + secondary if configured)
  const schedulesToCheck = [primaryEmail];
  if (secondaryEmail && !userEmail) {
    // Only add secondary if no specific userEmail was requested
    schedulesToCheck.push(secondaryEmail);
  }

  const requestBody: FreeBusyRequest = {
    schedules: schedulesToCheck,
    startTime: {
      dateTime: startDate.toISOString(),
      timeZone: timezone,
    },
    endTime: {
      dateTime: endDate.toISOString(),
      timeZone: timezone,
    },
    availabilityViewInterval: 15, // 15-minute intervals
  };

  // Use /users/{user}/calendar/getSchedule for application credentials
  // /me/calendar/getSchedule only works with delegated (user login) authentication
  const response = await fetch(`${GRAPH_API_BASE}/users/${primaryEmail}/calendar/getSchedule`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get availability: ${error}`);
  }

  const data: FreeBusyResponse = await response.json();

  // Convert schedule items to OutlookFreeBusy format
  const busySlots: OutlookFreeBusy[] = [];
  for (const schedule of data.value) {
    for (const item of schedule.scheduleItems) {
      busySlots.push({
        start: item.start.dateTime,
        end: item.end.dateTime,
        status: item.status as OutlookFreeBusy['status'],
      });
    }
  }

  return busySlots;
}

/**
 * Check if a specific time slot is available
 */
export async function isTimeSlotAvailable(
  startTime: Date,
  endTime: Date,
  userEmail?: string
): Promise<boolean> {
  const busySlots = await getAvailability(startTime, endTime, userEmail);

  // Check if any busy slot overlaps with the requested time
  for (const slot of busySlots) {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);

    // Skip free slots
    if (slot.status === 'free') continue;

    // Check for overlap
    if (startTime < slotEnd && endTime > slotStart) {
      return false;
    }
  }

  return true;
}

// ============================================
// Calendar Events
// ============================================

interface GraphCalendarEvent {
  subject: string;
  body: {
    contentType: string;
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  attendees: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
    type: string;
  }>;
  isOnlineMeeting?: boolean;
  onlineMeetingProvider?: string;
  // Prevent automatic invite emails - we send our own booking confirmation
  isReminderOn?: boolean;
}

/**
 * Create a calendar event in Outlook
 * Optionally creates a Teams meeting link
 */
export async function createCalendarEvent(
  booking: Booking,
  eventType: EventType,
  createTeamsMeeting: boolean = false
): Promise<CalendarEvent> {
  const accessToken = await getAccessToken();
  const userEmail = process.env.MICROSOFT_USER_EMAIL || process.env.MS_GRAPH_USER_EMAIL;

  if (!userEmail) {
    throw new Error('User email not configured for calendar events');
  }

  // Microsoft Graph expects dateTime without 'Z' suffix when timeZone is specified
  // Convert ISO strings to local datetime format
  const formatDateTimeForGraph = (isoString: string): string => {
    // Remove the 'Z' or timezone offset from ISO string
    return isoString.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
  };

  // Get secondary user email for shared calendar
  const secondaryUserEmail = process.env.MICROSOFT_USER_EMAIL_SECONDARY;

  // Build attendees list - include secondary user (Ramin) as required attendee
  // The primary user (Hakan) is the organizer, so he automatically gets the event
  // We DON'T include the customer as attendee to prevent automatic Microsoft invite emails
  const attendees: GraphCalendarEvent['attendees'] = [];

  // Add secondary team member as required attendee
  if (secondaryUserEmail) {
    attendees.push({
      emailAddress: {
        address: secondaryUserEmail,
        name: secondaryUserEmail.split('@')[0].charAt(0).toUpperCase() + secondaryUserEmail.split('@')[0].slice(1),
      },
      type: 'required',
    });
  }

  const eventBody: GraphCalendarEvent = {
    subject: `${eventType.title} - ${booking.customer_name}`,
    body: {
      contentType: 'HTML',
      content: `
        <p><strong>Booking Details</strong></p>
        <p>Customer: ${booking.customer_name}</p>
        <p>Email: ${booking.customer_email}</p>
        ${booking.customer_phone ? `<p>Phone: ${booking.customer_phone}</p>` : ''}
        ${booking.customer_notes ? `<p>Notes: ${booking.customer_notes}</p>` : ''}
      `,
    },
    start: {
      dateTime: formatDateTimeForGraph(booking.start_time),
      timeZone: booking.timezone || 'Europe/Amsterdam',
    },
    end: {
      dateTime: formatDateTimeForGraph(booking.end_time),
      timeZone: booking.timezone || 'Europe/Amsterdam',
    },
    // Include team members as attendees - they will receive calendar invites
    // Customer is NOT included - we send our own booking confirmation email
    attendees,
    // Enable reminder for organizers (15 minutes before by default)
    isReminderOn: true,
  };

  // Add location if on-site
  if (eventType.location_type !== 'online' && eventType.location_address) {
    eventBody.location = {
      displayName: eventType.location_address,
    };
  }

  // Add Teams meeting if requested
  if (createTeamsMeeting && eventType.location_type !== 'on_location') {
    eventBody.isOnlineMeeting = true;
    eventBody.onlineMeetingProvider = 'teamsForBusiness';
  }

  // Use /users/{email}/events for application permissions (client credentials flow)
  // /me/events only works with delegated permissions (user signed in)
  const response = await fetch(`${GRAPH_API_BASE}/users/${userEmail}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventBody),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[MSGraph] Failed to create calendar event:', error);
    throw new Error(`Failed to create calendar event: ${error}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    subject: data.subject,
    start: data.start,
    end: data.end,
    location: data.location,
    onlineMeeting: data.onlineMeeting,
    attendees: data.attendees,
  };
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<{
    subject: string;
    start: Date;
    end: Date;
    timezone: string;
  }>
): Promise<CalendarEvent> {
  const accessToken = await getAccessToken();
  const userEmail = process.env.MICROSOFT_USER_EMAIL || process.env.MS_GRAPH_USER_EMAIL;

  if (!userEmail) {
    throw new Error('User email not configured for calendar events');
  }

  const eventBody: Partial<GraphCalendarEvent> = {};

  if (updates.subject) {
    eventBody.subject = updates.subject;
  }

  if (updates.start) {
    eventBody.start = {
      dateTime: updates.start.toISOString(),
      timeZone: updates.timezone || 'Europe/Amsterdam',
    };
  }

  if (updates.end) {
    eventBody.end = {
      dateTime: updates.end.toISOString(),
      timeZone: updates.timezone || 'Europe/Amsterdam',
    };
  }

  const response = await fetch(`${GRAPH_API_BASE}/users/${userEmail}/events/${eventId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update calendar event: ${error}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    subject: data.subject,
    start: data.start,
    end: data.end,
    location: data.location,
    onlineMeeting: data.onlineMeeting,
    attendees: data.attendees,
  };
}

/**
 * Cancel/delete a calendar event
 */
export async function cancelCalendarEvent(eventId: string): Promise<void> {
  const accessToken = await getAccessToken();
  const userEmail = process.env.MICROSOFT_USER_EMAIL || process.env.MS_GRAPH_USER_EMAIL;

  if (!userEmail) {
    throw new Error('User email not configured for calendar events');
  }

  const response = await fetch(`${GRAPH_API_BASE}/users/${userEmail}/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    throw new Error(`Failed to cancel calendar event: ${error}`);
  }
}

// ============================================
// Teams Meetings
// ============================================

interface OnlineMeetingRequest {
  subject: string;
  startDateTime: string;
  endDateTime: string;
  participants?: {
    attendees: Array<{
      upn?: string;
      emailAddress?: {
        address: string;
        name: string;
      };
    }>;
  };
}

/**
 * Create a standalone Teams meeting (without calendar event)
 */
export async function createTeamsMeeting(
  booking: Booking,
  eventType: EventType
): Promise<TeamsOnlineMeeting> {
  const accessToken = await getAccessToken();
  const userEmail = process.env.MICROSOFT_USER_EMAIL || process.env.MS_GRAPH_USER_EMAIL;

  if (!userEmail) {
    throw new Error('User email not configured for Teams meetings');
  }

  const meetingRequest: OnlineMeetingRequest = {
    subject: `${eventType.title} - ${booking.customer_name}`,
    startDateTime: booking.start_time,
    endDateTime: booking.end_time,
    participants: {
      attendees: [
        {
          emailAddress: {
            address: booking.customer_email,
            name: booking.customer_name,
          },
        },
      ],
    },
  };

  const response = await fetch(`${GRAPH_API_BASE}/users/${userEmail}/onlineMeetings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meetingRequest),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Teams meeting: ${error}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    joinUrl: data.joinUrl || data.joinWebUrl,
    subject: data.subject,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
  };
}

/**
 * Get details of an existing Teams meeting
 */
export async function getTeamsMeeting(meetingId: string): Promise<TeamsOnlineMeeting | null> {
  const accessToken = await getAccessToken();
  const userEmail = process.env.MICROSOFT_USER_EMAIL || process.env.MS_GRAPH_USER_EMAIL;

  if (!userEmail) {
    throw new Error('User email not configured for Teams meetings');
  }

  const response = await fetch(`${GRAPH_API_BASE}/users/${userEmail}/onlineMeetings/${meetingId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.text();
    throw new Error(`Failed to get Teams meeting: ${error}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    joinUrl: data.joinUrl || data.joinWebUrl,
    subject: data.subject,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Create both a calendar event and Teams meeting for a booking
 * This is the recommended approach for online meetings
 */
export async function createBookingWithMeeting(
  booking: Booking,
  eventType: EventType
): Promise<{
  calendarEvent: CalendarEvent;
  meetingUrl: string | null;
}> {
  // Create calendar event with Teams meeting
  const isOnline = eventType.location_type === 'online' || eventType.location_type === 'hybrid';
  const calendarEvent = await createCalendarEvent(booking, eventType, isOnline);

  // Extract meeting URL from calendar event
  const meetingUrl = calendarEvent.onlineMeeting?.joinUrl || null;

  return {
    calendarEvent,
    meetingUrl,
  };
}

/**
 * Get list of upcoming calendar events
 */
export async function getUpcomingEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const accessToken = await getAccessToken();
  const userEmail = process.env.MICROSOFT_USER_EMAIL || process.env.MS_GRAPH_USER_EMAIL;

  if (!userEmail) {
    throw new Error('User email not configured for calendar events');
  }

  const params = new URLSearchParams({
    startDateTime: startDate.toISOString(),
    endDateTime: endDate.toISOString(),
    $select: 'id,subject,start,end,location,onlineMeeting,attendees',
    $orderby: 'start/dateTime',
  });

  const response = await fetch(`${GRAPH_API_BASE}/users/${userEmail}/calendarView?${params}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'outlook.timezone="Europe/Amsterdam"',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get calendar events: ${error}`);
  }

  const data = await response.json();

  return data.value.map((event: {
    id: string;
    subject: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: { displayName: string };
    onlineMeeting?: { joinUrl: string };
    attendees?: Array<{ emailAddress: { address: string; name: string } }>;
  }) => ({
    id: event.id,
    subject: event.subject,
    start: event.start,
    end: event.end,
    location: event.location,
    onlineMeeting: event.onlineMeeting,
    attendees: event.attendees,
  }));
}
