# Microsoft Graph Integration

This project uses the Microsoft Graph API to integrate with Outlook Calendar and Microsoft Teams for the booking system.

## What It Does

- **Calendar Availability** — Checks free/busy status on Outlook calendars (primary + secondary) to prevent double bookings
- **Calendar Events** — Creates, updates, and deletes Outlook calendar events when bookings are made/cancelled
- **Teams Meetings** — Automatically generates Teams meeting links for online bookings
- **Multi-Calendar** — Supports checking two calendars (e.g. Hakan + Ramin) for combined availability

## Architecture

```
src/integrations/booking/
├── lib/
│   ├── microsoft-graph.ts   # Graph API client (auth, calendar, Teams)
│   └── availability.ts      # Availability engine (combines schedules + Outlook)
├── types.ts                 # TypeScript types (OutlookFreeBusy, CalendarEvent, etc.)
└── components/              # Booking UI components
```

## Auth Flow

Uses **OAuth 2.0 Client Credentials** (app-only, no user login required):

```
App → POST /oauth2/v2.0/token → Access Token → Graph API
```

- Tokens are cached in memory with a 5-minute refresh buffer
- Uses `/users/{email}/...` endpoints (not `/me/...` since there's no signed-in user)

## Environment Variables

```env
# Required
MICROSOFT_CLIENT_ID="your-azure-app-client-id"
MICROSOFT_CLIENT_SECRET="your-azure-app-client-secret"
MICROSOFT_TENANT_ID="your-azure-tenant-id"
MICROSOFT_USER_EMAIL="primary@yourdomain.com"

# Optional — second calendar to check for availability
MICROSOFT_USER_EMAIL_SECONDARY="secondary@yourdomain.com"
```

## Azure Portal Setup

### 1. Register an App

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click **New registration**
3. Name it (e.g. "AV Booking System")
4. Set **Supported account types** to "Single tenant"
5. Click **Register**
6. Copy the **Application (client) ID** → `MICROSOFT_CLIENT_ID`
7. Copy the **Directory (tenant) ID** → `MICROSOFT_TENANT_ID`

### 2. Create a Client Secret

1. Go to **Certificates & secrets** → **New client secret**
2. Add a description and expiry
3. Copy the secret **Value** (not the ID) → `MICROSOFT_CLIENT_SECRET`

### 3. Grant API Permissions

Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Application permissions**:

| Permission | Purpose |
|---|---|
| `Calendars.ReadWrite` | Read/write calendar events, check free/busy |
| `User.Read.All` | Look up user profiles for calendar access |
| `OnlineMeetings.ReadWrite.All` | Create Teams meeting links |

After adding, click **Grant admin consent for [your tenant]**.

## API Functions

### Token Management

```typescript
getAccessToken(): Promise<string>
```
Gets a cached or fresh access token via client credentials flow.

### Calendar Availability

```typescript
// Get busy slots for a date range (checks both calendars)
getAvailability(startDate, endDate, userEmail?, timezone?): Promise<OutlookFreeBusy[]>

// Check if a specific time slot is free
isTimeSlotAvailable(startTime, endTime, userEmail?): Promise<boolean>
```

Default timezone: `Europe/Amsterdam`. Availability is checked in 15-minute intervals.

### Calendar Events

```typescript
// Create event (optionally with Teams meeting link)
createCalendarEvent(booking, eventType, createTeamsMeeting?): Promise<CalendarEvent>

// Update event (subject, start/end time)
updateCalendarEvent(eventId, updates): Promise<CalendarEvent>

// Delete event
cancelCalendarEvent(eventId): Promise<void>

// List upcoming events
getUpcomingEvents(startDate, endDate): Promise<CalendarEvent[]>
```

### Teams Meetings

```typescript
// Create standalone Teams meeting
createTeamsMeeting(booking, eventType): Promise<TeamsOnlineMeeting>

// Get existing meeting details
getTeamsMeeting(meetingId): Promise<TeamsOnlineMeeting | null>
```

### Combined (Recommended)

```typescript
// Creates calendar event + Teams link in one call
createBookingWithMeeting(booking, eventType): Promise<{
  calendarEvent: CalendarEvent;
  meetingUrl: string | null;
}>
```

## How Availability Works

The availability engine in `availability.ts` combines multiple sources:

```
1. Recurring weekly schedules (from DB)
2. One-time event slots (from DB)
3. Blocked times (from DB)
4. Existing bookings (from DB)
5. Outlook calendar busy slots (from Graph API)  ← Microsoft Graph
6. Filter past slots
7. Sort by start time
```

Outlook checking is automatic when `MS_GRAPH_CLIENT_ID` is set. If the Graph API call fails, availability calculation continues without it (graceful degradation).

## Booking Flow

```
Customer selects time slot
  → POST /api/booking/create
    → Check availability (including Outlook)
    → Create booking in DB
    → createBookingWithMeeting()
      → Creates Outlook calendar event on primary user's calendar
      → Adds secondary user as required attendee
      → Generates Teams meeting link (for online events)
      → Customer is NOT added as attendee (we send our own emails)
    → Send booking confirmation email with .ics attachment
    → Send team notification email
```

On cancellation:
```
POST /api/booking/cancel
  → cancelCalendarEvent(eventId)  → Deletes from Outlook
  → Send cancellation email
```

## Important Notes

- **Customer is not added as a calendar attendee** — we send custom booking confirmation emails instead of relying on Outlook's auto-invite
- **Secondary email** is added as a required attendee so both team members see the event
- Calendar events include customer details (name, email, phone, notes) in the event body
- The event subject format is: `{Event Type Title} - {Customer Name}`
- Events use `teamsForBusiness` as the online meeting provider

## Testing

Run the test script to verify your Graph API setup:

```bash
npx tsx scripts/test-microsoft-graph.ts
```

This will:
1. Verify environment variables
2. Get an access token
3. Test user access
4. Test calendar read access
5. Test availability checking (both calendars)
6. Create and delete a test calendar event with Teams link
