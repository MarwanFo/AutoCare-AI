package com.autocare.backend.vehicle.repository;

import com.autocare.backend.vehicle.entity.UserComponent;
import com.autocare.backend.vehicle.entity.enums.ComponentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserComponentRepository extends JpaRepository<UserComponent, UUID> {
    List<UserComponent> findByUserVehicleIdOrderByCategoryAscNameAsc(UUID userVehicleId);
    List<UserComponent> findByUserVehicleIdAndCategory(UUID userVehicleId, ComponentCategory category);
}
