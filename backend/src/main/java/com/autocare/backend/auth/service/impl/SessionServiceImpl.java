package com.autocare.backend.auth.service.impl;

import com.autocare.backend.auth.dto.SessionResponse;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.entity.UserSession;
import com.autocare.backend.auth.exception.SessionNotFoundException;
import com.autocare.backend.auth.mapper.UserSessionMapper;
import com.autocare.backend.auth.repository.UserSessionRepository;
import com.autocare.backend.auth.service.RefreshTokenService;
import com.autocare.backend.auth.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionServiceImpl implements SessionService {

    private final UserSessionRepository userSessionRepository;
    private final UserSessionMapper userSessionMapper;
    private final RefreshTokenService refreshTokenService;

    @Override
    public UserSession createSession(User user, UUID deviceId, String ipAddress, String userAgent, String refreshToken, boolean rememberMe) {
        String tokenHash = refreshTokenService.hashToken(refreshToken);
        Instant expiresAt = Instant.now().plus(rememberMe ? Duration.ofDays(30) : Duration.ofDays(7));

        Optional<UserSession> existingOpt = userSessionRepository.findByUserAndDeviceId(user, deviceId);
        UserSession session;

        if (existingOpt.isPresent()) {
            session = existingOpt.get();
            session.setTokenHash(tokenHash);
            session.setIpAddress(ipAddress);
            session.setUserAgent(userAgent);
            session.setExpiresAt(expiresAt);
            session.setLastAccessedAt(Instant.now());
            session.setRevokedAt(null);
        } else {
            session = new UserSession();
            session.setUser(user);
            session.setDeviceId(deviceId);
            session.setTokenHash(tokenHash);
            session.setIpAddress(ipAddress);
            session.setUserAgent(userAgent);
            session.setExpiresAt(expiresAt);
            session.setLastAccessedAt(Instant.now());
            session = userSessionRepository.save(session);
        }

        return session;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessions(User user, UUID currentSessionId) {
        List<UserSession> activeSessions = userSessionRepository.findAllByUserAndRevokedAtIsNull(user);
        
        // Filter out expired sessions in-memory if not already handled by DB cleanup
        Instant now = Instant.now();
        List<UserSession> validSessions = activeSessions.stream()
                .filter(session -> session.getExpiresAt().isAfter(now))
                .toList();

        return userSessionMapper.toResponseList(validSessions, currentSessionId);
    }

    @Override
    public void revokeSession(UUID sessionId, User user) {
        UserSession session = userSessionRepository.findByIdAndUser(sessionId, user)
                .orElseThrow(() -> new SessionNotFoundException("Session with ID " + sessionId + " not found"));
        session.setRevokedAt(Instant.now());
    }

    @Override
    public void revokeAllOtherSessions(User user, UUID currentSessionId) {
        List<UserSession> activeSessions = userSessionRepository.findAllByUserAndRevokedAtIsNull(user);
        Instant now = Instant.now();
        for (UserSession session : activeSessions) {
            if (!session.getId().equals(currentSessionId)) {
                session.setRevokedAt(now);
            }
        }
    }
}
