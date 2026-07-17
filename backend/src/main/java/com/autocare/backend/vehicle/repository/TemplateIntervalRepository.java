package com.autocare.backend.vehicle.repository;

import com.autocare.backend.vehicle.entity.TemplateInterval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TemplateIntervalRepository extends JpaRepository<TemplateInterval, UUID> {
    List<TemplateInterval> findByTemplateIdOrderByTitleAsc(UUID templateId);
}
