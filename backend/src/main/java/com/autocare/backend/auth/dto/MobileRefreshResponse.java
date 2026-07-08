package com.autocare.backend.auth.dto;

public record MobileRefreshResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresIn
) {}
