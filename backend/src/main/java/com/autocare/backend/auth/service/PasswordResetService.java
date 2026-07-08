package com.autocare.backend.auth.service;

import com.autocare.backend.auth.dto.ChangePasswordRequest;
import com.autocare.backend.auth.dto.ForgotPasswordRequest;
import com.autocare.backend.auth.dto.ResetPasswordRequest;
import com.autocare.backend.auth.entity.User;

public interface PasswordResetService {
    void initiateForgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(User user, ChangePasswordRequest request);
}
