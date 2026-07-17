-- V5__create_vehicle_schema.sql
-- AutoCare AI Vehicle Management Module Schema Initialization

-- 1. Create lookup and template tables

-- Brands Table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    CONSTRAINT uq_brands_name UNIQUE (name),
    CONSTRAINT chk_brands_name_length CHECK (char_length(name) >= 2)
);

-- Models Table
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    CONSTRAINT uq_brand_model_name UNIQUE (brand_id, name),
    CONSTRAINT chk_models_name_length CHECK (char_length(name) >= 1)
);

-- Vehicle Templates Table
CREATE TABLE vehicle_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE RESTRICT,
    year INTEGER NOT NULL,
    trim_configuration VARCHAR(100) NOT NULL DEFAULT 'Standard',
    specifications JSONB NOT NULL DEFAULT '{}',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    CONSTRAINT uq_brand_model_year_trim UNIQUE (brand_id, model_id, year, trim_configuration),
    CONSTRAINT chk_vehicle_templates_year CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2),
    CONSTRAINT chk_vehicle_templates_version CHECK (version >= 1)
);

-- Template Components Table
CREATE TABLE template_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES vehicle_templates(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    standard_part_number VARCHAR(100),
    standard_specifications TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    CONSTRAINT chk_template_components_name_length CHECK (char_length(name) >= 1)
);

-- Template Intervals Table
CREATE TABLE template_intervals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES vehicle_templates(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    interval_mileage INTEGER,
    interval_months INTEGER,
    is_inspection_only BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    CONSTRAINT chk_template_intervals_title_length CHECK (char_length(title) >= 1),
    CONSTRAINT chk_template_intervals_intervals CHECK (
        (interval_mileage IS NULL OR interval_mileage > 0) AND 
        (interval_months IS NULL OR interval_months > 0) AND
        (interval_mileage IS NOT NULL OR interval_months IS NOT NULL)
    )
);

-- 2. Create User Digital Twin tables

-- User Vehicles Table
CREATE TABLE user_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    template_id UUID NOT NULL REFERENCES vehicle_templates(id) ON DELETE RESTRICT,
    license_plate VARCHAR(20),
    vin VARCHAR(17),
    current_mileage INTEGER NOT NULL DEFAULT 0,
    mileage_unit VARCHAR(10) NOT NULL DEFAULT 'KM',
    fuel_type VARCHAR(50) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    color VARCHAR(50),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_service_date TIMESTAMPTZ,
    last_service_mileage INTEGER,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    CONSTRAINT chk_user_vehicles_mileage CHECK (current_mileage >= 0),
    CONSTRAINT chk_user_vehicles_service_mileage CHECK (last_service_mileage IS NULL OR last_service_mileage >= 0),
    CONSTRAINT chk_user_vehicles_vin CHECK (vin IS NULL OR char_length(vin) = 17),
    CONSTRAINT chk_user_vehicles_mileage_unit CHECK (mileage_unit IN ('KM', 'MILES')),
    CONSTRAINT chk_user_vehicles_status CHECK (status IN ('ACTIVE', 'SOLD', 'ARCHIVED')),
    CONSTRAINT chk_user_vehicles_fuel_type CHECK (fuel_type IN ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID', 'LPG')),
    CONSTRAINT chk_user_vehicles_transmission CHECK (transmission IN ('MANUAL', 'AUTOMATIC', 'CVT', 'DUAL_CLUTCH'))
);

-- User Components Table
CREATE TABLE user_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_vehicle_id UUID NOT NULL REFERENCES user_vehicles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    part_number VARCHAR(100),
    specifications TEXT,
    last_replaced_mileage INTEGER,
    last_replaced_date DATE,
    notes TEXT,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    is_modified_from_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    CONSTRAINT chk_user_components_name_length CHECK (char_length(name) >= 1),
    CONSTRAINT chk_user_components_replaced_mileage CHECK (last_replaced_mileage IS NULL OR last_replaced_mileage >= 0)
);

-- User Intervals Table
CREATE TABLE user_intervals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_vehicle_id UUID NOT NULL REFERENCES user_vehicles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    interval_mileage INTEGER,
    interval_months INTEGER,
    is_inspection_only BOOLEAN NOT NULL DEFAULT FALSE,
    is_modified_from_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    CONSTRAINT chk_user_intervals_title_length CHECK (char_length(title) >= 1),
    CONSTRAINT chk_user_intervals_intervals CHECK (
        (interval_mileage IS NULL OR interval_mileage > 0) AND 
        (interval_months IS NULL OR interval_months > 0) AND
        (interval_mileage IS NOT NULL OR interval_months IS NOT NULL)
    )
);

-- User Documents Table
CREATE TABLE user_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_vehicle_id UUID NOT NULL REFERENCES user_vehicles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID,
    CONSTRAINT chk_user_documents_title_length CHECK (char_length(title) >= 1)
);

-- Vehicle Photos Table
CREATE TABLE vehicle_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_vehicle_id UUID NOT NULL REFERENCES user_vehicles(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID
);

-- 3. Indexes for query performance optimization

-- Lookup indexes
CREATE INDEX idx_models_brand_id ON models (brand_id);
CREATE INDEX idx_vehicle_templates_brand_model ON vehicle_templates (brand_id, model_id);

-- User vehicle query indexes
CREATE INDEX idx_user_vehicles_user_status ON user_vehicles (user_id, status);
CREATE UNIQUE INDEX idx_user_vehicles_primary ON user_vehicles (user_id) WHERE (is_primary = TRUE AND status = 'ACTIVE');

-- Digital Twin query indexes
CREATE INDEX idx_user_components_vehicle ON user_components (user_vehicle_id);
CREATE INDEX idx_user_intervals_vehicle ON user_intervals (user_vehicle_id);
CREATE INDEX idx_user_documents_vehicle ON user_documents (user_vehicle_id);
CREATE INDEX idx_vehicle_photos_vehicle ON vehicle_photos (user_vehicle_id);

-- Partial index for only one main photo per vehicle
CREATE UNIQUE INDEX uq_vehicle_photos_main ON vehicle_photos (user_vehicle_id) WHERE (is_main = TRUE);
