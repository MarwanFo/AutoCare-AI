package com.autocare.backend.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pricing_packs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingPack {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "pack_type", nullable = false, length = 30)
    private PackType packType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "MAD";

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_period", length = 30)
    private BillingPeriod billingPeriod;

    @Column(name = "vehicle_limit", nullable = false)
    @Builder.Default
    private Integer vehicleLimit = 1;

    @Column(name = "ai_credits", nullable = false)
    @Builder.Default
    private Integer aiCredits = 0;

    @Column(columnDefinition = "TEXT")
    private String features; // JSON array or formatted list of strings

    @Column(length = 50)
    private String badge;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "last_modified_at")
    private Instant lastModifiedAt;
}
