package com.autocare.backend.vehicle.service;

import com.autocare.backend.vehicle.entity.UserVehicle;

public interface ComponentDegradationService {
    /**
     * Recalculates piece-specific health scores, remaining mileage, and remaining days
     * for all components of the given vehicle, and triggers DANGER notifications if critical.
     */
    void updateVehicleComponentDegradation(UserVehicle vehicle);
}
