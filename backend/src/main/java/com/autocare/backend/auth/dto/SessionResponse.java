package com.autocare.backend.auth.dto;

import java.time.Instant;
import java.util.UUID;

public record SessionResponse(
    UUID sessionId,
    UUID deviceId,
    String ipAddress,
    String userAgent,
    Instant lastAccessedAt,
    boolean isCurrent
) {}
