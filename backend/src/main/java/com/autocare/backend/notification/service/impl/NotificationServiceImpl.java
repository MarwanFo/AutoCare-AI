package com.autocare.backend.notification.service.impl;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.exception.ResourceNotFoundException;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.notification.dto.NotificationResponse;
import com.autocare.backend.notification.entity.Notification;
import com.autocare.backend.notification.entity.enums.NotificationSeverity;
import com.autocare.backend.notification.entity.enums.NotificationType;
import com.autocare.backend.notification.repository.NotificationRepository;
import com.autocare.backend.notification.service.NotificationService;
import com.autocare.backend.vehicle.entity.UserComponent;
import com.autocare.backend.vehicle.entity.UserDocument;
import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.enums.ComponentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final Clock clock;
    private final EntityManager entityManager;

    @Value("${autocare.notifications.document-expiry-warning-days:30}")
    private int documentExpiryWarningDays;

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
            throw new AccessDeniedException("You are not authorized to mark this notification as read.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
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
        notification.setType(NotificationType.COMPONENT_CRITICAL);
        notification.setRead(false);

        log.info("Triggered notification [{}] for user: {}, vehicle: {}, component: {}", severity, userId, vehicle != null ? vehicle.getId() : null, component != null ? component.getId() : null);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void evaluateComponentNotification(UUID userId, UserVehicle vehicle, UserComponent component) {
        if (userId == null || component == null) return;

        ComponentStatus status = component.getStatus();
        NotificationType desiredType = null;
        NotificationSeverity severity = NotificationSeverity.INFO;
        String title = "";
        String message = "";

        String vehicleTitle = resolveVehicleTitle(vehicle);
        String compName = component.getName() != null ? component.getName() : "Component";

        if (status == ComponentStatus.CRITICAL) {
            desiredType = NotificationType.COMPONENT_CRITICAL;
            severity = NotificationSeverity.DANGER;
            title = "Critical maintenance required: " + compName;
            message = String.format("The %s on %s has exceeded its safe lifespan and requires immediate replacement.", compName, vehicleTitle);
        } else if (status == ComponentStatus.WARNING) {
            desiredType = NotificationType.COMPONENT_WARNING;
            severity = NotificationSeverity.WARNING;
            title = "Maintenance approaching: " + compName;
            message = String.format("The %s on %s is approaching its recommended service interval.", compName, vehicleTitle);
        } else if (status == ComponentStatus.UNKNOWN) {
            desiredType = NotificationType.COMPONENT_DATA_REQUIRED;
            severity = NotificationSeverity.INFO;
            title = "Service history missing: " + compName;
            message = String.format("We need past replacement history for the %s on %s to calibrate accurate wear predictions.", compName, vehicleTitle);
        } else {
            desiredType = null;
        }

        Optional<Notification> activeOpt = notificationRepository.findActiveComponentConditionNotification(userId, component.getId());

        if (desiredType == null) {
            if (activeOpt.isPresent()) {
                Notification active = activeOpt.get();
                active.setResolvedAt(Instant.now(clock));
                notificationRepository.saveAndFlush(active);
            }
            return;
        }

        if (activeOpt.isPresent()) {
            Notification active = activeOpt.get();
            if (active.getType() == desiredType) {
                return;
            }
            active.setResolvedAt(Instant.now(clock));
            notificationRepository.saveAndFlush(active);
        }

        notificationRepository.insertActiveComponentNotification(
                UUID.randomUUID(),
                userId,
                vehicle != null ? vehicle.getId() : null,
                component.getId(),
                desiredType.name(),
                severity.name(),
                title,
                message
        );
    }

    @Override
    @Transactional
    public void evaluateDocumentNotification(UUID userId, UserVehicle vehicle, UserDocument document) {
        if (userId == null || document == null) return;

        LocalDate expiryDate = document.getExpiryDate();
        LocalDate today = LocalDate.now(clock);
        LocalDate warningCutoff = today.plusDays(documentExpiryWarningDays);

        NotificationType desiredType = null;
        NotificationSeverity severity = NotificationSeverity.INFO;
        String title = "";
        String message = "";

        String vehicleTitle = resolveVehicleTitle(vehicle);
        String docTitle = document.getTitle() != null ? document.getTitle() : "Document";

        if (expiryDate != null) {
            if (expiryDate.isBefore(today)) {
                desiredType = NotificationType.DOCUMENT_EXPIRED;
                severity = NotificationSeverity.DANGER;
                title = "Vehicle document expired: " + docTitle;
                message = String.format("Your %s on %s passed its recorded expiration date of %s. Please review or renew it.", docTitle, vehicleTitle, expiryDate);
            } else if (!expiryDate.isAfter(warningCutoff)) {
                desiredType = NotificationType.DOCUMENT_EXPIRING;
                severity = NotificationSeverity.WARNING;
                title = "Vehicle document expiring soon: " + docTitle;
                message = String.format("Your %s on %s expires on %s. Please check or renew it before the expiration date.", docTitle, vehicleTitle, expiryDate);
            }
        }

        Optional<Notification> activeOpt = notificationRepository.findActiveDocumentConditionNotification(userId, document.getId());

        if (desiredType == null) {
            if (activeOpt.isPresent()) {
                Notification active = activeOpt.get();
                active.setResolvedAt(Instant.now(clock));
                notificationRepository.saveAndFlush(active);
            }
            return;
        }

        if (activeOpt.isPresent()) {
            Notification active = activeOpt.get();
            if (active.getType() == desiredType) {
                return;
            }
            active.setResolvedAt(Instant.now(clock));
            notificationRepository.saveAndFlush(active);
        }

        notificationRepository.insertActiveDocumentNotification(
                UUID.randomUUID(),
                userId,
                vehicle != null ? vehicle.getId() : null,
                document.getId(),
                desiredType.name(),
                severity.name(),
                title,
                message
        );
    }

    @Override
    @Transactional
    public void resolveDocumentNotificationsBeforeDelete(UUID userId, UUID documentId) {
        if (userId == null || documentId == null) return;
        notificationRepository.resolveActiveDocumentConditionNotifications(userId, documentId, Instant.now(clock));
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setSeverity(notification.getSeverity());
        dto.setVehicleId(notification.getVehicle() != null ? notification.getVehicle().getId() : null);
        dto.setVehicleTitle(resolveVehicleTitle(notification.getVehicle()));
        
        if (notification.getComponent() != null) {
            UserComponent comp = notification.getComponent();
            dto.setComponentId(comp.getId());
            dto.setComponentCode(comp.getName());
            dto.setHealthScore(comp.getHealthScore()); // Derive live fresh value from UserComponent
        }

        if (notification.getDocument() != null) {
            UserDocument doc = notification.getDocument();
            dto.setDocumentId(doc.getId());
            dto.setDocumentTitle(doc.getTitle());
            dto.setExpiryDate(doc.getExpiryDate()); // Derive live fresh value from UserDocument
        }

        dto.setRead(notification.isRead());
        dto.setResolvedAt(notification.getResolvedAt());
        dto.setResolved(notification.getResolvedAt() != null);
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        return dto;
    }

    private String resolveVehicleTitle(UserVehicle vehicle) {
        if (vehicle == null) return "Vehicle";
        if (vehicle.getNickname() != null && !vehicle.getNickname().isBlank()) {
            return vehicle.getNickname();
        }
        if (vehicle.getTemplate() != null) {
            String brandStr = vehicle.getTemplate().getBrand() != null ? vehicle.getTemplate().getBrand().getName() : "";
            String modelStr = vehicle.getTemplate().getModel() != null ? vehicle.getTemplate().getModel().getName() : "";
            return (brandStr + " " + modelStr).trim();
        }
        return "Vehicle";
    }
}
