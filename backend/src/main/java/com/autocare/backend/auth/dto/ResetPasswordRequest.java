package com.autocare.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "Token is required")
    @Size(min = 32, message = "Verification token must be at least 32 characters long")
    String token,

    @NotBlank(message = "New password is required")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
        message = "New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character"
    )
    String newPassword
) {}
