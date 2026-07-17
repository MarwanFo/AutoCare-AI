package com.autocare.backend.vehicle.exception;

public class GeminiTransientException extends GeminiException {
    public GeminiTransientException(String message) {
        super(message);
    }

    public GeminiTransientException(String message, Throwable cause) {
        super(message, cause);
    }
}
