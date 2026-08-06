-- V15: Add missing audit columns to notifications table
ALTER TABLE notifications
ADD COLUMN created_by UUID,
ADD COLUMN last_modified_by UUID;
