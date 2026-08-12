package com.autocare.backend.vehicle;

import com.autocare.backend.auth.dto.LoginRequest;
import com.autocare.backend.auth.dto.MobileAuthResponse;
import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.Role;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.repository.RoleRepository;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.auth.repository.UserSessionRepository;
import com.autocare.backend.vehicle.dto.*;
import com.autocare.backend.vehicle.entity.Brand;
import com.autocare.backend.vehicle.entity.Model;
import com.autocare.backend.vehicle.entity.enums.*;
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

import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class SaasVehicleIntegrationTest {

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

        // Setup role & user
        createTestUser("alex@example.com", "Alex Owner");
        tokenUser1 = obtainMobileToken("alex@example.com");

        // Setup Brand & Model
        brand = new Brand();
        brand.setName("Toyota");
        brand.setLogoUrl("https://logo.png");
        brand = brandRepository.save(brand);

        model = new Model();
        model.setName("Camry");
        model.setBrand(brand);
        model = modelRepository.save(model);

        // Mock GeminiClient Response with documents in specifications JSON
        GeminiVehicleProfileResponse mockProfile = new GeminiVehicleProfileResponse();
        mockProfile.setSpecifications(new HashMap<>(Map.of("horsepower", 203)));
        
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

        GeminiVehicleProfileResponse.DocumentDto docDto = new GeminiVehicleProfileResponse.DocumentDto();
        docDto.setTitle("Owner's Manual");
        docDto.setNotes("Manufacturer instructions");
        mockProfile.setDocuments(List.of(docDto));

        Mockito.when(geminiClient.fetchProfile(anyString())).thenReturn(mockProfile);
    }

    private void createTestUser(String email, String name) {
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
        userRepository.save(user);
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
    @DisplayName("Verify BRAND_NEW vehicle digital twin AI-prefilling behavior")
    void testBrandNewPrefilling() throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setBrandId(brand.getId());
        request.setModelId(model.getId());
        request.setYear(2025);
        request.setTransmission(Transmission.AUTOMATIC);
        request.setFuelType(FuelType.GASOLINE);
        request.setPurchaseCondition(PurchaseCondition.BRAND_NEW);
        request.setCurrentMileage(0);
        request.setMileageUnit(MileageUnit.KM);
        request.setLicensePlate("NEWCAR");
        request.setVin("1YJ1E1EB8FF000001");

        UUID vehicleId = onboardVehicle(request, tokenUser1);

        mockMvc.perform(get("/api/v1/vehicles/" + vehicleId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components").isArray())
                .andExpect(jsonPath("$.components[0].name").value("Engine Oil Filter"))
                .andExpect(jsonPath("$.components[0].status").value("NEW"))
                .andExpect(jsonPath("$.components[0].healthScore").value(100))
                .andExpect(jsonPath("$.components[0].origin").value("FACTORY"))
                .andExpect(jsonPath("$.documents").isArray())
                .andExpect(jsonPath("$.documents[0].title").value("Owner's Manual"));
    }

    @Test
    @DisplayName("Verify USED vehicle digital twin skips AI components/documents prefilling")
    void testUsedSkipsPrefilling() throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setBrandId(brand.getId());
        request.setModelId(model.getId());
        request.setYear(2025);
        request.setTransmission(Transmission.AUTOMATIC);
        request.setFuelType(FuelType.GASOLINE);
        request.setPurchaseCondition(PurchaseCondition.USED);
        request.setCurrentMileage(50000);
        request.setMileageUnit(MileageUnit.KM);
        request.setLicensePlate("USEDCAR");
        request.setVin("1YJ1E1EB8FF000002");
        request.setInitialComponentHealths(Map.of("engineOil", "NEEDING_ATTENTION"));

        UUID vehicleId = onboardVehicle(request, tokenUser1);

        mockMvc.perform(get("/api/v1/vehicles/" + vehicleId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components").isArray())
                .andExpect(jsonPath("$.components[0].name").value("Engine Oil Filter"))
                .andExpect(jsonPath("$.components[0].status").value("WARNING"))
                .andExpect(jsonPath("$.documents").isArray());
    }

    @Test
    @DisplayName("Verify CRUD operations for parts (components) manually")
    void testComponentCRUD() throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setBrandId(brand.getId());
        request.setModelId(model.getId());
        request.setYear(2025);
        request.setTransmission(Transmission.AUTOMATIC);
        request.setFuelType(FuelType.GASOLINE);
        request.setPurchaseCondition(PurchaseCondition.USED);
        request.setCurrentMileage(50000);
        request.setMileageUnit(MileageUnit.KM);
        request.setLicensePlate("CRUDCAR");

        UUID vehicleId = onboardVehicle(request, tokenUser1);

        // 1. Add component manually
        CreateComponentRequest createComp = new CreateComponentRequest();
        createComp.setCategory(ComponentCategory.BRAKES);
        createComp.setName("Rear Brake Pads");
        createComp.setPartNumber("BP-999");
        createComp.setSpecifications("Ceramic");

        MvcResult addResult = mockMvc.perform(post("/api/v1/vehicles/" + vehicleId + "/components")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createComp)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Rear Brake Pads"))
                .andExpect(jsonPath("$.custom").value(true))
                .andReturn();

        UUID componentId = UUID.fromString(objectMapper.readTree(addResult.getResponse().getContentAsString()).get("id").asText());

        // 2. Update component manually
        UpdateComponentRequest updateComp = new UpdateComponentRequest();
        updateComp.setCategory(ComponentCategory.BRAKES);
        updateComp.setName("Rear Brake Pads v2");
        updateComp.setPartNumber("BP-999-v2");

        mockMvc.perform(put("/api/v1/vehicles/" + vehicleId + "/components/" + componentId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateComp)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Rear Brake Pads v2"))
                .andExpect(jsonPath("$.partNumber").value("BP-999-v2"));

        // 3. Delete component manually
        mockMvc.perform(delete("/api/v1/vehicles/" + vehicleId + "/components/" + componentId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(status().isNoContent());

        // Verify component is gone
        mockMvc.perform(get("/api/v1/vehicles/" + vehicleId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(jsonPath("$.components[?(@.custom == true)]").isEmpty());
    }

    @Test
    @DisplayName("Verify CRUD operations for documents manually")
    void testDocumentCRUD() throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setBrandId(brand.getId());
        request.setModelId(model.getId());
        request.setYear(2025);
        request.setTransmission(Transmission.AUTOMATIC);
        request.setFuelType(FuelType.GASOLINE);
        request.setPurchaseCondition(PurchaseCondition.USED);
        request.setCurrentMileage(50000);
        request.setMileageUnit(MileageUnit.KM);
        request.setLicensePlate("DOCAR");

        UUID vehicleId = onboardVehicle(request, tokenUser1);

        // 1. Add document manually
        CreateDocumentRequest createDoc = new CreateDocumentRequest();
        createDoc.setTitle("Registration");
        createDoc.setUrl("https://example.com/doc.pdf");
        createDoc.setNotes("Car registration");

        MvcResult addResult = mockMvc.perform(post("/api/v1/vehicles/" + vehicleId + "/documents")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDoc)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Registration"))
                .andReturn();

        UUID docId = UUID.fromString(objectMapper.readTree(addResult.getResponse().getContentAsString()).get("id").asText());

        // 2. Update document manually
        UpdateDocumentRequest updateDoc = new UpdateDocumentRequest();
        updateDoc.setTitle("Registration v2");
        updateDoc.setUrl("https://example.com/doc-v2.pdf");

        mockMvc.perform(put("/api/v1/vehicles/" + vehicleId + "/documents/" + docId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDoc)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Registration v2"));

        // 3. Delete document manually
        mockMvc.perform(delete("/api/v1/vehicles/" + vehicleId + "/documents/" + docId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(status().isNoContent());

        // Verify custom document is gone
        mockMvc.perform(get("/api/v1/vehicles/" + vehicleId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser1))
                .andExpect(jsonPath("$.documents[?(@.title == 'Registration v2')]").doesNotExist());
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

        // Poll job status
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
            throw new AssertionError("Job failed or timed out.");
        }

        String vehicleIdStr = objectMapper.readTree(responseStr).get("result").get("vehicleId").asText();
        return UUID.fromString(vehicleIdStr);
    }
}
