package com.autocare.backend.user;

import com.autocare.backend.auth.dto.ChangePasswordRequest;
import com.autocare.backend.auth.dto.LoginRequest;
import com.autocare.backend.auth.dto.MobileAuthResponse;
import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.Role;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.repository.RoleRepository;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.user.dto.request.DeactivateAccountRequest;
import com.autocare.backend.user.dto.request.UpdatePreferencesRequest;
import com.autocare.backend.user.dto.request.UpdateProfileRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
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
class UserProfileIntegrationTest {

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

    private User testUser;
    private String jwtToken;
    private String userEmail;

    @BeforeEach
    void setUp() throws Exception {
        userEmail = "profile.test." + UUID.randomUUID() + "@autocare.ai";

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_USER");
                    return roleRepository.save(role);
                });

        testUser = new User();
        testUser.setEmail(userEmail);
        testUser.setPasswordHash(passwordEncoder.encode("Password123!"));
        testUser.setFullName("Profile Test User");
        testUser.setPhoneNumber("+1202555" + (1000 + (int)(Math.random() * 8999)));
        testUser.setStatus(AccountStatus.ACTIVE);
        testUser.setRoles(Set.of(userRole));
        testUser = userRepository.save(testUser);

        // Obtain JWT via Login Endpoint
        LoginRequest loginRequest = new LoginRequest(userEmail, "Password123!", false, UUID.randomUUID());
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/mobile/login")
                        .header("User-Agent", "Test-Agent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        MobileAuthResponse authResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(),
                MobileAuthResponse.class
        );
        jwtToken = authResponse.accessToken();
    }

    @Test
    @DisplayName("GET /api/v1/users/me — Successfully retrieves authenticated profile")
    void testGetProfile_Success() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId().toString()))
                .andExpect(jsonPath("$.email").value(userEmail))
                .andExpect(jsonPath("$.fullName").value("Profile Test User"))
                .andExpect(jsonPath("$.preferredLanguage").value("en"))
                .andExpect(jsonPath("$.preferredCurrency").value("USD"))
                .andExpect(jsonPath("$.preferredDistanceUnit").value("KM"))
                .andExpect(jsonPath("$.pushNotificationsEnabled").value(true))
                .andExpect(jsonPath("$.emailNotificationsEnabled").value(true));
    }

    @Test
    @DisplayName("PUT /api/v1/users/me — Successfully updates fullName and phoneNumber")
    void testUpdateProfile_Success() throws Exception {
        String newPhone = "+1202555" + (1000 + (int)(Math.random() * 8999));
        UpdateProfileRequest request = new UpdateProfileRequest("Updated Name", newPhone);

        mockMvc.perform(put("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"))
                .andExpect(jsonPath("$.phoneNumber").value(newPhone))
                .andExpect(jsonPath("$.isProfileCompleted").value(true));

        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getFullName()).isEqualTo("Updated Name");
        assertThat(updatedUser.getPhoneNumber()).isEqualTo(newPhone);
        assertThat(updatedUser.isProfileCompleted()).isTrue();
    }

    @Test
    @DisplayName("PUT /api/v1/users/me — Returns 409 Conflict when phone number belongs to another active user")
    void testUpdateProfile_DuplicatePhoneNumber_Returns409() throws Exception {
        Role userRole = roleRepository.findByName("ROLE_USER").orElseThrow();
        User secondUser = new User();
        secondUser.setEmail("second.user." + UUID.randomUUID() + "@autocare.ai");
        secondUser.setPasswordHash(passwordEncoder.encode("Password123!"));
        secondUser.setFullName("Second User");
        secondUser.setStatus(AccountStatus.ACTIVE);
        secondUser.setRoles(Set.of(userRole));
        String duplicatePhone = "+12025559999";
        secondUser.setPhoneNumber(duplicatePhone);
        userRepository.save(secondUser);

        UpdateProfileRequest request = new UpdateProfileRequest("Profile Test User", duplicatePhone);

        mockMvc.perform(put("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("The phone number '" + duplicatePhone + "' is already in use by another active account."));
    }

    @Test
    @DisplayName("PUT /api/v1/users/me/preferences — Successfully updates localization and notification preferences")
    void testUpdatePreferences_Success() throws Exception {
        UpdatePreferencesRequest request = new UpdatePreferencesRequest("FR", "EUR", "MILES", false, true);

        mockMvc.perform(put("/api/v1/users/me/preferences")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferredLanguage").value("FR"))
                .andExpect(jsonPath("$.preferredCurrency").value("EUR"))
                .andExpect(jsonPath("$.preferredDistanceUnit").value("MILES"))
                .andExpect(jsonPath("$.pushNotificationsEnabled").value(false))
                .andExpect(jsonPath("$.emailNotificationsEnabled").value(true));

        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getPreferredLanguage()).isEqualTo("FR");
        assertThat(updatedUser.getPreferredCurrency()).isEqualTo("EUR");
        assertThat(updatedUser.getPreferredDistanceUnit()).isEqualTo("MILES");
        assertThat(updatedUser.isPushNotificationsEnabled()).isFalse();
        assertThat(updatedUser.isEmailNotificationsEnabled()).isTrue();
    }

    @Test
    @DisplayName("POST /api/v1/users/me/avatar — Successfully uploads valid JPEG avatar image")
    void testUploadAvatar_Success() throws Exception {
        byte[] validJpegBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0x10, 0x4A, 0x46, 0x49, 0x46, 0, 0};
        MockMultipartFile avatarFile = new MockMultipartFile(
                "file",
                "test-avatar.jpg",
                "image/jpeg",
                validJpegBytes
        );

        mockMvc.perform(multipart("/api/v1/users/me/avatar")
                        .file(avatarFile)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").exists());

        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getAvatarUrl()).isNotNull();
        assertThat(updatedUser.getAvatarUrl()).contains("/uploads/avatars/");
    }

    @Test
    @DisplayName("POST /api/v1/users/me/avatar — Returns 400 Bad Request when uploading non-image with spoofed extension")
    void testUploadAvatar_InvalidMagicBytes_Returns400() throws Exception {
        byte[] invalidBytes = "This is a plain text file spoofed as JPEG".getBytes();
        MockMultipartFile fakeJpegFile = new MockMultipartFile(
                "file",
                "malicious.jpg",
                "image/jpeg",
                invalidBytes
        );

        mockMvc.perform(multipart("/api/v1/users/me/avatar")
                        .file(fakeJpegFile)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Security check failed: File header magic bytes do not match a valid JPEG, PNG, or WEBP image."));
    }

    @Test
    @DisplayName("DELETE /api/v1/users/me/avatar — Successfully deletes avatar and resets avatarUrl")
    void testDeleteAvatar_Success() throws Exception {
        testUser.setAvatarUrl("http://localhost:8080/uploads/avatars/existing.jpg");
        userRepository.save(testUser);

        mockMvc.perform(delete("/api/v1/users/me/avatar")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getAvatarUrl()).isNull();
    }

    @Test
    @DisplayName("PUT /api/v1/users/me/password — Successfully changes password with valid current password")
    void testChangePassword_Success() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest("Password123!", "NewSecretPass123!");

        mockMvc.perform(put("/api/v1/users/me/password")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(passwordEncoder.matches("NewSecretPass123!", updatedUser.getPasswordHash())).isTrue();
    }

    @Test
    @DisplayName("DELETE /api/v1/users/me — Successfully deactivates account and sets SUSPENDED status")
    void testDeactivateAccount_Success() throws Exception {
        DeactivateAccountRequest request = new DeactivateAccountRequest("Password123!");

        mockMvc.perform(delete("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        assertThat(userRepository.findById(testUser.getId())).isEmpty();
    }
}
