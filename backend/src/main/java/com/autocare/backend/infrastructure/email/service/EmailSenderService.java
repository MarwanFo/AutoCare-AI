package com.autocare.backend.infrastructure.email.service;

public interface EmailSenderService {
    void sendVerificationEmail(String recipientEmail, String rawToken);
    void sendPasswordResetEmail(String recipientEmail, String rawToken);
}
