-- Stop exposing Telegram credentials on public landing lookups.
-- Server-side submit uses internal_get_landing_telegram (service_role only).

CREATE OR REPLACE FUNCTION public_get_user_by_slug(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
  v_landing RECORD;
  v_is_valid BOOLEAN;
BEGIN
  PERFORM check_landing_expiry();

  SELECT
    lp.id,
    lp.template_id,
    lp.subdomain_slug,
    lp.activated_at,
    lp.duration_days,
    lp.is_enabled,
    u.status AS user_status,
    u.telegram_connected,
    u.telegram_bot_token,
    u.telegram_chat_id
  INTO v_landing
  FROM user_landing_pages lp
  JOIN users u ON u.id = lp.user_id
  WHERE lp.subdomain_slug = p_slug
    AND u.role = 'user'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'template_id', NULL,
      'status', NULL,
      'activated_at', NULL,
      'duration_days', NULL
    );
  END IF;

  v_is_valid := v_landing.user_status = 'active'
    AND v_landing.is_enabled = true
    AND NOT is_landing_expired(v_landing.activated_at, v_landing.duration_days)
    AND v_landing.telegram_connected IS TRUE
    AND v_landing.telegram_bot_token IS NOT NULL
    AND v_landing.telegram_chat_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM landing_templates lt
      WHERE lt.id = v_landing.template_id
        AND lt.is_active = true
    );

  RETURN json_build_object(
    'valid', v_is_valid,
    'template_id', v_landing.template_id,
    'status', v_landing.user_status,
    'activated_at', v_landing.activated_at,
    'duration_days', v_landing.duration_days
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION internal_get_landing_telegram(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
  v_landing RECORD;
  v_is_valid BOOLEAN;
BEGIN
  PERFORM check_landing_expiry();

  SELECT
    lp.activated_at,
    lp.duration_days,
    lp.is_enabled,
    u.status AS user_status,
    u.telegram_connected,
    u.telegram_bot_token,
    u.telegram_chat_id,
    lp.template_id
  INTO v_landing
  FROM user_landing_pages lp
  JOIN users u ON u.id = lp.user_id
  WHERE lp.subdomain_slug = p_slug
    AND u.role = 'user'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false);
  END IF;

  v_is_valid := v_landing.user_status = 'active'
    AND v_landing.is_enabled = true
    AND NOT is_landing_expired(v_landing.activated_at, v_landing.duration_days)
    AND v_landing.telegram_connected IS TRUE
    AND v_landing.telegram_bot_token IS NOT NULL
    AND v_landing.telegram_chat_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM landing_templates lt
      WHERE lt.id = v_landing.template_id
        AND lt.is_active = true
    );

  IF NOT v_is_valid THEN
    RETURN json_build_object('ok', false);
  END IF;

  RETURN json_build_object(
    'ok', true,
    'bot_token', v_landing.telegram_bot_token,
    'chat_id', v_landing.telegram_chat_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION internal_get_landing_telegram(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION internal_get_landing_telegram(TEXT) FROM anon;
REVOKE ALL ON FUNCTION internal_get_landing_telegram(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION internal_get_landing_telegram(TEXT) TO service_role;
