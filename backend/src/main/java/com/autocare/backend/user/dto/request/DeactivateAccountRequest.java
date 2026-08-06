package com.autocare.backend.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record DeactivateAccountRequest(
    @NotBlank(message = "Confirmation password is required")
    String confirmationPassword
) {}
