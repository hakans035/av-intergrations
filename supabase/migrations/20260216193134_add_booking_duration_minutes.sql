-- Add booking_duration_minutes to event_types
-- When set, this overrides duration_minutes for slot generation and booking end_time
-- duration_minutes remains as the total traject duration for display
ALTER TABLE event_types ADD COLUMN IF NOT EXISTS booking_duration_minutes INTEGER;

-- Set 60-min onboarding sessions for all trajecten
UPDATE event_types SET booking_duration_minutes = 60 WHERE slug IN ('private-wealth', 'ambition-wealth-circle', 'financieel-fundament');
