package com.autocare.backend.auth.entity;

public enum AuditEventType {
    USER_REGISTERED,
    EMAIL_VERIFIED,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    PASSWORD_RESET_REQUESTED,
    PASSWORD_RESET_COMPLETED,
    SESSION_REVOKED
}
