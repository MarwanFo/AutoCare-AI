package com.autocare.backend.auth.dto;

public record MobileAuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresIn,
    AuthResponse.AuthUserResponse user
) {}
