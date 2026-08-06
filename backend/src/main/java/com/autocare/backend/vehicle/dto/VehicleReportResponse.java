package com.autocare.backend.vehicle.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class VehicleReportResponse {
    private UUID vehicleId;
    private String vehicleTitle;
    private String nickname;
    private String vin;
    private String licensePlate;
    private Integer currentMileage;
    private String mileageUnit;
    private String fuelType;
    private String transmission;
    private Integer completenessScore;
    private Integer overallHealthScore;
    private String generatedAt;

    private List<ComponentReportItem> components;
    private List<String> criticalWarnings;

    @Getter
    @Setter
    @Builder
    public static class ComponentReportItem {
        private String name;
        private String category;
        private Integer healthScore;
        private String status;
        private Integer remainingMileage;
        private Integer remainingDays;
        private String lastReplacedDate;
    }
}
