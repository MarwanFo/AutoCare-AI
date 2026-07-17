package com.autocare.backend.vehicle.dto;

import com.autocare.backend.vehicle.entity.enums.FuelType;
import com.autocare.backend.vehicle.entity.enums.MileageUnit;
import com.autocare.backend.vehicle.entity.enums.Transmission;
import com.autocare.backend.vehicle.entity.enums.VehicleStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class VehicleSummaryResponse {
    private UUID id;
    private String brandName;
    private String modelName;
    private Integer year;
    private String trimConfiguration;
    private String licensePlate;
    private String vin;
    private Integer currentMileage;
    private MileageUnit mileageUnit;
    private FuelType fuelType;
    private Transmission transmission;
    private String color;
    private String nickname;
    private com.autocare.backend.vehicle.entity.enums.PurchaseCondition purchaseCondition;
    private boolean isPrimary;
    private VehicleStatus status;
    private String mainPhotoUrl;
    private Instant lastServiceDate;
    private Integer lastServiceMileage;

    private java.time.LocalDate purchaseDate;
    private Integer mileageAtPurchase;
    private Integer completenessScore;
    private Integer estimatedAnnualMileage;
    private String drivingProfile;
    private String climateAssumptions;
}
