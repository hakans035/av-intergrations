# Booking Integration

A custom booking system for Ambition Valley, supporting free intakes, paid sessions, group events, and 1:1 consultations with Stripe payments and Microsoft 365 calendar integration.

## Features

- **Multiple Event Types**: Free intake calls, paid 1:1 sessions, group coaching days
- **Flexible Pricing**: Full payment or 50% deposit option
- **Payment Processing**: Stripe Checkout with iDEAL and card support
- **Calendar Integration**: Microsoft Outlook calendar sync with Teams meeting links
- **Email Notifications**: Automated booking confirmations and cancellation emails
- **Admin Dashboard**: Manage bookings, event types, and availability

## Architecture

```
src/integrations/booking/
├── components/           # React components
│   ├── BookingCalendar.tsx    # Date/time picker
│   ├── BookingConfirmation.tsx # Success page component
│   ├── BookingForm.tsx        # Customer details form
│   ├── EventTypeCard.tsx      # Event type display card
│   └── index.ts
├── lib/                  # Business logic
│   ├── availability.ts        # Slot calculation & validation
│   ├── microsoft-graph.ts     # Outlook/Teams integration
│   └── stripe.ts              # Payment processing
├── types.ts              # TypeScript definitions
├── index.ts              # Main exports
└── README.md
```

## Database Schema

Six tables in Supabase (see `supabase/migrations/20251205140351_initial_schema.sql`):

| Table | Description |
|-------|-------------|
| `event_types` | Event configurations (title, duration, price, location) |
| `availability_schedules` | Weekly availability per event type |
| `event_slots` | Specific time slots for group events |
| `blocked_times` | Blocked periods (holidays, unavailable times) |
| `bookings` | Customer bookings with payment status |
| `booking_attendees` | Additional attendees for group bookings |

## API Routes

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/booking/event-types` | GET | List active event types |
| `/api/booking/event-types/[slug]` | GET | Get event type by slug |
| `/api/booking/availability` | GET | Get available time slots |
| `/api/booking/create` | POST | Create new booking |
| `/api/booking/confirm` | GET | Confirm booking after payment |
| `/api/booking/cancel` | POST | Cancel a booking |
| `/api/booking/webhook` | POST | Stripe webhook handler |

### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/event-types` | GET, POST | List/create event types |
| `/api/admin/event-types/[id]` | GET, PUT, DELETE | Manage event type |
| `/api/admin/bookings` | GET | List all bookings |
| `/api/admin/bookings/[id]` | GET, PUT | Manage booking |

## Pages

### Public Pages

- `/booking` - Event type listing
- `/booking/[slug]` - Booking flow for specific event
- `/booking/[slug]/confirm` - Booking confirmation
- `/booking/cancel/[id]` - Cancel booking

### Admin Pages

- `/admin/booking` - Booking dashboard
- `/admin/booking/event-types` - Manage event types
- `/admin/booking/event-types/new` - Create new event type
- `/admin/booking/event-types/[id]` - Edit event type

## Configuration

### Environment Variables

```bash
# Stripe (required for paid events)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Microsoft Graph (required for calendar/Teams)
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=...
MICROSOFT_USER_EMAIL=...  # Calendar owner email
```

### Event Type Settings

| Field | Description | Default |
|-------|-------------|---------|
| `slug` | URL identifier | required |
| `title` | Display name | required |
| `duration_minutes` | Session length | 60 |
| `location_type` | `online`, `on_location`, `hybrid` | required |
| `price_cents` | Price in cents (0 = free) | 0 |
| `deposit_percent` | Deposit percentage | 50 |
| `max_attendees` | Max participants (1 = 1:1) | 1 |
| `requires_approval` | Manual confirmation needed | false |
| `buffer_before_minutes` | Buffer before event | 0 |
| `buffer_after_minutes` | Buffer after event | 0 |

## Usage Examples

### Creating an Event Type

```typescript
// POST /api/admin/event-types
{
  "slug": "intake-gesprek",
  "title": "Gratis Intake Gesprek",
  "description": "15 minuten kennismakingsgesprek",
  "duration_minutes": 15,
  "location_type": "online",
  "price_cents": 0,
  "max_attendees": 1,
  "is_active": true
}
```

### Fetching Availability

```typescript
// GET /api/booking/availability?eventTypeId=xxx&startDate=2025-01-01&endDate=2025-01-31
{
  "success": true,
  "data": {
    "slots": [
      { "start": "2025-01-15T09:00:00Z", "end": "2025-01-15T09:15:00Z", "available": true },
      { "start": "2025-01-15T09:15:00Z", "end": "2025-01-15T09:30:00Z", "available": true }
    ]
  }
}
```

### Creating a Booking

```typescript
// POST /api/booking/create
{
  "eventTypeId": "uuid",
  "startTime": "2025-01-15T09:00:00Z",
  "customerName": "Jan de Vries",
  "customerEmail": "jan@example.com",
  "customerPhone": "+31612345678",
  "customerNotes": "Interesse in coaching traject"
}

// Response for paid event
{
  "success": true,
  "data": {
    "booking": { ... },
    "checkoutUrl": "https://checkout.stripe.com/...",
    "requiresPayment": true
  }
}
```

## Booking Flow

### Free Event
1. Customer selects date/time
2. Customer fills in details
3. Booking confirmed immediately
4. Calendar event + Teams link created
5. Confirmation email sent

### Paid Event
1. Customer selects date/time
2. Customer fills in details
3. Redirect to Stripe Checkout (deposit or full amount)
4. On success: booking confirmed
5. Calendar event + Teams link created
6. Confirmation email sent

### Cancellation
1. Customer clicks cancel link in email
2. Optionally provides reason
3. Booking cancelled
4. Refund initiated (if paid)
5. Calendar event removed
6. Cancellation email sent

## Components

### BookingCalendar

```tsx
<BookingCalendar
  eventTypeId="uuid"
  onSelectSlot={(slot) => setSelectedSlot(slot)}
  selectedSlot={selectedSlot}
/>
```

### BookingForm

```tsx
<BookingForm
  eventType={eventType}
  selectedSlot={selectedSlot}
  onSubmit={handleSubmit}
  isLoading={submitting}
/>
```

### EventTypeCard

```tsx
<EventTypeCard
  eventType={eventType}
  onClick={() => router.push(`/booking/${eventType.slug}`)}
/>
```

## Microsoft 365 Integration

The integration creates:
- **Outlook Calendar Event**: With customer details and meeting link
- **Teams Meeting**: Auto-generated join URL included in booking

Requires Azure AD app registration with:
- `Calendars.ReadWrite`
- `OnlineMeetings.ReadWrite`

## Stripe Integration

Supports:
- **Checkout Sessions**: Secure hosted payment page
- **iDEAL**: Dutch bank payments
- **Card payments**: Visa, Mastercard, etc.
- **Webhooks**: Payment confirmation handling
- **Refunds**: Automatic refund on cancellation

## Email Templates

Located in `src/lib/email/templates/`:
- `bookingConfirmation.tsx` - Sent after successful booking
- `bookingCancellation.tsx` - Sent after cancellation

## Testing

```bash
# Run all tests
npm run test

# Run booking-specific tests
npm run test -- --grep booking
```

## Local Development

1. Start local Supabase:
   ```bash
   npx supabase start
   ```

2. Generate types:
   ```bash
   npx supabase gen types typescript --local > src/lib/supabase/types.ts
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. For Stripe webhooks locally:

   **First time setup:**
   ```bash
   # Install Stripe CLI (macOS)
   brew install stripe/stripe-cli/stripe

   # Or download from: https://stripe.com/docs/stripe-cli

   # Login to your Stripe account
   stripe login
   ```

   **Create webhook endpoint in Stripe Dashboard (for production):**
   1. Go to https://dashboard.stripe.com/webhooks
   2. Click "Add endpoint"
   3. Enter URL: `https://your-domain.com/api/booking/webhook`
   4. Select events:
      - `checkout.session.completed`
      - `checkout.session.expired`
      - `payment_intent.succeeded`
      - `payment_intent.payment_failed`
   5. Copy the signing secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`

   **For local development:**
   ```bash
   # Start webhook forwarding (run in separate terminal)
   stripe listen --forward-to localhost:3000/api/booking/webhook

   # Copy the webhook signing secret from the output (starts with whsec_)
   # and add it to .env.local as STRIPE_WEBHOOK_SECRET
   ```

   **Test a webhook:**
   ```bash
   stripe trigger checkout.session.completed
   ```
