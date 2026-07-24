package com.autocare.backend.auth.dto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    String email,
    String fullName,
    String phoneNumber,
    String avatarUrl,
    String preferredLanguage,
    String preferredCurrency,
    String preferredDistanceUnit,
    boolean pushNotificationsEnabled,
    boolean emailNotificationsEnabled,
    boolean isProfileCompleted,
    Set<String> roles,
    Set<String> permissions,
    String status,
    Instant createdAt
) {}
