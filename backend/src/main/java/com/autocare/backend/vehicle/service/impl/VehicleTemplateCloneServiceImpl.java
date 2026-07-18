package com.autocare.backend.vehicle.service.impl;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.vehicle.entity.*;
import com.autocare.backend.vehicle.entity.enums.FuelType;
import com.autocare.backend.vehicle.entity.enums.MileageUnit;
import com.autocare.backend.vehicle.entity.enums.Transmission;
import com.autocare.backend.vehicle.mapper.VehicleCloneMapper;
import com.autocare.backend.vehicle.repository.UserVehicleRepository;
import com.autocare.backend.vehicle.repository.VehicleTemplateRepository;
import com.autocare.backend.vehicle.service.VehicleTemplateCloneService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VehicleTemplateCloneServiceImpl implements VehicleTemplateCloneService {

    private final UserVehicleRepository userVehicleRepository;
    private final VehicleTemplateRepository vehicleTemplateRepository;
    private final VehicleCloneMapper vehicleCloneMapper;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Override
    @Transactional
    public UserVehicle cloneTemplateToUser(
            VehicleTemplate template, 
            User user, 
            String licensePlate, 
            String vin, 
            Integer currentMileage, 
            MileageUnit mileageUnit,
            FuelType fuelType, 
            Transmission transmission, 
            String color, 
            boolean isPrimary,
            com.autocare.backend.vehicle.entity.enums.PurchaseCondition purchaseCondition,
            String nickname,
            java.time.LocalDate purchaseDate,
            Integer mileageAtPurchase,
            java.util.Map<String, String> initialComponentHealths) {
        
        // Reload template to attach it to the active Hibernate session/transaction context
        VehicleTemplate managedTemplate = vehicleTemplateRepository.findById(template.getId())
                .orElseThrow(() -> new IllegalArgumentException("Template not found with ID: " + template.getId()));

        boolean isBrandNew = (purchaseCondition == com.autocare.backend.vehicle.entity.enums.PurchaseCondition.BRAND_NEW);

        // 1. Map template specs to new UserVehicle instance
        UserVehicle userVehicle = vehicleCloneMapper.toUserVehicle(
                managedTemplate, 
                user, 
                licensePlate, 
                vin, 
                currentMileage, 
                mileageUnit,
                fuelType, 
                transmission, 
                color, 
                isPrimary,
                purchaseCondition,
                nickname,
                purchaseDate
        );
        userVehicle.setMileageAtPurchase(mileageAtPurchase != null ? mileageAtPurchase : 0);

        // 2. Clone template components into UserVehicle
        if (managedTemplate.getComponents() != null) {
            for (TemplateComponent tc : managedTemplate.getComponents()) {
                if (isBrandNew) {
                    // Pre-fill ALL components for brand new vehicles
                    UserComponent uc = vehicleCloneMapper.toUserComponent(tc, userVehicle, purchaseCondition, initialComponentHealths);
                    userVehicle.addComponent(uc);
                } else {
                    // For USED vehicles, ONLY pre-fill components user explicitly calibrated during onboarding.
                    // The rest are input manually one-by-one by the user post-onboarding.
                    String healthKey = getMatchingHealthKey(tc);
                    if (healthKey != null && initialComponentHealths != null && initialComponentHealths.containsKey(healthKey)) {
                        UserComponent uc = vehicleCloneMapper.toUserComponent(tc, userVehicle, purchaseCondition, initialComponentHealths);
                        userVehicle.addComponent(uc);
                    }
                }
            }
        }

        // Recalculate Completeness Score based on component verification origin
        if (userVehicle.getComponents() != null && !userVehicle.getComponents().isEmpty()) {
            long totalComponents = userVehicle.getComponents().size();
            long verifiedComponents = userVehicle.getComponents().stream()
                    .filter(c -> c.getOrigin() != com.autocare.backend.vehicle.entity.enums.DataOrigin.AI_GENERATED)
                    .count();
            int score = (int) Math.round(((double) verifiedComponents / totalComponents) * 100.0);
            userVehicle.setCompletenessScore(score);
        } else {
            userVehicle.setCompletenessScore(isBrandNew ? 100 : 0);
        }

        // 3. Clone template intervals into UserVehicle
        if (managedTemplate.getIntervals() != null) {
            for (TemplateInterval ti : managedTemplate.getIntervals()) {
                UserInterval ui = vehicleCloneMapper.toUserInterval(ti, userVehicle);
                userVehicle.addInterval(ui);
            }
        }

        // 4. Populate documents for BRAND_NEW vehicle from template specifications JSON
        if (isBrandNew && managedTemplate.getSpecifications() != null && managedTemplate.getSpecifications().containsKey("documents")) {
            Object docsObj = managedTemplate.getSpecifications().get("documents");
            if (docsObj instanceof java.util.List) {
                for (Object docObj : (java.util.List<?>) docsObj) {
                    try {
                        java.util.Map<?, ?> docMap = objectMapper.convertValue(docObj, java.util.Map.class);
                        String title = (String) docMap.get("title");
                        String notes = (String) docMap.get("notes");
                        if (title != null && !title.trim().isEmpty()) {
                            UserDocument ud = new UserDocument();
                            ud.setUserVehicle(userVehicle);
                            ud.setTitle(title.trim());
                            ud.setNotes(notes != null ? notes.trim() : null);
                            // Standard placeholder URL for generated documents
                            ud.setUrl("https://autocare.ai/templates/documents/" + java.util.UUID.randomUUID().toString() + ".pdf");
                            userVehicle.addDocument(ud);
                        }
                    } catch (Exception e) {
                        // Log parsing failure but proceed
                    }
                }
            }
        }

        // 5. Persist UserVehicle (CascadeType.ALL takes care of child collections)
        return userVehicleRepository.save(userVehicle);
    }

    private String getMatchingHealthKey(TemplateComponent tc) {
        String name = tc.getName().toLowerCase();
        String cat = tc.getCategory().name().toLowerCase();
        if (name.contains("oil") && (cat.contains("fluid") || cat.contains("engine") || cat.contains("filter"))) {
            return "engineOil";
        }
        if ((name.contains("coolant") || name.contains("antifreeze")) && (cat.contains("fluid") || cat.contains("engine"))) {
            return "coolant";
        }
        if ((name.contains("tire") || name.contains("tyre")) && cat.contains("tire")) {
            return "tires";
        }
        if (name.contains("brake") && name.contains("pad") && cat.contains("brake")) {
            return "brakePads";
        }
        if ((name.contains("battery") || name.contains("12v")) && (cat.contains("battery") || cat.contains("electrical") || cat.contains("other"))) {
            return "battery";
        }
        return null;
    }
}
