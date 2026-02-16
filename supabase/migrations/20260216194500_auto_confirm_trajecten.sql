-- Auto-confirm all trajecten bookings (no manual approval needed)
-- Admin still gets notified via team notification email and can cancel if needed
UPDATE event_types SET requires_approval = false WHERE slug IN ('private-wealth', 'ambition-wealth-circle');
