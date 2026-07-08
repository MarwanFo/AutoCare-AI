package com.autocare.backend.auth.service;

import com.autocare.backend.auth.dto.SessionResponse;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.entity.UserSession;
import java.util.List;
import java.util.UUID;

public interface SessionService {
    UserSession createSession(User user, UUID deviceId, String ipAddress, String userAgent, String refreshToken, boolean rememberMe);
    List<SessionResponse> getActiveSessions(User user, UUID currentSessionId);
    void revokeSession(UUID sessionId, User user);
    void revokeAllOtherSessions(User user, UUID currentSessionId);
}
