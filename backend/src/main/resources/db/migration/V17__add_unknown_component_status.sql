ALTER TABLE user_components DROP CONSTRAINT IF EXISTS chk_user_component_status;
ALTER TABLE user_components ADD CONSTRAINT chk_user_component_status CHECK (status IN ('NEW', 'NEEDS_VERIFICATION', 'GOOD', 'WARNING', 'CRITICAL', 'UNKNOWN'));
