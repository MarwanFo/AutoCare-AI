package com.autocare.backend.vehicle;

import com.autocare.backend.notification.repository.NotificationRepository;
import com.autocare.backend.notification.service.NotificationService;
import com.autocare.backend.vehicle.entity.UserComponent;
import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.enums.ComponentCategory;
import com.autocare.backend.vehicle.entity.enums.ComponentStatus;
import com.autocare.backend.vehicle.entity.enums.PurchaseCondition;
import com.autocare.backend.vehicle.repository.UserComponentRepository;
import com.autocare.backend.vehicle.service.impl.ComponentDegradationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComponentDegradationServiceTest {

    @Mock
    private UserComponentRepository userComponentRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ComponentDegradationServiceImpl degradationService;

    private UserVehicle vehicle;
    private UserComponent component;

    @BeforeEach
    void setUp() {
        vehicle = new UserVehicle();
        vehicle.setId(UUID.randomUUID());
        vehicle.setCurrentMileage(50000);
        vehicle.setPurchaseCondition(PurchaseCondition.USED);

        com.autocare.backend.auth.entity.User user = new com.autocare.backend.auth.entity.User();
        user.setId(UUID.randomUUID());
        vehicle.setUser(user);

        component = new UserComponent();
        component.setId(UUID.randomUUID());
        component.setName("Engine Oil");
        component.setCategory(ComponentCategory.ENGINE);
        component.setUserVehicle(vehicle);

        List<UserComponent> list = new ArrayList<>();
        list.add(component);
        vehicle.setComponents(list);
    }

    @Test
    @DisplayName("A. Valid mileage + valid time: stricter ratio is used")
    void testValidMileageAndTimeStricterUsed() {
        // Lifespan: 10,000 km or 12 months (approx 360 days)
        component.setExpectedLifespanMileage(10000);
        component.setExpectedLifespanMonths(12);

        // Mileage: driven 8,000 km out of 10,000 km -> mileageRatio = 0.8
        component.setInstallationMileage(42000); // 50,000 - 42,000 = 8,000 driven

        // Time: installed 60 days ago out of 360 days -> timeRatio = 0.166
        component.setInstallationDate(LocalDate.now().minusDays(60));

        degradationService.updateVehicleComponentDegradation(vehicle);

        // Mileage ratio (0.8) is stricter -> health = (1 - 0.8)*100 = 20%
        assertThat(component.getHealthScore()).isEqualTo(20);
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.CRITICAL);
    }

    @Test
    @DisplayName("B. Valid mileage only: calculation succeeds")
    void testValidMileageOnlySucceeds() {
        component.setExpectedLifespanMileage(20000);
        component.setExpectedLifespanMonths(null); // No time lifespan
        component.setInstallationMileage(40000);  // 10,000 driven -> 50% ratio

        degradationService.updateVehicleComponentDegradation(vehicle);

        assertThat(component.getHealthScore()).isEqualTo(50);
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.WARNING);
        assertThat(component.getRemainingMileage()).isEqualTo(10000);
        assertThat(component.getRemainingDays()).isNull();
    }

    @Test
    @DisplayName("C. Valid time only: calculation succeeds")
    void testValidTimeOnlySucceeds() {
        component.setExpectedLifespanMileage(null); // No mileage lifespan
        component.setExpectedLifespanMonths(10);    // 300 days expected
        component.setInstallationDate(LocalDate.now().minusDays(150)); // 50% ratio

        degradationService.updateVehicleComponentDegradation(vehicle);

        assertThat(component.getHealthScore()).isEqualTo(50);
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.WARNING);
        assertThat(component.getRemainingDays()).isEqualTo(150);
        assertThat(component.getRemainingMileage()).isNull();
    }

    @Test
    @DisplayName("D. No valid mileage or time evidence: UNKNOWN status & null health")
    void testNoValidEvidenceResultsInUnknown() {
        component.setExpectedLifespanMileage(null);
        component.setExpectedLifespanMonths(null);
        component.setInstallationDate(null);
        component.setInstallationMileage(null);

        degradationService.updateVehicleComponentDegradation(vehicle);

        assertThat(component.getHealthScore()).isNull();
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.UNKNOWN);
        assertThat(component.getRemainingMileage()).isNull();
        assertThat(component.getRemainingDays()).isNull();
    }

    @Test
    @DisplayName("E. Missing lifespan: no fabricated 50,000 km or 36 months used")
    void testMissingLifespanNoFabrication() {
        component.setExpectedLifespanMileage(null);
        component.setExpectedLifespanMonths(null);
        component.setInstallationMileage(10000);
        component.setInstallationDate(LocalDate.now().minusMonths(6));

        degradationService.updateVehicleComponentDegradation(vehicle);

        assertThat(component.getHealthScore()).isNull();
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.UNKNOWN);
    }

    @Test
    @DisplayName("F. Pre-owned missing replacement date: no manufactured purchase-minus-6-month date")
    void testPreownedMissingDateNoManufacturedDate() {
        vehicle.setPurchaseCondition(PurchaseCondition.USED);
        vehicle.setPurchaseDate(LocalDate.now().minusYears(1));
        
        component.setExpectedLifespanMileage(15000);
        component.setExpectedLifespanMonths(12);
        component.setInstallationDate(null); // Unknown replacement date
        component.setInstallationMileage(null);

        degradationService.updateVehicleComponentDegradation(vehicle);

        assertThat(component.getHealthScore()).isNull();
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.UNKNOWN);
    }

    @Test
    @DisplayName("G. Installation mileage > current mileage: invalid input -> UNKNOWN status")
    void testInstallationMileageGreaterThanCurrentMileageInvalid() {
        component.setExpectedLifespanMileage(10000);
        component.setInstallationMileage(60000); // Current is 50,000 -> Impossible!

        degradationService.updateVehicleComponentDegradation(vehicle);

        assertThat(component.getHealthScore()).isNull();
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.UNKNOWN);
    }

    @Test
    @DisplayName("H. Future installation date: invalid input -> UNKNOWN status")
    void testFutureInstallationDateInvalid() {
        component.setExpectedLifespanMonths(12);
        component.setInstallationDate(LocalDate.now().plusDays(10)); // Future date!

        degradationService.updateVehicleComponentDegradation(vehicle);

        assertThat(component.getHealthScore()).isNull();
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.UNKNOWN);
    }

    @Test
    @DisplayName("I. Lifespan <= 0: unknown, no divide by zero error")
    void testZeroOrNegativeLifespanNoDivideByZero() {
        component.setExpectedLifespanMileage(0);
        component.setExpectedLifespanMonths(-5);
        component.setInstallationMileage(10000);

        degradationService.updateVehicleComponentDegradation(vehicle);

        assertThat(component.getHealthScore()).isNull();
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.UNKNOWN);
    }

    @Test
    @DisplayName("J. UNKNOWN status: no critical safety notification dispatched")
    void testUnknownStatusNoNotification() {
        component.setExpectedLifespanMileage(null);
        component.setExpectedLifespanMonths(null);

        degradationService.updateVehicleComponentDegradation(vehicle);

        assertThat(component.getStatus()).isEqualTo(ComponentStatus.UNKNOWN);
        verifyNoInteractions(notificationService);
    }

    @Test
    @DisplayName("K. Valid health < 25%: CRITICAL notification dispatched")
    void testCriticalHealthTriggersNotification() {
        component.setExpectedLifespanMileage(10000);
        component.setInstallationMileage(41000); // 9,000 km driven out of 10,000 -> 10% health

        when(notificationRepository.existsByUserIdAndComponentIdAndIsReadFalse(any(), any())).thenReturn(false);

        degradationService.updateVehicleComponentDegradation(vehicle);

        assertThat(component.getHealthScore()).isEqualTo(10);
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.CRITICAL);
        verify(notificationService, times(1)).createNotification(any(), any(), eq(component), any(), any(), any());
    }

    @Test
    @DisplayName("L. Existing GOOD / WARNING / CRITICAL health boundaries remain correct")
    void testHealthStatusBoundaries() {
        component.setExpectedLifespanMileage(10000);

        // Case 1: 80% health -> GOOD
        component.setInstallationMileage(48000); // 2,000 driven -> 80% health
        degradationService.updateVehicleComponentDegradation(vehicle);
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.GOOD);

        // Case 2: 50% health -> WARNING
        component.setInstallationMileage(45000); // 5,000 driven -> 50% health
        degradationService.updateVehicleComponentDegradation(vehicle);
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.WARNING);

        // Case 3: 20% health -> CRITICAL
        component.setInstallationMileage(42000); // 8,000 driven -> 20% health
        degradationService.updateVehicleComponentDegradation(vehicle);
        assertThat(component.getStatus()).isEqualTo(ComponentStatus.CRITICAL);
    }
}
