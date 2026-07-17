package com.autocare.backend.auth.service;


public interface RefreshTokenService {
    String generateRefreshToken();
    String hashToken(String token);
}
