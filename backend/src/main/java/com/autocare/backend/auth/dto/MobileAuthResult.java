package com.autocare.backend.auth.dto;

public record MobileAuthResult(
    boolean verificationRequired,
    String email,
    MobileAuthResponse authResponse
) {}
