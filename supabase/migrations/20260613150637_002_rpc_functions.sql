-- RPC functions for admin operations

-- Function to get all users (for super admin)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  username VARCHAR(50),
  phone VARCHAR(20),
  role user_role,
  status user_status,
  subdomain_slug VARCHAR(10),
  telegram_bot_token TEXT,
  telegram_chat_id VARCHAR(100),
  telegram_connected BOOLEAN,
  activated_at TIMESTAMP WITH TIME ZONE,
  duration_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE role = 'user' ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate a user
CREATE OR REPLACE FUNCTION activate_user(user_id UUID, duration INTEGER, slug VARCHAR(10))
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    status = 'active',
    duration_days = duration,
    activated_at = NOW(),
    subdomain_slug = COALESCE(subdomain_slug, slug)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user status (deactivate)
CREATE OR REPLACE FUNCTION update_user_status(
  user_id UUID,
  new_status user_status,
  new_duration INTEGER,
  new_activated_at TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    status = new_status,
    duration_days = new_duration,
    activated_at = new_activated_at
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a user (soft delete by marking as inactive and clearing sensitive data)
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user by subdomain slug (for landing page)
CREATE OR REPLACE FUNCTION get_user_by_slug(slug VARCHAR(10))
RETURNS TABLE (
  id UUID,
  username VARCHAR(50),
  telegram_bot_token TEXT,
  telegram_chat_id VARCHAR(100),
  telegram_connected BOOLEAN,
  status user_status
) AS $$
BEGIN
  -- Check expiry first
  PERFORM check_user_expiry();
  
  RETURN QUERY 
    SELECT id, username, telegram_bot_token, telegram_chat_id, telegram_connected, status
    FROM users
    WHERE subdomain_slug = slug
      AND status = 'active'
      AND telegram_connected = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update telegram connection status
CREATE OR REPLACE FUNCTION update_telegram_status(
  user_id UUID,
  connected BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET telegram_connected = connected
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update telegram credentials
CREATE OR REPLACE FUNCTION update_telegram_credentials(
  user_id UUID,
  bot_token TEXT,
  chat_id VARCHAR(100)
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    telegram_bot_token = bot_token,
    telegram_chat_id = chat_id
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;