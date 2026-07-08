package com.autocare.backend.auth.dto;

import java.util.Set;
import java.util.UUID;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    AuthUserResponse user
) {
    public record AuthUserResponse(
        UUID id,
        String email,
        String fullName,
        Set<String> roles,
        Set<String> permissions,
        boolean isEmailVerified,
        boolean isProfileCompleted
    ) {}
}
