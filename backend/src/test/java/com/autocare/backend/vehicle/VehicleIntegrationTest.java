package com.autocare.backend.vehicle;

import com.autocare.backend.auth.dto.LoginRequest;
import com.autocare.backend.auth.dto.MobileAuthResponse;
import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.Role;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.repository.RoleRepository;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.auth.repository.UserSessionRepository;
import com.autocare.backend.vehicle.dto.CreateVehicleRequest;
import com.autocare.backend.vehicle.dto.GeminiVehicleProfileResponse;
import com.autocare.backend.vehicle.entity.Brand;
import com.autocare.backend.vehicle.entity.Model;
import com.autocare.backend.vehicle.entity.enums.FuelType;
import com.autocare.backend.vehicle.entity.enums.MileageUnit;
import com.autocare.backend.vehicle.entity.enums.PurchaseCondition;
import com.autocare.backend.vehicle.entity.enums.Transmission;
import com.autocare.backend.vehicle.repository.BrandRepository;
import com.autocare.backend.vehicle.repository.ModelRepository;
import com.autocare.backend.vehicle.repository.UserVehicleRepository;
import com.autocare.backend.vehicle.repository.VehicleTemplateRepository;
import com.autocare.backend.vehicle.service.GeminiClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class VehicleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ModelRepository modelRepository;

    @Autowired
    private UserVehicleRepository userVehicleRepository;

    @Autowired
    private VehicleTemplateRepository vehicleTemplateRepository;

    @MockitoBean
    private GeminiClient geminiClient;

    private String tokenUser1;
    private String tokenUser2;

    private Brand brand;
    private Model model;

    @BeforeEach
    void setUp() throws Exception {
        userVehicleRepository.deleteAll();
        vehicleTemplateRepository.deleteAll();
        modelRepository.deleteAll();
        brandRepository.deleteAll();
        userSessionRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Setup roles & users
        createTestUser("alex@example.com", "Alex Owner");
        createTestUser("bob@example.com", "Bob Imposter");

        tokenUser1 = obtainMobileToken("alex@example.com");
        tokenUser2 = obtainMobileToken("bob@example.com");

        // 2. Setup Brand & Model
        brand = new Brand();
        brand.setName("Toyota");
        brand.setLogoUrl("https://logo.png");
        brand = brandRepository.save(brand);

        model = new Model();
        model.setName("Camry");
        model.setBrand(brand);
        model = modelRepository.save(model);

        // 3. Mock GeminiClient Response
        GeminiVehicleProfileResponse mockProfile = new GeminiVehicleProfileResponse();
        mockProfile.setSpecifications(Map.of("horsepower", 203));
        
        GeminiVehicleProfileResponse.ComponentDto compDto = new GeminiVehicleProfileResponse.ComponentDto();
        compDto.setCategory("Engine");
        compDto.setName("Engine Oil Filter");
        compDto.setStandardPartNumber("TOY-12345");
        compDto.setStandardSpecifications("0W-20");
        mockProfile.setComponents(List.of(compDto));

        GeminiVehicleProfileResponse.IntervalDto intDto = new GeminiVehicleProfileResponse.IntervalDto();
        intDto.setTitle("Oil Change");
        intDto.setDescription("Replace engine oil and filter");
        intDto.setIntervalMileage(10000);
        intDto.setIntervalMonths(6);
        intDto.setInspectionOnly(false);
        mockProfile.setIntervals(List.of(intDto));

        Mockito.when(geminiClient.fetchProfile(anyString())).thenReturn(mockProfile);
    }

    private User createTestUser(String email, String name) {
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ROLE_USER");
                    r.setPermissions(Collections.emptySet());
                    return roleRepository.save(r);
                });

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("Password123!"));
        user.setFullName(name);
        user.setRoles(Collections.singleton(userRole));
        user.setStatus(AccountStatus.ACTIVE);
        return userRepository.save(user);
    }

    private String obtainMobileToken(String email) throws Exception {
        LoginRequest loginRequest = new LoginRequest(email, "Password123!", true, UUID.randomUUID());
        MvcResult result = mockMvc.perform(post("/api/v1/auth/mobile/login")
                        .header("User-Agent", "Test-Agent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        MobileAuthResponse loginResponse = objectMapper.readValue(responseStr, MobileAuthResponse.class);
        return loginResponse.accessToken();
    }

    @Test
    @DisplayName("JWT Authentication security protection check")
    void testAuthMissingToken() throws Exception {
        mockMvc.perform(get("/api/v1/vehicles"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Successfully onboard vehicle (with Gemini generation and template cloning)")
    void testOnboardVehicleSuccess() throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setBrandId(brand.getId());
        request.setModelId(model.getId());
        request.setYear(2025);
        request.setTrimConfiguration("SE");
        request.setTransmission(Transmission.AUTOMATIC);
        request.setFuelType(FuelType.GASOLINE);
        request.setColor("Super White");
        request.setLicensePlate("CAMRY25");
        request.setVin("1YJ1E1EB8FF123456");
        request.setCurrentMileage(5000);
        request.setMileageUnit(MileageUnit.KM);
        request.setPrimary(true);
        request.setPurchaseCondition(PurchaseCondition.USED);

        UUID vehicleId = onboardVehicle(request, tokenUser1);

        mockMvc.perform(get("/api/v1/vehicles/" + vehicleId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(vehicleId.toString()))
                .andExpect(jsonPath("$.brandName").value("Toyota"))
                .andExpect(jsonPath("$.modelName").value("Camry"))
                .andExpect(jsonPath("$.licensePlate").value("CAMRY25"))
                .andExpect(jsonPath("$.primary").value(true))
                .andExpect(jsonPath("$.components").isArray())
                .andExpect(jsonPath("$.components[0].name").value("Engine Oil Filter"))
                .andExpect(jsonPath("$.intervals[0].title").value("Oil Change"));

        // Verify template was created
        assertThat(vehicleTemplateRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("Validate duplicate VIN registration returns 409 Conflict")
    void testOnboardDuplicateVinConflict() throws Exception {
        CreateVehicleRequest request1 = new CreateVehicleRequest();
        request1.setBrandId(brand.getId());
        request1.setModelId(model.getId());
        request1.setYear(2025);
        request1.setTransmission(Transmission.AUTOMATIC);
        request1.setFuelType(FuelType.GASOLINE);
        request1.setVin("1YJ1E1EB8FF123456");
        request1.setCurrentMileage(100);
        request1.setMileageUnit(MileageUnit.KM);
        request1.setPurchaseCondition(PurchaseCondition.USED);

        onboardVehicle(request1, tokenUser1);

        // Same VIN under second request -> expect 409 Conflict
        CreateVehicleRequest request2 = new CreateVehicleRequest();
        request2.setBrandId(brand.getId());
        request2.setModelId(model.getId());
        request2.setYear(2025);
        request2.setTransmission(Transmission.AUTOMATIC);
        request2.setFuelType(FuelType.GASOLINE);
        request2.setVin("1YJ1E1EB8FF123456"); // duplicate
        request2.setCurrentMileage(200);
        request2.setMileageUnit(MileageUnit.KM);
        request2.setPurchaseCondition(PurchaseCondition.USED);

        mockMvc.perform(post("/api/v1/vehicles")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Validate duplicate License Plate returns 409 Conflict")
    void testOnboardDuplicateLicensePlateConflict() throws Exception {
        CreateVehicleRequest request1 = new CreateVehicleRequest();
        request1.setBrandId(brand.getId());
        request1.setModelId(model.getId());
        request1.setYear(2025);
        request1.setTransmission(Transmission.AUTOMATIC);
        request1.setFuelType(FuelType.GASOLINE);
        request1.setLicensePlate("PLATE123");
        request1.setCurrentMileage(100);
        request1.setMileageUnit(MileageUnit.KM);
        request1.setPurchaseCondition(PurchaseCondition.USED);

        onboardVehicle(request1, tokenUser1);

        // Same License Plate -> expect 409 Conflict
        CreateVehicleRequest request2 = new CreateVehicleRequest();
        request2.setBrandId(brand.getId());
        request2.setModelId(model.getId());
        request2.setYear(2025);
        request2.setTransmission(Transmission.AUTOMATIC);
        request2.setFuelType(FuelType.GASOLINE);
        request2.setLicensePlate("plate123"); // Case insensitive check
        request2.setCurrentMileage(200);
        request2.setMileageUnit(MileageUnit.KM);
        request2.setPurchaseCondition(PurchaseCondition.USED);

        mockMvc.perform(post("/api/v1/vehicles")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Verify ownership constraint: Bob cannot read Alex's vehicle")
    void testOwnershipAccessValidation() throws Exception {
        // Alex registers a vehicle
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setBrandId(brand.getId());
        request.setModelId(model.getId());
        request.setYear(2025);
        request.setTransmission(Transmission.AUTOMATIC);
        request.setFuelType(FuelType.GASOLINE);
        request.setCurrentMileage(100);
        request.setMileageUnit(MileageUnit.KM);
        request.setPurchaseCondition(PurchaseCondition.USED);

        UUID vehicleId = onboardVehicle(request, tokenUser1);

        // Bob tries to read Alex's vehicle -> expect 403 Forbidden
        mockMvc.perform(get("/api/v1/vehicles/" + vehicleId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser2))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Verify vehicle update details and primary status swapping")
    void testUpdateAndPrimarySwapping() throws Exception {
        // Create vehicle 1 (Primary)
        CreateVehicleRequest req1 = new CreateVehicleRequest();
        req1.setBrandId(brand.getId());
        req1.setModelId(model.getId());
        req1.setYear(2025);
        req1.setTransmission(Transmission.AUTOMATIC);
        req1.setFuelType(FuelType.GASOLINE);
        req1.setCurrentMileage(100);
        req1.setMileageUnit(MileageUnit.KM);
        req1.setPrimary(true);
        req1.setPurchaseCondition(PurchaseCondition.USED);

        UUID car1Id = onboardVehicle(req1, tokenUser1);

        // Create vehicle 2
        CreateVehicleRequest req2 = new CreateVehicleRequest();
        req2.setBrandId(brand.getId());
        req2.setModelId(model.getId());
        req2.setYear(2025);
        req2.setTransmission(Transmission.AUTOMATIC);
        req2.setFuelType(FuelType.GASOLINE);
        req2.setCurrentMileage(200);
        req2.setMileageUnit(MileageUnit.KM);
        req2.setPrimary(false);
        req2.setPurchaseCondition(PurchaseCondition.USED);

        UUID car2Id = onboardVehicle(req2, tokenUser1);

        // Verify car 1 is primary
        mockMvc.perform(get("/api/v1/vehicles/" + car1Id)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(jsonPath("$.primary").value(true));

        // Switch primary to car 2
        mockMvc.perform(patch("/api/v1/vehicles/" + car2Id + "/primary")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.primary").value(true));

        // Verify car 1 is no longer primary
        mockMvc.perform(get("/api/v1/vehicles/" + car1Id)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(jsonPath("$.primary").value(false));
    }

    @Test
    @DisplayName("Verify soft delete / archiving flow")
    void testArchiveVehicleFlow() throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setBrandId(brand.getId());
        request.setModelId(model.getId());
        request.setYear(2025);
        request.setTransmission(Transmission.AUTOMATIC);
        request.setFuelType(FuelType.GASOLINE);
        request.setCurrentMileage(100);
        request.setMileageUnit(MileageUnit.KM);
        request.setPurchaseCondition(PurchaseCondition.USED);

        UUID vehicleId = onboardVehicle(request, tokenUser1);

        // Perform archive delete request
        mockMvc.perform(delete("/api/v1/vehicles/" + vehicleId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(status().isNoContent());

        // Verify it is archived and not deleted from database
        mockMvc.perform(get("/api/v1/vehicles/" + vehicleId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARCHIVED"));
    }

    private UUID onboardVehicle(CreateVehicleRequest request, String token) throws Exception {
        MvcResult postResult = mockMvc.perform(post("/api/v1/vehicles")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted())
                .andReturn();

        String postResponse = postResult.getResponse().getContentAsString();
        UUID jobId = UUID.fromString(objectMapper.readTree(postResponse).get("id").asText());

        // Poll job status until it is COMPLETED or FAILED
        String status = "PENDING";
        String responseStr = "";
        int retries = 50;
        while (retries > 0 && ("PENDING".equals(status) || "RUNNING".equals(status))) {
            MvcResult jobResult = mockMvc.perform(get("/api/v1/jobs/" + jobId)
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                    .andExpect(status().isOk())
                    .andReturn();
            responseStr = jobResult.getResponse().getContentAsString();
            status = objectMapper.readTree(responseStr).get("status").asText();
            if ("COMPLETED".equals(status) || "FAILED".equals(status)) {
                break;
            }
            Thread.sleep(100);
            retries--;
        }

        if (!"COMPLETED".equals(status)) {
            String errorMsg = objectMapper.readTree(responseStr).path("errorMessage").asText();
            throw new AssertionError("Job failed or timed out. Status: " + status + ", Error: " + errorMsg);
        }

        String vehicleIdStr = objectMapper.readTree(responseStr).get("result").get("vehicleId").asText();
        return UUID.fromString(vehicleIdStr);
    }
}
