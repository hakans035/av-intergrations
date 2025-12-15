-- Add followup_email_sent_at column to track follow-up emails
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS followup_email_sent_at TIMESTAMPTZ;
