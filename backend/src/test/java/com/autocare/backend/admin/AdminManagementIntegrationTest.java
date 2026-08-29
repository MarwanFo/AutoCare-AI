package com.autocare.backend.admin;

import com.autocare.backend.admin.dto.AdminUpdateUserRoleRequest;
import com.autocare.backend.admin.dto.AdminUpdateUserStatusRequest;
import com.autocare.backend.auth.dto.LoginRequest;
import com.autocare.backend.auth.dto.MobileAuthResponse;
import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.Role;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.repository.RoleRepository;
import com.autocare.backend.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class AdminManagementIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;
    private User normalUser;
    private String adminToken;
    private String normalUserToken;

    @BeforeEach
    void setUp() throws Exception {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ROLE_ADMIN");
                    return roleRepository.save(r);
                });

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ROLE_USER");
                    return roleRepository.save(r);
                });

        // 1. Create Admin
        String adminEmail = "admin_" + UUID.randomUUID() + "@autocare.com";
        adminUser = new User();
        adminUser.setEmail(adminEmail);
        adminUser.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
        adminUser.setFullName("Super Admin");
        adminUser.setPhoneNumber("+1" + (System.nanoTime() % 9000000000L + 1000000000L));
        adminUser.setStatus(AccountStatus.ACTIVE);
        adminUser.setRoles(Set.of(adminRole, userRole));
        adminUser = userRepository.save(adminUser);

        // 2. Create Normal User
        String normalEmail = "user_" + UUID.randomUUID() + "@autocare.com";
        normalUser = new User();
        normalUser.setEmail(normalEmail);
        normalUser.setPasswordHash(passwordEncoder.encode("UserPass123!"));
        normalUser.setFullName("Standard User");
        normalUser.setPhoneNumber("+1" + ((System.nanoTime() + 1000) % 9000000000L + 1000000000L));
        normalUser.setStatus(AccountStatus.ACTIVE);
        normalUser.setRoles(Set.of(userRole));
        normalUser = userRepository.save(normalUser);

        // 3. Login Admin
        LoginRequest adminLogin = new LoginRequest(adminEmail, "AdminPass123!", false, UUID.randomUUID());
        MvcResult adminRes = mockMvc.perform(post("/api/v1/auth/mobile/login")
                        .header("User-Agent", "Admin-Agent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        MobileAuthResponse adminAuth = objectMapper.readValue(adminRes.getResponse().getContentAsString(), MobileAuthResponse.class);
        adminToken = adminAuth.accessToken();

        // 4. Login Normal User
        LoginRequest userLogin = new LoginRequest(normalEmail, "UserPass123!", false, UUID.randomUUID());
        MvcResult userRes = mockMvc.perform(post("/api/v1/auth/mobile/login")
                        .header("User-Agent", "User-Agent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userLogin)))
                .andExpect(status().isOk())
                .andReturn();
        MobileAuthResponse userAuth = objectMapper.readValue(userRes.getResponse().getContentAsString(), MobileAuthResponse.class);
        normalUserToken = userAuth.accessToken();
    }

    @Test
    @DisplayName("Admin - Get Platform Stats Successfully")
    void testGetPlatformStats() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.activeUsers").isNumber())
                .andExpect(jsonPath("$.totalVehicles").isNumber())
                .andExpect(jsonPath("$.totalJobs").isNumber());
    }

    @Test
    @DisplayName("Non-Admin - Access Denied to Admin Stats (403)")
    void testNonAdminAccessDeniedToStats() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + normalUserToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin - List Users with Pagination and Query")
    void testGetUsersList() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .param("query", normalUser.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").value(normalUser.getEmail()))
                .andExpect(jsonPath("$.content[0].fullName").value(normalUser.getFullName()))
                .andExpect(jsonPath("$.content[0].status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Admin - Suspend and Reactivate User Account")
    void testSuspendAndReactivateUser() throws Exception {
        // Suspend
        AdminUpdateUserStatusRequest suspendReq = new AdminUpdateUserStatusRequest();
        suspendReq.setStatus(AccountStatus.SUSPENDED);

        mockMvc.perform(patch("/api/v1/admin/users/" + normalUser.getId() + "/status")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suspendReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));

        User suspended = userRepository.findById(normalUser.getId()).orElseThrow();
        assertThat(suspended.getStatus()).isEqualTo(AccountStatus.SUSPENDED);

        // Reactivate
        AdminUpdateUserStatusRequest reactivateReq = new AdminUpdateUserStatusRequest();
        reactivateReq.setStatus(AccountStatus.ACTIVE);

        mockMvc.perform(patch("/api/v1/admin/users/" + normalUser.getId() + "/status")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reactivateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Admin - Update User Role")
    void testUpdateUserRole() throws Exception {
        AdminUpdateUserRoleRequest roleReq = new AdminUpdateUserRoleRequest();
        roleReq.setRoleName("ROLE_ADMIN");

        mockMvc.perform(patch("/api/v1/admin/users/" + normalUser.getId() + "/role")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles").isArray());
    }

    @Test
    @DisplayName("Admin - List Background Jobs")
    void testGetJobsList() throws Exception {
        mockMvc.perform(get("/api/v1/admin/jobs")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("Admin - List Global Fleet Vehicles")
    void testGetVehiclesList() throws Exception {
        mockMvc.perform(get("/api/v1/admin/vehicles")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}
