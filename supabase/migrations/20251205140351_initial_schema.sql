-- Form submissions table
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  answers JSONB NOT NULL,
  qualification_result TEXT NOT NULL,
  redirected_to TEXT,
  user_agent TEXT,
  ip_address TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  session_id TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form events table
CREATE TABLE form_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  form_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  field_ref TEXT,
  field_index INTEGER,
  event_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_email ON form_submissions(email);
CREATE INDEX idx_form_submissions_qualification ON form_submissions(qualification_result);
CREATE INDEX idx_form_submissions_created ON form_submissions(created_at);

CREATE INDEX idx_form_events_session ON form_events(session_id);
CREATE INDEX idx_form_events_form ON form_events(form_id);
CREATE INDEX idx_form_events_type ON form_events(event_type);
CREATE INDEX idx_form_events_timestamp ON form_events(timestamp);

-- Row Level Security
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_events ENABLE ROW LEVEL SECURITY;

-- Allow insert for anonymous users (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON form_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON form_events
  FOR INSERT TO anon WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role full access" ON form_submissions
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON form_events
  FOR ALL TO service_role USING (true);

-- ============================================
-- BOOKING SYSTEM TABLES
-- ============================================

-- Event Types (admin-configurable)
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  location_type TEXT NOT NULL CHECK (location_type IN ('online', 'on_location', 'hybrid')),
  location_address TEXT,
  price_cents INTEGER DEFAULT 0,
  deposit_percent INTEGER DEFAULT 50,
  max_attendees INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring availability schedule (weekly working hours)
CREATE TABLE availability_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Available Time Slots (for one-time slots and group events)
CREATE TABLE event_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_attendees INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked dates/times (override availability)
CREATE TABLE blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES event_types(id),
  event_slot_id UUID REFERENCES event_slots(id),

  -- Customer info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_notes TEXT,

  -- Scheduling
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Europe/Amsterdam',

  -- Meeting details
  meeting_url TEXT,
  meeting_id TEXT,
  location_address TEXT,

  -- Payment
  total_price_cents INTEGER DEFAULT 0,
  deposit_cents INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid', 'refunded', 'failed')),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking attendees (for group events)
CREATE TABLE booking_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Indexes
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_event_type ON bookings(event_type_id);
CREATE INDEX idx_event_slots_event_type ON event_slots(event_type_id);
CREATE INDEX idx_event_slots_start_time ON event_slots(start_time);
CREATE INDEX idx_availability_event_type ON availability_schedules(event_type_id);
CREATE INDEX idx_blocked_times_event_type ON blocked_times(event_type_id);
CREATE INDEX idx_booking_attendees_booking ON booking_attendees(booking_id);

-- Booking RLS
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_attendees ENABLE ROW LEVEL SECURITY;

-- Public read for active event types
CREATE POLICY "Public can view active event types" ON event_types
  FOR SELECT USING (is_active = true);

-- Public can view availability schedules
CREATE POLICY "Public can view availability" ON availability_schedules
  FOR SELECT USING (is_active = true);

-- Public can view active slots
CREATE POLICY "Public can view active slots" ON event_slots
  FOR SELECT USING (is_active = true);

-- Public can view blocked times (to calculate availability)
CREATE POLICY "Public can view blocked times" ON blocked_times
  FOR SELECT USING (true);

-- Public can create bookings
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Public can view their own bookings by email
CREATE POLICY "Public can view own bookings" ON bookings
  FOR SELECT USING (true);

-- Public can create attendees
CREATE POLICY "Public can create attendees" ON booking_attendees
  FOR INSERT WITH CHECK (true);

-- Service role full access for booking tables
CREATE POLICY "Service role full access event_types" ON event_types
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access availability" ON availability_schedules
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access event_slots" ON event_slots
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access blocked_times" ON blocked_times
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access bookings" ON bookings
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access attendees" ON booking_attendees
  FOR ALL TO service_role USING (true);

-- ============================================
-- EMAIL WORKFLOW SYSTEM TABLES
-- ============================================

-- Email Workflows (Calendly-style automation rules)
CREATE TABLE email_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'booking_confirmed',
    'booking_cancelled',
    'before_event',
    'after_event'
  )),
  trigger_offset_minutes INTEGER DEFAULT 0, -- negative = before, positive = after, 0 = immediate
  email_subject TEXT NOT NULL,
  email_template TEXT NOT NULL, -- template identifier (e.g., 'booking_confirmation', 'reminder', 'follow_up')
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Logs (audit trail and duplicate prevention)
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  workflow_id UUID REFERENCES email_workflows(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  email_subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  resend_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add completed_at to bookings for tracking when events finish
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Email Workflow Indexes
CREATE INDEX idx_email_workflows_event_type ON email_workflows(event_type_id);
CREATE INDEX idx_email_workflows_trigger ON email_workflows(trigger_type);
CREATE INDEX idx_email_workflows_active ON email_workflows(is_active);
CREATE INDEX idx_email_logs_booking ON email_logs(booking_id);
CREATE INDEX idx_email_logs_workflow ON email_logs(workflow_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at);

-- Email Workflow RLS
ALTER TABLE email_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Service role full access for email tables
CREATE POLICY "Service role full access email_workflows" ON email_workflows
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access email_logs" ON email_logs
  FOR ALL TO service_role USING (true);

-- ============================================
-- INVOICE SYSTEM TABLES
-- ============================================

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Invoice identification
  invoice_number TEXT UNIQUE NOT NULL,  -- e.g., AV-2025-0001
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Stripe references
  stripe_invoice_id TEXT,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,

  -- Customer info (denormalized for historical record)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- Invoice details
  description TEXT NOT NULL,
  currency TEXT DEFAULT 'EUR',
  line_items JSONB NOT NULL,  -- [{description, quantity, unit_price_cents, total_cents}]

  -- Amount breakdown
  subtotal_cents INTEGER NOT NULL,
  btw_percent NUMERIC(5,2) DEFAULT 21.00,
  btw_amount_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,

  -- Invoice type and status
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('deposit', 'balance', 'full_payment', 'refund')),
  status TEXT DEFAULT 'paid' CHECK (status IN ('draft', 'paid', 'voided', 'refunded')),

  -- PDF storage
  pdf_url TEXT,  -- Supabase Storage URL
  pdf_path TEXT,  -- Storage path: invoices/2025/AV-2025-0001.pdf
  stripe_pdf_url TEXT,  -- Original Stripe hosted URL

  -- Timestamps
  invoice_date TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice number sequence
CREATE SEQUENCE invoice_number_seq START 1;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_val INTEGER;
  current_year TEXT;
BEGIN
  next_val := nextval('invoice_number_seq');
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  RETURN 'AV-' || current_year || '-' || LPAD(next_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Invoice Indexes
CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);

-- Invoice RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access invoices" ON invoices
  FOR ALL TO service_role USING (true);
