package com.autocare.backend.auth.exception;

public class SessionNotFoundException extends ResourceNotFoundException {
    public SessionNotFoundException(String message) {
        super(message);
    }
}
