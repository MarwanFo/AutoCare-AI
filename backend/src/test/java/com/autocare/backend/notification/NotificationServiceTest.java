package com.autocare.backend.notification;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.notification.entity.Notification;
import com.autocare.backend.notification.entity.enums.NotificationSeverity;
import com.autocare.backend.notification.entity.enums.NotificationType;
import com.autocare.backend.notification.repository.NotificationRepository;
import com.autocare.backend.notification.service.NotificationService;
import com.autocare.backend.vehicle.entity.Brand;
import com.autocare.backend.vehicle.entity.Model;
import com.autocare.backend.vehicle.entity.UserComponent;
import com.autocare.backend.vehicle.entity.UserDocument;
import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.VehicleTemplate;
import com.autocare.backend.vehicle.entity.enums.ComponentCategory;
import com.autocare.backend.vehicle.entity.enums.ComponentStatus;
import com.autocare.backend.vehicle.repository.BrandRepository;
import com.autocare.backend.vehicle.repository.ModelRepository;
import com.autocare.backend.vehicle.repository.UserComponentRepository;
import com.autocare.backend.vehicle.repository.UserDocumentRepository;
import com.autocare.backend.vehicle.repository.UserVehicleRepository;
import com.autocare.backend.vehicle.repository.VehicleTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserVehicleRepository userVehicleRepository;

    @Autowired
    private UserComponentRepository userComponentRepository;

    @Autowired
    private UserDocumentRepository userDocumentRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ModelRepository modelRepository;

    @Autowired
    private VehicleTemplateRepository vehicleTemplateRepository;

    private User testUser;
    private User testUserB;
    private UserVehicle testVehicle;
    private UserComponent testComponent;
    private UserDocument testDocument;

    private Clock fixedClock = Clock.fixed(Instant.parse("2026-08-12T12:00:00Z"), ZoneId.of("UTC"));

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setFullName("Test User A");
        testUser.setEmail("testuser_" + UUID.randomUUID() + "@autocare.com");
        testUser.setPasswordHash("$2a$10$7EqJtq986P4m0yN84b2pce3N/5yB.z1a4Lw4Lw4Lw4Lw4Lw4Lw4Lw");
        testUser = userRepository.save(testUser);

        testUserB = new User();
        testUserB.setFullName("Test User B");
        testUserB.setEmail("testuserB_" + UUID.randomUUID() + "@autocare.com");
        testUserB.setPasswordHash("$2a$10$7EqJtq986P4m0yN84b2pce3N/5yB.z1a4Lw4Lw4Lw4Lw4Lw4Lw4Lw");
        testUserB = userRepository.save(testUserB);

        Brand brand = new Brand();
        brand.setName("Toyota_" + UUID.randomUUID());
        brand.setLogoUrl("https://logo.png");
        brand = brandRepository.save(brand);

        Model model = new Model();
        model.setName("Camry_" + UUID.randomUUID());
        model.setBrand(brand);
        model = modelRepository.save(model);

        VehicleTemplate template = new VehicleTemplate();
        template.setBrand(brand);
        template.setModel(model);
        template.setYear(2022);
        template.setTrimConfiguration("LE_" + UUID.randomUUID());
        template.setSpecifications(java.util.Map.of("engine", "2.0L"));
        template = vehicleTemplateRepository.save(template);

        testVehicle = new UserVehicle();
        testVehicle.setUser(testUser);
        testVehicle.setTemplate(template);
        testVehicle.setNickname("Test Sedan");
        testVehicle = userVehicleRepository.save(testVehicle);

        testComponent = new UserComponent();
        testComponent.setUserVehicle(testVehicle);
        testComponent.setCategory(ComponentCategory.BRAKES);
        testComponent.setName("Front Brake Pads");
        testComponent.setStatus(ComponentStatus.GOOD);
        testComponent.setHealthScore(90);
        testComponent = userComponentRepository.save(testComponent);

        testDocument = new UserDocument();
        testDocument.setUserVehicle(testVehicle);
        testDocument.setTitle("Vehicle Insurance");
        testDocument.setUrl("https://autocare.com/docs/insurance.pdf");
        testDocument.setExpiryDate(LocalDate.now(fixedClock).plusDays(60));
        testDocument = userDocumentRepository.save(testDocument);
    }

    @Test
    void testGoodComponentNoActiveNotification() {
        testComponent.setStatus(ComponentStatus.GOOD);
        testComponent.setHealthScore(95);
        userComponentRepository.save(testComponent);

        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Optional<Notification> active = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId());
        assertTrue(active.isEmpty(), "GOOD component should produce no active condition notification.");
    }

    @Test
    void testWarningComponentCreatesWarningNotification() {
        testComponent.setStatus(ComponentStatus.WARNING);
        testComponent.setHealthScore(50);
        userComponentRepository.save(testComponent);

        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Optional<Notification> active = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId());
        assertTrue(active.isPresent(), "WARNING component must produce an active notification.");
        assertEquals(NotificationType.COMPONENT_WARNING, active.get().getType());
        assertEquals(NotificationSeverity.WARNING, active.get().getSeverity());
    }

    @Test
    void testWarningRecalculatedRepeatedlyRetainsSameNotification() {
        testComponent.setStatus(ComponentStatus.WARNING);
        testComponent.setHealthScore(50);
        userComponentRepository.save(testComponent);

        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);
        Notification first = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId()).orElseThrow();

        // Recalculate 3 times
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Notification current = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId()).orElseThrow();
        assertEquals(first.getId(), current.getId(), "Same state recalculation must retain the existing notification ID without history spam.");
    }

    @Test
    void testWarningReadRepeatedEvaluationNoDuplicate() {
        testComponent.setStatus(ComponentStatus.WARNING);
        testComponent.setHealthScore(50);
        userComponentRepository.save(testComponent);

        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);
        Notification notification = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId()).orElseThrow();

        // User reads notification
        notificationService.markAsRead(testUser.getId(), notification.getId());

        // Recalculate again
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Optional<Notification> active = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId());
        assertTrue(active.isPresent(), "Reading notification must NOT resolve condition or permit duplicate creation.");
        assertEquals(notification.getId(), active.get().getId());
        assertTrue(active.get().isRead(), "Read flag should remain true.");
    }

    @Test
    void testWarningToCriticalTransitionResolvesWarningAndCreatesCritical() {
        testComponent.setStatus(ComponentStatus.WARNING);
        userComponentRepository.save(testComponent);
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Notification warningNotif = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId()).orElseThrow();

        // Transition to CRITICAL
        testComponent.setStatus(ComponentStatus.CRITICAL);
        testComponent.setHealthScore(15);
        userComponentRepository.save(testComponent);
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Notification criticalNotif = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId()).orElseThrow();
        assertNotEquals(warningNotif.getId(), criticalNotif.getId());
        assertEquals(NotificationType.COMPONENT_CRITICAL, criticalNotif.getType());

        // Verify old warning notification was resolved
        Notification oldWarning = notificationRepository.findById(warningNotif.getId()).orElseThrow();
        assertNotNull(oldWarning.getResolvedAt(), "Previous warning notification must be resolved.");
    }

    @Test
    void testCriticalToGoodResolvesCritical() {
        testComponent.setStatus(ComponentStatus.CRITICAL);
        testComponent.setHealthScore(10);
        userComponentRepository.save(testComponent);
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Notification criticalNotif = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId()).orElseThrow();

        // Replace component -> status GOOD
        testComponent.setStatus(ComponentStatus.GOOD);
        testComponent.setHealthScore(100);
        userComponentRepository.save(testComponent);
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Optional<Notification> active = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId());
        assertTrue(active.isEmpty(), "GOOD state must resolve active critical condition.");

        Notification resolved = notificationRepository.findById(criticalNotif.getId()).orElseThrow();
        assertNotNull(resolved.getResolvedAt(), "Critical notification must be marked resolved.");
    }

    @Test
    void testCriticalToUnknownResolvesCriticalAndCreatesDataRequired() {
        testComponent.setStatus(ComponentStatus.CRITICAL);
        testComponent.setHealthScore(15);
        userComponentRepository.save(testComponent);
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Notification criticalNotif = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId()).orElseThrow();

        // Status becomes UNKNOWN
        testComponent.setStatus(ComponentStatus.UNKNOWN);
        testComponent.setHealthScore(null);
        userComponentRepository.save(testComponent);
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Notification active = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId()).orElseThrow();
        assertEquals(NotificationType.COMPONENT_DATA_REQUIRED, active.getType());

        Notification oldCritical = notificationRepository.findById(criticalNotif.getId()).orElseThrow();
        assertNotNull(oldCritical.getResolvedAt(), "Previous critical notification must be resolved when state becomes UNKNOWN.");
    }

    @Test
    void testDocumentNullExpiryNoNotification() {
        testDocument.setExpiryDate(null);
        userDocumentRepository.save(testDocument);

        notificationService.evaluateDocumentNotification(testUser.getId(), testVehicle, testDocument);

        Optional<Notification> active = notificationRepository.findActiveDocumentConditionNotification(testUser.getId(), testDocument.getId());
        assertTrue(active.isEmpty(), "NULL expiry date should produce no notification.");
    }

    @Test
    void testDocumentExpiringWithinWarningWindow() {
        testDocument.setExpiryDate(LocalDate.now().plusDays(15));
        userDocumentRepository.save(testDocument);

        notificationService.evaluateDocumentNotification(testUser.getId(), testVehicle, testDocument);

        Optional<Notification> active = notificationRepository.findActiveDocumentConditionNotification(testUser.getId(), testDocument.getId());
        assertTrue(active.isPresent(), "Document expiring in 15 days must produce EXPIRING notification.");
        assertEquals(NotificationType.DOCUMENT_EXPIRING, active.get().getType());
        assertEquals(NotificationSeverity.WARNING, active.get().getSeverity());
    }

    @Test
    void testDocumentExpiredPastDate() {
        testDocument.setExpiryDate(LocalDate.now().minusDays(2));
        userDocumentRepository.save(testDocument);

        notificationService.evaluateDocumentNotification(testUser.getId(), testVehicle, testDocument);

        Optional<Notification> active = notificationRepository.findActiveDocumentConditionNotification(testUser.getId(), testDocument.getId());
        assertTrue(active.isPresent(), "Expired document must produce EXPIRED notification.");
        assertEquals(NotificationType.DOCUMENT_EXPIRED, active.get().getType());
        assertEquals(NotificationSeverity.DANGER, active.get().getSeverity());
    }

    @Test
    void testDocumentExpiringToExpiredTransition() {
        testDocument.setExpiryDate(LocalDate.now().plusDays(5));
        userDocumentRepository.save(testDocument);
        notificationService.evaluateDocumentNotification(testUser.getId(), testVehicle, testDocument);

        Notification expiringNotif = notificationRepository.findActiveDocumentConditionNotification(testUser.getId(), testDocument.getId()).orElseThrow();

        // Time moves past expiry
        testDocument.setExpiryDate(LocalDate.now().minusDays(1));
        userDocumentRepository.save(testDocument);
        notificationService.evaluateDocumentNotification(testUser.getId(), testVehicle, testDocument);

        Notification expiredNotif = notificationRepository.findActiveDocumentConditionNotification(testUser.getId(), testDocument.getId()).orElseThrow();
        assertEquals(NotificationType.DOCUMENT_EXPIRED, expiredNotif.getType());

        Notification oldExpiring = notificationRepository.findById(expiringNotif.getId()).orElseThrow();
        assertNotNull(oldExpiring.getResolvedAt(), "Previous EXPIRING notification must be resolved in history.");
    }

    @Test
    void testDocumentExpiryBecomesNullResolvesStaleNotifications() {
        testDocument.setExpiryDate(LocalDate.now().plusDays(10));
        userDocumentRepository.save(testDocument);
        notificationService.evaluateDocumentNotification(testUser.getId(), testVehicle, testDocument);

        Notification expiringNotif = notificationRepository.findActiveDocumentConditionNotification(testUser.getId(), testDocument.getId()).orElseThrow();

        // Expiry date is removed
        testDocument.setExpiryDate(null);
        userDocumentRepository.save(testDocument);
        notificationService.evaluateDocumentNotification(testUser.getId(), testVehicle, testDocument);

        Optional<Notification> active = notificationRepository.findActiveDocumentConditionNotification(testUser.getId(), testDocument.getId());
        assertTrue(active.isEmpty(), "Active notification must be resolved when expiry date becomes NULL.");

        Notification resolved = notificationRepository.findById(expiringNotif.getId()).orElseThrow();
        assertNotNull(resolved.getResolvedAt());
    }

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @Test
    void testDocumentDeleteResolvesActiveNotificationsBeforeDelete() {
        testDocument.setExpiryDate(LocalDate.now().plusDays(10));
        userDocumentRepository.save(testDocument);
        notificationService.evaluateDocumentNotification(testUser.getId(), testVehicle, testDocument);

        Notification expiringNotif = notificationRepository.findActiveDocumentConditionNotification(testUser.getId(), testDocument.getId()).orElseThrow();

        // Resolve before delete
        notificationService.resolveDocumentNotificationsBeforeDelete(testUser.getId(), testDocument.getId());
        userDocumentRepository.delete(testDocument);
        entityManager.flush();
        entityManager.clear();

        Notification resolved = notificationRepository.findById(expiringNotif.getId()).orElseThrow();
        assertNotNull(resolved.getResolvedAt(), "Document active notification must be resolved prior to document deletion.");
        assertNull(resolved.getDocument(), "Document reference should be nullified by ON DELETE SET NULL.");
    }

    @Test
    void testUserSecurityIsolation() {
        testComponent.setStatus(ComponentStatus.CRITICAL);
        userComponentRepository.save(testComponent);
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        Notification notif = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId()).orElseThrow();

        // User B attempts to mark User A's notification read
        assertThrows(AccessDeniedException.class, () -> {
            notificationService.markAsRead(testUserB.getId(), notif.getId());
        }, "User B must not be permitted to read or alter User A's notifications.");
    }

    @Test
    void testMarkAllAsReadOnlyAffectsUserNotifications() {
        testComponent.setStatus(ComponentStatus.CRITICAL);
        userComponentRepository.save(testComponent);
        notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);

        notificationService.markAllAsRead(testUser.getId());

        Notification notif = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId()).orElseThrow();
        assertTrue(notif.isRead());
    }
}
