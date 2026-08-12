package com.autocare.backend.notification.dto;

import com.autocare.backend.notification.entity.enums.NotificationSeverity;
import com.autocare.backend.notification.entity.enums.NotificationType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class NotificationResponse {
    private UUID id;
    private NotificationType type;
    private NotificationSeverity severity;
    private UUID vehicleId;
    private String vehicleTitle;
    private UUID componentId;
    private String componentCode;
    private Integer healthScore;
    private UUID documentId;
    private String documentTitle;
    private LocalDate expiryDate;
    private boolean isRead;
    private Instant resolvedAt;
    private boolean isResolved;
    private Instant createdAt;
    private String title;
    private String message;
}
