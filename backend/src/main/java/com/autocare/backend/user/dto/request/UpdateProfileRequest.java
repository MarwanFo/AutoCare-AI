package com.autocare.backend.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(
        regexp = "^[a-zA-Z\\s\\-\\'\\.\\u00C0-\\u017F]{2,100}$",
        message = "Full name contains invalid characters"
    )
    String fullName,

    @Pattern(
        regexp = "^$|^\\+[1-9]\\d{1,14}$",
        message = "Phone number must be in valid E.164 international format (e.g. +12025550143)"
    )
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    String phoneNumber
) {}
