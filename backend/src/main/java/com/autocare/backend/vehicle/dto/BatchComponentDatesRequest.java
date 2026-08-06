package com.autocare.backend.vehicle.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

/**
 * Request DTO for batch-updating component last-changed dates
 * during pre-owned vehicle onboarding.
 * Key = component name (e.g. "Engine Oil"), Value = ISO date string (YYYY-MM-DD).
 */
@Getter
@Setter
public class BatchComponentDatesRequest {

    @NotNull(message = "Component dates map is required")
    private Map<String, String> componentDates;
}
