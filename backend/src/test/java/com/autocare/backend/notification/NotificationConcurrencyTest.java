package com.autocare.backend.notification;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.notification.entity.Notification;
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

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class NotificationConcurrencyTest {

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
    private UserVehicle testVehicle;
    private UserComponent testComponent;
    private UserDocument testDocument;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setFullName("Concurrent User");
        testUser.setEmail("concurrent_" + UUID.randomUUID() + "@autocare.com");
        testUser.setPasswordHash("$2a$10$7EqJtq986P4m0yN84b2pce3N/5yB.z1a4Lw4Lw4Lw4Lw4Lw4Lw4Lw");
        testUser = userRepository.save(testUser);

        Brand brand = new Brand();
        brand.setName("Honda_" + UUID.randomUUID());
        brand.setLogoUrl("https://logo.png");
        brand = brandRepository.save(brand);

        Model model = new Model();
        model.setName("Civic_" + UUID.randomUUID());
        model.setBrand(brand);
        model = modelRepository.save(model);

        VehicleTemplate template = new VehicleTemplate();
        template.setBrand(brand);
        template.setModel(model);
        template.setYear(2023);
        template.setTrimConfiguration("EX_" + UUID.randomUUID());
        template.setSpecifications(java.util.Map.of("engine", "1.5T"));
        template = vehicleTemplateRepository.save(template);

        testVehicle = new UserVehicle();
        testVehicle.setUser(testUser);
        testVehicle.setTemplate(template);
        testVehicle.setNickname("Concurrent Wagon");
        testVehicle = userVehicleRepository.save(testVehicle);

        testComponent = new UserComponent();
        testComponent.setUserVehicle(testVehicle);
        testComponent.setCategory(ComponentCategory.ENGINE);
        testComponent.setName("Engine Oil");
        testComponent.setStatus(ComponentStatus.CRITICAL);
        testComponent.setHealthScore(15);
        testComponent = userComponentRepository.save(testComponent);

        testDocument = new UserDocument();
        testDocument.setUserVehicle(testVehicle);
        testDocument.setTitle("Registration Certificate");
        testDocument.setUrl("https://autocare.com/docs/reg.pdf");
        testDocument.setExpiryDate(LocalDate.now().plusDays(5));
        testDocument = userDocumentRepository.save(testDocument);
    }

    @Test
    void testConcurrentComponentEvaluationPessimisticLocking() throws InterruptedException {
        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    notificationService.evaluateComponentNotification(testUser.getId(), testVehicle, testComponent);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        latch.countDown();
        executor.shutdown();
        executor.awaitTermination(10, java.util.concurrent.TimeUnit.SECONDS);

        assertEquals(threads, successCount.get(), "Both parallel evaluation threads must execute cleanly without deadlock or rollback exceptions.");

        Optional<Notification> active = notificationRepository.findActiveComponentConditionNotification(testUser.getId(), testComponent.getId());
        assertTrue(active.isPresent());
        assertEquals(NotificationType.COMPONENT_CRITICAL, active.get().getType());
    }

    @Test
    void testConcurrentDocumentEvaluationPessimisticLocking() throws InterruptedException {
        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    notificationService.evaluateDocumentNotification(testUser.getId(), testVehicle, testDocument);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        latch.countDown();
        executor.shutdown();
        executor.awaitTermination(10, java.util.concurrent.TimeUnit.SECONDS);

        assertEquals(threads, successCount.get());

        Optional<Notification> active = notificationRepository.findActiveDocumentConditionNotification(testUser.getId(), testDocument.getId());
        assertTrue(active.isPresent());
        assertEquals(NotificationType.DOCUMENT_EXPIRING, active.get().getType());
    }
}
