-- V4__add_phone_number_constraints.sql
-- Add uniqueness and format constraints to user phone numbers

ALTER TABLE users ADD CONSTRAINT uq_users_phone_number UNIQUE (phone_number);

ALTER TABLE users ADD CONSTRAINT chk_users_phone_number_format CHECK (phone_number IS NULL OR phone_number ~ '^\+[1-9]\d{1,14}$');
