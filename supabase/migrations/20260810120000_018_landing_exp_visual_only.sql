-- Exp is visual-only in admin UI; do not change users.status when landings expire.

CREATE OR REPLACE FUNCTION check_landing_expiry()
RETURNS void AS $$
BEGIN
  UPDATE user_landing_pages
  SET is_enabled = false,
      updated_at = NOW()
  WHERE is_enabled = true
    AND activated_at IS NOT NULL
    AND duration_days > 0
    AND (activated_at + (duration_days || ' days')::INTERVAL) < NOW();
END;
$$ LANGUAGE plpgsql;

-- Restore users incorrectly marked expired by the previous landing-expiry sync.
UPDATE users
SET status = 'active',
    updated_at = NOW()
WHERE role = 'user'
  AND status = 'expired';
