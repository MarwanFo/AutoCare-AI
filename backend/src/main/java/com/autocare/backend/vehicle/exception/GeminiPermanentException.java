package com.autocare.backend.vehicle.exception;

public class GeminiPermanentException extends GeminiException {
    public GeminiPermanentException(String message) {
        super(message);
    }

    public GeminiPermanentException(String message, Throwable cause) {
        super(message, cause);
    }
}
