package com.autocare.backend.vehicle.mapper;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.vehicle.entity.*;
import com.autocare.backend.vehicle.entity.enums.FuelType;
import com.autocare.backend.vehicle.entity.enums.MileageUnit;
import com.autocare.backend.vehicle.entity.enums.Transmission;
import com.autocare.backend.vehicle.entity.enums.VehicleStatus;
import org.springframework.stereotype.Component;

@Component
public class VehicleCloneMapper {

    public UserVehicle toUserVehicle(
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
            java.time.LocalDate purchaseDate) {
        
        UserVehicle userVehicle = new UserVehicle();
        userVehicle.setUser(user);
        userVehicle.setTemplate(template);
        userVehicle.setLicensePlate(licensePlate);
        userVehicle.setVin(vin);
        userVehicle.setCurrentMileage(currentMileage != null ? currentMileage : 0);
        userVehicle.setMileageUnit(mileageUnit);
        userVehicle.setPurchaseDate(purchaseDate);

        // Resolve transmission and fuelType from template specifications if null
        FuelType resolvedFuelType = fuelType;
        if (resolvedFuelType == null && template.getSpecifications() != null) {
            String ftStr = (String) template.getSpecifications().get("fuelType");
            if (ftStr != null) {
                try {
                    resolvedFuelType = FuelType.valueOf(ftStr.toUpperCase());
                } catch (Exception ignored) {}
            }
        }
        if (resolvedFuelType == null) {
            resolvedFuelType = FuelType.GASOLINE; // Fallback
        }
        userVehicle.setFuelType(resolvedFuelType);

        Transmission resolvedTransmission = transmission;
        if (resolvedTransmission == null && template.getSpecifications() != null) {
            String transStr = (String) template.getSpecifications().get("transmission");
            if (transStr != null) {
                try {
                    resolvedTransmission = Transmission.valueOf(transStr.toUpperCase());
                } catch (Exception ignored) {}
            }
        }
        if (resolvedTransmission == null) {
            resolvedTransmission = Transmission.AUTOMATIC; // Fallback
        }
        userVehicle.setTransmission(resolvedTransmission);

        // AI metadata resolution
        Integer estMileage = 15000;
        if (template.getSpecifications() != null) {
            Object estObj = template.getSpecifications().get("estimatedAnnualMileage");
            if (estObj instanceof Number) {
                estMileage = ((Number) estObj).intValue();
            } else if (estObj instanceof String) {
                try {
                    estMileage = Integer.parseInt((String) estObj);
                } catch (Exception ignored) {}
            }
        }
        userVehicle.setEstimatedAnnualMileage(estMileage);

        com.autocare.backend.vehicle.entity.enums.DrivingProfile dProfile = com.autocare.backend.vehicle.entity.enums.DrivingProfile.COMMUTER;
        if (template.getSpecifications() != null) {
            String dpStr = (String) template.getSpecifications().get("drivingProfile");
            if (dpStr != null) {
                try {
                    dProfile = com.autocare.backend.vehicle.entity.enums.DrivingProfile.valueOf(dpStr.toUpperCase());
                } catch (Exception ignored) {}
            }
        }
        userVehicle.setDrivingProfile(dProfile);

        com.autocare.backend.vehicle.entity.enums.ClimateAssumption cAssumption = com.autocare.backend.vehicle.entity.enums.ClimateAssumption.TEMPERATE;
        if (template.getSpecifications() != null) {
            String caStr = (String) template.getSpecifications().get("climateAssumptions");
            if (caStr != null) {
                try {
                    cAssumption = com.autocare.backend.vehicle.entity.enums.ClimateAssumption.valueOf(caStr.toUpperCase());
                } catch (Exception ignored) {}
            }
        }
        userVehicle.setClimateAssumptions(cAssumption);

        // Set Completeness Score: 100 for BRAND_NEW, 0 for USED
        boolean isBrandNew = (purchaseCondition == com.autocare.backend.vehicle.entity.enums.PurchaseCondition.BRAND_NEW);
        userVehicle.setCompletenessScore(isBrandNew ? 100 : 0);

        userVehicle.setColor(color);
        userVehicle.setPrimary(isPrimary);
        userVehicle.setPurchaseCondition(purchaseCondition != null ? purchaseCondition : com.autocare.backend.vehicle.entity.enums.PurchaseCondition.USED);
        
        String resolvedNickname = (nickname != null && !nickname.trim().isEmpty())
                ? nickname.trim()
                : template.getYear() + " " + template.getBrand().getName() + " " + template.getModel().getName();
        userVehicle.setNickname(resolvedNickname);
        
        userVehicle.setStatus(VehicleStatus.ACTIVE);
        return userVehicle;
    }

    public UserComponent toUserComponent(
            TemplateComponent templateComponent, 
            UserVehicle userVehicle, 
            com.autocare.backend.vehicle.entity.enums.PurchaseCondition purchaseCondition,
            java.util.Map<String, String> initialComponentHealths) {
        UserComponent userComponent = new UserComponent();
        userComponent.setUserVehicle(userVehicle);
        userComponent.setCategory(templateComponent.getCategory());
        userComponent.setName(templateComponent.getName());
        userComponent.setPartNumber(templateComponent.getStandardPartNumber());
        userComponent.setSpecifications(templateComponent.getStandardSpecifications());
        userComponent.setExpectedLifespanMileage(templateComponent.getExpectedLifespanMileage());
        userComponent.setExpectedLifespanMonths(templateComponent.getExpectedLifespanMonths());
        userComponent.setCustom(false);
        userComponent.setModifiedFromTemplate(false);

        boolean isBrandNew = (purchaseCondition == com.autocare.backend.vehicle.entity.enums.PurchaseCondition.BRAND_NEW);
        
        if (isBrandNew) {
            userComponent.setStatus(com.autocare.backend.vehicle.entity.enums.ComponentStatus.NEW);
            userComponent.setHealthScore(100);
            userComponent.setConfidenceScore(100);
            userComponent.setOrigin(com.autocare.backend.vehicle.entity.enums.DataOrigin.FACTORY);
            
            java.time.LocalDate pDate = userVehicle.getPurchaseDate() != null ? userVehicle.getPurchaseDate() : java.time.LocalDate.now();
            userComponent.setInstallationMileage(0);
            userComponent.setInstallationDate(pDate);
            userComponent.setLastReplacedMileage(0);
            userComponent.setLastReplacedDate(pDate);
        } else {
            // Check for initial component health reported by user during onboarding
            String healthKey = getMatchingHealthKey(templateComponent);
            String healthVal = (healthKey != null && initialComponentHealths != null) ? initialComponentHealths.get(healthKey) : null;
            
            if (healthVal != null) {
                userComponent.setOrigin(com.autocare.backend.vehicle.entity.enums.DataOrigin.USER_CONFIRMED);
                userComponent.setConfidenceScore(100);
                
                if ("GOOD".equalsIgnoreCase(healthVal)) {
                    userComponent.setStatus(com.autocare.backend.vehicle.entity.enums.ComponentStatus.GOOD);
                    userComponent.setHealthScore(100);
                } else if ("NEEDING_ATTENTION".equalsIgnoreCase(healthVal)) {
                    userComponent.setStatus(com.autocare.backend.vehicle.entity.enums.ComponentStatus.WARNING);
                    userComponent.setHealthScore(50);
                } else if ("CRITICAL".equalsIgnoreCase(healthVal)) {
                    userComponent.setStatus(com.autocare.backend.vehicle.entity.enums.ComponentStatus.CRITICAL);
                    userComponent.setHealthScore(10);
                } else {
                    userComponent.setStatus(com.autocare.backend.vehicle.entity.enums.ComponentStatus.NEEDS_VERIFICATION);
                    userComponent.setHealthScore(null);
                    userComponent.setConfidenceScore(50);
                    userComponent.setOrigin(com.autocare.backend.vehicle.entity.enums.DataOrigin.AI_GENERATED);
                }
            } else {
                userComponent.setStatus(com.autocare.backend.vehicle.entity.enums.ComponentStatus.NEEDS_VERIFICATION);
                userComponent.setHealthScore(null);
                userComponent.setConfidenceScore(50);
                userComponent.setOrigin(com.autocare.backend.vehicle.entity.enums.DataOrigin.AI_GENERATED);
            }
            
            userComponent.setInstallationMileage(null);
            userComponent.setInstallationDate(null);
            userComponent.setLastReplacedMileage(null);
            userComponent.setLastReplacedDate(null);
        }

        // Add default structured recommendation map
        java.util.List<java.util.Map<String, Object>> recommendations = new java.util.ArrayList<>();
        java.util.Map<String, Object> rec = new java.util.HashMap<>();
        rec.put("action", isBrandNew ? "INSPECT" : "REPLACE");
        rec.put("priority", isBrandNew ? "LOW" : "MEDIUM");
        rec.put("reason", "Factory checklist baseline for " + templateComponent.getName());
        rec.put("triggerCondition", "MILEAGE");
        recommendations.add(rec);
        userComponent.setRecommendations(recommendations);
        
        return userComponent;
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

    public UserInterval toUserInterval(TemplateInterval templateInterval, UserVehicle userVehicle) {
        UserInterval userInterval = new UserInterval();
        userInterval.setUserVehicle(userVehicle);
        userInterval.setTitle(templateInterval.getTitle());
        userInterval.setDescription(templateInterval.getDescription());
        userInterval.setIntervalMileage(templateInterval.getIntervalMileage());
        userInterval.setIntervalMonths(templateInterval.getIntervalMonths());
        userInterval.setInspectionOnly(templateInterval.isInspectionOnly());
        userInterval.setModifiedFromTemplate(false);
        return userInterval;
    }
}
