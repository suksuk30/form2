-- Per-user anti-spam toggle (default off). Admin enables rate limit per landing owner.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS anti_spam_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION admin_get_users(
  p_admin_id UUID,
  p_session_token TEXT
)
RETURNS JSON AS $$
DECLARE
  v_users JSON;
BEGIN
  IF NOT verify_admin_session(p_admin_id, p_session_token) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  PERFORM check_landing_expiry();

  SELECT json_agg(
    json_build_object(
      'id', u.id,
      'username', u.username,
      'phone', u.phone,
      'role', u.role,
      'status', u.status,
      'telegram_connected', u.telegram_connected,
      'anti_spam_enabled', u.anti_spam_enabled,
      'landing_pages', build_user_landings_json(u.id),
      'created_at', u.created_at,
      'updated_at', u.updated_at
    )
    ORDER BY u.created_at DESC
  )
  INTO v_users
  FROM users u
  WHERE u.role = 'user';

  RETURN json_build_object('users', COALESCE(v_users, '[]'::JSON));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_set_user_anti_spam(
  p_admin_id UUID,
  p_session_token TEXT,
  p_user_id UUID,
  p_enabled BOOLEAN
)
RETURNS JSON AS $$
BEGIN
  IF NOT verify_admin_session(p_admin_id, p_session_token) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'user') THEN
    RETURN json_build_object('error', 'User tidak ditemukan');
  END IF;

  UPDATE users
  SET anti_spam_enabled = COALESCE(p_enabled, false),
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'anti_spam_enabled', COALESCE(p_enabled, false)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION internal_slug_anti_spam_enabled(p_slug TEXT)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (
      SELECT u.anti_spam_enabled
      FROM user_landing_pages lp
      JOIN users u ON u.id = lp.user_id
      WHERE lp.subdomain_slug = p_slug
        AND u.role = 'user'
      LIMIT 1
    ),
    false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

REVOKE ALL ON FUNCTION internal_slug_anti_spam_enabled(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION internal_slug_anti_spam_enabled(TEXT) FROM anon;
REVOKE ALL ON FUNCTION internal_slug_anti_spam_enabled(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION internal_slug_anti_spam_enabled(TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION admin_set_user_anti_spam(UUID, TEXT, UUID, BOOLEAN) TO anon;
