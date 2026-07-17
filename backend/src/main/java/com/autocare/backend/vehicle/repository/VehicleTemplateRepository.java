package com.autocare.backend.vehicle.repository;

import com.autocare.backend.vehicle.entity.VehicleTemplate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleTemplateRepository extends JpaRepository<VehicleTemplate, UUID> {

    Optional<VehicleTemplate> findByBrandIdAndModelIdAndYearAndTrimConfigurationIgnoreCase(
            UUID brandId, UUID modelId, Integer year, String trimConfiguration);

    Optional<VehicleTemplate> findByBrandIdAndModelIdAndYearAndTrimConfigurationIgnoreCaseAndVersion(
            UUID brandId, UUID modelId, Integer year, String trimConfiguration, Integer version);

    boolean existsByBrandIdAndModelIdAndYearAndTrimConfigurationIgnoreCase(
            UUID brandId, UUID modelId, Integer year, String trimConfiguration);

    @Query("SELECT vt FROM VehicleTemplate vt " +
           "JOIN FETCH vt.brand " +
           "JOIN FETCH vt.model " +
           "WHERE vt.id = :id")
    Optional<VehicleTemplate> findByIdWithBrandAndModel(@Param("id") UUID id);

    @Query("SELECT vt FROM VehicleTemplate vt " +
           "WHERE vt.brand.id = :brandId " +
           "AND vt.model.id = :modelId " +
           "AND vt.year = :year " +
           "AND LOWER(vt.trimConfiguration) = LOWER(:trimConfiguration) " +
           "ORDER BY vt.version DESC")
    List<VehicleTemplate> findLatestTemplateVersion(
            @Param("brandId") UUID brandId,
            @Param("modelId") UUID modelId,
            @Param("year") Integer year,
            @Param("trimConfiguration") String trimConfiguration,
            Pageable pageable
    );
}
