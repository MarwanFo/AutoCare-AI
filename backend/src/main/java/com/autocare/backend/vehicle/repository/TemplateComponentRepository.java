package com.autocare.backend.vehicle.repository;

import com.autocare.backend.vehicle.entity.TemplateComponent;
import com.autocare.backend.vehicle.entity.enums.ComponentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TemplateComponentRepository extends JpaRepository<TemplateComponent, UUID> {
    List<TemplateComponent> findByTemplateIdOrderByCategoryAscNameAsc(UUID templateId);
    List<TemplateComponent> findByTemplateIdAndCategory(UUID templateId, ComponentCategory category);
}
