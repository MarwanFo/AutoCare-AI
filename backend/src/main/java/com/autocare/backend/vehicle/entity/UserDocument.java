package com.autocare.backend.vehicle.entity;

import com.autocare.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_documents")
@Getter
@Setter
@NoArgsConstructor
public class UserDocument extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Vehicle association is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_vehicle_id", nullable = false)
    private UserVehicle userVehicle;

    @NotBlank(message = "Document title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @NotBlank(message = "Document url is required")
    @Size(max = 255, message = "URL cannot exceed 255 characters")
    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;
}
