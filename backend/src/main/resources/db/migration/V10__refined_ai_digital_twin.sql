-- 1. Extend user_vehicles for calibration, metadata, and completeness metrics
ALTER TABLE user_vehicles ADD COLUMN purchase_date DATE;
ALTER TABLE user_vehicles ADD COLUMN estimated_annual_mileage INTEGER;
ALTER TABLE user_vehicles ADD COLUMN driving_profile VARCHAR(50);
ALTER TABLE user_vehicles ADD COLUMN climate_assumptions VARCHAR(50);
ALTER TABLE user_vehicles ADD COLUMN wear_profile_metadata JSONB;
ALTER TABLE user_vehicles ADD COLUMN completeness_score INTEGER DEFAULT 0;

-- Drop NOT NULL constraints on manual entry fields to defer to AI resolution
ALTER TABLE user_vehicles ALTER COLUMN fuel_type DROP NOT NULL;
ALTER TABLE user_vehicles ALTER COLUMN transmission DROP NOT NULL;

-- Add constraints on user_vehicles
ALTER TABLE user_vehicles ADD CONSTRAINT chk_user_vehicles_driving_profile CHECK (driving_profile IN ('COMMUTER', 'CITY', 'HIGHWAY', 'SPIRITED'));
ALTER TABLE user_vehicles ADD CONSTRAINT chk_user_vehicles_climate CHECK (climate_assumptions IN ('COLD', 'TEMPERATE', 'HOT', 'EXTREME'));
ALTER TABLE user_vehicles ADD CONSTRAINT chk_user_vehicles_completeness CHECK (completeness_score >= 0 AND completeness_score <= 100);

-- 2. Extend user_components with intelligent object tracking
ALTER TABLE user_components ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'NEEDS_VERIFICATION';
ALTER TABLE user_components ADD COLUMN health_score INTEGER; -- Numeric range 0 to 100
ALTER TABLE user_components ADD COLUMN confidence_score INTEGER NOT NULL DEFAULT 50; -- Numeric range 0 to 100
ALTER TABLE user_components ADD COLUMN estimated_remaining_life INTEGER; -- Km or Miles remaining
ALTER TABLE user_components ADD COLUMN installation_mileage INTEGER;
ALTER TABLE user_components ADD COLUMN installation_date DATE;
ALTER TABLE user_components ADD COLUMN last_inspection_date DATE;
ALTER TABLE user_components ADD COLUMN origin VARCHAR(50) NOT NULL DEFAULT 'AI_GENERATED';
ALTER TABLE user_components ADD COLUMN recommendations JSONB; -- Structured AI recommendations list

-- Add constraints on user_components
ALTER TABLE user_components ADD CONSTRAINT chk_user_component_status CHECK (status IN ('NEW', 'NEEDS_VERIFICATION', 'GOOD', 'WARNING', 'CRITICAL'));
ALTER TABLE user_components ADD CONSTRAINT chk_user_component_origin CHECK (origin IN ('FACTORY', 'AI_GENERATED', 'USER_CONFIRMED', 'USER_MODIFIED', 'OCR_EXTRACTED', 'DIAGNOSTIC_DEVICE'));
ALTER TABLE user_components ADD CONSTRAINT chk_user_component_health CHECK (health_score IS NULL OR (health_score >= 0 AND health_score <= 100));
ALTER TABLE user_components ADD CONSTRAINT chk_user_component_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100);
