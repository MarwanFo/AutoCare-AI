-- V1__init_auth_schema.sql
-- AutoCare AI Authentication Module Schema Initialization

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 1. Create Enums
CREATE TYPE account_status AS ENUM ('UNVERIFIED', 'ACTIVE', 'SUSPENDED');
CREATE TYPE auth_token_type AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');
CREATE TYPE audit_event_type AS ENUM (
    'USER_REGISTERED', 
    'EMAIL_VERIFIED', 
    'LOGIN_SUCCESS', 
    'LOGIN_FAILURE', 
    'PASSWORD_RESET_REQUESTED', 
    'PASSWORD_RESET_COMPLETED', 
    'SESSION_REVOKED'
);

-- 2. Create tables

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    status account_status NOT NULL DEFAULT 'UNVERIFIED',
    is_profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_email_length CHECK (char_length(email) >= 3 AND char_length(email) <= 255),
    CONSTRAINT chk_users_password_hash_length CHECK (char_length(password_hash) = 60),
    CONSTRAINT chk_users_version_positive CHECK (version >= 0)
);

-- User AI Credits Table
CREATE TABLE user_ai_credits (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_ai_credits_non_negative CHECK (credits >= 0),
    CONSTRAINT chk_user_ai_credits_version_positive CHECK (version >= 0)
);

-- Password History Table
CREATE TABLE password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_password_history_hash_length CHECK (char_length(password_hash) = 60)
);

-- Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_roles_name UNIQUE (name),
    CONSTRAINT chk_roles_name_length CHECK (char_length(name) >= 3)
);

-- User Roles Join Table
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Permissions Table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_permissions_name UNIQUE (name),
    CONSTRAINT chk_permissions_name_length CHECK (char_length(name) >= 3)
);

-- Role Permissions Join Table
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- User Sessions (Refresh Session Tracking) Table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(512) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    CONSTRAINT uq_user_sessions_token_hash UNIQUE (token_hash),
    CONSTRAINT chk_user_sessions_ip_length CHECK (char_length(ip_address) >= 7)
);

-- Auth Tokens Table (Short-lived verification/reset tokens)
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    token_type auth_token_type NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMPTZ,
    CONSTRAINT uq_auth_tokens_token_hash UNIQUE (token_hash)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type audit_event_type NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(512) NOT NULL,
    correlation_id UUID NOT NULL,
    event_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_audit_logs_ip_length CHECK (char_length(ip_address) >= 7)
);

-- 3. Create Indexes

-- Users Indexes
CREATE INDEX idx_users_status_deleted ON users(status, deleted_at);

-- Password History Indexes
CREATE INDEX idx_pass_history_user_id ON password_history(user_id);

-- User Roles Indexes
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Role Permissions Indexes
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- User Sessions Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expiry_revoked ON user_sessions(expires_at, revoked_at);

-- Auth Tokens Indexes
CREATE INDEX idx_auth_tokens_expiry_type ON auth_tokens(expires_at, token_type);

-- Audit Logs Indexes
CREATE INDEX idx_audit_correlation_id ON audit_logs(correlation_id);
CREATE INDEX idx_audit_user_id_created ON audit_logs(user_id, created_at DESC);

-- 4. Table Comments for Schema Maintainability
COMMENT ON TABLE users IS 'Stores user account identities, authentication credentials, status, and profile progress.';
COMMENT ON TABLE user_ai_credits IS 'Tracks AI interaction token credits allocated to each user with concurrency controls.';
COMMENT ON TABLE password_history IS 'Stores historical password hashes to prevent password reuse.';
COMMENT ON TABLE roles IS 'Definitions of roles mapping authorization categories within the system.';
COMMENT ON TABLE user_roles IS 'Join table linking users to their security roles.';
COMMENT ON TABLE permissions IS 'Definitions of granular access control privileges.';
COMMENT ON TABLE role_permissions IS 'Join table mapping privileges to roles.';
COMMENT ON TABLE user_sessions IS 'Persists active login sessions and client metadata to support Refresh Token Rotation.';
COMMENT ON TABLE auth_tokens IS 'Stores short-lived tokens generated for email confirmation or password reset requests.';
COMMENT ON TABLE audit_logs IS 'Append-only trace logs detailing security, authentication, and state events.';
