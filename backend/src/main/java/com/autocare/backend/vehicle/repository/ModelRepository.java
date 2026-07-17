package com.autocare.backend.vehicle.repository;

import com.autocare.backend.vehicle.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModelRepository extends JpaRepository<Model, UUID> {
    List<Model> findByBrandIdOrderByNameAsc(UUID brandId);
    Optional<Model> findByBrandIdAndNameIgnoreCase(UUID brandId, String name);
    boolean existsByBrandIdAndNameIgnoreCase(UUID brandId, String name);
}
