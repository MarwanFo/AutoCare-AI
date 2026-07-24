package com.autocare.backend.infrastructure.storage.exception;

import com.autocare.backend.auth.exception.BusinessException;

public class StorageException extends BusinessException {
    public StorageException(String message) {
        super(message);
    }

    public StorageException(String message, Throwable cause) {
        super(message);
    }
}
