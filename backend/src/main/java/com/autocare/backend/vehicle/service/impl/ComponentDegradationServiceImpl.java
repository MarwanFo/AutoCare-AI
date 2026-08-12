package com.autocare.backend.vehicle.service.impl;

import com.autocare.backend.notification.service.NotificationService;
import com.autocare.backend.vehicle.entity.UserComponent;
import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.enums.ComponentStatus;
import com.autocare.backend.vehicle.repository.UserComponentRepository;
import com.autocare.backend.vehicle.service.ComponentDegradationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComponentDegradationServiceImpl implements ComponentDegradationService {

    private final UserComponentRepository userComponentRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void updateVehicleComponentDegradation(UserVehicle vehicle) {
        if (vehicle == null || vehicle.getComponents() == null || vehicle.getComponents().isEmpty()) {
            return;
        }

        Integer currentMileage = vehicle.getCurrentMileage();
        LocalDate now = LocalDate.now();

        List<UserComponent> components = vehicle.getComponents();
        for (UserComponent comp : components) {
            // Retrieve expected piece-specific lifespans without fabricating generic defaults
            Integer expMileage = comp.getExpectedLifespanMileage();
            Integer expMonths = comp.getExpectedLifespanMonths();

            // Determine installation/replacement mileage & date without manufactured fallbacks
            Integer instMileage = comp.getInstallationMileage() != null ? comp.getInstallationMileage() : comp.getLastReplacedMileage();
            LocalDate instDate = comp.getInstallationDate() != null ? comp.getInstallationDate() : comp.getLastReplacedDate();

            // For BRAND_NEW vehicles only, use vehicle purchase/delivery baseline if recorded and no custom date exists
            boolean isBrandNew = vehicle.getPurchaseCondition() == com.autocare.backend.vehicle.entity.enums.PurchaseCondition.BRAND_NEW;
            if (isBrandNew) {
                if (instMileage == null && vehicle.getMileageAtPurchase() != null) {
                    instMileage = vehicle.getMileageAtPurchase();
                }
                if (instDate == null && vehicle.getPurchaseDate() != null) {
                    instDate = vehicle.getPurchaseDate();
                }
            }

            // 1. Evaluate Mileage Dimension Safety
            boolean hasValidMileage = false;
            double mileageRatio = 0.0;
            Integer remainingMileage = null;

            if (expMileage != null && expMileage > 0 
                    && instMileage != null && instMileage >= 0 
                    && currentMileage != null && currentMileage >= 0 
                    && currentMileage >= instMileage) {
                
                int driven = currentMileage - instMileage;
                remainingMileage = Math.max(0, expMileage - driven);
                mileageRatio = (double) driven / expMileage;
                hasValidMileage = true;
            }

            // 2. Evaluate Time Dimension Safety
            boolean hasValidTime = false;
            double timeRatio = 0.0;
            Integer remainingDays = null;

            if (expMonths != null && expMonths > 0 
                    && instDate != null && !instDate.isAfter(now)) {
                
                long daysElapsed = ChronoUnit.DAYS.between(instDate, now);
                long totalDaysExpected = (long) expMonths * 30;
                remainingDays = Math.max(0, (int) (totalDaysExpected - daysElapsed));
                timeRatio = (double) daysElapsed / totalDaysExpected;
                hasValidTime = true;
            }

            // 3. Health & Status Determination
            if (hasValidMileage || hasValidTime) {
                double effectiveRatio;
                if (hasValidMileage && hasValidTime) {
                    effectiveRatio = Math.max(mileageRatio, timeRatio);
                } else if (hasValidMileage) {
                    effectiveRatio = mileageRatio;
                } else {
                    effectiveRatio = timeRatio;
                }

                int calculatedHealth = Math.max(0, Math.min(100, (int) Math.round((1.0 - effectiveRatio) * 100.0)));

                comp.setRemainingMileage(remainingMileage);
                comp.setRemainingDays(remainingDays);
                comp.setHealthScore(calculatedHealth);

                if (calculatedHealth < 25) {
                    comp.setStatus(ComponentStatus.CRITICAL);
                } else if (calculatedHealth <= 60) {
                    comp.setStatus(ComponentStatus.WARNING);
                } else {
                    if (comp.getStatus() == ComponentStatus.NEW && calculatedHealth >= 80) {
                        comp.setStatus(ComponentStatus.NEW);
                    } else {
                        comp.setStatus(ComponentStatus.GOOD);
                    }
                }
            } else if (comp.getOrigin() == com.autocare.backend.vehicle.entity.enums.DataOrigin.USER_CONFIRMED && comp.getHealthScore() != null) {
                // Preserve user-confirmed initial health input from onboarding
                // Do not override user-confirmed health with UNKNOWN
            } else if (isBrandNew && comp.getStatus() == ComponentStatus.NEW && comp.getHealthScore() != null) {
                // Preserve BRAND_NEW factory baseline initialization
            } else {
                // UNKNOWN / INSUFFICIENT_DATA State
                comp.setRemainingMileage(null);
                comp.setRemainingDays(null);
                comp.setHealthScore(null);
                comp.setStatus(ComponentStatus.UNKNOWN);
            }

            userComponentRepository.save(comp);

            // Delegate state-transition notification evaluation with pessimistic locking & clean invariants
            if (vehicle.getUser() != null) {
                notificationService.evaluateComponentNotification(vehicle.getUser().getId(), vehicle, comp);
            }
        }
    }
}
