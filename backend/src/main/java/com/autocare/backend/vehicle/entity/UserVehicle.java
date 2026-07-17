package com.autocare.backend.vehicle.entity;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.common.entity.BaseEntity;
import com.autocare.backend.vehicle.entity.enums.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_vehicles")
@Getter
@Setter
@NoArgsConstructor
public class UserVehicle extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Owner user is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Vehicle template association is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private VehicleTemplate template;

    @Size(max = 20, message = "License plate cannot exceed 20 characters")
    @Column(name = "license_plate", length = 20)
    private String licensePlate;

    @Pattern(regexp = "^[A-HJ-NPR-Z0-9]{17}$", message = "VIN must be exactly 17 characters in standard ISO 3779 format")
    @Column(name = "vin", length = 17)
    private String vin;

    @NotNull(message = "Current mileage is required")
    @Min(value = 0, message = "Current mileage cannot be negative")
    @Column(name = "current_mileage", nullable = false)
    private Integer currentMileage = 0;

    @Min(value = 0, message = "Mileage at purchase cannot be negative")
    @Column(name = "mileage_at_purchase")
    private Integer mileageAtPurchase;

    @NotNull(message = "Mileage unit is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "mileage_unit", nullable = false, length = 10)
    private MileageUnit mileageUnit = MileageUnit.KM;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", length = 50)
    private FuelType fuelType;

    @Enumerated(EnumType.STRING)
    @Column(name = "transmission", length = 50)
    private Transmission transmission;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "estimated_annual_mileage")
    private Integer estimatedAnnualMileage;

    @Enumerated(EnumType.STRING)
    @Column(name = "driving_profile", length = 50)
    private DrivingProfile drivingProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "climate_assumptions", length = 50)
    private ClimateAssumption climateAssumptions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "wear_profile_metadata", columnDefinition = "jsonb")
    private Map<String, Object> wearProfileMetadata;

    @Column(name = "completeness_score", nullable = false)
    private Integer completenessScore = 0;

    @Size(max = 50, message = "Color cannot exceed 50 characters")
    @Column(name = "color", length = 50)
    private String color;

    @Size(max = 100, message = "Nickname cannot exceed 100 characters")
    @Column(name = "nickname", length = 100)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_condition", length = 20)
    private PurchaseCondition purchaseCondition = PurchaseCondition.USED;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    @NotNull(message = "Vehicle status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VehicleStatus status = VehicleStatus.ACTIVE;

    @Column(name = "last_service_date")
    private Instant lastServiceDate;

    @Min(value = 0, message = "Last service mileage cannot be negative")
    @Column(name = "last_service_mileage")
    private Integer lastServiceMileage;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @OneToMany(mappedBy = "userVehicle", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<UserComponent> components = new ArrayList<>();

    @OneToMany(mappedBy = "userVehicle", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<UserInterval> intervals = new ArrayList<>();

    @OneToMany(mappedBy = "userVehicle", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<UserDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "userVehicle", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<VehiclePhoto> photos = new ArrayList<>();

    public void addComponent(UserComponent component) {
        components.add(component);
        component.setUserVehicle(this);
    }

    public void removeComponent(UserComponent component) {
        components.remove(component);
        component.setUserVehicle(null);
    }

    public void addInterval(UserInterval interval) {
        intervals.add(interval);
        interval.setUserVehicle(this);
    }

    public void removeInterval(UserInterval interval) {
        intervals.remove(interval);
        interval.setUserVehicle(null);
    }

    public void addDocument(UserDocument document) {
        documents.add(document);
        document.setUserVehicle(this);
    }

    public void removeDocument(UserDocument document) {
        documents.remove(document);
        document.setUserVehicle(null);
    }

    public void addPhoto(VehiclePhoto photo) {
        photos.add(photo);
        photo.setUserVehicle(this);
    }

    public void removePhoto(VehiclePhoto photo) {
        photos.remove(photo);
        photo.setUserVehicle(null);
    }
}
