package com.autocare.backend.vehicle.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateIntervalRequest {

    @NotBlank(message = "Interval title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;

    private String description;

    @Min(value = 1, message = "Interval mileage must be positive")
    private Integer intervalMileage;

    @Min(value = 1, message = "Interval months must be positive")
    private Integer intervalMonths;

    private boolean isInspectionOnly = false;
}
