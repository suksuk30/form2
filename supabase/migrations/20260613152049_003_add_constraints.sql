-- Update users table for custom auth (add password field properly as bcrypt hash will be stored)
-- We'll store hashed passwords using bcrypt

-- Add a constraint for username format
ALTER TABLE users ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- Add a constraint for phone format
ALTER TABLE users ADD CONSTRAINT phone_format CHECK (phone ~ '^[0-9]{10,15}$');

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);