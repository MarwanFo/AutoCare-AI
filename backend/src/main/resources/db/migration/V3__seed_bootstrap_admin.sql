-- V3__seed_bootstrap_admin.sql
-- AutoCare AI — Bootstrap Administrator Account
--
-- PURPOSE
--   Seeds the first platform administrator account for development and initial
--   production deployment. This account is the only entry point into the admin
--   panel before the invite-based provisioning system is implemented.
--
-- SECURITY NOTES
--   • The password hash below encodes the TEMPORARY default credential.
--   • This credential MUST be rotated on first login in every environment.
--   • The account email and password must be changed before any data is loaded.
--   • This migration is idempotent — running it twice is safe (ON CONFLICT DO NOTHING).
--
-- CHANGING CREDENTIALS AFTER DEPLOYMENT
--   1. Log in with the default credentials.
--   2. Use the admin "Change Password" flow (POST /api/v1/auth/change-password).
--   3. Update the account email via the User Management API.
--   Alternatively, run a manual UPDATE on the users table with a fresh BCrypt hash:
--
--   UPDATE users
--   SET email        = 'your.email@domain.com',
--       password_hash = '<bcrypt-hash-of-new-password>',
--       last_modified_at = CURRENT_TIMESTAMP
--   WHERE email = 'admin@autocare.ai';
--
-- GENERATING A NEW BCRYPT HASH (password strength 10)
--   Option A — Spring Boot test (recommended):
--     System.out.println(new BCryptPasswordEncoder().encode("YourNewPassword1@"));
--   Option B — htpasswd CLI:
--     htpasswd -bnBC 10 "" "YourNewPassword1@" | tr -d ':\n'
--   Option C — Python (requires passlib):
--     python -c "from passlib.hash import bcrypt; print(bcrypt.using(rounds=10).hash('YourNewPassword1@'))"
--
-- DEFAULT CREDENTIALS (development only — rotate immediately)
--   Email    : admin@autocare.ai
--   Password : AdminAutocare1@
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    v_admin_id    UUID;
    v_admin_role_id UUID;
BEGIN

    -- Only execute the seed block if the 'seed-dev-admin' placeholder is set to 'true'
    IF '${seed-dev-admin}' = 'true' THEN

        -- ── 1. Insert the bootstrap administrator account ───────────────────────
        --    ON CONFLICT DO NOTHING ensures the migration is safe to re-run.
        --    status = 'ACTIVE' skips email verification for this seeded account.
        INSERT INTO users (
            id,
            email,
            password_hash,
            full_name,
            status,
            is_profile_completed,
            version,
            created_at,
            last_modified_at
        )
        VALUES (
            gen_random_uuid(),
            'admin@autocare.ai',
            '$2a$10$bfQRdgSaQ2t/lfnNhT3Y1uxgBtbuhFtv5dH40vmomQW/ZyDzcCnTu',
            'System Administrator',
            'ACTIVE',
            TRUE,
            0,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (email) DO NOTHING;

        -- ── 2. Resolve the inserted user's ID ───────────────────────────────────
        SELECT id INTO v_admin_id
        FROM users
        WHERE email = 'admin@autocare.ai';

        -- ── 3. Resolve the ROLE_ADMIN role ID ───────────────────────────────────
        SELECT id INTO v_admin_role_id
        FROM roles
        WHERE name = 'ROLE_ADMIN';

        IF v_admin_role_id IS NULL THEN
            RAISE EXCEPTION 'ROLE_ADMIN not found. Ensure V2__seed_auth_roles_permissions.sql has run first.';
        END IF;

        -- ── 4. Assign ROLE_ADMIN to the bootstrap account ───────────────────────
        --    ON CONFLICT DO NOTHING is safe if the migration re-runs.
        INSERT INTO user_roles (user_id, role_id, assigned_at)
        VALUES (v_admin_id, v_admin_role_id, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, role_id) DO NOTHING;

        -- ── 5. Initialise AI credits for the admin account ──────────────────────
        INSERT INTO user_ai_credits (user_id, credits, version, created_at, last_modified_at)
        VALUES (v_admin_id, 100, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO NOTHING;

        -- ── 6. Seed initial password history entry ──────────────────────────────
        --    Required to satisfy the password reuse policy validation on first
        --    password change.
        INSERT INTO password_history (user_id, password_hash, created_at)
        VALUES (
            v_admin_id,
            '$2a$10$bfQRdgSaQ2t/lfnNhT3Y1uxgBtbuhFtv5dH40vmomQW/ZyDzcCnTu',
            CURRENT_TIMESTAMP
        )
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Bootstrap administrator seeded successfully for: admin@autocare.ai';
    ELSE
        RAISE NOTICE 'Skipping bootstrap administrator seeding (non-development environment).';
    END IF;

END $$;
