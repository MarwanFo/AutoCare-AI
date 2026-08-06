package com.autocare.backend.vehicle.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class GeminiVehicleProfileResponse {
    private String transmission;
    private String fuelType;
    private Map<String, Object> specifications;
    private List<ComponentDto> components;
    private List<IntervalDto> intervals;
    private List<DocumentDto> documents;

    @Getter
    @Setter
    @ToString
    public static class DocumentDto {
        private String title;
        private String notes;
        private String fileUrl;
    }

    @Getter
    @Setter
    @ToString
    public static class ComponentDto {
        private String category;
        private String name;
        private String standardPartNumber;
        private String standardSpecifications;
        private Integer expectedLifespanMileage;
        private Integer expectedLifespanMonths;
    }

    @Getter
    @Setter
    @ToString
    public static class IntervalDto {
        private String title;
        private String description;
        private Integer intervalMileage;
        private Integer intervalMonths;
        private boolean isInspectionOnly;
    }
}
