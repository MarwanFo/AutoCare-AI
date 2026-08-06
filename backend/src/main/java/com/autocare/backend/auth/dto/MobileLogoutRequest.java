package com.autocare.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record MobileLogoutRequest(
        @Schema(description = "Refresh token to revoke on logout", example = "eyJhbGciOiJIUzI1NiJ9...")
        String refreshToken
) {}
