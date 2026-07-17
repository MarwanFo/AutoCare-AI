package com.autocare.backend.vehicle.repository;

import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.enums.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserVehicleRepository extends JpaRepository<UserVehicle, UUID> {

    Page<UserVehicle> findByUserIdAndStatus(UUID userId, VehicleStatus status, Pageable pageable);

    Optional<UserVehicle> findByUserIdAndIsPrimaryTrueAndStatus(UUID userId, VehicleStatus status);

    boolean existsByIdAndUserId(UUID id, UUID userId);

    boolean existsByVinAndStatus(String vin, VehicleStatus status);

    boolean existsByLicensePlateIgnoreCaseAndStatus(String licensePlate, VehicleStatus status);

    @Query("SELECT uv FROM UserVehicle uv " +
           "JOIN FETCH uv.user " +
           "JOIN FETCH uv.template t " +
           "JOIN FETCH t.brand " +
           "JOIN FETCH t.model " +
           "WHERE uv.id = :id")
    Optional<UserVehicle> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT uv FROM UserVehicle uv " +
           "JOIN FETCH uv.template t " +
           "JOIN FETCH t.brand " +
           "JOIN FETCH t.model " +
           "WHERE uv.user.id = :userId AND uv.status = :status")
    List<UserVehicle> findAllByUserIdAndStatusWithTemplate(
            @Param("userId") UUID userId, @Param("status") VehicleStatus status);
}

