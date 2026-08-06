package com.autocare.backend.notification.service.impl;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.exception.ResourceNotFoundException;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.notification.dto.NotificationResponse;
import com.autocare.backend.notification.entity.Notification;
import com.autocare.backend.notification.entity.enums.NotificationSeverity;
import com.autocare.backend.notification.repository.NotificationRepository;
import com.autocare.backend.notification.service.NotificationService;
import com.autocare.backend.vehicle.entity.UserComponent;
import com.autocare.backend.vehicle.entity.UserVehicle;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this notification.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public Notification createNotification(UUID userId, UserVehicle vehicle, UserComponent component, String title, String message, NotificationSeverity severity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setVehicle(vehicle);
        notification.setComponent(component);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setSeverity(severity);
        notification.setRead(false);

        log.info("Triggered notification [{}] for user: {}, vehicle: {}, component: {}", severity, userId, vehicle != null ? vehicle.getId() : null, component != null ? component.getId() : null);
        return notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(notification.getId());
        dto.setVehicleId(notification.getVehicle() != null ? notification.getVehicle().getId() : null);
        dto.setComponentId(notification.getComponent() != null ? notification.getComponent().getId() : null);
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setSeverity(notification.getSeverity());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
