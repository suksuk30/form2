-- Remove legacy RPCs from migration 002 (no session checks, expose Telegram tokens).
-- Safe: app uses public_get_user_by_slug, user_save_telegram, user_set_telegram_connected, admin_*.

DROP FUNCTION IF EXISTS get_user_by_slug(VARCHAR(10));
DROP FUNCTION IF EXISTS update_telegram_credentials(UUID, TEXT, VARCHAR(100));
DROP FUNCTION IF EXISTS update_telegram_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_all_users();
DROP FUNCTION IF EXISTS activate_user(UUID, INTEGER, VARCHAR(10));
DROP FUNCTION IF EXISTS update_user_status(UUID, user_status, INTEGER, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS delete_user(UUID);
