package com.autocare.backend.auth.exception;

import org.springframework.http.HttpStatus;

public class GoogleAuthenticationException extends AuthException {

    private final HttpStatus status;
    private final String errorCode;

    public GoogleAuthenticationException(String message) {
        super(message);
        this.status = HttpStatus.UNAUTHORIZED;
        this.errorCode = "GOOGLE_AUTHENTICATION_FAILED";
    }

    public GoogleAuthenticationException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
