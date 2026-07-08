package com.autocare.backend.auth.service;

import com.autocare.backend.auth.entity.User;
import java.time.Instant;
import java.util.UUID;

public interface RefreshTokenService {
    String generateRefreshToken();
    String hashToken(String token);
}
