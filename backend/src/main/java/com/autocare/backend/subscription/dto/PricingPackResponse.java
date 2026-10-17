package com.autocare.backend.subscription.dto;

import com.autocare.backend.subscription.entity.BillingPeriod;
import com.autocare.backend.subscription.entity.PackType;
import com.autocare.backend.subscription.entity.PricingPack;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record PricingPackResponse(
        UUID id,
        String code,
        String name,
        String description,
        PackType packType,
        BigDecimal price,
        String currency,
        BillingPeriod billingPeriod,
        Integer vehicleLimit,
        Integer aiCredits,
        String features,
        String badge,
        Boolean isActive,
        Integer displayOrder,
        Instant createdAt,
        Instant lastModifiedAt
) {
    public static PricingPackResponse fromEntity(PricingPack entity) {
        if (entity == null) return null;
        return PricingPackResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .packType(entity.getPackType())
                .price(entity.getPrice())
                .currency(entity.getCurrency())
                .billingPeriod(entity.getBillingPeriod())
                .vehicleLimit(entity.getVehicleLimit())
                .aiCredits(entity.getAiCredits())
                .features(entity.getFeatures())
                .badge(entity.getBadge())
                .isActive(entity.getIsActive())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .lastModifiedAt(entity.getLastModifiedAt())
                .build();
    }
}
