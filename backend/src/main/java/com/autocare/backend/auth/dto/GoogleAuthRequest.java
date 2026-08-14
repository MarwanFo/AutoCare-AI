package com.autocare.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleAuthRequest(
    @NotBlank(message = "Google ID Token is required")
    String idToken
) {}
