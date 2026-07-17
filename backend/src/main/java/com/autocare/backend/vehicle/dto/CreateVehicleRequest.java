package com.autocare.backend.vehicle.dto;

import com.autocare.backend.vehicle.entity.enums.FuelType;
import com.autocare.backend.vehicle.entity.enums.MileageUnit;
import com.autocare.backend.vehicle.entity.enums.Transmission;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateVehicleRequest {

    @NotNull(message = "Brand ID is required")
    private UUID brandId;

    @NotNull(message = "Model ID is required")
    private UUID modelId;

    @NotNull(message = "Year is required")
    @Min(value = 1900, message = "Year must be 1900 or later")
    private Integer year;

    private String trimConfiguration;

    private String engine;

    private Transmission transmission;

    private FuelType fuelType;

    private java.time.LocalDate purchaseDate;

    private String color;

    private String licensePlate;

    @Size(min = 17, max = 17, message = "VIN must be exactly 17 characters if provided")
    private String vin;

    @Min(value = 0, message = "Mileage cannot be negative")
    private Integer currentMileage;

    @Min(value = 0, message = "Mileage at purchase cannot be negative")
    private Integer mileageAtPurchase;

    @NotNull(message = "Mileage unit is required")
    private MileageUnit mileageUnit;

    private boolean isPrimary;

    @NotNull(message = "Purchase condition is required")
    private com.autocare.backend.vehicle.entity.enums.PurchaseCondition purchaseCondition;

    private String nickname;

    private java.util.Map<String, String> initialComponentHealths;
}
