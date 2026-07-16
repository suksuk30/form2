-- Drop existing RPC policies and create proper SECURITY DEFINER functions
-- that work with the anon key (no service role key needed)

-- =====================================================
-- AUTH FUNCTIONS
-- =====================================================

-- Register new user
CREATE OR REPLACE FUNCTION auth_register(
  p_username TEXT,
  p_phone TEXT,
  p_password TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Validate username format
  IF NOT (p_username ~ '^[a-zA-Z0-9_]{3,20}$') THEN
    RETURN json_build_object('error', 'Username harus 3-20 karakter (huruf, angka, underscore)');
  END IF;

  -- Validate phone
  IF NOT (p_phone ~ '^[0-9]{10,15}$') THEN
    RETURN json_build_object('error', 'Nomor HP tidak valid (10-15 digit angka)');
  END IF;

  -- Validate password length
  IF char_length(p_password) < 6 THEN
    RETURN json_build_object('error', 'Password minimal 6 karakter');
  END IF;

  -- Check username exists
  IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
    RETURN json_build_object('error', 'Username sudah digunakan');
  END IF;

  -- Create user
  v_user_id := gen_random_uuid();
  INSERT INTO users (id, username, phone, password_hash, role, status)
  VALUES (v_user_id, p_username, p_phone, crypt(p_password, gen_salt('bf')), 'user', 'inactive');

  RETURN json_build_object('success', true, 'message', 'Akun berhasil dibuat. Silakan login.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Login user
CREATE OR REPLACE FUNCTION auth_login(
  p_username TEXT,
  p_password TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_session_token TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user by username
  SELECT * INTO v_user FROM users WHERE username = p_username;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Username tidak ditemukan');
  END IF;

  -- Verify password
  IF v_user.password_hash != crypt(p_password, v_user.password_hash) THEN
    RETURN json_build_object('error', 'Password salah');
  END IF;

  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := NOW() + INTERVAL '7 days';

  -- Update session
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
      'subdomain_slug', v_user.subdomain_slug,
      'telegram_bot_token', v_user.telegram_bot_token,
      'telegram_chat_id', v_user.telegram_chat_id,
      'telegram_connected', v_user.telegram_connected,
      'activated_at', v_user.activated_at,
      'duration_days', v_user.duration_days,
      'created_at', v_user.created_at,
      'updated_at', v_user.updated_at
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current session user
CREATE OR REPLACE FUNCTION auth_get_session(
  p_user_id UUID,
  p_session_token TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Check expiry for all active users
  UPDATE users
  SET status = 'expired'
  WHERE status = 'active'
    AND role = 'user'
    AND activated_at IS NOT NULL
    AND duration_days > 0
    AND (activated_at + (duration_days || ' days')::interval) < NOW();

  -- Get user by session
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
      'subdomain_slug', v_user.subdomain_slug,
      'telegram_bot_token', v_user.telegram_bot_token,
      'telegram_chat_id', v_user.telegram_chat_id,
      'telegram_connected', v_user.telegram_connected,
      'activated_at', v_user.activated_at,
      'duration_days', v_user.duration_days,
      'created_at', v_user.created_at,
      'updated_at', v_user.updated_at
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Logout user
CREATE OR REPLACE FUNCTION auth_logout(
  p_user_id UUID,
  p_session_token TEXT
)
RETURNS JSON AS $$
BEGIN
  UPDATE users
  SET session_token = NULL, session_expires_at = NULL
  WHERE id = p_user_id AND session_token = p_session_token;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADMIN FUNCTIONS
-- =====================================================

-- Get all users (admin only)
CREATE OR REPLACE FUNCTION admin_get_users(
  p_admin_id UUID,
  p_session_token TEXT
)
RETURNS JSON AS $$
DECLARE
  v_admin RECORD;
  v_users JSON;
BEGIN
  -- Check expiry
  UPDATE users
  SET status = 'expired'
  WHERE status = 'active'
    AND role = 'user'
    AND activated_at IS NOT NULL
    AND duration_days > 0
    AND (activated_at + (duration_days || ' days')::interval) < NOW();

  -- Verify admin
  SELECT * INTO v_admin
  FROM users
  WHERE id = p_admin_id
    AND session_token = p_session_token
    AND session_expires_at > NOW()
    AND role = 'super_admin';

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  -- Get users
  SELECT json_agg(
    json_build_object(
      'id', u.id,
      'username', u.username,
      'phone', u.phone,
      'role', u.role,
      'status', u.status,
      'subdomain_slug', u.subdomain_slug,
      'telegram_connected', u.telegram_connected,
      'activated_at', u.activated_at,
      'duration_days', u.duration_days,
      'created_at', u.created_at,
      'updated_at', u.updated_at
    ) ORDER BY u.created_at DESC
  )
  INTO v_users
  FROM users u
  WHERE u.role = 'user';

  RETURN json_build_object('users', COALESCE(v_users, '[]'::json));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activate / deactivate user (admin only)
CREATE OR REPLACE FUNCTION admin_set_user_status(
  p_admin_id UUID,
  p_session_token TEXT,
  p_user_id UUID,
  p_activate BOOLEAN,
  p_duration_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  v_admin RECORD;
  v_slug TEXT;
  v_chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  v_existing_slug TEXT;
BEGIN
  -- Verify admin
  SELECT * INTO v_admin
  FROM users
  WHERE id = p_admin_id
    AND session_token = p_session_token
    AND session_expires_at > NOW()
    AND role = 'super_admin';

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF p_activate THEN
    -- Get existing slug or generate new one
    SELECT subdomain_slug INTO v_existing_slug FROM users WHERE id = p_user_id;

    IF v_existing_slug IS NULL OR v_existing_slug = '' THEN
      LOOP
        v_slug := '';
        FOR i IN 1..(6 + floor(random() * 3)::int) LOOP
          v_slug := v_slug || substr(v_chars, floor(random() * 36 + 1)::int, 1);
        END LOOP;
        EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE subdomain_slug = v_slug);
      END LOOP;
    ELSE
      v_slug := v_existing_slug;
    END IF;

    UPDATE users
    SET status = 'active',
        duration_days = p_duration_days,
        activated_at = NOW(),
        subdomain_slug = v_slug
    WHERE id = p_user_id;
  ELSE
    UPDATE users
    SET status = 'inactive',
        duration_days = 0,
        activated_at = NULL,
        subdomain_slug = NULL,
        telegram_connected = FALSE
    WHERE id = p_user_id;
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete user (admin only)
CREATE OR REPLACE FUNCTION admin_delete_user(
  p_admin_id UUID,
  p_session_token TEXT,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_admin RECORD;
BEGIN
  -- Verify admin
  SELECT * INTO v_admin
  FROM users
  WHERE id = p_admin_id
    AND session_token = p_session_token
    AND session_expires_at > NOW()
    AND role = 'super_admin';

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  DELETE FROM users WHERE id = p_user_id AND role = 'user';

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USER FUNCTIONS
-- =====================================================

-- Save telegram settings
CREATE OR REPLACE FUNCTION user_save_telegram(
  p_user_id UUID,
  p_session_token TEXT,
  p_bot_token TEXT,
  p_chat_id TEXT
)
RETURNS JSON AS $$
BEGIN
  -- Verify session
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = p_user_id
      AND session_token = p_session_token
      AND session_expires_at > NOW()
  ) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  UPDATE users
  SET telegram_bot_token = p_bot_token,
      telegram_chat_id = p_chat_id
  WHERE id = p_user_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update telegram connection status
CREATE OR REPLACE FUNCTION user_set_telegram_connected(
  p_user_id UUID,
  p_session_token TEXT,
  p_connected BOOLEAN,
  p_bot_token TEXT DEFAULT NULL,
  p_chat_id TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  -- Verify session
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = p_user_id
      AND session_token = p_session_token
      AND session_expires_at > NOW()
  ) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  UPDATE users
  SET telegram_connected = p_connected,
      telegram_bot_token = COALESCE(p_bot_token, telegram_bot_token),
      telegram_chat_id = COALESCE(p_chat_id, telegram_chat_id)
  WHERE id = p_user_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user by subdomain slug (for landing page - public)
CREATE OR REPLACE FUNCTION public_get_user_by_slug(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Check expiry first
  UPDATE users
  SET status = 'expired'
  WHERE status = 'active'
    AND role = 'user'
    AND activated_at IS NOT NULL
    AND duration_days > 0
    AND (activated_at + (duration_days || ' days')::interval) < NOW();

  -- Get user by slug and include status + expiry metadata for server-side validation
  SELECT status, activated_at, duration_days, telegram_connected, telegram_bot_token, telegram_chat_id
  INTO v_user
  FROM users
  WHERE subdomain_slug = p_slug
    AND role = 'user'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'status', NULL,
      'activated_at', NULL,
      'duration_days', NULL,
      'botToken', NULL,
      'chatId', NULL
    );
  END IF;

  RETURN json_build_object(
    'valid', v_user.status = 'active'
      AND v_user.telegram_connected IS TRUE
      AND v_user.telegram_bot_token IS NOT NULL
      AND v_user.telegram_chat_id IS NOT NULL,
    'status', v_user.status,
    'activated_at', v_user.activated_at,
    'duration_days', v_user.duration_days,
    'botToken', CASE
      WHEN v_user.status = 'active'
        AND v_user.telegram_connected IS TRUE
        AND v_user.telegram_bot_token IS NOT NULL
        AND v_user.telegram_chat_id IS NOT NULL
      THEN v_user.telegram_bot_token
      ELSE NULL
    END,
    'chatId', CASE
      WHEN v_user.status = 'active'
        AND v_user.telegram_connected IS TRUE
        AND v_user.telegram_bot_token IS NOT NULL
        AND v_user.telegram_chat_id IS NOT NULL
      THEN v_user.telegram_chat_id
      ELSE NULL
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION auth_register(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION auth_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION auth_get_session(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION auth_logout(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION admin_get_users(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION admin_set_user_status(UUID, TEXT, UUID, BOOLEAN, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID, TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION user_save_telegram(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION user_set_telegram_connected(UUID, TEXT, BOOLEAN, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public_get_user_by_slug(TEXT) TO anon;