-- ============================================
-- SEED DATA FOR LOCAL DEVELOPMENT
-- Run with: npx supabase db reset (applies migrations + seed)
-- Or manually: psql -f supabase/seed.sql
-- ============================================

-- ============================================
-- AUTH: Create admin user
-- Email: admin@ambitionvalley.nl
-- Password: 121272Hs@
-- ============================================

-- Insert admin user into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'admin@ambitionvalley.nl',
  crypt('121272Hs@', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert identity for the user
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  jsonb_build_object('sub', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'email', 'admin@ambitionvalley.nl'),
  'email',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- ============================================
-- EVENT TYPES: Booking event types
-- ============================================

INSERT INTO event_types (id, slug, title, description, duration_minutes, location_type, location_address, price_cents, deposit_percent, max_attendees, is_active, requires_approval, buffer_before_minutes, buffer_after_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'gratis-intake', 'Gratis Intake Gesprek', 'Plan een gratis kennismakingsgesprek van 15 minuten om je situatie te bespreken en te ontdekken welk traject het beste bij je past.', 15, 'online', NULL, 0, 0, 1, true, false, 5, 5),
  ('550e8400-e29b-41d4-a716-446655440002', 'financieel-fundament', 'Financieel Fundament (1-op-1)', 'Krijg direct grip op je geld en ontdek waar je nu al belasting kunt besparen. Diepgaand Fiscaal & Financieel consult gericht op belastingbesparing en vermogensgroei.', 60, 'online', NULL, 99900, 50, 1, true, false, 15, 15),
  ('550e8400-e29b-41d4-a716-446655440003', 'private-wealth', 'Private Wealth (1-op-1)', 'Voor deelnemers die Maximale Fiscale Optimalisatie en een Persoonlijk Plan willen. Inclusief 1 uur intake online en 3 uur op locatie.', 240, 'hybrid', NULL, 0, 50, 1, true, true, 30, 30),
  ('550e8400-e29b-41d4-a716-446655440004', 'ambition-wealth-circle', 'Ambition Wealth Circle', 'Livedag in groepsverband, met directe toepassing op jouw situatie. Leer slimme strategieën om direct minder belasting te betalen en netwerk met gelijkgestemde ondernemers.', 480, 'on_location', 'Locatie wordt na inschrijving gedeeld', 0, 50, 20, true, true, 0, 0)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  price_cents = EXCLUDED.price_cents,
  location_type = EXCLUDED.location_type;

-- ============================================
-- AVAILABILITY: Weekly schedule for event types
-- ============================================

-- Gratis Intake availability (Mon-Fri, 9:00-17:00)
INSERT INTO availability_schedules (event_type_id, day_of_week, start_time, end_time, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 1, '09:00', '17:00', true),  -- Monday
  ('550e8400-e29b-41d4-a716-446655440001', 2, '09:00', '17:00', true),  -- Tuesday
  ('550e8400-e29b-41d4-a716-446655440001', 3, '09:00', '17:00', true),  -- Wednesday
  ('550e8400-e29b-41d4-a716-446655440001', 4, '09:00', '17:00', true),  -- Thursday
  ('550e8400-e29b-41d4-a716-446655440001', 5, '09:00', '17:00', true);  -- Friday

-- Financieel Fundament availability (Mon-Fri, 9:00-17:00)
INSERT INTO availability_schedules (event_type_id, day_of_week, start_time, end_time, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 1, '09:00', '17:00', true),  -- Monday
  ('550e8400-e29b-41d4-a716-446655440002', 2, '09:00', '17:00', true),  -- Tuesday
  ('550e8400-e29b-41d4-a716-446655440002', 3, '09:00', '17:00', true),  -- Wednesday
  ('550e8400-e29b-41d4-a716-446655440002', 4, '09:00', '17:00', true),  -- Thursday
  ('550e8400-e29b-41d4-a716-446655440002', 5, '09:00', '17:00', true);  -- Friday

-- Private Wealth availability (Mon-Fri, 9:00-17:00)
INSERT INTO availability_schedules (event_type_id, day_of_week, start_time, end_time, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 1, '09:00', '17:00', true),  -- Monday
  ('550e8400-e29b-41d4-a716-446655440003', 2, '09:00', '17:00', true),  -- Tuesday
  ('550e8400-e29b-41d4-a716-446655440003', 3, '09:00', '17:00', true),  -- Wednesday
  ('550e8400-e29b-41d4-a716-446655440003', 4, '09:00', '17:00', true),  -- Thursday
  ('550e8400-e29b-41d4-a716-446655440003', 5, '09:00', '17:00', true);  -- Friday

-- ============================================
-- EMAIL WORKFLOWS: Automation rules (matching seed-email-workflows.ts)
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
  email_subject = EXCLUDED.email_subject;

-- ============================================
-- SAMPLE FORM SUBMISSIONS (for testing)
-- ============================================

INSERT INTO form_submissions (id, form_id, name, email, phone, answers, qualification_result, created_at) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'tIKMPvBf', 'Jan de Vries', 'jan@example.nl', '+31612345678',
   '{"d8d36ddb-cc2b-4bd4-9b5e-0498f3032e02": "32ba348e-bffb-498f-9145-4231df734365", "8003f762-172c-4610-85ec-ffc22ec4403a": ["Q7yHu4YGjH56"], "d07662a1-2637-457c-b071-c64637e6bf2c": "xhT4pvLRfeLO", "6c970c5c-7d7e-474f-88b6-e40bac8b8755": "tBhNE3RGwoqi"}',
   'qualified', NOW() - INTERVAL '2 days'),
  ('770e8400-e29b-41d4-a716-446655440002', 'tIKMPvBf', 'Maria Jansen', 'maria@example.nl', '+31687654321',
   '{"d8d36ddb-cc2b-4bd4-9b5e-0498f3032e02": "32ba348e-bffb-498f-9145-4231df734365", "8003f762-172c-4610-85ec-ffc22ec4403a": ["d7lUEbqxk6aF"], "d07662a1-2637-457c-b071-c64637e6bf2c": "mnXrs9lPty9T", "6c970c5c-7d7e-474f-88b6-e40bac8b8755": "d2V2zlPp7Ezm"}',
   'disqualified', NOW() - INTERVAL '1 day'),
  ('770e8400-e29b-41d4-a716-446655440003', 'tIKMPvBf', 'Peter Bakker', 'peter@example.nl', '+31698765432',
   '{"d8d36ddb-cc2b-4bd4-9b5e-0498f3032e02": "32ba348e-bffb-498f-9145-4231df734365", "8003f762-172c-4610-85ec-ffc22ec4403a": ["Ga8EmTOPZuUl", "Q7yHu4YGjH56"], "d07662a1-2637-457c-b071-c64637e6bf2c": "YUUwrMD0FmyP", "6c970c5c-7d7e-474f-88b6-e40bac8b8755": "QRTJzaQkJkol"}',
   'qualified', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE BOOKINGS (for testing)
-- ============================================

INSERT INTO bookings (id, event_type_id, customer_name, customer_email, customer_phone, start_time, end_time, status, payment_status, total_price_cents, deposit_cents) VALUES
  -- Gratis Intake booking (15 min)
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Jan de Vries', 'jan@example.nl', '+31612345678',
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '15 minutes', 'confirmed', 'pending', 0, 0),
  -- Financieel Fundament booking (60 min, €999, 50% deposit)
  ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Peter Bakker', 'peter@example.nl', '+31698765432',
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '60 minutes', 'confirmed', 'deposit_paid', 99900, 49950)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- OUTPUT: Confirm seed completed
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed completed successfully!';
  RAISE NOTICE '   Admin user: admin@ambitionvalley.nl';
  RAISE NOTICE '   Password: 121272Hs@';
  RAISE NOTICE '   Event types: 4 (Gratis Intake, Financieel Fundament, Private Wealth, AWC)';
  RAISE NOTICE '   Email workflows: 13';
  RAISE NOTICE '   Sample submissions: 3';
  RAISE NOTICE '   Sample bookings: 2';
END $$;
