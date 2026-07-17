package com.autocare.backend.vehicle.entity;

import com.autocare.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(
    name = "vehicle_templates",
    uniqueConstraints = @UniqueConstraint(name = "uq_brand_model_year_trim", columnNames = {"brand_id", "model_id", "year", "trim_configuration"})
)
@Getter
@Setter
@NoArgsConstructor
public class VehicleTemplate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Brand is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @NotNull(message = "Model is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;

    @NotNull(message = "Year is required")
    @Min(value = 1900, message = "Year must be 1900 or later")
    @Column(name = "year", nullable = false)
    private Integer year;

    @NotBlank(message = "Trim/Configuration is required")
    @Column(name = "trim_configuration", nullable = false, length = 100)
    private String trimConfiguration = "Standard";

    @NotNull(message = "Specifications are required")
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "specifications", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> specifications;

    @NotNull(message = "Template version is required")
    @Min(value = 1, message = "Version must be at least 1")
    @Column(name = "version", nullable = false)
    private Integer version = 1;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TemplateComponent> components = new ArrayList<>();

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TemplateInterval> intervals = new ArrayList<>();

    public void addComponent(TemplateComponent component) {
        components.add(component);
        component.setTemplate(this);
    }

    public void removeComponent(TemplateComponent component) {
        components.remove(component);
        component.setTemplate(null);
    }

    public void addInterval(TemplateInterval interval) {
        intervals.add(interval);
        interval.setTemplate(this);
    }

    public void removeInterval(TemplateInterval interval) {
        intervals.remove(interval);
        interval.setTemplate(null);
    }
}
