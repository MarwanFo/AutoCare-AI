package com.autocare.backend.auth.service;

import com.autocare.backend.auth.entity.User;

public interface EmailVerificationService {
    void sendVerificationEmail(User user);
    void verifyEmail(String token);
}
