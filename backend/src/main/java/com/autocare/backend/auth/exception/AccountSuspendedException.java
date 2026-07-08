package com.autocare.backend.auth.exception;

public class AccountSuspendedException extends BusinessException {
    public AccountSuspendedException(String message) {
        super(message);
    }
}
