# Ambition Valley Integrations

A Next.js 16 application for Ambition Valley that provides:
- **Booking System** - Cal.com-style appointment scheduling with Outlook calendar sync
- **Financial Calculators** - Interactive calculators with PDF report generation
- **Form System** - Typeform-compatible forms with conditional logic

## Architecture Overview

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── booking/        # Booking API endpoints
│   │   └── admin/          # Admin API endpoints
│   ├── booking/            # Public booking pages
│   └── admin/              # Admin dashboard
├── integrations/
│   ├── booking/            # Booking system
│   │   ├── components/     # Calendar, forms
│   │   ├── lib/            # Availability, Microsoft Graph
│   │   └── types.ts        # TypeScript types
│   ├── calculators/        # Financial calculators
│   └── form/               # Form system
└── lib/
    ├── supabase/           # Database client
    └── email/              # Resend email templates
```

## Booking System

### How It Works

1. **Event Types** - Define appointment types (duration, price, location, availability)
2. **Availability Schedules** - Set recurring weekly availability (Mon-Fri, 9-17)
3. **Calendar Integration** - Syncs with Outlook calendars to prevent double-booking
4. **Booking Flow** - Customer selects date/time → fills form → receives confirmation

### Outlook Calendar Sync

The booking system checks **both** Hakan's and Ramin's Outlook calendars for conflicts:

```
MICROSOFT_USER_EMAIL=hakan@ambitionvalley.nl       # Primary calendar
MICROSOFT_USER_EMAIL_SECONDARY=ramin@ambitionvalley.nl  # Secondary calendar
```

When a customer tries to book, the system:
1. Gets busy slots from both calendars
2. Filters out times that conflict with either calendar
3. Only shows available times in the booking widget

### Testing Outlook Integration

```bash
npx tsx scripts/test-microsoft-graph.ts
```

This tests:
- Access token retrieval
- User access for both calendars
- Combined availability check
- Calendar event creation with Teams meeting

### Timezone Handling

All availability calculations use **Europe/Amsterdam** timezone:
- Database stores `day_of_week` (0=Sunday, 1=Monday, etc.)
- Backend generates slots with explicit timezone offsets
- Frontend displays dates in local timezone

## Environment Variables

### Required for Production

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Microsoft Graph (Outlook + Teams)
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx
MICROSOFT_TENANT_ID=xxx
MICROSOFT_USER_EMAIL=hakan@ambitionvalley.nl
MICROSOFT_USER_EMAIL_SECONDARY=ramin@ambitionvalley.nl

# Resend (Email)
RESEND_API_KEY=xxx

# Base URL
NEXT_PUBLIC_BASE_URL=https://check.ambitionvalley.nl
```

### Local Development

```env
# Use local Supabase (run: npx supabase start)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start>
```

## Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server

# Testing
npm run test             # Run unit tests (Vitest)
npx tsx scripts/test-microsoft-graph.ts  # Test Outlook integration

# Database (Local Supabase)
npx supabase start       # Start local Supabase (Docker required)
npx supabase stop        # Stop local Supabase
npx supabase db reset    # Reset and apply migrations

# Generate TypeScript types from database
npx supabase gen types typescript --local > src/lib/supabase/types.ts

# Deploy
vercel --prod            # Deploy to Vercel production
```

## Database Schema

### Key Tables

- `event_types` - Appointment types (slug, title, duration, price, location)
- `availability_schedules` - Weekly recurring availability (day_of_week, start_time, end_time)
- `bookings` - Customer bookings with status tracking
- `blocked_times` - Manually blocked time slots

### Day of Week Convention

```
0 = Sunday (Zondag)
1 = Monday (Maandag)
2 = Tuesday (Dinsdag)
3 = Wednesday (Woensdag)
4 = Thursday (Donderdag)
5 = Friday (Vrijdag)
6 = Saturday (Zaterdag)
```

## Microsoft Azure Setup

### Required API Permissions (Application)

In Azure Portal → App Registrations → API Permissions:

- `User.Read.All` - Read user profiles
- `Calendars.ReadWrite` - Create/read calendar events
- `OnlineMeetings.ReadWrite.All` - Create Teams meetings

**Important:** Grant admin consent after adding permissions.

### Authentication Flow

Uses OAuth2 Client Credentials flow (app-only, no user login required):
```
POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
```

## Troubleshooting

### Calendar shows wrong days (off by one)

The calendar was showing Tuesday-Saturday instead of Monday-Friday. This was caused by:
1. **Backend**: Using `toISOString()` which converts to UTC
2. **Frontend**: Same issue in `BookingCalendar.tsx`

**Fix**: Use explicit timezone offsets and local date formatting.

### Outlook integration not checking secondary calendar

Make sure `MICROSOFT_USER_EMAIL_SECONDARY` is set in `.env.local` and on Vercel.

### "Access token only works with delegated authentication"

The `/me/calendar/getSchedule` endpoint requires user login. Use `/users/{email}/calendar/getSchedule` instead for application credentials.

## Financial Calculators

### Available Calculators

| Calculator | Slug | Description |
|------------|------|-------------|
| Sparen vs Beleggen | `sparen-vs-beleggen` | Compare savings vs investment returns |
| Pensioenbeleggen | `pensioenbeleggen` | Pension investment calculator with growth phases |

### Embedding Calculators

#### Single Calculator (iframe)

Embed a specific calculator:

```html
<iframe
  src="https://check.ambitionvalley.nl/calculators/sparen-vs-beleggen"
  width="100%"
  height="700"
  frameborder="0"
></iframe>
```

#### All Calculators with Tabs

Embed all calculators with a tab switcher:

```html
<iframe
  src="https://check.ambitionvalley.nl/calculators/all"
  width="100%"
  height="750"
  frameborder="0"
></iframe>
```

You can pre-select a calculator using the `calc` query parameter:

```html
<!-- Pre-select pensioenbeleggen -->
<iframe
  src="https://check.ambitionvalley.nl/calculators/all?calc=pensioenbeleggen"
  width="100%"
  height="750"
  frameborder="0"
></iframe>
```

#### Custom Theming

Customize colors via URL parameters:

```html
<iframe
  src="https://check.ambitionvalley.nl/calculators/sparen-vs-beleggen?bg=ffffff&accent=307cf1&text=0f172a"
  width="100%"
  height="700"
  frameborder="0"
></iframe>
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `bg` | Background color (hex) | `ffffff` |
| `accent` | Accent color (hex) | `307cf1` |
| `text` | Text color (hex) | `0f172a` |

### Calculator Routes

| Route | Description |
|-------|-------------|
| `/calculators` | Redirects to first enabled calculator |
| `/calculators/[slug]` | Single calculator page |
| `/calculators/all` | All calculators with tab switcher |
| `/calculators/all?calc=slug` | Pre-select specific calculator |

### PDF Reports

Users can request email reports with PDF attachments:
- API endpoint: `POST /api/report/send`
- Rate limited: 5 requests per email per hour
- PDF generated with `@react-pdf/renderer`

## File Locations

| Feature | Location |
|---------|----------|
| Booking API | `src/app/api/booking/` |
| Calendar Component | `src/integrations/booking/components/BookingCalendar.tsx` |
| Availability Logic | `src/integrations/booking/lib/availability.ts` |
| Microsoft Graph | `src/integrations/booking/lib/microsoft-graph.ts` |
| Calculators | `src/integrations/calculators/` |
| Calculator UI | `src/integrations/calculators/calculators/[slug]/ui.tsx` |
| Database Migrations | `supabase/migrations/` |
| Test Scripts | `scripts/` |