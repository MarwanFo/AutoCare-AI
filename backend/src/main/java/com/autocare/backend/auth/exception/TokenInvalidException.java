package com.autocare.backend.auth.exception;

public class TokenInvalidException extends InvalidTokenException {
    public TokenInvalidException(String message) {
        super(message);
    }
}
