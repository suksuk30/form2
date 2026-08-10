-- Admin: create and update customer accounts (super_admin only).

CREATE OR REPLACE FUNCTION admin_create_user(
  p_admin_id UUID,
  p_session_token TEXT,
  p_username TEXT,
  p_phone TEXT,
  p_password TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT verify_admin_session(p_admin_id, p_session_token) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF NOT (p_username ~ '^[a-zA-Z0-9_]{3,20}$') THEN
    RETURN json_build_object('error', 'Username harus 3-20 karakter (huruf, angka, underscore)');
  END IF;

  IF NOT (p_phone ~ '^[0-9]{10,15}$') THEN
    RETURN json_build_object('error', 'Nomor HP tidak valid (10-15 digit angka)');
  END IF;

  IF char_length(p_password) < 6 THEN
    RETURN json_build_object('error', 'Password minimal 6 karakter');
  END IF;

  IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
    RETURN json_build_object('error', 'Username sudah digunakan');
  END IF;

  v_user_id := gen_random_uuid();
  INSERT INTO users (id, username, phone, password_hash, role, status)
  VALUES (v_user_id, p_username, p_phone, crypt(p_password, gen_salt('bf')), 'user', 'inactive');

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user_id,
      'username', p_username,
      'phone', p_phone,
      'status', 'inactive'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_update_user(
  p_admin_id UUID,
  p_session_token TEXT,
  p_user_id UUID,
  p_username TEXT,
  p_phone TEXT,
  p_password TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_target users%ROWTYPE;
BEGIN
  IF NOT verify_admin_session(p_admin_id, p_session_token) THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  SELECT * INTO v_target
  FROM users
  WHERE id = p_user_id AND role = 'user';

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'User tidak ditemukan');
  END IF;

  IF NOT (p_username ~ '^[a-zA-Z0-9_]{3,20}$') THEN
    RETURN json_build_object('error', 'Username harus 3-20 karakter (huruf, angka, underscore)');
  END IF;

  IF NOT (p_phone ~ '^[0-9]{10,15}$') THEN
    RETURN json_build_object('error', 'Nomor HP tidak valid (10-15 digit angka)');
  END IF;

  IF p_password IS NOT NULL AND btrim(p_password) <> '' AND char_length(p_password) < 6 THEN
    RETURN json_build_object('error', 'Password minimal 6 karakter');
  END IF;

  IF EXISTS (
    SELECT 1 FROM users WHERE username = p_username AND id <> p_user_id
  ) THEN
    RETURN json_build_object('error', 'Username sudah digunakan');
  END IF;

  UPDATE users
  SET
    username = p_username,
    phone = p_phone,
    password_hash = CASE
      WHEN p_password IS NOT NULL AND btrim(p_password) <> '' THEN crypt(p_password, gen_salt('bf'))
      ELSE password_hash
    END,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', p_user_id,
      'username', p_username,
      'phone', p_phone
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION admin_create_user(UUID, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_user(UUID, TEXT, UUID, TEXT, TEXT, TEXT) TO anon;
