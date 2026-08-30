package com.autocare.backend.vehicle.service;

import com.autocare.backend.vehicle.dto.GeminiVehicleProfileResponse;
import com.autocare.backend.vehicle.dto.VehicleBudgetForecastResponse;

public interface GeminiClient {
    GeminiVehicleProfileResponse fetchProfile(String prompt);
    String askAdvisor(String prompt);
    VehicleBudgetForecastResponse generateBudgetForecast(String prompt);
}
