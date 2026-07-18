package com.autocare.backend.vehicle.service;

import com.autocare.backend.vehicle.dto.CreateVehicleRequest;
import com.autocare.backend.vehicle.dto.UpdateVehicleRequest;
import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.enums.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;
import com.autocare.backend.vehicle.dto.CreateComponentRequest;
import com.autocare.backend.vehicle.dto.UpdateComponentRequest;
import com.autocare.backend.vehicle.dto.CreateDocumentRequest;
import com.autocare.backend.vehicle.dto.UpdateDocumentRequest;

public interface VehicleService {

    UserVehicle createVehicle(UUID userId, CreateVehicleRequest request);

    UserVehicle getVehicleById(UUID userId, UUID id);

    Page<UserVehicle> getVehicles(UUID userId, VehicleStatus status, Pageable pageable);

    UserVehicle updateVehicle(UUID userId, UUID id, UpdateVehicleRequest request);

    void archiveVehicle(UUID userId, UUID id);

    UserVehicle setPrimaryVehicle(UUID userId, UUID id);

    void checkDuplicates(String vin, String licensePlate);

    com.autocare.backend.vehicle.entity.UserComponent addComponent(UUID userId, java.util.UUID vehicleId, CreateComponentRequest request);

    com.autocare.backend.vehicle.entity.UserComponent updateComponent(UUID userId, java.util.UUID vehicleId, java.util.UUID componentId, UpdateComponentRequest request);

    void deleteComponent(UUID userId, java.util.UUID vehicleId, java.util.UUID componentId);

    com.autocare.backend.vehicle.entity.UserDocument addDocument(UUID userId, java.util.UUID vehicleId, CreateDocumentRequest request);

    com.autocare.backend.vehicle.entity.UserDocument updateDocument(UUID userId, java.util.UUID vehicleId, java.util.UUID documentId, UpdateDocumentRequest request);

    void deleteDocument(UUID userId, java.util.UUID vehicleId, java.util.UUID documentId);
}

