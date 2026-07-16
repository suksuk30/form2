-- Fix: only validate template availability when enabling a landing page.
-- Previously, disabled templates (standard/pro/enterprise) in the payload
-- triggered "Template X tidak tersedia" even when not being activated.

CREATE OR REPLACE FUNCTION admin_set_user_landings(
  p_admin_id UUID,
  p_session_token TEXT,
  p_user_id UUID,
  p_landings JSONB
)
RETURNS JSON AS $$
DECLARE
  v_item JSONB;
  v_template_id TEXT;
  v_duration_days INTEGER;
  v_enabled BOOLEAN;
  v_landing_id UUID;
  v_was_enabled BOOLEAN;
  v_slug TEXT;
BEGIN
  IF NOT verify_admin_session(p_admin_id, p_session_token) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_user_id AND role = 'user' AND status = 'active'
  ) THEN
    RETURN json_build_object('error', 'User harus aktif terlebih dahulu');
  END IF;

  IF p_landings IS NULL OR jsonb_typeof(p_landings) != 'array' THEN
    RETURN json_build_object('error', 'Format landing pages tidak valid');
  END IF;

  PERFORM check_landing_expiry();

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_landings)
  LOOP
    v_template_id := v_item ->> 'template_id';
    v_duration_days := COALESCE((v_item ->> 'duration_days')::INTEGER, 30);
    v_enabled := COALESCE((v_item ->> 'enabled')::BOOLEAN, false);

    IF v_template_id IS NULL OR v_template_id = '' THEN
      RETURN json_build_object('error', 'template_id wajib diisi');
    END IF;

    SELECT id, is_enabled
    INTO v_landing_id, v_was_enabled
    FROM user_landing_pages
    WHERE user_id = p_user_id
      AND template_id = v_template_id;

    IF NOT v_enabled AND v_landing_id IS NULL THEN
      CONTINUE;
    END IF;

    IF v_enabled THEN
      IF v_duration_days < 1 OR v_duration_days > 365 THEN
        RETURN json_build_object('error', 'Durasi landing harus 1-365 hari');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM landing_templates WHERE id = v_template_id AND is_active = true
      ) THEN
        RETURN json_build_object('error', format('Template %s tidak tersedia', v_template_id));
      END IF;
    END IF;

    IF v_enabled THEN
      IF v_landing_id IS NULL THEN
        v_slug := generate_landing_slug();

        INSERT INTO user_landing_pages (
          user_id,
          template_id,
          subdomain_slug,
          activated_at,
          duration_days,
          is_enabled
        ) VALUES (
          p_user_id,
          v_template_id,
          v_slug,
          NOW(),
          v_duration_days,
          true
        );
      ELSE
        UPDATE user_landing_pages
        SET duration_days = v_duration_days,
            activated_at = CASE
              WHEN NOT v_was_enabled OR is_landing_expired(activated_at, duration_days) THEN NOW()
              ELSE activated_at
            END,
            is_enabled = true,
            updated_at = NOW()
        WHERE id = v_landing_id;
      END IF;
    ELSIF v_landing_id IS NOT NULL THEN
      UPDATE user_landing_pages
      SET is_enabled = false,
          updated_at = NOW()
      WHERE id = v_landing_id;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'landing_pages', build_user_landings_json(p_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION admin_set_user_landings(UUID, TEXT, UUID, JSONB) TO anon;
