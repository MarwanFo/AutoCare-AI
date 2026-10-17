package com.autocare.backend.subscription.controller;

import com.autocare.backend.subscription.dto.GrantCreditsRequest;
import com.autocare.backend.subscription.dto.PricingPackRequest;
import com.autocare.backend.subscription.dto.PricingPackResponse;
import com.autocare.backend.subscription.entity.PackType;
import com.autocare.backend.subscription.service.PricingPackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/packs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
@Tag(name = "Admin Pricing Packs", description = "Admin management of subscription plans and credit packages")
public class AdminPricingPackController {

    private final PricingPackService pricingPackService;

    @GetMapping
    @Operation(summary = "Get all packs with filters")
    public ResponseEntity<List<PricingPackResponse>> getAllPacks(
            @RequestParam(required = false) PackType type,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        log.info("Admin fetching pricing packs: type={}, activeOnly={}", type, activeOnly);
        return ResponseEntity.ok(pricingPackService.getAllPacks(type, activeOnly));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single pack by ID")
    public ResponseEntity<PricingPackResponse> getPackById(@PathVariable UUID id) {
        return ResponseEntity.ok(pricingPackService.getPackById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new pricing pack or subscription plan")
    public ResponseEntity<PricingPackResponse> createPack(@Valid @RequestBody PricingPackRequest request) {
        log.info("Admin creating pricing pack: {}", request.name());
        PricingPackResponse created = pricingPackService.createPack(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing pricing pack")
    public ResponseEntity<PricingPackResponse> updatePack(
            @PathVariable UUID id,
            @Valid @RequestBody PricingPackRequest request
    ) {
        log.info("Admin updating pricing pack ID: {}", id);
        return ResponseEntity.ok(pricingPackService.updatePack(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle pack active/inactive status")
    public ResponseEntity<PricingPackResponse> togglePackStatus(@PathVariable UUID id) {
        log.info("Admin toggling status for pack ID: {}", id);
        return ResponseEntity.ok(pricingPackService.togglePackStatus(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a pricing pack")
    public ResponseEntity<Void> deletePack(@PathVariable UUID id) {
        log.info("Admin deleting pricing pack ID: {}", id);
        pricingPackService.deletePack(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{userId}/credits")
    @Operation(summary = "Manually grant or deduct AI credits for a user")
    public ResponseEntity<Map<String, Object>> grantUserCredits(
            @PathVariable UUID userId,
            @Valid @RequestBody GrantCreditsRequest request
    ) {
        log.info("Admin modifying credits for user: {} amount: {}", userId, request.credits());
        int updatedTotal = pricingPackService.grantUserCredits(userId, request.credits(), request.reason());
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "creditsAdded", request.credits(),
                "totalCredits", updatedTotal,
                "message", "Credits successfully updated."
        ));
    }
}
