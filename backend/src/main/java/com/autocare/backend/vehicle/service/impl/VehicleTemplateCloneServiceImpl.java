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
                UserComponent uc = vehicleCloneMapper.toUserComponent(tc, userVehicle, purchaseCondition, initialComponentHealths);
                userVehicle.addComponent(uc);
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
            userVehicle.setCompletenessScore(purchaseCondition == com.autocare.backend.vehicle.entity.enums.PurchaseCondition.BRAND_NEW ? 100 : 0);
        }

        // 3. Clone template intervals into UserVehicle
        if (managedTemplate.getIntervals() != null) {
            for (TemplateInterval ti : managedTemplate.getIntervals()) {
                UserInterval ui = vehicleCloneMapper.toUserInterval(ti, userVehicle);
                userVehicle.addInterval(ui);
            }
        }

        // 4. Persist UserVehicle (CascadeType.ALL takes care of child collections)
        return userVehicleRepository.save(userVehicle);
    }
}
