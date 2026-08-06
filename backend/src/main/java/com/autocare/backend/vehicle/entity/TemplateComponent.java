package com.autocare.backend.vehicle.entity;

import com.autocare.backend.common.entity.BaseEntity;
import com.autocare.backend.vehicle.entity.enums.ComponentCategory;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "template_components")
@Getter
@Setter
@NoArgsConstructor
public class TemplateComponent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Template association is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private VehicleTemplate template;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private ComponentCategory category;

    @NotBlank(message = "Component name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Size(max = 100, message = "Part number cannot exceed 100 characters")
    @Column(name = "standard_part_number", length = 100)
    private String standardPartNumber;

    @Column(name = "standard_specifications", columnDefinition = "text")
    private String standardSpecifications;

    @Column(name = "expected_lifespan_mileage")
    private Integer expectedLifespanMileage;

    @Column(name = "expected_lifespan_months")
    private Integer expectedLifespanMonths;
}
