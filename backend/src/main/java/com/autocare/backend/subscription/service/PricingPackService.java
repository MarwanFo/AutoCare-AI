package com.autocare.backend.subscription.service;

import com.autocare.backend.subscription.dto.PricingPackRequest;
import com.autocare.backend.subscription.dto.PricingPackResponse;
import com.autocare.backend.subscription.entity.PackType;

import java.util.List;
import java.util.UUID;

public interface PricingPackService {

    List<PricingPackResponse> getAllPacks(PackType packType, Boolean activeOnly);

    List<PricingPackResponse> getActivePublicPacks();

    PricingPackResponse getPackById(UUID id);

    PricingPackResponse createPack(PricingPackRequest request);

    PricingPackResponse updatePack(UUID id, PricingPackRequest request);

    PricingPackResponse togglePackStatus(UUID id);

    void deletePack(UUID id);

    int grantUserCredits(UUID userId, int creditsAmount, String reason);
}
