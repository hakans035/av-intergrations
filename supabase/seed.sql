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
-- EVENT TYPES: Sample booking event types
-- ============================================

INSERT INTO event_types (id, slug, title, description, duration_minutes, location_type, price_cents, deposit_percent, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'intake-gesprek', 'Intake Gesprek', 'Een vrijblijvend kennismakingsgesprek om je situatie te bespreken en te kijken hoe we je kunnen helpen.', 30, 'online', 0, 0, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'strategie-sessie', 'Strategie Sessie', 'Een diepgaande sessie waarin we je complete fiscale strategie uitwerken.', 60, 'online', 29500, 50, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'groepsdag', 'Groepsdag', 'Leer in een dag alles over belastingbesparing in een interactieve groepssessie.', 480, 'on_location', 49500, 100, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  price_cents = EXCLUDED.price_cents;

-- ============================================
-- AVAILABILITY: Weekly schedule for event types
-- ============================================

-- Intake gesprek availability (Mon-Fri, 9:00-17:00)
INSERT INTO availability_schedules (event_type_id, day_of_week, start_time, end_time, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 1, '09:00', '17:00', true),  -- Monday
  ('550e8400-e29b-41d4-a716-446655440001', 2, '09:00', '17:00', true),  -- Tuesday
  ('550e8400-e29b-41d4-a716-446655440001', 3, '09:00', '17:00', true),  -- Wednesday
  ('550e8400-e29b-41d4-a716-446655440001', 4, '09:00', '17:00', true),  -- Thursday
  ('550e8400-e29b-41d4-a716-446655440001', 5, '09:00', '17:00', true);  -- Friday

-- Strategie sessie availability (Mon-Thu, 10:00-16:00)
INSERT INTO availability_schedules (event_type_id, day_of_week, start_time, end_time, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 1, '10:00', '16:00', true),  -- Monday
  ('550e8400-e29b-41d4-a716-446655440002', 2, '10:00', '16:00', true),  -- Tuesday
  ('550e8400-e29b-41d4-a716-446655440002', 3, '10:00', '16:00', true),  -- Wednesday
  ('550e8400-e29b-41d4-a716-446655440002', 4, '10:00', '16:00', true);  -- Thursday

-- ============================================
-- EMAIL WORKFLOWS: Sample automation rules
-- ============================================

INSERT INTO email_workflows (id, name, slug, description, event_type_id, trigger_type, trigger_offset_minutes, email_subject, email_template, is_active) VALUES
  -- Intake gesprek workflows
  ('660e8400-e29b-41d4-a716-446655440001', 'Intake Bevestiging', 'intake-confirmation', 'Bevestigingsmail direct na boeking', '550e8400-e29b-41d4-a716-446655440001', 'booking_confirmed', 0, 'Je intake gesprek is bevestigd', 'booking_confirmation', true),
  ('660e8400-e29b-41d4-a716-446655440002', 'Intake Herinnering 24u', 'intake-reminder-24h', 'Herinnering 24 uur voor het gesprek', '550e8400-e29b-41d4-a716-446655440001', 'before_event', -1440, 'Morgen: Je intake gesprek met Ambition Valley', 'reminder_24h', true),
  ('660e8400-e29b-41d4-a716-446655440003', 'Intake Herinnering 1u', 'intake-reminder-1h', 'Herinnering 1 uur voor het gesprek', '550e8400-e29b-41d4-a716-446655440001', 'before_event', -60, 'Over 1 uur: Je intake gesprek', 'reminder_1h', true),
  ('660e8400-e29b-41d4-a716-446655440004', 'Intake Follow-up', 'intake-followup', 'Follow-up 1 dag na het gesprek', '550e8400-e29b-41d4-a716-446655440001', 'after_event', 1440, 'Bedankt voor je intake gesprek', 'follow_up', true),

  -- Strategie sessie workflows
  ('660e8400-e29b-41d4-a716-446655440005', 'Strategie Bevestiging', 'strategy-confirmation', 'Bevestigingsmail direct na boeking', '550e8400-e29b-41d4-a716-446655440002', 'booking_confirmed', 0, 'Je strategie sessie is bevestigd', 'booking_confirmation', true),
  ('660e8400-e29b-41d4-a716-446655440006', 'Strategie Herinnering 24u', 'strategy-reminder-24h', 'Herinnering 24 uur voor de sessie', '550e8400-e29b-41d4-a716-446655440002', 'before_event', -1440, 'Morgen: Je strategie sessie met Ambition Valley', 'reminder_24h', true),
  ('660e8400-e29b-41d4-a716-446655440007', 'Strategie Follow-up', 'strategy-followup', 'Follow-up 1 dag na de sessie', '550e8400-e29b-41d4-a716-446655440002', 'after_event', 1440, 'Bedankt voor je strategie sessie', 'follow_up', true),

  -- Groepsdag workflows
  ('660e8400-e29b-41d4-a716-446655440008', 'Groepsdag Bevestiging', 'groepsdag-confirmation', 'Bevestigingsmail direct na boeking', '550e8400-e29b-41d4-a716-446655440003', 'booking_confirmed', 0, 'Je aanmelding voor de Groepsdag is bevestigd', 'booking_confirmation', true),
  ('660e8400-e29b-41d4-a716-446655440009', 'Groepsdag Herinnering 3d', 'groepsdag-reminder-3d', 'Herinnering 3 dagen voor de groepsdag', '550e8400-e29b-41d4-a716-446655440003', 'before_event', -4320, 'Over 3 dagen: Ambition Valley Groepsdag', 'reminder_3d', true),
  ('660e8400-e29b-41d4-a716-446655440010', 'Groepsdag Follow-up', 'groepsdag-followup', 'Follow-up 1 dag na de groepsdag', '550e8400-e29b-41d4-a716-446655440003', 'after_event', 1440, 'Bedankt voor je deelname aan de Groepsdag', 'follow_up', true)
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
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Jan de Vries', 'jan@example.nl', '+31612345678',
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '30 minutes', 'confirmed', 'pending', 0, 0),
  ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Peter Bakker', 'peter@example.nl', '+31698765432',
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '60 minutes', 'confirmed', 'deposit_paid', 29500, 14750)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- OUTPUT: Confirm seed completed
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed completed successfully!';
  RAISE NOTICE '   Admin user: admin@ambitionvalley.nl';
  RAISE NOTICE '   Password: 121272Hs@';
  RAISE NOTICE '   Event types: 3';
  RAISE NOTICE '   Email workflows: 10';
  RAISE NOTICE '   Sample submissions: 3';
  RAISE NOTICE '   Sample bookings: 2';
END $$;
