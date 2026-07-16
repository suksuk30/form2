-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('user', 'super_admin');

-- Create enum for user status
CREATE TYPE user_status AS ENUM ('inactive', 'active', 'expired');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'inactive',
  subdomain_slug VARCHAR(10) UNIQUE,
  telegram_bot_token TEXT,
  telegram_chat_id VARCHAR(100),
  telegram_connected BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMP WITH TIME ZONE,
  duration_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster subdomain lookups
CREATE INDEX idx_users_subdomain_slug ON users(subdomain_slug);

-- Create index for status lookups
CREATE INDEX idx_users_status ON users(status);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Super admins can see all users
CREATE POLICY "super_admin_select_all" ON users FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Users can only see their own data
CREATE POLICY "user_select_own" ON users FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- Only super admins can insert users
CREATE POLICY "super_admin_insert" ON users FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Users can update their own data (telegram settings)
CREATE POLICY "user_update_own" ON users FOR UPDATE
  TO authenticated USING (auth.uid() = id);

-- Only super admins can delete users
CREATE POLICY "super_admin_delete" ON users FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Create function to generate random subdomain slug
CREATE OR REPLACE FUNCTION generate_subdomain_slug() RETURNS VARCHAR AS $$
DECLARE
  chars VARCHAR(36) := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result VARCHAR(10) := '';
  i INTEGER;
  exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..7 LOOP
      result := result || substr(chars, floor(random() * 36 + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM users WHERE subdomain_slug = result) INTO exists;
    IF NOT exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to check and update expired users
CREATE OR REPLACE FUNCTION check_user_expiry()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET status = 'expired'
  WHERE status = 'active'
    AND activated_at IS NOT NULL
    AND duration_days > 0
    AND (activated_at + (duration_days || ' days')::interval) < NOW();
END;
$$ LANGUAGE plpgsql;