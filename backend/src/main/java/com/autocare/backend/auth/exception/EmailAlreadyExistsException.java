package com.autocare.backend.auth.exception;

public class EmailAlreadyExistsException extends AuthException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
