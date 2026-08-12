package com.autocare.backend.notification.service;

import com.autocare.backend.notification.dto.NotificationResponse;
import com.autocare.backend.notification.entity.Notification;
import com.autocare.backend.notification.entity.enums.NotificationSeverity;
import com.autocare.backend.notification.entity.enums.NotificationType;
import com.autocare.backend.vehicle.entity.UserComponent;
import com.autocare.backend.vehicle.entity.UserDocument;
import com.autocare.backend.vehicle.entity.UserVehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {
    Page<NotificationResponse> getUserNotifications(UUID userId, Pageable pageable);
    long getUnreadCount(UUID userId);
    void markAsRead(UUID userId, UUID notificationId);
    void markAllAsRead(UUID userId);
    Notification createNotification(UUID userId, UserVehicle vehicle, UserComponent component, String title, String message, NotificationSeverity severity);
    void evaluateComponentNotification(UUID userId, UserVehicle vehicle, UserComponent component);
    void evaluateDocumentNotification(UUID userId, UserVehicle vehicle, UserDocument document);
    void resolveDocumentNotificationsBeforeDelete(UUID userId, UUID documentId);
}
