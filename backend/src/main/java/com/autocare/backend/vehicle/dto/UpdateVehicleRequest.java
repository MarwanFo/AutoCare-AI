package com.autocare.backend.vehicle.dto;

import com.autocare.backend.vehicle.entity.enums.FuelType;
import com.autocare.backend.vehicle.entity.enums.MileageUnit;
import com.autocare.backend.vehicle.entity.enums.Transmission;
import com.autocare.backend.vehicle.entity.enums.VehicleStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UpdateVehicleRequest {

    private String color;

    private String licensePlate;

    @Size(min = 17, max = 17, message = "VIN must be exactly 17 characters if provided")
    private String vin;

    @Min(value = 0, message = "Mileage cannot be negative")
    private Integer currentMileage;

    private MileageUnit mileageUnit;

    private FuelType fuelType;

    private Transmission transmission;

    private Instant lastServiceDate;


    @Min(value = 0, message = "Last service mileage cannot be negative")
    private Integer lastServiceMileage;

    private VehicleStatus status;
}
