package com.autocare.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record MobileRefreshRequest(
    @NotBlank(message = "Refresh token is required")
    String refreshToken
) {}
