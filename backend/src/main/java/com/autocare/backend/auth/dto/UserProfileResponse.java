package com.autocare.backend.auth.dto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    String email,
    String fullName,
    String phoneNumber,
    Set<String> roles,
    Set<String> permissions,
    String status,
    Instant createdAt
) {}
