package com.autocare.backend.auth;

import com.autocare.backend.auth.dto.*;
import com.autocare.backend.auth.entity.*;
import com.autocare.backend.auth.repository.*;
import com.autocare.backend.auth.service.RefreshTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class AuthenticationIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private AuthTokenRepository authTokenRepository;

    @Autowired
    private PasswordHistoryRepository passwordHistoryRepository;

    @Autowired
    private UserAiCreditsRepository userAiCreditsRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        userSessionRepository.deleteAll();
        authTokenRepository.deleteAll();
        passwordHistoryRepository.deleteAll();
        userAiCreditsRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Successfully register a new user")
    void testRegisterUserSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "john.doe@example.com",
                "Password123!",
                "John Doe",
                "+1234567890"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful. Please check your email to verify your account."));

        Optional<User> userOpt = userRepository.findByEmail("john.doe@example.com");
        assertThat(userOpt).isPresent();
        User user = userOpt.get();
        assertThat(user.getFullName()).isEqualTo("John Doe");
        assertThat(user.getStatus()).isEqualTo(AccountStatus.UNVERIFIED);

        List<AuthToken> tokens = authTokenRepository.findAll();
        assertThat(tokens).hasSize(1);
        assertThat(tokens.get(0).getUser().getId()).isEqualTo(user.getId());
        assertThat(tokens.get(0).getTokenType()).isEqualTo(AuthTokenType.EMAIL_VERIFICATION);
    }

    @Test
    @DisplayName("Verify user email with a valid token")
    void testVerifyEmailSuccess() throws Exception {
        // Seed user and token
        User user = createTestUser("jane.doe@example.com", AccountStatus.UNVERIFIED);
        String rawToken = "secureverificationtokenstring123";
        AuthToken token = createAuthToken(user, AuthTokenType.EMAIL_VERIFICATION, rawToken);

        mockMvc.perform(get("/api/v1/auth/verify-email")
                        .param("token", rawToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email verified successfully. You can now log in."));

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updatedUser.getStatus()).isEqualTo(AccountStatus.ACTIVE);

        AuthToken updatedToken = authTokenRepository.findById(token.getId()).orElseThrow();
        assertThat(updatedToken.getUsedAt()).isNotNull();
    }

    @Test
    @DisplayName("Successful login returns access token and refresh cookie")
    void testLoginSuccess() throws Exception {
        User user = createTestUser("active.user@example.com", AccountStatus.ACTIVE);

        LoginRequest request = new LoginRequest(
                "active.user@example.com",
                "Password123!",
                true,
                UUID.randomUUID()
        );

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("active.user@example.com"))
                .andReturn();

        Cookie refreshCookie = result.getResponse().getCookie("refresh_token");
        assertThat(refreshCookie).isNotNull();
        assertThat(refreshCookie.getValue()).isNotEmpty();
        assertThat(refreshCookie.isHttpOnly()).isTrue();
        assertThat(refreshCookie.getSecure()).isTrue();

        List<UserSession> sessions = userSessionRepository.findAll();
        assertThat(sessions).hasSize(1);
        assertThat(sessions.get(0).getUser().getId()).isEqualTo(user.getId());
    }

    @Test
    @DisplayName("Login with invalid credentials returns 401 Unauthorized")
    void testLoginInvalidCredentials() throws Exception {
        createTestUser("active.user@example.com", AccountStatus.ACTIVE);

        LoginRequest request = new LoginRequest(
                "active.user@example.com",
                "WrongPassword!",
                true,
                UUID.randomUUID()
        );

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    @Test
    @DisplayName("Successfully rotate refresh token")
    void testRefreshTokenRotation() throws Exception {
        User user = createTestUser("active.user@example.com", AccountStatus.ACTIVE);
        String deviceId = UUID.randomUUID().toString();

        LoginRequest request = new LoginRequest(
                "active.user@example.com",
                "Password123!",
                true,
                UUID.fromString(deviceId)
        );

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        Cookie loginCookie = loginResult.getResponse().getCookie("refresh_token");
        assertThat(loginCookie).isNotNull();

        // Perform token refresh rotation
        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(loginCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();

        Cookie rotatedCookie = refreshResult.getResponse().getCookie("refresh_token");
        assertThat(rotatedCookie).isNotNull();
        assertThat(rotatedCookie.getValue()).isNotEqualTo(loginCookie.getValue());
    }

    @Test
    @DisplayName("Successfully logout and clear cookie")
    void testLogoutSuccess() throws Exception {
        User user = createTestUser("active.user@example.com", AccountStatus.ACTIVE);

        LoginRequest loginRequest = new LoginRequest(
                "active.user@example.com",
                "Password123!",
                true,
                UUID.randomUUID()
        );

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String responseStr = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseStr, AuthResponse.class);
        Cookie refreshCookie = loginResult.getResponse().getCookie("refresh_token");

        MvcResult logoutResult = mockMvc.perform(post("/api/v1/auth/logout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authResponse.accessToken())
                        .cookie(refreshCookie))
                .andExpect(status().isNoContent())
                .andReturn();

        Cookie clearedCookie = logoutResult.getResponse().getCookie("refresh_token");
        assertThat(clearedCookie).isNotNull();
        assertThat(clearedCookie.getMaxAge()).isZero();

        List<UserSession> sessions = userSessionRepository.findAll();
        assertThat(sessions).hasSize(1);
        assertThat(sessions.get(0).getRevokedAt()).isNotNull();
    }

    @Test
    @DisplayName("Logout all active devices/sessions")
    void testLogoutAllSuccess() throws Exception {
        User user = createTestUser("active.user@example.com", AccountStatus.ACTIVE);

        LoginRequest loginRequest = new LoginRequest(
                "active.user@example.com",
                "Password123!",
                true,
                UUID.randomUUID()
        );

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String responseStr = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseStr, AuthResponse.class);

        mockMvc.perform(post("/api/v1/auth/logout-all")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authResponse.accessToken()))
                .andExpect(status().isNoContent());

        List<UserSession> sessions = userSessionRepository.findAll();
        assertThat(sessions).isNotEmpty();
        assertThat(sessions.stream().allMatch(s -> s.getRevokedAt() != null)).isTrue();
    }

    @Test
    @DisplayName("Request password recovery token")
    void testForgotPasswordSuccess() throws Exception {
        User user = createTestUser("active.user@example.com", AccountStatus.ACTIVE);

        ForgotPasswordRequest request = new ForgotPasswordRequest("active.user@example.com");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If the email is registered, a password reset link has been sent."));

        List<AuthToken> tokens = authTokenRepository.findAll();
        assertThat(tokens).hasSize(1);
        assertThat(tokens.get(0).getTokenType()).isEqualTo(AuthTokenType.PASSWORD_RESET);
    }

    @Test
    @DisplayName("Reset password using valid recovery token")
    void testResetPasswordSuccess() throws Exception {
        User user = createTestUser("active.user@example.com", AccountStatus.ACTIVE);
        String rawToken = "resettokenstring1234567890abcdef";
        AuthToken token = createAuthToken(user, AuthTokenType.PASSWORD_RESET, rawToken);

        ResetPasswordRequest request = new ResetPasswordRequest(
                rawToken,
                "NewPassword123!"
        );

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password has been reset successfully. You may now login."));

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(passwordEncoder.matches("NewPassword123!", updatedUser.getPasswordHash())).isTrue();
    }

    @Test
    @DisplayName("Change password for authenticated user")
    void testChangePasswordSuccess() throws Exception {
        User user = createTestUser("active.user@example.com", AccountStatus.ACTIVE);

        LoginRequest loginRequest = new LoginRequest(
                "active.user@example.com",
                "Password123!",
                true,
                UUID.randomUUID()
        );

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String responseStr = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseStr, AuthResponse.class);

        ChangePasswordRequest changeRequest = new ChangePasswordRequest(
                "Password123!",
                "BrandNewPassword123!"
        );

        mockMvc.perform(post("/api/v1/auth/change-password")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authResponse.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully."));
    }

    @Test
    @DisplayName("Get current authenticated user profile")
    void testGetCurrentUserMe() throws Exception {
        User user = createTestUser("active.user@example.com", AccountStatus.ACTIVE);

        LoginRequest loginRequest = new LoginRequest(
                "active.user@example.com",
                "Password123!",
                true,
                UUID.randomUUID()
        );

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String responseStr = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseStr, AuthResponse.class);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authResponse.accessToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("active.user@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"));
    }

    @Test
    @DisplayName("List active user sessions")
    void testListActiveSessions() throws Exception {
        User user = createTestUser("active.user@example.com", AccountStatus.ACTIVE);

        LoginRequest loginRequest = new LoginRequest(
                "active.user@example.com",
                "Password123!",
                true,
                UUID.randomUUID()
        );

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String responseStr = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseStr, AuthResponse.class);

        mockMvc.perform(get("/api/v1/auth/sessions")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authResponse.accessToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].isCurrent").value(true));
    }

    @Test
    @DisplayName("Revoke a specific active device session")
    void testRevokeSessionSuccess() throws Exception {
        User user = createTestUser("active.user@example.com", AccountStatus.ACTIVE);

        LoginRequest loginRequest = new LoginRequest(
                "active.user@example.com",
                "Password123!",
                true,
                UUID.randomUUID()
        );

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String responseStr = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseStr, AuthResponse.class);

        List<UserSession> sessions = userSessionRepository.findAll();
        assertThat(sessions).isNotEmpty();
        UUID sessionId = sessions.get(0).getId();

        mockMvc.perform(delete("/api/v1/auth/sessions/" + sessionId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authResponse.accessToken()))
                .andExpect(status().isNoContent());

        UserSession revokedSession = userSessionRepository.findById(sessionId).orElseThrow();
        assertThat(revokedSession.getRevokedAt()).isNotNull();
    }

    // --- Helper Methods ---

    private User createTestUser(String email, AccountStatus status) {
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
        user.setFullName("Test User");
        user.setRoles(Collections.singleton(userRole));
        user.setStatus(status);

        return userRepository.save(user);
    }

    private AuthToken createAuthToken(User user, AuthTokenType type, String rawToken) {
        AuthToken token = new AuthToken();
        token.setUser(user);
        token.setTokenHash(refreshTokenService.hashToken(rawToken));
        token.setTokenType(type);
        token.setExpiresAt(java.time.Instant.now().plus(java.time.Duration.ofHours(24)));
        return authTokenRepository.save(token);
    }
}
