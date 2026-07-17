
-- V11__seed_dev_normal_users.sql
-- AutoCare AI — Seed Default Normal User Account (Alex)
--

DO $$
DECLARE
    v_user_id     UUID;
    v_user_role_id UUID;
BEGIN

    -- Only execute the seed block if the 'seed-dev-admin' placeholder is set to 'true'
    IF '${seed-dev-admin}' = 'true' THEN

        -- ── 1. Insert the normal user account (alex@example.com) ───────────────────
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
            'alex@example.com',
            '$2b$10$GuVE9OH3NhG5b/kQY/otCu2dG6hBXBN5kn084zAwKvex7gjzSRpUK', -- Password123!
            'Alex Rider',
            'ACTIVE',
            TRUE,
            0,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (email) DO NOTHING;

        -- ── 2. Resolve the inserted user's ID ───────────────────────────────────
        SELECT id INTO v_user_id
        FROM users
        WHERE email = 'alex@example.com';

        -- ── 3. Resolve the ROLE_USER role ID ─────────────────────────────────────
        SELECT id INTO v_user_role_id
        FROM roles
        WHERE name = 'ROLE_USER';

        IF v_user_role_id IS NOT NULL AND v_user_id IS NOT NULL THEN
            -- ── 4. Assign ROLE_USER to the account ───────────────────────────────────
            INSERT INTO user_roles (user_id, role_id, assigned_at)
            VALUES (v_user_id, v_user_role_id, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, role_id) DO NOTHING;

            -- ── 5. Initialise AI credits ─────────────────────────────────────────────
            INSERT INTO user_ai_credits (user_id, credits, version, created_at, last_modified_at)
            VALUES (v_user_id, 100, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO NOTHING;

            -- ── 6. Seed initial password history entry ──────────────────────────────
            INSERT INTO password_history (user_id, password_hash, created_at)
            VALUES (
                v_user_id,
                '$2b$10$GuVE9OH3NhG5b/kQY/otCu2dG6hBXBN5kn084zAwKvex7gjzSRpUK',
                CURRENT_TIMESTAMP
            )
            ON CONFLICT DO NOTHING;
        END IF;

        RAISE NOTICE 'Dev user alex@example.com seeded successfully';
    END IF;

END $$;
