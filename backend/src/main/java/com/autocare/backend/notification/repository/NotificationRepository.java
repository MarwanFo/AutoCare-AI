package com.autocare.backend.notification.repository;

import com.autocare.backend.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Notification> findByUserIdAndIsReadFalse(UUID userId);

    long countByUserIdAndIsReadFalse(UUID userId);

    boolean existsByUserIdAndComponentIdAndIsReadFalse(UUID userId, UUID componentId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.component.id = :componentId AND n.resolvedAt IS NULL AND n.type IN ('COMPONENT_WARNING', 'COMPONENT_CRITICAL', 'COMPONENT_DATA_REQUIRED')")
    Optional<Notification> findActiveComponentConditionNotification(@Param("userId") UUID userId, @Param("componentId") UUID componentId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.document.id = :documentId AND n.resolvedAt IS NULL AND n.type IN ('DOCUMENT_EXPIRING', 'DOCUMENT_EXPIRED')")
    Optional<Notification> findActiveDocumentConditionNotification(@Param("userId") UUID userId, @Param("documentId") UUID documentId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.resolvedAt = :now WHERE n.user.id = :userId AND n.component.id = :componentId AND n.resolvedAt IS NULL AND n.type IN ('COMPONENT_WARNING', 'COMPONENT_CRITICAL', 'COMPONENT_DATA_REQUIRED')")
    int resolveActiveComponentConditionNotifications(@Param("userId") UUID userId, @Param("componentId") UUID componentId, @Param("now") Instant now);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.resolvedAt = :now WHERE n.user.id = :userId AND n.document.id = :documentId AND n.resolvedAt IS NULL AND n.type IN ('DOCUMENT_EXPIRING', 'DOCUMENT_EXPIRED')")
    int resolveActiveDocumentConditionNotifications(@Param("userId") UUID userId, @Param("documentId") UUID documentId, @Param("now") Instant now);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query(value = "INSERT INTO notifications (id, user_id, user_vehicle_id, user_component_id, notification_type, severity, title, message, is_read, resolved_at, created_at, last_modified_at) " +
            "VALUES (:id, :userId, :vehicleId, :componentId, :type, :severity, :title, :message, false, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
            "ON CONFLICT (user_id, user_component_id) WHERE resolved_at IS NULL AND user_component_id IS NOT NULL AND notification_type IN ('COMPONENT_WARNING', 'COMPONENT_CRITICAL', 'COMPONENT_DATA_REQUIRED') DO NOTHING",
            nativeQuery = true)
    int insertActiveComponentNotification(
            @Param("id") UUID id,
            @Param("userId") UUID userId,
            @Param("vehicleId") UUID vehicleId,
            @Param("componentId") UUID componentId,
            @Param("type") String type,
            @Param("severity") String severity,
            @Param("title") String title,
            @Param("message") String message
    );

    @Modifying
    @Query(value = "INSERT INTO notifications (id, user_id, user_vehicle_id, user_document_id, notification_type, severity, title, message, is_read, resolved_at, created_at, last_modified_at) " +
            "VALUES (:id, :userId, :vehicleId, :documentId, :type, :severity, :title, :message, false, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
            "ON CONFLICT (user_id, user_document_id) WHERE resolved_at IS NULL AND user_document_id IS NOT NULL AND notification_type IN ('DOCUMENT_EXPIRING', 'DOCUMENT_EXPIRED') DO NOTHING",
            nativeQuery = true)
    int insertActiveDocumentNotification(
            @Param("id") UUID id,
            @Param("userId") UUID userId,
            @Param("vehicleId") UUID vehicleId,
            @Param("documentId") UUID documentId,
            @Param("type") String type,
            @Param("severity") String severity,
            @Param("title") String title,
            @Param("message") String message
    );
}
