package com.autocare.backend.vehicle.repository;

import com.autocare.backend.vehicle.entity.VehiclePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehiclePhotoRepository extends JpaRepository<VehiclePhoto, UUID> {
    List<VehiclePhoto> findByUserVehicleIdOrderByUploadedAtDesc(UUID userVehicleId);
    Optional<VehiclePhoto> findByUserVehicleIdAndIsMainTrue(UUID userVehicleId);
}
