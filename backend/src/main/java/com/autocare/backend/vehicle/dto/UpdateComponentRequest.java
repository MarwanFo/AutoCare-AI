package com.autocare.backend.vehicle.dto;

import com.autocare.backend.vehicle.entity.enums.ComponentCategory;
import com.autocare.backend.vehicle.entity.enums.ComponentStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateComponentRequest {

    @NotNull(message = "Category is required")
    private ComponentCategory category;

    @NotBlank(message = "Component name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @Size(max = 100, message = "Part number cannot exceed 100 characters")
    private String partNumber;

    private String specifications;

    @Min(value = 0, message = "Last replaced mileage cannot be negative")
    private Integer lastReplacedMileage;

    private LocalDate lastReplacedDate;

    private String notes;

    private ComponentStatus status;

    private Integer healthScore;

    private Integer confidenceScore;

    private Integer estimatedRemainingLife;

    private Integer installationMileage;

    private LocalDate installationDate;

    private LocalDate lastInspectionDate;
}
