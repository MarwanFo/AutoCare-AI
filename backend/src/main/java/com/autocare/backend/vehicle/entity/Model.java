package com.autocare.backend.vehicle.entity;

import com.autocare.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
    name = "models",
    uniqueConstraints = @UniqueConstraint(name = "uq_brand_model_name", columnNames = {"brand_id", "name"})
)
@Getter
@Setter
@NoArgsConstructor
public class Model extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @NotBlank(message = "Model name is required")
    @Size(min = 1, max = 100, message = "Model name must be between 1 and 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;
}
