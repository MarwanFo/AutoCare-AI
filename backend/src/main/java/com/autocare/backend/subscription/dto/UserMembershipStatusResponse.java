package com.autocare.backend.subscription.dto;

import lombok.Builder;

import java.time.Instant;

@Builder
public record UserMembershipStatusResponse(
        PricingPackResponse currentPack,
        int aiCredits,
        long vehiclesCount,
        int vehicleLimit,
        String status,
        Instant startedAt,
        Instant expiresAt,
        boolean autoRenew
) {}
