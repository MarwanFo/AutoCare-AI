package com.autocare.backend.auth.exception;

public class TokenInvalidException extends AuthException {
    public TokenInvalidException(String message) {
        super(message);
    }
}
