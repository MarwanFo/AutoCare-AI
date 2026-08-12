package com.autocare.backend.notification.entity;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.common.entity.BaseEntity;
import com.autocare.backend.notification.entity.enums.NotificationSeverity;
import com.autocare.backend.notification.entity.enums.NotificationType;
import com.autocare.backend.vehicle.entity.UserComponent;
import com.autocare.backend.vehicle.entity.UserDocument;
import com.autocare.backend.vehicle.entity.UserVehicle;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_vehicle_id")
    private UserVehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_component_id")
    private UserComponent component;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_document_id")
    private UserDocument document;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", length = 50)
    private NotificationType type;

    @NotBlank
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank
    @Column(name = "message", nullable = false, columnDefinition = "text")
    private String message;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private NotificationSeverity severity = NotificationSeverity.INFO;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
