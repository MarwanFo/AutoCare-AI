package com.autocare.backend.auth;

import com.autocare.backend.auth.dto.*;
import com.autocare.backend.auth.entity.*;
import com.autocare.backend.auth.exception.AuthException;
import com.autocare.backend.auth.exception.GoogleAuthenticationException;
import com.autocare.backend.auth.repository.*;
import com.autocare.backend.auth.service.AuthenticationService;
import com.autocare.backend.auth.service.GoogleIdentityVerifier;
import com.autocare.backend.auth.service.PasswordResetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;

@SpringBootTest
@Transactional
public class GoogleAuthenticationTest {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserIdentityRepository userIdentityRepository;

    @Autowired
    private RoleRepository roleRepository;

    @MockitoBean
    private GoogleIdentityVerifier googleIdentityVerifier;

    private Role userRole;

    @BeforeEach
    void setUp() {
        userRole = roleRepository.findByName("ROLE_USER").orElseGet(() -> {
            Role r = new Role();
            r.setName("ROLE_USER");
            return roleRepository.save(r);
        });
    }

    @Test
    void testNewGmailUserSignupActive() {
        String sub = "google_sub_" + UUID.randomUUID();
        String email = "alex_" + UUID.randomUUID() + "@gmail.com";
        GoogleIdentity identity = new GoogleIdentity(sub, email, true, "Alex Gmail", "https://avatar.png", null);

        Mockito.when(googleIdentityVerifier.verify(anyString())).thenReturn(identity);

        MobileAuthResult result = authenticationService.loginWithGoogle(new GoogleAuthRequest("valid_token"), "127.0.0.1", "JUnit");

        assertFalse(result.verificationRequired(), "Gmail user signup should be ACTIVE immediately.");
        assertNotNull(result.authResponse());
        assertNotNull(result.authResponse().accessToken());

        User user = userRepository.findByEmail(email).orElseThrow();
        assertEquals(AccountStatus.ACTIVE, user.getStatus());
        assertNull(user.getPasswordHash(), "Google-only account passwordHash must be null.");

        Optional<UserIdentity> link = userIdentityRepository.findByProviderAndProviderUserId("GOOGLE", sub);
        assertTrue(link.isPresent());
        assertEquals(user.getId(), link.get().getUser().getId());
    }

    @Test
    void testNewWorkspaceUserSignupActive() {
        String sub = "google_sub_" + UUID.randomUUID();
        String email = "corporate_" + UUID.randomUUID() + "@company.com";
        GoogleIdentity identity = new GoogleIdentity(sub, email, true, "Corporate User", "https://avatar.png", "company.com");

        Mockito.when(googleIdentityVerifier.verify(anyString())).thenReturn(identity);

        MobileAuthResult result = authenticationService.loginWithGoogle(new GoogleAuthRequest("valid_token"), "127.0.0.1", "JUnit");

        assertFalse(result.verificationRequired(), "Workspace user with valid hd claim should be ACTIVE immediately.");
        assertNotNull(result.authResponse());

        User user = userRepository.findByEmail(email).orElseThrow();
        assertEquals(AccountStatus.ACTIVE, user.getStatus());
    }

    @Test
    void testNewThirdPartyGoogleUserSignup() {
        String sub = "google_sub_" + UUID.randomUUID();
        String email = "thirdparty_" + UUID.randomUUID() + "@outlook.com";
        GoogleIdentity identity = new GoogleIdentity(sub, email, true, "Outlook User", "https://avatar.png", null);

        Mockito.when(googleIdentityVerifier.verify(anyString())).thenReturn(identity);

        MobileAuthResult result = authenticationService.loginWithGoogle(new GoogleAuthRequest("valid_token"), "127.0.0.1", "JUnit");

        assertFalse(result.verificationRequired());
        assertNotNull(result.authResponse());

        User user = userRepository.findByEmail(email).orElseThrow();
        assertEquals(AccountStatus.ACTIVE, user.getStatus());

        Optional<UserIdentity> link = userIdentityRepository.findByProviderAndProviderUserId("GOOGLE", sub);
        assertTrue(link.isPresent());
    }

    @Test
    void testRepeatedThirdPartyGoogleLogin() {
        String sub = "google_sub_" + UUID.randomUUID();
        String email = "thirdparty_" + UUID.randomUUID() + "@yahoo.com";
        GoogleIdentity identity = new GoogleIdentity(sub, email, true, "Yahoo User", "https://avatar.png", null);

        Mockito.when(googleIdentityVerifier.verify(anyString())).thenReturn(identity);

        // Attempt 1
        authenticationService.loginWithGoogle(new GoogleAuthRequest("valid_token"), "127.0.0.1", "JUnit");
        // Attempt 2
        MobileAuthResult result = authenticationService.loginWithGoogle(new GoogleAuthRequest("valid_token"), "127.0.0.1", "JUnit");

        assertFalse(result.verificationRequired());
        assertNotNull(result.authResponse());

        long count = userRepository.findAll().stream().filter(u -> u.getEmail().equals(email)).count();
        assertEquals(1, count, "No duplicate user created on repeated login.");
    }

    @Test
    void testPostVerificationGoogleLogin() {
        String sub = "google_sub_" + UUID.randomUUID();
        String email = "thirdparty_" + UUID.randomUUID() + "@icloud.com";
        GoogleIdentity identity = new GoogleIdentity(sub, email, true, "iCloud User", "https://avatar.png", null);

        Mockito.when(googleIdentityVerifier.verify(anyString())).thenReturn(identity);

        // Create user
        authenticationService.loginWithGoogle(new GoogleAuthRequest("valid_token"), "127.0.0.1", "JUnit");

        // Subsequent login
        MobileAuthResult result = authenticationService.loginWithGoogle(new GoogleAuthRequest("valid_token"), "127.0.0.1", "JUnit");

        assertFalse(result.verificationRequired());
        assertNotNull(result.authResponse());
        assertNotNull(result.authResponse().accessToken());
    }

    @Test
    void testPasswordResetForUser() {
        User user = new User();
        user.setEmail("user_" + UUID.randomUUID() + "@outlook.com");
        user.setFullName("Test User");
        user.setStatus(AccountStatus.ACTIVE);
        user.getRoles().add(userRole);
        userRepository.save(user);

        assertDoesNotThrow(() -> {
            passwordResetService.initiateForgotPassword(new ForgotPasswordRequest(user.getEmail()));
        });
    }

    @Test
    void testExistingThirdPartyAccountLinkRejected() {
        String email = "existing_" + UUID.randomUUID() + "@outlook.com";

        User existing = new User();
        existing.setEmail(email);
        existing.setPasswordHash("$2a$10$7EqJtq986P4m0yN84b2pce3N/5yB.z1a4Lw4Lw4Lw4Lw4Lw4Lw4Lw");
        existing.setFullName("Existing User");
        existing.setStatus(AccountStatus.ACTIVE);
        existing.getRoles().add(userRole);
        userRepository.save(existing);

        String sub = "google_sub_" + UUID.randomUUID();
        GoogleIdentity identity = new GoogleIdentity(sub, email, true, "Existing User", null, null);
        Mockito.when(googleIdentityVerifier.verify(anyString())).thenReturn(identity);

        assertThrows(GoogleAuthenticationException.class, () -> {
            authenticationService.loginWithGoogle(new GoogleAuthRequest("valid_token"), "127.0.0.1", "JUnit");
        }, "Automatic linking of third-party Google email to existing password account must be rejected.");
    }

    @Test
    void testSuspendedAccountGoogleLoginRejected() {
        String email = "suspended_" + UUID.randomUUID() + "@gmail.com";

        User existing = new User();
        existing.setEmail(email);
        existing.setFullName("Suspended User");
        existing.setStatus(AccountStatus.SUSPENDED);
        existing.getRoles().add(userRole);
        existing = userRepository.save(existing);

        String sub = "google_sub_" + UUID.randomUUID();
        UserIdentity identityLink = new UserIdentity();
        identityLink.setUser(existing);
        identityLink.setProvider("GOOGLE");
        identityLink.setProviderUserId(sub);
        identityLink.setProviderEmail(email);
        userIdentityRepository.save(identityLink);

        GoogleIdentity identity = new GoogleIdentity(sub, email, true, "Suspended User", null, null);
        Mockito.when(googleIdentityVerifier.verify(anyString())).thenReturn(identity);

        assertThrows(AuthException.class, () -> {
            authenticationService.loginWithGoogle(new GoogleAuthRequest("valid_token"), "127.0.0.1", "JUnit");
        }, "Google login for SUSPENDED account must be rejected.");
    }

    @Test
    void testUnverifiedGoogleEmailRejected() {
        String sub = "google_sub_" + UUID.randomUUID();
        String email = "unverified_google_" + UUID.randomUUID() + "@gmail.com";
        GoogleIdentity identity = new GoogleIdentity(sub, email, false, "Unverified Google", null, null);

        Mockito.when(googleIdentityVerifier.verify(anyString())).thenReturn(identity);

        assertThrows(GoogleAuthenticationException.class, () -> {
            authenticationService.loginWithGoogle(new GoogleAuthRequest("valid_token"), "127.0.0.1", "JUnit");
        }, "Google identity with email_verified = false must be rejected.");
    }
}
