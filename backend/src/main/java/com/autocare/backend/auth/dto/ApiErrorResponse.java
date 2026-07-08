package com.autocare.backend.auth.dto;

import java.time.Instant;

public record ApiErrorResponse(
    long timestamp,
    int status,
    String error,
    String message,
    String path
) {
    public ApiErrorResponse(int status, String error, String message, String path) {
        this(Instant.now().toEpochMilli(), status, error, message, path);
    }
}
