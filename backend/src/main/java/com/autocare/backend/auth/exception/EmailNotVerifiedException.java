package com.autocare.backend.auth.exception;

public class EmailNotVerifiedException extends BusinessException {
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
