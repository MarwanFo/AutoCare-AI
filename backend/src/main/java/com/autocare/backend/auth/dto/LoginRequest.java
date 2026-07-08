package com.autocare.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record LoginRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    String email,

    @NotBlank(message = "Password is required")
    String password,

    @NotNull(message = "rememberMe is required")
    Boolean rememberMe,

    @NotNull(message = "deviceId is required")
    UUID deviceId
) {}
