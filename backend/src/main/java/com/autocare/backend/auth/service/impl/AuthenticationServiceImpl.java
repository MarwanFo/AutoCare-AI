package com.autocare.backend.auth.service.impl;

import com.autocare.backend.auth.dto.*;
import com.autocare.backend.auth.dto.AuthResponse.AuthUserResponse;
import com.autocare.backend.auth.entity.*;
import com.autocare.backend.auth.exception.*;
import com.autocare.backend.auth.mapper.UserMapper;
import com.autocare.backend.auth.repository.PasswordHistoryRepository;
import com.autocare.backend.auth.repository.RoleRepository;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.auth.repository.UserSessionRepository;
import com.autocare.backend.auth.service.AuthenticationService;
import com.autocare.backend.auth.service.EmailVerificationService;
import com.autocare.backend.auth.service.JwtService;
import com.autocare.backend.auth.service.RefreshTokenService;
import com.autocare.backend.auth.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final UserSessionRepository userSessionRepository;
    private final SessionService sessionService;
    private final EmailVerificationService emailVerificationService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final com.autocare.backend.auth.repository.UserIdentityRepository userIdentityRepository;
    private final com.autocare.backend.auth.service.GoogleIdentityVerifier googleIdentityVerifier;

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email is already registered.");
        }

        if (request.phoneNumber() != null && userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new PhoneNumberAlreadyExistsException("Phone number is already registered.");
        }

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setStatus(AccountStatus.UNVERIFIED);

        Role defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new AuthException("Default role ROLE_USER not found"));
        user.getRoles().add(defaultRole);

        // Initial starting credits setup
        UserAiCredits credits = new UserAiCredits();
        credits.setUser(user);
        credits.setCredits(10);
        user.setAiCredits(credits);

        User savedUser = userRepository.save(user);

        // Record initial password history
        PasswordHistory history = new PasswordHistory();
        history.setUser(savedUser);
        history.setPasswordHash(savedUser.getPasswordHash());
        passwordHistoryRepository.save(history);

        // Send verification email
        emailVerificationService.sendVerificationEmail(savedUser);

        log.info("Successfully registered user: {}", savedUser.getEmail());
        return savedUser;
    }

    @Override
    public TokenResult login(LoginRequest request, String ipAddress, String userAgent) {
        // Retrieve user, eagerly loading roles and permissions via dedicated repository query
        User user = userRepository.findWithRolesAndPermissionsByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        if (user.getStatus() == AccountStatus.UNVERIFIED) {
            throw new AuthException("Please verify your email address before logging in.");
        }

        if (user.getStatus() == AccountStatus.SUSPENDED) {
            throw new AuthException("Your account has been suspended.");
        }

        String refreshToken = refreshTokenService.generateRefreshToken();
        UserSession session = sessionService.createSession(
                user, request.deviceId(), ipAddress, userAgent, refreshToken, request.rememberMe()
        );

        String accessToken = jwtService.generateAccessToken(user, session.getId());
        AuthUserResponse authUser = userMapper.toAuthUserResponse(user);

        AuthResponse authResponse = new AuthResponse(accessToken, "Bearer", 900, authUser);

        log.info("User {} successfully logged in with session ID: {}", user.getEmail(), session.getId());
        return new TokenResult(authResponse, refreshToken);
    }

    @Override
    public void logout(String accessToken) {
        if (jwtService.validateAccessToken(accessToken)) {
            UUID sessionId = jwtService.getSessionIdFromToken(accessToken);
            userSessionRepository.findById(sessionId).ifPresent(session -> {
                session.setRevokedAt(Instant.now());
                userSessionRepository.save(session);
                log.info("Session {} successfully logged out", sessionId);
            });
        }
    }

    @Override
    public TokenResult refresh(String refreshToken, String ipAddress, String userAgent) {
        String tokenHash = refreshTokenService.hashToken(refreshToken);
        UserSession session = userSessionRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new TokenInvalidException("Refresh token is invalid or expired."));

        if (session.getRevokedAt() != null) {
            // Token reuse / theft anomaly detected - revoke all user sessions for safety
            userSessionRepository.revokeAllByUser(session.getUser(), Instant.now());
            log.warn("Revoked token reuse detected! Revoking all sessions for user {}", session.getUser().getEmail());
            throw new TokenInvalidException("Refresh token is invalid or expired.");
        }

        if (session.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenExpiredException("Refresh token has expired.");
        }

        // Rotate Refresh Token
        String newRefreshToken = refreshTokenService.generateRefreshToken();
        String newHash = refreshTokenService.hashToken(newRefreshToken);

        session.setTokenHash(newHash);
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);
        session.setLastAccessedAt(Instant.now());
        userSessionRepository.save(session);

        // Retrieve user, eagerly loading roles and permissions
        User user = userRepository.findWithRolesAndPermissionsByEmail(session.getUser().getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        String newAccessToken = jwtService.generateAccessToken(user, session.getId());

        AuthResponse authResponse = new AuthResponse(newAccessToken, "Bearer", 900, null);

        log.info("Token rotated successfully for session ID: {}", session.getId());
        return new TokenResult(authResponse, newRefreshToken);
    }

    @Override
    public MobileAuthResult loginWithGoogle(GoogleAuthRequest request, String ipAddress, String userAgent) {
        GoogleIdentity identity = googleIdentityVerifier.verify(request.idToken());

        if (!identity.emailVerified()) {
            throw new GoogleAuthenticationException(
                    "Google account email is not verified.",
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "GOOGLE_EMAIL_NOT_VERIFIED"
            );
        }

        String email = identity.email().trim().toLowerCase(java.util.Locale.ROOT);
        boolean isGmail = email.endsWith("@gmail.com");
        boolean isWorkspace = identity.hostedDomain() != null && !identity.hostedDomain().isBlank();
        boolean isAuthoritative = isGmail || isWorkspace;

        java.util.Optional<UserIdentity> existingIdentity = userIdentityRepository.findByProviderAndProviderUserId("GOOGLE", identity.sub());

        User user;
        if (existingIdentity.isPresent()) {
            user = existingIdentity.get().getUser();
        } else {
            java.util.Optional<User> existingUser = userRepository.findWithRolesAndPermissionsByEmail(email);

            if (existingUser.isPresent()) {
                user = existingUser.get();

                java.util.Optional<UserIdentity> otherGoogleIdentity = userIdentityRepository.findByUserIdAndProvider(user.getId(), "GOOGLE");
                if (otherGoogleIdentity.isPresent() && !otherGoogleIdentity.get().getProviderUserId().equals(identity.sub())) {
                    throw new GoogleAuthenticationException(
                            "This Google account is already linked to another user.",
                            org.springframework.http.HttpStatus.CONFLICT,
                            "GOOGLE_IDENTITY_CONFLICT"
                    );
                }

                if (!isAuthoritative) {
                    throw new GoogleAuthenticationException(
                            "Existing AutoCare account requires password authentication to link third-party Google account.",
                            org.springframework.http.HttpStatus.CONFLICT,
                            "ACCOUNT_LINK_REQUIRED"
                    );
                }

                if (otherGoogleIdentity.isEmpty()) {
                    UserIdentity newIdentity = new UserIdentity();
                    newIdentity.setUser(user);
                    newIdentity.setProvider("GOOGLE");
                    newIdentity.setProviderUserId(identity.sub());
                    newIdentity.setProviderEmail(email);
                    userIdentityRepository.save(newIdentity);
                }

                if (user.getStatus() == AccountStatus.UNVERIFIED && isAuthoritative) {
                    user.setStatus(AccountStatus.ACTIVE);
                    userRepository.save(user);
                }
            } else {
                user = new User();
                user.setEmail(email);
                user.setPasswordHash(null);
                user.setFullName(identity.fullName() != null && !identity.fullName().isBlank() ? identity.fullName() : "Google User");
                user.setAvatarUrl(identity.avatarUrl());

                if (isAuthoritative) {
                    user.setStatus(AccountStatus.ACTIVE);
                } else {
                    user.setStatus(AccountStatus.UNVERIFIED);
                }

                Role defaultRole = roleRepository.findByName("ROLE_USER")
                        .orElseThrow(() -> new AuthException("Default role ROLE_USER not found"));
                user.getRoles().add(defaultRole);

                UserAiCredits credits = new UserAiCredits();
                credits.setUser(user);
                credits.setCredits(10);
                user.setAiCredits(credits);

                user = userRepository.save(user);

                UserIdentity newIdentity = new UserIdentity();
                newIdentity.setUser(user);
                newIdentity.setProvider("GOOGLE");
                newIdentity.setProviderUserId(identity.sub());
                newIdentity.setProviderEmail(email);
                userIdentityRepository.save(newIdentity);

                if (!isAuthoritative) {
                    emailVerificationService.sendVerificationEmail(user);
                }
            }
        }

        if (user.getStatus() == AccountStatus.SUSPENDED) {
            throw new AuthException("Your account has been suspended.");
        }

        if (user.getStatus() == AccountStatus.UNVERIFIED) {
            if (!isAuthoritative) {
                try {
                    emailVerificationService.sendVerificationEmail(user);
                } catch (Exception e) {
                    log.warn("Resend email verification suppressed or rate limited: {}", e.getMessage());
                }
            }
            return new MobileAuthResult(true, user.getEmail(), null);
        }

        String refreshToken = refreshTokenService.generateRefreshToken();
        UserSession session = sessionService.createSession(
                user, java.util.UUID.randomUUID(), ipAddress, userAgent, refreshToken, true
        );

        String accessToken = jwtService.generateAccessToken(user, session.getId());
        AuthUserResponse authUserResponse = userMapper.toAuthUserResponse(user);

        AuthResponse authResponse = new AuthResponse(
                accessToken,
                "Bearer",
                900L,
                authUserResponse
        );

        return new MobileAuthResult(false, user.getEmail(), new MobileAuthResponse(
                authResponse.accessToken(),
                refreshToken,
                authResponse.tokenType(),
                authResponse.expiresIn(),
                authResponse.user()
        ));
    }
}
