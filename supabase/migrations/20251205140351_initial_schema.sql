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
