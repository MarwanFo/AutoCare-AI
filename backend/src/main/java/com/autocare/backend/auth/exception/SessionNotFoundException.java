package com.autocare.backend.auth.exception;

public class SessionNotFoundException extends AuthException {
    public SessionNotFoundException(String message) {
        super(message);
    }
}
