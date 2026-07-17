package com.autocare.backend.auth.service.impl;

import com.autocare.backend.auth.dto.*;
import com.autocare.backend.auth.dto.AuthResponse.AuthUserResponse;
import com.autocare.backend.auth.entity.*;
import com.autocare.backend.auth.exception.*;
import com.autocare.backend.auth.mapper.UserMapper;
import com.autocare.backend.auth.repository.*;
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

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
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
}
