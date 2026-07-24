package com.autocare.backend.user.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UpdatePreferencesRequest(
    @NotNull(message = "Preferred language is required")
    @Pattern(
        regexp = "(?i)^(EN|FR|AR)$",
        message = "Preferred language must be one of: EN, FR, AR"
    )
    String preferredLanguage,

    @NotNull(message = "Preferred currency is required")
    @Pattern(
        regexp = "(?i)^(USD|EUR|MAD|GBP)$",
        message = "Preferred currency must be one of: USD, EUR, MAD, GBP"
    )
    String preferredCurrency,

    @NotNull(message = "Preferred distance unit is required")
    @Pattern(
        regexp = "(?i)^(KM|MILES)$",
        message = "Preferred distance unit must be one of: KM, MILES"
    )
    String preferredDistanceUnit,

    @NotNull(message = "Push notifications preference flag is required")
    Boolean pushNotificationsEnabled,

    @NotNull(message = "Email notifications preference flag is required")
    Boolean emailNotificationsEnabled
) {}
