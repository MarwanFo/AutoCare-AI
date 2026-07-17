package com.autocare.backend.vehicle.entity;

import com.autocare.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "template_intervals")
@Getter
@Setter
@NoArgsConstructor
public class TemplateInterval extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Template association is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private VehicleTemplate template;

    @NotBlank(message = "Interval title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Min(value = 1, message = "Interval mileage must be positive")
    @Column(name = "interval_mileage")
    private Integer intervalMileage;

    @Min(value = 1, message = "Interval months must be positive")
    @Column(name = "interval_months")
    private Integer intervalMonths;

    @Column(name = "is_inspection_only", nullable = false)
    private boolean isInspectionOnly = false;
}
