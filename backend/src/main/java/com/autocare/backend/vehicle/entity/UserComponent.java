package com.autocare.backend.vehicle.entity;

import com.autocare.backend.common.entity.BaseEntity;
import com.autocare.backend.vehicle.entity.enums.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "user_components")
@Getter
@Setter
@NoArgsConstructor
public class UserComponent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Vehicle association is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_vehicle_id", nullable = false)
    private UserVehicle userVehicle;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private ComponentCategory category;

    @NotBlank(message = "Component name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Size(max = 100, message = "Part number cannot exceed 100 characters")
    @Column(name = "part_number", length = 100)
    private String partNumber;

    @Column(name = "specifications", columnDefinition = "text")
    private String specifications;

    @Min(value = 0, message = "Last replaced mileage cannot be negative")
    @Column(name = "last_replaced_mileage")
    private Integer lastReplacedMileage;

    @Column(name = "last_replaced_date")
    private LocalDate lastReplacedDate;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "is_custom", nullable = false)
    private boolean isCustom = false;

    @Column(name = "is_modified_from_template", nullable = false)
    private boolean isModifiedFromTemplate = false;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ComponentStatus status = ComponentStatus.NEEDS_VERIFICATION;

    @Column(name = "health_score")
    private Integer healthScore;

    @NotNull
    @Column(name = "confidence_score", nullable = false)
    private Integer confidenceScore = 50;

    @Column(name = "estimated_remaining_life")
    private Integer estimatedRemainingLife;

    @Column(name = "installation_mileage")
    private Integer installationMileage;

    @Column(name = "installation_date")
    private LocalDate installationDate;

    @Column(name = "last_inspection_date")
    private LocalDate lastInspectionDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "origin", nullable = false, length = 50)
    private DataOrigin origin = DataOrigin.AI_GENERATED;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendations", columnDefinition = "jsonb")
    private List<Map<String, Object>> recommendations;
}
