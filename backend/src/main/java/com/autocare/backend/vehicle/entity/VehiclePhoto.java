package com.autocare.backend.vehicle.entity;

import com.autocare.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "vehicle_photos")
@Getter
@Setter
@NoArgsConstructor
public class VehiclePhoto extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Vehicle association is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_vehicle_id", nullable = false)
    private UserVehicle userVehicle;

    @NotBlank(message = "Photo URL is required")
    @Size(max = 255, message = "URL cannot exceed 255 characters")
    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "is_main", nullable = false)
    private boolean isMain = false;

    @NotNull(message = "Upload date is required")
    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt = Instant.now();
}
