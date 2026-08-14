package com.autocare.backend.auth.service;

import com.autocare.backend.auth.dto.*;
import com.autocare.backend.auth.entity.User;

public interface AuthenticationService {
    User register(RegisterRequest request);
    TokenResult login(LoginRequest request, String ipAddress, String userAgent);
    void logout(String accessToken);
    TokenResult refresh(String refreshToken, String ipAddress, String userAgent);
    MobileAuthResult loginWithGoogle(GoogleAuthRequest request, String ipAddress, String userAgent);

    record TokenResult(AuthResponse authResponse, String refreshToken) {}
}
