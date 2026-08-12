package com.autocare.backend.vehicle.repository;

import com.autocare.backend.vehicle.entity.UserComponent;
import com.autocare.backend.vehicle.entity.enums.ComponentCategory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserComponentRepository extends JpaRepository<UserComponent, UUID> {
    List<UserComponent> findByUserVehicleIdOrderByCategoryAscNameAsc(UUID userVehicleId);
    List<UserComponent> findByUserVehicleIdAndCategory(UUID userVehicleId, ComponentCategory category);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM UserComponent c WHERE c.id = :id")
    Optional<UserComponent> findByIdForUpdate(@Param("id") UUID id);
}
