package com.autocare.backend.vehicle.dto;

import com.autocare.backend.vehicle.entity.enums.FuelType;
import com.autocare.backend.vehicle.entity.enums.MileageUnit;
import com.autocare.backend.vehicle.entity.enums.Transmission;
import com.autocare.backend.vehicle.entity.enums.VehicleStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
public class VehicleResponse {

    private UUID id;
    private UUID userId;
    private UUID templateId;
    
    private String brandName;
    private String modelName;
    private Integer year;
    private String trimConfiguration;
    private Map<String, Object> specifications;

    private String licensePlate;
    private String vin;
    private Integer currentMileage;
    private MileageUnit mileageUnit;
    private FuelType fuelType;
    private Transmission transmission;
    private String color;
    private String nickname;
    private com.autocare.backend.vehicle.entity.enums.PurchaseCondition purchaseCondition;
    private boolean isPrimary;
    private VehicleStatus status;
    private Instant lastServiceDate;
    private Integer lastServiceMileage;

    private LocalDate purchaseDate;
    private Integer mileageAtPurchase;
    private Integer completenessScore;
    private Integer estimatedAnnualMileage;
    private String drivingProfile;
    private String climateAssumptions;
    private Map<String, Object> wearProfileMetadata;

    private List<ComponentResponse> components;
    private List<IntervalResponse> intervals;
    private List<DocumentResponse> documents;
    private List<PhotoResponse> photos;

    @Getter
    @Setter
    public static class ComponentResponse {
        private UUID id;
        private String category;
        private String name;
        private String partNumber;
        private String specifications;
        private Integer lastReplacedMileage;
        private LocalDate lastReplacedDate;
        private String notes;
        private boolean isCustom;
        private boolean isModifiedFromTemplate;

        private String status;
        private Integer healthScore;
        private Integer confidenceScore;
        private Integer estimatedRemainingLife;
        private Integer installationMileage;
        private LocalDate installationDate;
        private LocalDate lastInspectionDate;
        private String origin;
        private List<Map<String, Object>> recommendations;
    }

    @Getter
    @Setter
    public static class IntervalResponse {
        private UUID id;
        private String title;
        private String description;
        private Integer intervalMileage;
        private Integer intervalMonths;
        private boolean isInspectionOnly;
        private boolean isModifiedFromTemplate;
    }

    @Getter
    @Setter
    public static class DocumentResponse {
        private UUID id;
        private String title;
        private String url;
        private LocalDate expiryDate;
        private String notes;
    }

    @Getter
    @Setter
    public static class PhotoResponse {
        private UUID id;
        private String url;
        private boolean isMain;
        private Instant uploadedAt;
    }
}

