package com.autocare.backend.auth.exception;

public class PhoneNumberAlreadyExistsException extends AuthException {
    public PhoneNumberAlreadyExistsException(String message) {
        super(message);
    }
}
