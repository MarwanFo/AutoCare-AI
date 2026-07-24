-- Migration V13: Add user profile, localization, preferences, and phone constraints

ALTER TABLE users
    ADD COLUMN avatar_url VARCHAR(500),
    ADD COLUMN preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    ADD COLUMN preferred_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    ADD COLUMN preferred_distance_unit VARCHAR(10) NOT NULL DEFAULT 'KM',
    ADD COLUMN push_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Add partial unique index for phone numbers on active (non-deleted) users
CREATE UNIQUE INDEX idx_users_active_phone 
    ON users (phone_number) 
    WHERE phone_number IS NOT NULL AND deleted_at IS NULL;
