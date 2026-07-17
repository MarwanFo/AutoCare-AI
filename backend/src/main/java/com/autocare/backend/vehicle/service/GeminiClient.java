package com.autocare.backend.vehicle.service;

import com.autocare.backend.vehicle.dto.GeminiVehicleProfileResponse;

public interface GeminiClient {
    GeminiVehicleProfileResponse fetchProfile(String prompt);
}
