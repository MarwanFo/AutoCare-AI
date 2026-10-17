package com.autocare.backend.subscription.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record GrantCreditsRequest(
        @NotNull(message = "Credits adjustment amount is required")
        Integer credits,

        String reason
) {}
