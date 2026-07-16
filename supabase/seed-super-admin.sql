-- Seed Super Admin Account
-- Run this manually via SQL Editor to create a super admin account

-- First, create auth user via Supabase Auth (this needs to be done through the API/UI)
-- Then run the query below with the auth user ID:

-- Replace 'YOUR_AUTH_USER_ID' with the actual UUID from auth.users
-- UPDATE users SET role = 'super_admin' WHERE id = 'YOUR_AUTH_USER_ID';

-- This is a documentation file showing the process to create a super_admin.
-- The actual creation needs to be done in two steps:

-- 1. Create the auth user first (via Supabase Dashboard > Authentication > Users > Add User)
--    Email: admin@webkita.app (or any email you prefer)
--    Password: [your-secure-password]

-- 2. Get the user ID from the auth.users table, then run:
--    INSERT INTO users (id, username, phone, role, status)
--    VALUES (
--      'uuid-from-auth-users',
--      'admin',
--      '0000000000',
--      'super_admin',
--      'active'
--    );

-- Or if the user already exists in users table:
-- UPDATE users SET role = 'super_admin' WHERE username = 'admin';
