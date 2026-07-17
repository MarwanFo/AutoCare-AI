package com.autocare.backend.vehicle.service;

import com.autocare.backend.vehicle.dto.CreateVehicleRequest;
import com.autocare.backend.vehicle.dto.UpdateVehicleRequest;
import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.enums.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface VehicleService {

    UserVehicle createVehicle(UUID userId, CreateVehicleRequest request);

    UserVehicle getVehicleById(UUID userId, UUID id);

    Page<UserVehicle> getVehicles(UUID userId, VehicleStatus status, Pageable pageable);

    UserVehicle updateVehicle(UUID userId, UUID id, UpdateVehicleRequest request);

    void archiveVehicle(UUID userId, UUID id);

    UserVehicle setPrimaryVehicle(UUID userId, UUID id);

    void checkDuplicates(String vin, String licensePlate);
}

