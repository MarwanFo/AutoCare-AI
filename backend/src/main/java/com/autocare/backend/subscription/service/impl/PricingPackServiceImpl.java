package com.autocare.backend.subscription.service.impl;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.entity.UserAiCredits;
import com.autocare.backend.auth.exception.DuplicateResourceException;
import com.autocare.backend.auth.exception.ResourceNotFoundException;
import com.autocare.backend.auth.repository.UserAiCreditsRepository;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.subscription.dto.PricingPackRequest;
import com.autocare.backend.subscription.dto.PricingPackResponse;
import com.autocare.backend.subscription.entity.BillingPeriod;
import com.autocare.backend.subscription.entity.PackType;
import com.autocare.backend.subscription.entity.PricingPack;
import com.autocare.backend.subscription.repository.PricingPackRepository;
import com.autocare.backend.subscription.service.PricingPackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PricingPackServiceImpl implements PricingPackService {

    private final PricingPackRepository pricingPackRepository;
    private final UserRepository userRepository;
    private final UserAiCreditsRepository userAiCreditsRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PricingPackResponse> getAllPacks(PackType packType, Boolean activeOnly) {
        List<PricingPack> packs;

        if (Boolean.TRUE.equals(activeOnly)) {
            if (packType != null) {
                packs = pricingPackRepository.findAllByPackTypeAndIsActiveTrueOrderByDisplayOrderAsc(packType);
            } else {
                packs = pricingPackRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc();
            }
        } else {
            if (packType != null) {
                packs = pricingPackRepository.findAllByPackTypeOrderByDisplayOrderAsc(packType);
            } else {
                packs = pricingPackRepository.findAllByOrderByDisplayOrderAsc();
            }
        }

        return packs.stream().map(PricingPackResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PricingPackResponse> getActivePublicPacks() {
        return pricingPackRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(PricingPackResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PricingPackResponse getPackById(UUID id) {
        PricingPack pack = pricingPackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing pack not found with ID: " + id));
        return PricingPackResponse.fromEntity(pack);
    }

    @Override
    @Transactional
    public PricingPackResponse createPack(PricingPackRequest request) {
        String code = request.code().trim().toUpperCase();
        if (pricingPackRepository.existsByCode(code)) {
            throw new DuplicateResourceException("A pricing pack with code '" + code + "' already exists.");
        }

        PricingPack pack = PricingPack.builder()
                .code(code)
                .name(request.name().trim())
                .description(request.description())
                .packType(request.packType())
                .price(request.price())
                .currency(request.currency() != null ? request.currency().trim().toUpperCase() : "MAD")
                .billingPeriod(request.billingPeriod() != null ? request.billingPeriod() : 
                        (request.packType() == PackType.SUBSCRIPTION ? BillingPeriod.MONTHLY : BillingPeriod.ONE_TIME))
                .vehicleLimit(request.vehicleLimit() != null ? request.vehicleLimit() : 1)
                .aiCredits(request.aiCredits() != null ? request.aiCredits() : 0)
                .features(request.features())
                .badge(request.badge())
                .isActive(request.isActive() != null ? request.isActive() : true)
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .build();

        PricingPack saved = pricingPackRepository.save(pack);
        log.info("Created new pricing pack: {} (ID: {})", saved.getName(), saved.getId());
        return PricingPackResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public PricingPackResponse updatePack(UUID id, PricingPackRequest request) {
        PricingPack pack = pricingPackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing pack not found with ID: " + id));

        String code = request.code().trim().toUpperCase();
        if (pricingPackRepository.existsByCodeAndIdNot(code, id)) {
            throw new DuplicateResourceException("A pricing pack with code '" + code + "' already exists.");
        }

        pack.setCode(code);
        pack.setName(request.name().trim());
        pack.setDescription(request.description());
        pack.setPackType(request.packType());
        pack.setPrice(request.price());
        if (request.currency() != null) {
            pack.setCurrency(request.currency().trim().toUpperCase());
        }
        if (request.billingPeriod() != null) {
            pack.setBillingPeriod(request.billingPeriod());
        }
        if (request.vehicleLimit() != null) {
            pack.setVehicleLimit(request.vehicleLimit());
        }
        if (request.aiCredits() != null) {
            pack.setAiCredits(request.aiCredits());
        }
        pack.setFeatures(request.features());
        pack.setBadge(request.badge());
        if (request.isActive() != null) {
            pack.setIsActive(request.isActive());
        }
        if (request.displayOrder() != null) {
            pack.setDisplayOrder(request.displayOrder());
        }

        PricingPack updated = pricingPackRepository.save(pack);
        log.info("Updated pricing pack: {} (ID: {})", updated.getName(), updated.getId());
        return PricingPackResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public PricingPackResponse togglePackStatus(UUID id) {
        PricingPack pack = pricingPackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing pack not found with ID: " + id));

        pack.setIsActive(!Boolean.TRUE.equals(pack.getIsActive()));
        PricingPack updated = pricingPackRepository.save(pack);
        log.info("Toggled pack status for ID: {} to {}", id, updated.getIsActive());
        return PricingPackResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deletePack(UUID id) {
        if (!pricingPackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pricing pack not found with ID: " + id);
        }
        pricingPackRepository.deleteById(id);
        log.info("Deleted pricing pack with ID: {}", id);
    }

    @Override
    @Transactional
    public int grantUserCredits(UUID userId, int creditsAmount, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        UserAiCredits credits = userAiCreditsRepository.findById(userId)
                .orElseGet(() -> {
                    UserAiCredits newCredits = new UserAiCredits();
                    newCredits.setUser(user);
                    newCredits.setCredits(0);
                    return newCredits;
                });

        int newTotal = Math.max(0, credits.getCredits() + creditsAmount);
        credits.setCredits(newTotal);
        userAiCreditsRepository.save(credits);

        log.info("Admin adjusted credits for user: {} by {} (new total: {}, reason: {})",
                user.getEmail(), creditsAmount, newTotal, reason);

        return newTotal;
    }
}
