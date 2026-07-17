package com.autocare.backend.vehicle.service;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.VehicleTemplate;
import com.autocare.backend.vehicle.entity.enums.FuelType;
import com.autocare.backend.vehicle.entity.enums.MileageUnit;
import com.autocare.backend.vehicle.entity.enums.Transmission;

public interface VehicleTemplateCloneService {

    UserVehicle cloneTemplateToUser(
            VehicleTemplate template, 
            User user, 
            String licensePlate, 
            String vin, 
            Integer currentMileage, 
            MileageUnit mileageUnit,
            FuelType fuelType, 
            Transmission transmission, 
            String color, 
            boolean isPrimary,
            com.autocare.backend.vehicle.entity.enums.PurchaseCondition purchaseCondition,
            String nickname,
            java.time.LocalDate purchaseDate,
            Integer mileageAtPurchase,
            java.util.Map<String, String> initialComponentHealths
    );
}
