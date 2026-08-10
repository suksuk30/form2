-- Mark users as expired when all their landing pages have passed the active period.

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

  UPDATE users u
  SET status = 'expired',
      updated_at = NOW()
  WHERE u.role = 'user'
    AND u.status = 'active'
    AND EXISTS (
      SELECT 1
      FROM user_landing_pages lp
      WHERE lp.user_id = u.id
        AND lp.activated_at IS NOT NULL
        AND lp.duration_days > 0
        AND is_landing_expired(lp.activated_at, lp.duration_days)
    )
    AND NOT EXISTS (
      SELECT 1
      FROM user_landing_pages lp
      WHERE lp.user_id = u.id
        AND lp.is_enabled = true
        AND NOT is_landing_expired(lp.activated_at, lp.duration_days)
    );
END;
$$ LANGUAGE plpgsql;
