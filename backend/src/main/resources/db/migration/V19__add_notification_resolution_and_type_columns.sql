ALTER TABLE notifications
    ADD COLUMN notification_type VARCHAR(50),
    ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN user_document_id UUID REFERENCES user_documents(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX uq_active_component_condition
ON notifications (user_id, user_component_id)
WHERE resolved_at IS NULL
  AND user_component_id IS NOT NULL
  AND notification_type IN ('COMPONENT_WARNING', 'COMPONENT_CRITICAL', 'COMPONENT_DATA_REQUIRED');

CREATE UNIQUE INDEX uq_active_document_condition
ON notifications (user_id, user_document_id)
WHERE resolved_at IS NULL
  AND user_document_id IS NOT NULL
  AND notification_type IN ('DOCUMENT_EXPIRING', 'DOCUMENT_EXPIRED');

CREATE INDEX idx_notifications_user_active ON notifications (user_id, resolved_at) WHERE resolved_at IS NULL;
