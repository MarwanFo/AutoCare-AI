package com.autocare.backend.auth.service;

import com.autocare.backend.auth.entity.User;
import java.util.UUID;

public interface JwtService {
    String generateAccessToken(User user, UUID sessionId);
    String getEmailFromToken(String token);
    boolean validateAccessToken(String token);
    UUID getSessionIdFromToken(String token);
}
