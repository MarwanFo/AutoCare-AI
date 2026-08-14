-- V20: Add external user identities for OAuth (Google Sign-In) and support nullable password hashes for OAuth-only users

-- 1. Make password_hash nullable on users table for OAuth-only accounts
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Update password_hash length constraint to allow NULL or exact 60 chars (BCrypt)
ALTER TABLE users DROP CONSTRAINT chk_users_password_hash_length;
ALTER TABLE users ADD CONSTRAINT chk_users_password_hash_length CHECK (password_hash IS NULL OR char_length(password_hash) = 60);

-- 3. Create user_identities table for storing external provider account links (e.g. Google sub)
CREATE TABLE user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    CONSTRAINT uq_user_identities_provider_user_id UNIQUE (provider, provider_user_id),
    CONSTRAINT uq_user_identities_user_provider UNIQUE (user_id, provider)
);

CREATE INDEX idx_user_identities_user_id ON user_identities(user_id);
