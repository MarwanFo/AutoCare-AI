package com.autocare.backend.notification.dto;

import com.autocare.backend.notification.entity.enums.NotificationSeverity;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class NotificationResponse {
    private UUID id;
    private UUID vehicleId;
    private UUID componentId;
    private String title;
    private String message;
    private NotificationSeverity severity;
    private boolean isRead;
    private Instant createdAt;
}
