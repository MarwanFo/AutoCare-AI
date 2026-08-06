package com.autocare.backend.vehicle.service.impl;

import com.autocare.backend.notification.entity.enums.NotificationSeverity;
import com.autocare.backend.notification.repository.NotificationRepository;
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
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public void updateVehicleComponentDegradation(UserVehicle vehicle) {
        if (vehicle == null || vehicle.getComponents() == null || vehicle.getComponents().isEmpty()) {
            return;
        }

        int currentMileage = vehicle.getCurrentMileage() != null ? vehicle.getCurrentMileage() : 0;
        LocalDate now = LocalDate.now();

        List<UserComponent> components = vehicle.getComponents();
        for (UserComponent comp : components) {
            // Determine expected piece-specific lifespans with sensible category defaults
            int expMileage = comp.getExpectedLifespanMileage() != null ? comp.getExpectedLifespanMileage() : getDefaultMileageLifespan(comp);
            int expMonths = comp.getExpectedLifespanMonths() != null ? comp.getExpectedLifespanMonths() : getDefaultMonthsLifespan(comp);

            int instMileage = comp.getInstallationMileage() != null ? comp.getInstallationMileage() : 
                    (comp.getLastReplacedMileage() != null ? comp.getLastReplacedMileage() : 0);
            LocalDate instDate = comp.getInstallationDate() != null ? comp.getInstallationDate() : 
                    (comp.getLastReplacedDate() != null ? comp.getLastReplacedDate() : vehicle.getPurchaseDate());
            if (instDate == null) {
                instDate = now.minusMonths(6); // Default 6 months ago baseline
            }

            int driven = Math.max(0, currentMileage - instMileage);
            long daysElapsed = Math.max(0, ChronoUnit.DAYS.between(instDate, now));
            long totalDaysExpected = Math.max(1, (long) expMonths * 30);

            int remainingMileage = Math.max(0, expMileage - driven);
            int remainingDays = Math.max(0, (int) (totalDaysExpected - daysElapsed));

            double mileageRatio = (double) driven / expMileage;
            double timeRatio = (double) daysElapsed / totalDaysExpected;
            double maxRatio = Math.max(mileageRatio, timeRatio);

            int calculatedHealth = Math.max(0, Math.min(100, (int) Math.round((1.0 - maxRatio) * 100.0)));

            comp.setExpectedLifespanMileage(expMileage);
            comp.setExpectedLifespanMonths(expMonths);
            comp.setRemainingMileage(remainingMileage);
            comp.setRemainingDays(remainingDays);
            comp.setHealthScore(calculatedHealth);

            if (calculatedHealth < 25) {
                comp.setStatus(ComponentStatus.CRITICAL);
            } else if (calculatedHealth <= 60) {
                comp.setStatus(ComponentStatus.WARNING);
            } else {
                comp.setStatus(ComponentStatus.GOOD);
            }

            userComponentRepository.save(comp);

            // Trigger DANGER alert notification if health score < 25% and no unread alert exists
            if (calculatedHealth < 25) {
                boolean hasUnreadAlert = notificationRepository.existsByUserIdAndComponentIdAndIsReadFalse(vehicle.getUser().getId(), comp.getId());
                if (!hasUnreadAlert) {
                    String title = "🚨 Critical Safety Alert: " + comp.getName();
                    String message = String.format(
                            "Danger! %s health on vehicle %s is critical (%d%% health). Estimated remaining life: %d %s / %d days. Immediate inspection required!",
                            comp.getName(),
                            vehicle.getNickname(),
                            calculatedHealth,
                            remainingMileage,
                            vehicle.getMileageUnit(),
                            remainingDays
                    );
                    notificationService.createNotification(
                            vehicle.getUser().getId(),
                            vehicle,
                            comp,
                            title,
                            message,
                            NotificationSeverity.DANGER
                    );
                }
            }
        }
    }

    private int getDefaultMileageLifespan(UserComponent comp) {
        String name = comp.getName().toLowerCase();
        if (name.contains("oil")) return 10000;
        if (name.contains("filter")) return 15000;
        if (name.contains("brake") && name.contains("pad")) return 30000;
        if (name.contains("tire")) return 50000;
        if (name.contains("spark")) return 60000;
        if (name.contains("timing")) return 100000;
        return 30000;
    }

    private int getDefaultMonthsLifespan(UserComponent comp) {
        String name = comp.getName().toLowerCase();
        if (name.contains("oil")) return 12;
        if (name.contains("filter")) return 12;
        if (name.contains("brake") && name.contains("pad")) return 24;
        if (name.contains("tire")) return 36;
        if (name.contains("spark")) return 48;
        if (name.contains("battery")) return 48;
        if (name.contains("timing")) return 72;
        return 24;
    }
}
