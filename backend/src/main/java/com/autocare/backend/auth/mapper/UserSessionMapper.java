package com.autocare.backend.auth.mapper;

import com.autocare.backend.auth.dto.SessionResponse;
import com.autocare.backend.auth.entity.UserSession;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class UserSessionMapper {

    public SessionResponse toResponse(UserSession session, UUID currentSessionId) {
        if (session == null) {
            return null;
        }

        boolean isCurrent = session.getId() != null && session.getId().equals(currentSessionId);

        return new SessionResponse(
                session.getId(),
                session.getDeviceId(),
                session.getIpAddress(),
                session.getUserAgent(),
                session.getLastAccessedAt(),
                isCurrent
        );
    }

    public List<SessionResponse> toResponseList(List<UserSession> sessions, UUID currentSessionId) {
        if (sessions == null) {
            return null;
        }

        return sessions.stream()
                .map(session -> toResponse(session, currentSessionId))
                .toList();
    }
}
