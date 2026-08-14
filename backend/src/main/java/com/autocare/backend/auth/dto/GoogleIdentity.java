package com.autocare.backend.auth.dto;

public record GoogleIdentity(
    String sub,
    String email,
    boolean emailVerified,
    String fullName,
    String avatarUrl,
    String hostedDomain
) {}
