-- Clear rate-limit counters when anti-spam is toggled off (and scope limits to anti-spam only).

CREATE OR REPLACE FUNCTION internal_clear_user_rate_limits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM landing_submit_rate_limits r
  USING user_landing_pages lp
  WHERE lp.user_id = p_user_id
    AND (
      r.rate_key LIKE 'slug:%:' || lp.subdomain_slug
      OR r.rate_key LIKE 'app:%:' || lp.subdomain_slug
      OR r.rate_key LIKE 'global:%:' || lp.subdomain_slug
    );

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION internal_clear_user_rate_limits(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION internal_clear_user_rate_limits(UUID) FROM anon;
REVOKE ALL ON FUNCTION internal_clear_user_rate_limits(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION internal_clear_user_rate_limits(UUID) TO service_role;

CREATE OR REPLACE FUNCTION admin_set_user_anti_spam(
  p_admin_id UUID,
  p_session_token TEXT,
  p_user_id UUID,
  p_enabled BOOLEAN
)
RETURNS JSON AS $$
DECLARE
  v_enabled BOOLEAN := COALESCE(p_enabled, false);
  v_cleared INTEGER := 0;
BEGIN
  IF NOT verify_admin_session(p_admin_id, p_session_token) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'user') THEN
    RETURN json_build_object('error', 'User tidak ditemukan');
  END IF;

  UPDATE users
  SET anti_spam_enabled = v_enabled,
      updated_at = NOW()
  WHERE id = p_user_id;

  IF NOT v_enabled THEN
    v_cleared := internal_clear_user_rate_limits(p_user_id);
  END IF;

  RETURN json_build_object(
    'success', true,
    'anti_spam_enabled', v_enabled,
    'cleared_limits', v_cleared
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION admin_set_user_anti_spam(UUID, TEXT, UUID, BOOLEAN) TO anon;
