package com.autocare.backend.subscription.controller;

import com.autocare.backend.subscription.dto.PricingPackResponse;
import com.autocare.backend.subscription.entity.PackType;
import com.autocare.backend.subscription.service.PricingPackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/packs")
@RequiredArgsConstructor
@Tag(name = "Pricing Packs", description = "Public endpoints for browsing active subscription tiers and credit packs")
public class PublicPricingPackController {

    private final PricingPackService pricingPackService;

    @GetMapping("/active")
    @Operation(summary = "Get all active packs for users")
    public ResponseEntity<List<PricingPackResponse>> getActivePacks(
            @RequestParam(required = false) PackType type
    ) {
        log.info("Public request for active packs, filter type: {}", type);
        return ResponseEntity.ok(pricingPackService.getAllPacks(type, true));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single pack details")
    public ResponseEntity<PricingPackResponse> getPackById(@PathVariable UUID id) {
        return ResponseEntity.ok(pricingPackService.getPackById(id));
    }
}
