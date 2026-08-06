-- V14: Add notifications table and piece-specific lifespan columns

-- 1. Add piece-specific lifespan columns to template_components
ALTER TABLE template_components
ADD COLUMN expected_lifespan_mileage INT,
ADD COLUMN expected_lifespan_months INT;

-- 2. Add piece-specific lifespan and remaining columns to user_components
ALTER TABLE user_components
ADD COLUMN expected_lifespan_mileage INT,
ADD COLUMN expected_lifespan_months INT,
ADD COLUMN remaining_mileage INT,
ADD COLUMN remaining_days INT;

-- 3. Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_vehicle_id UUID REFERENCES user_vehicles(id) ON DELETE CASCADE,
    user_component_id UUID REFERENCES user_components(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_modified_by UUID
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_is_read ON notifications(user_id, is_read);
