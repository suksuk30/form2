-- Add session management columns
ALTER TABLE users 
ADD COLUMN session_token VARCHAR(100),
ADD COLUMN session_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for session token lookups
CREATE INDEX idx_users_session_token ON users(session_token);

-- Password hashing function using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to hash password
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, stored_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN stored_hash = crypt(input_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_username VARCHAR(50),
  admin_phone VARCHAR(20),
  admin_password TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO users (id, username, phone, password_hash, role, status)
  VALUES (
    gen_random_uuid(),
    admin_username,
    admin_phone,
    hash_password(admin_password),
    'super_admin',
    'active'
  );
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;