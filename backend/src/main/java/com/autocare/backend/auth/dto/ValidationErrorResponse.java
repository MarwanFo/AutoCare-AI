package com.autocare.backend.auth.dto;

import java.time.Instant;
import java.util.Map;

public record ValidationErrorResponse(
    long timestamp,
    int status,
    String error,
    String message,
    String path,
    Map<String, String> errors
) {
    public ValidationErrorResponse(int status, String error, String message, String path, Map<String, String> errors) {
        this(Instant.now().toEpochMilli(), status, error, message, path, errors);
    }
}
