package com.autocare.backend.vehicle.service;

import com.autocare.backend.vehicle.entity.Brand;
import com.autocare.backend.vehicle.entity.Model;
import com.autocare.backend.vehicle.entity.VehicleTemplate;

public interface GeminiVehicleProfileService {

    VehicleTemplate generateAndSaveTemplate(
            Brand brand, 
            Model model, 
            Integer year, 
            String trimConfiguration, 
            String engine, 
            String transmission, 
            String fuelType
    );
}
