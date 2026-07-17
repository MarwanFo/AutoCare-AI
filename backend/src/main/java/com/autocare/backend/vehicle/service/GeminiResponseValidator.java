package com.autocare.backend.vehicle.service;

import com.autocare.backend.vehicle.dto.GeminiVehicleProfileResponse;

public interface GeminiResponseValidator {
    boolean isValid(GeminiVehicleProfileResponse response);
}
