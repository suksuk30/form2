-- Multi landing pages: templates, per-landing duration, slug reset
-- Account activation (users.status) is separate from landing page lifecycle.

-- =====================================================
-- SCHEMA
-- =====================================================

CREATE TABLE landing_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO landing_templates (id, name, description, sort_order, is_active) VALUES
  ('basic',        'Basic',        'Landing page versi dasar',        1, true),
  ('standard',     'Standard',     'Landing page versi standard',     2, false),
  ('professional', 'Professional', 'Landing page versi professional', 3, false),
  ('enterprise',   'Enterprise',   'Landing page versi enterprise',   4, false);

CREATE TABLE user_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES landing_templates(id),
  subdomain_slug VARCHAR(3) NOT NULL,
  activated_at TIMESTAMPTZ,
  duration_days INTEGER NOT NULL DEFAULT 30 CHECK (duration_days >= 1 AND duration_days <= 365),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, template_id),
  UNIQUE (subdomain_slug),
  CONSTRAINT user_landing_pages_slug_format CHECK (subdomain_slug ~ '^[a-z0-9]{3}$')
);

CREATE INDEX idx_user_landing_pages_user_id ON user_landing_pages(user_id);
CREATE INDEX idx_user_landing_pages_subdomain_slug ON user_landing_pages(subdomain_slug);
CREATE INDEX idx_user_landing_pages_enabled ON user_landing_pages(is_enabled);

CREATE TRIGGER update_user_landing_pages_updated_at
  BEFORE UPDATE ON user_landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPERS (before data migration)
-- =====================================================

CREATE OR REPLACE FUNCTION generate_landing_slug()
RETURNS VARCHAR AS $$
DECLARE
  v_chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  v_slug TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_slug := '';

    FOR i IN 1..3 LOOP
      v_slug := v_slug || substr(v_chars, floor(random() * 36 + 1)::INTEGER, 1);
    END LOOP;

    SELECT EXISTS(
      SELECT 1 FROM user_landing_pages WHERE subdomain_slug = v_slug
    ) INTO v_exists;

    IF NOT v_exists THEN
      RETURN v_slug;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing single-slug users into basic landing (regenerate short slug)
DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN
    SELECT
      id,
      activated_at,
      duration_days,
      status,
      subdomain_slug
    FROM users
    WHERE subdomain_slug IS NOT NULL
  LOOP
    INSERT INTO user_landing_pages (
      user_id,
      template_id,
      subdomain_slug,
      activated_at,
      duration_days,
      is_enabled
    ) VALUES (
      v_user.id,
      'basic',
      generate_landing_slug(),
      v_user.activated_at,
      GREATEST(COALESCE(v_user.duration_days, 30), 1),
      (v_user.status = 'active')
    )
    ON CONFLICT (user_id, template_id) DO NOTHING;
  END LOOP;
END $$;

ALTER TABLE users DROP COLUMN IF EXISTS subdomain_slug;
ALTER TABLE users DROP COLUMN IF EXISTS activated_at;
ALTER TABLE users DROP COLUMN IF EXISTS duration_days;

DROP INDEX IF EXISTS idx_users_subdomain_slug;

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

CREATE OR REPLACE FUNCTION is_landing_expired(
  p_activated_at TIMESTAMPTZ,
  p_duration_days INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_activated_at IS NULL OR p_duration_days IS NULL OR p_duration_days <= 0 THEN
    RETURN true;
  END IF;

  RETURN (p_activated_at + (p_duration_days || ' days')::INTERVAL) < NOW();
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION build_user_landings_json(p_user_id UUID)
RETURNS JSON AS $$
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', lp.id,
        'template_id', lp.template_id,
        'template_name', lt.name,
        'subdomain_slug', lp.subdomain_slug,
        'activated_at', lp.activated_at,
        'duration_days', lp.duration_days,
        'is_enabled', lp.is_enabled,
        'is_expired', is_landing_expired(lp.activated_at, lp.duration_days)
      )
      ORDER BY lt.sort_order, lp.created_at
    ),
    '[]'::JSON
  )
  FROM user_landing_pages lp
  JOIN landing_templates lt ON lt.id = lp.template_id
  WHERE lp.user_id = p_user_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION verify_user_session(
  p_user_id UUID,
  p_session_token TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = p_user_id
      AND session_token = p_session_token
      AND session_expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION verify_admin_session(
  p_admin_id UUID,
  p_session_token TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = p_admin_id
      AND session_token = p_session_token
      AND session_expires_at > NOW()
      AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================
-- AUTH FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION auth_login(
  p_username TEXT,
  p_password TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_session_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_user FROM users WHERE username = p_username;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Username tidak ditemukan');
  END IF;

  IF v_user.password_hash != crypt(p_password, v_user.password_hash) THEN
    RETURN json_build_object('error', 'Password salah');
  END IF;

  PERFORM check_landing_expiry();

  v_session_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := NOW() + INTERVAL '7 days';

  UPDATE users
  SET session_token = v_session_token,
      session_expires_at = v_expires_at
  WHERE id = v_user.id;

  RETURN json_build_object(
    'success', true,
    'session_token', v_session_token,
    'user', json_build_object(
      'id', v_user.id,
      'username', v_user.username,
      'phone', v_user.phone,
      'role', v_user.role,
      'status', v_user.status,
      'telegram_bot_token', v_user.telegram_bot_token,
      'telegram_chat_id', v_user.telegram_chat_id,
      'telegram_connected', v_user.telegram_connected,
      'landing_pages', build_user_landings_json(v_user.id),
      'created_at', v_user.created_at,
      'updated_at', v_user.updated_at
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_get_session(
  p_user_id UUID,
  p_session_token TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
BEGIN
  PERFORM check_landing_expiry();

  SELECT * INTO v_user
  FROM users
  WHERE id = p_user_id
    AND session_token = p_session_token
    AND session_expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object('user', NULL);
  END IF;

  RETURN json_build_object(
    'user', json_build_object(
      'id', v_user.id,
      'username', v_user.username,
      'phone', v_user.phone,
      'role', v_user.role,
      'status', v_user.status,
      'telegram_bot_token', v_user.telegram_bot_token,
      'telegram_chat_id', v_user.telegram_chat_id,
      'telegram_connected', v_user.telegram_connected,
      'landing_pages', build_user_landings_json(v_user.id),
      'created_at', v_user.created_at,
      'updated_at', v_user.updated_at
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADMIN FUNCTIONS
-- =====================================================

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

DROP FUNCTION IF EXISTS admin_set_user_status(UUID, TEXT, UUID, BOOLEAN, INTEGER);

CREATE OR REPLACE FUNCTION admin_set_user_status(
  p_admin_id UUID,
  p_session_token TEXT,
  p_user_id UUID,
  p_activate BOOLEAN
)
RETURNS JSON AS $$
BEGIN
  IF NOT verify_admin_session(p_admin_id, p_session_token) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'user') THEN
    RETURN json_build_object('error', 'User tidak ditemukan');
  END IF;

  IF p_activate THEN
    UPDATE users
    SET status = 'active'
    WHERE id = p_user_id;
  ELSE
    UPDATE users
    SET status = 'inactive',
        telegram_connected = FALSE
    WHERE id = p_user_id;

    UPDATE user_landing_pages
    SET is_enabled = false,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

    -- Skip inactive templates that are not being enabled and have no existing row
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

-- =====================================================
-- USER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION user_save_telegram(
  p_user_id UUID,
  p_session_token TEXT,
  p_bot_token TEXT,
  p_chat_id TEXT
)
RETURNS JSON AS $$
BEGIN
  IF NOT verify_user_session(p_user_id, p_session_token) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_user_id AND status = 'active'
  ) THEN
    RETURN json_build_object('error', 'Akun belum diaktifkan admin');
  END IF;

  UPDATE users
  SET telegram_bot_token = p_bot_token,
      telegram_chat_id = p_chat_id
  WHERE id = p_user_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_set_telegram_connected(
  p_user_id UUID,
  p_session_token TEXT,
  p_connected BOOLEAN,
  p_bot_token TEXT DEFAULT NULL,
  p_chat_id TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  IF NOT verify_user_session(p_user_id, p_session_token) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_user_id AND status = 'active'
  ) THEN
    RETURN json_build_object('error', 'Akun belum diaktifkan admin');
  END IF;

  UPDATE users
  SET telegram_connected = p_connected,
      telegram_bot_token = COALESCE(p_bot_token, telegram_bot_token),
      telegram_chat_id = COALESCE(p_chat_id, telegram_chat_id)
  WHERE id = p_user_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_reset_landing_slug(
  p_user_id UUID,
  p_session_token TEXT,
  p_landing_page_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_landing RECORD;
  v_new_slug TEXT;
BEGIN
  IF NOT verify_user_session(p_user_id, p_session_token) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_user_id AND status = 'active'
  ) THEN
    RETURN json_build_object('error', 'Akun belum diaktifkan admin');
  END IF;

  PERFORM check_landing_expiry();

  SELECT lp.*
  INTO v_landing
  FROM user_landing_pages lp
  WHERE lp.id = p_landing_page_id
    AND lp.user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Landing page tidak ditemukan');
  END IF;

  IF NOT v_landing.is_enabled THEN
    RETURN json_build_object('error', 'Landing page tidak aktif');
  END IF;

  IF is_landing_expired(v_landing.activated_at, v_landing.duration_days) THEN
    RETURN json_build_object('error', 'Landing page sudah expired');
  END IF;

  v_new_slug := generate_landing_slug();

  UPDATE user_landing_pages
  SET subdomain_slug = v_new_slug,
      updated_at = NOW()
  WHERE id = p_landing_page_id;

  RETURN json_build_object(
    'success', true,
    'landing_page_id', p_landing_page_id,
    'subdomain_slug', v_new_slug,
    'landing_pages', build_user_landings_json(p_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PUBLIC FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public_get_landing_templates()
RETURNS JSON AS $$
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', id,
        'name', name,
        'description', description,
        'sort_order', sort_order,
        'is_active', is_active
      )
      ORDER BY sort_order
    ),
    '[]'::JSON
  )
  FROM landing_templates;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public_get_user_by_slug(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
  v_landing RECORD;
  v_user RECORD;
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
      'duration_days', NULL,
      'botToken', NULL,
      'chatId', NULL
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
    'duration_days', v_landing.duration_days,
    'botToken', CASE WHEN v_is_valid THEN v_landing.telegram_bot_token ELSE NULL END,
    'chatId', CASE WHEN v_is_valid THEN v_landing.telegram_chat_id ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS
-- =====================================================

GRANT EXECUTE ON FUNCTION generate_landing_slug() TO anon;
GRANT EXECUTE ON FUNCTION check_landing_expiry() TO anon;
GRANT EXECUTE ON FUNCTION is_landing_expired(TIMESTAMPTZ, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION build_user_landings_json(UUID) TO anon;
GRANT EXECUTE ON FUNCTION verify_user_session(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_session(UUID, TEXT) TO anon;

GRANT EXECUTE ON FUNCTION auth_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION auth_get_session(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION admin_get_users(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION admin_set_user_status(UUID, TEXT, UUID, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION admin_set_user_landings(UUID, TEXT, UUID, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION user_save_telegram(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION user_set_telegram_connected(UUID, TEXT, BOOLEAN, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION user_reset_landing_slug(UUID, TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public_get_landing_templates() TO anon;
GRANT EXECUTE ON FUNCTION public_get_user_by_slug(TEXT) TO anon;
