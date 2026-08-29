package com.autocare.backend.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class AdminUserSummaryResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private String status;
    private boolean profileCompleted;
    private Set<String> roles;
    private long vehicleCount;
    private Instant createdAt;
    private Instant updatedAt;
}
