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

-- Follow-up tracking
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS followup_email_sent_at TIMESTAMPTZ;

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
  booking_duration_minutes INTEGER, -- Override for slot length (NULL = use duration_minutes)
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
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'not_required', 'deposit_paid', 'fully_paid', 'refunded', 'failed')),
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
-- EMAIL WORKFLOWS: Default automation rules
-- ============================================

INSERT INTO email_workflows (id, name, slug, description, event_type_id, trigger_type, trigger_offset_minutes, email_subject, email_template, is_active) VALUES
  -- Gratis Intake workflows
  ('660e8400-e29b-41d4-a716-446655440001', 'Intake Bevestiging', 'intake-bevestiging', 'Bevestigingsmail na het boeken van een gratis intake gesprek', '550e8400-e29b-41d4-a716-446655440001', 'booking_confirmed', 0, 'Bevestiging: Je intake gesprek bij Ambition Valley', 'booking_confirmation', true),
  ('660e8400-e29b-41d4-a716-446655440002', 'Intake Herinnering (3 dagen)', 'intake-herinnering-3d', 'Herinnering 3 dagen voor het intake gesprek', '550e8400-e29b-41d4-a716-446655440001', 'before_event', -4320, 'Herinnering: Je intake gesprek over 3 dagen', 'booking_reminder', true),
  ('660e8400-e29b-41d4-a716-446655440003', 'Intake Herinnering (dag van)', 'intake-herinnering-0d', 'Herinnering op de dag van het intake gesprek', '550e8400-e29b-41d4-a716-446655440001', 'before_event', -180, 'Vandaag: Je intake gesprek bij Ambition Valley', 'booking_reminder', true),
  ('660e8400-e29b-41d4-a716-446655440004', 'Intake Follow-up', 'intake-follow-up', 'Follow-up email na het intake gesprek met trajecten overzicht', '550e8400-e29b-41d4-a716-446655440001', 'after_event', 0, 'Bedankt voor je intake - Ontdek jouw vervolgstappen', 'intake_follow_up', true),

  -- Financieel Fundament workflows
  ('660e8400-e29b-41d4-a716-446655440005', 'Financieel Fundament Bevestiging', 'ff-bevestiging', 'Bevestigingsmail na het boeken van Financieel Fundament', '550e8400-e29b-41d4-a716-446655440002', 'booking_confirmed', 0, 'Bevestiging: Financieel Fundament sessie bij Ambition Valley', 'booking_confirmation', true),
  ('660e8400-e29b-41d4-a716-446655440006', 'Financieel Fundament Herinnering', 'ff-herinnering', 'Herinnering 3 dagen voor de Financieel Fundament sessie', '550e8400-e29b-41d4-a716-446655440002', 'before_event', -4320, 'Herinnering: Je Financieel Fundament sessie over 3 dagen', 'booking_reminder', true),
  ('660e8400-e29b-41d4-a716-446655440007', 'Financieel Fundament Follow-up', 'ff-follow-up', 'Bedankt email na de Financieel Fundament sessie', '550e8400-e29b-41d4-a716-446655440002', 'after_event', 0, 'Bedankt voor je Financieel Fundament sessie', 'traject_follow_up', true),

  -- Private Wealth workflows
  ('660e8400-e29b-41d4-a716-446655440008', 'Private Wealth Bevestiging', 'pw-bevestiging', 'Bevestigingsmail na het boeken van Private Wealth', '550e8400-e29b-41d4-a716-446655440003', 'booking_confirmed', 0, 'Bevestiging: Private Wealth sessie bij Ambition Valley', 'booking_confirmation', true),
  ('660e8400-e29b-41d4-a716-446655440009', 'Private Wealth Herinnering', 'pw-herinnering', 'Herinnering 3 dagen voor de Private Wealth sessie', '550e8400-e29b-41d4-a716-446655440003', 'before_event', -4320, 'Herinnering: Je Private Wealth sessie over 3 dagen', 'booking_reminder', true),
  ('660e8400-e29b-41d4-a716-446655440010', 'Private Wealth Follow-up', 'pw-follow-up', 'Bedankt email na de Private Wealth sessie', '550e8400-e29b-41d4-a716-446655440003', 'after_event', 0, 'Bedankt voor je Private Wealth sessie', 'traject_follow_up', true),

  -- Ambition Wealth Circle workflows
  ('660e8400-e29b-41d4-a716-446655440011', 'AWC Bevestiging', 'awc-bevestiging', 'Bevestigingsmail na het boeken van Ambition Wealth Circle', '550e8400-e29b-41d4-a716-446655440004', 'booking_confirmed', 0, 'Bevestiging: Ambition Wealth Circle bij Ambition Valley', 'booking_confirmation', true),
  ('660e8400-e29b-41d4-a716-446655440012', 'AWC Herinnering', 'awc-herinnering', 'Herinnering 3 dagen voor de Ambition Wealth Circle', '550e8400-e29b-41d4-a716-446655440004', 'before_event', -4320, 'Herinnering: Ambition Wealth Circle over 3 dagen', 'booking_reminder', true),

  -- Global cancellation workflow (applies to all events)
  ('660e8400-e29b-41d4-a716-446655440013', 'Annuleringsbevestiging', 'annulering-bevestiging', 'Bevestigingsmail bij annulering (geldt voor alle evenementen)', NULL, 'booking_cancelled', 0, 'Annulering bevestigd - Ambition Valley', 'booking_cancellation', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  trigger_offset_minutes = EXCLUDED.trigger_offset_minutes,
  email_subject = EXCLUDED.email_subject,
  email_template = EXCLUDED.email_template;

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
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

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

-- ============================================
-- SEO CONTENT ENGINE TABLES
-- ============================================

-- Keywords table (keyword discovery queue)
CREATE TABLE seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('nl', 'en')),
  intent TEXT NOT NULL CHECK (intent IN ('informational', 'transactional', 'local')),
  volume INTEGER DEFAULT 0,
  difficulty NUMERIC(5,2) DEFAULT 0 CHECK (difficulty >= 0 AND difficulty <= 100),
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'approved', 'in_progress', 'used', 'rejected', 'expired')),
  last_used TIMESTAMPTZ,
  source TEXT, -- e.g., 'google_trends', 'search_console', 'manual'
  source_data JSONB, -- raw data from source
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword, language)
);

-- Content drafts table
CREATE TABLE seo_content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID REFERENCES seo_keywords(id) ON DELETE SET NULL,
  keyword TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('nl', 'en')),
  content_type TEXT NOT NULL CHECK (content_type IN ('short', 'long', 'mixed')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  body TEXT NOT NULL,
  summary TEXT,
  meta_title TEXT,
  meta_description TEXT,
  schema_type TEXT CHECK (schema_type IN ('article', 'faqpage', 'article-faq')),
  hero_image_url TEXT,
  hero_image_asset_id TEXT,
  thumbnail_image_url TEXT,
  thumbnail_image_asset_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'archived')),
  webflow_item_id TEXT,
  current_gate TEXT CHECK (current_gate IN ('content_editor', 'compliance_officer', 'publishing_manager')),
  revision_count INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, language)
);

-- Content revisions table (version history)
CREATE TABLE seo_content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES seo_content_drafts(id) ON DELETE CASCADE,
  version TEXT NOT NULL, -- e.g., 'v1.0', 'v1.1'
  changes TEXT NOT NULL, -- description of changes
  previous_body TEXT, -- snapshot of previous body
  changed_by TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval logs table (audit trail)
CREATE TABLE seo_approval_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES seo_content_drafts(id) ON DELETE CASCADE,
  gate TEXT NOT NULL CHECK (gate IN ('content_editor', 'compliance_officer', 'publishing_manager')),
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'request_revision', 'flag_for_legal')),
  reviewer_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  notes TEXT,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated images table
CREATE TABLE seo_generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES seo_content_drafts(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('hero', 'thumbnail', 'infographic')),
  url TEXT NOT NULL,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  file_size_bytes INTEGER,
  webflow_asset_id TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE seo_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES seo_content_drafts(id) ON DELETE CASCADE,
  webflow_item_id TEXT,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  position NUMERIC(5,2) DEFAULT 0,
  ctr NUMERIC(5,2) DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  time_on_page_seconds INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  scroll_depth NUMERIC(5,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draft_id, date)
);

-- SEO Engine Indexes
CREATE INDEX idx_seo_keywords_language ON seo_keywords(language);
CREATE INDEX idx_seo_keywords_status ON seo_keywords(status);
CREATE INDEX idx_seo_keywords_intent ON seo_keywords(intent);
CREATE INDEX idx_seo_keywords_discovered ON seo_keywords(discovered_at);
CREATE INDEX idx_seo_keywords_keyword ON seo_keywords(keyword);

CREATE INDEX idx_seo_drafts_keyword ON seo_content_drafts(keyword_id);
CREATE INDEX idx_seo_drafts_status ON seo_content_drafts(status);
CREATE INDEX idx_seo_drafts_language ON seo_content_drafts(language);
CREATE INDEX idx_seo_drafts_slug ON seo_content_drafts(slug);
CREATE INDEX idx_seo_drafts_webflow ON seo_content_drafts(webflow_item_id);

CREATE INDEX idx_seo_revisions_draft ON seo_content_revisions(draft_id);
CREATE INDEX idx_seo_approval_draft ON seo_approval_logs(draft_id);
CREATE INDEX idx_seo_approval_gate ON seo_approval_logs(gate);
CREATE INDEX idx_seo_images_draft ON seo_generated_images(draft_id);
CREATE INDEX idx_seo_metrics_draft ON seo_performance_metrics(draft_id);
CREATE INDEX idx_seo_metrics_date ON seo_performance_metrics(date);

-- SEO Engine RLS
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_approval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Service role full access for SEO tables
CREATE POLICY "Service role full access seo_keywords" ON seo_keywords
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access seo_content_drafts" ON seo_content_drafts
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access seo_content_revisions" ON seo_content_revisions
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access seo_approval_logs" ON seo_approval_logs
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access seo_generated_images" ON seo_generated_images
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access seo_performance_metrics" ON seo_performance_metrics
  FOR ALL TO service_role USING (true);

-- ============================================
-- SEO AUTO-GENERATION SYSTEM TABLES
-- ============================================

-- Keyword Queue (for automated daily content generation)
CREATE TABLE seo_keyword_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'nl' CHECK (language IN ('nl', 'en')),
  priority INT NOT NULL DEFAULT 10, -- Lower = higher priority
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  scheduled_date DATE,
  content_type TEXT DEFAULT 'long' CHECK (content_type IN ('short', 'long', 'mixed')),
  metadata JSONB DEFAULT '{}', -- AI discovery data: category, trending_score, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  webflow_item_id TEXT,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(keyword, language)
);

-- Indexes for keyword queue
CREATE INDEX idx_keyword_queue_status ON seo_keyword_queue(status);
CREATE INDEX idx_keyword_queue_scheduled ON seo_keyword_queue(scheduled_date) WHERE status = 'pending';
CREATE INDEX idx_keyword_queue_priority ON seo_keyword_queue(priority, created_at) WHERE status = 'pending';

-- Generation Log (tracks each blog generation)
CREATE TABLE seo_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_queue_id UUID REFERENCES seo_keyword_queue(id) ON DELETE SET NULL,
  webflow_item_id TEXT,
  title TEXT,
  slug TEXT,
  status TEXT NOT NULL CHECK (status IN ('started', 'content_generated', 'saved_to_webflow', 'email_sent', 'completed', 'failed')),
  duration_ms INT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generation_log_keyword ON seo_generation_log(keyword_queue_id);
CREATE INDEX idx_generation_log_created ON seo_generation_log(created_at DESC);
CREATE INDEX idx_generation_log_status ON seo_generation_log(status);

-- Discovery Log (tracks AI keyword discovery runs)
CREATE TABLE seo_discovery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords_found INT NOT NULL DEFAULT 0,
  keywords_added INT NOT NULL DEFAULT 0,
  keywords_skipped INT NOT NULL DEFAULT 0,
  summary TEXT,
  raw_response JSONB,
  search_queries_used JSONB,
  news_sources_checked JSONB,
  error_message TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discovery_log_created ON seo_discovery_log(created_at DESC);

-- Admin Notification Settings
CREATE TABLE seo_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  notify_on_generation BOOLEAN DEFAULT true,
  notify_on_publish BOOLEAN DEFAULT true,
  notify_on_error BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_notification_email ON seo_notification_settings(email) WHERE is_active = true;

-- RLS for auto-generation tables
ALTER TABLE seo_keyword_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_generation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_discovery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_notification_settings ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access seo_keyword_queue" ON seo_keyword_queue
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access seo_generation_log" ON seo_generation_log
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access seo_discovery_log" ON seo_discovery_log
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access seo_notification_settings" ON seo_notification_settings
  FOR ALL TO service_role USING (true);
