package com.autocare.backend.auth.service.impl;

import com.autocare.backend.auth.dto.ChangePasswordRequest;
import com.autocare.backend.auth.dto.ForgotPasswordRequest;
import com.autocare.backend.auth.dto.ResetPasswordRequest;
import com.autocare.backend.auth.entity.AuthToken;
import com.autocare.backend.auth.entity.AuthTokenType;
import com.autocare.backend.auth.entity.PasswordHistory;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.exception.*;
import com.autocare.backend.auth.repository.AuthTokenRepository;
import com.autocare.backend.auth.repository.PasswordHistoryRepository;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.auth.repository.UserSessionRepository;
import com.autocare.backend.auth.service.PasswordResetService;
import com.autocare.backend.auth.service.RefreshTokenService;
import com.autocare.backend.auth.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final AuthTokenRepository authTokenRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final UserSessionRepository userSessionRepository;
    private final RefreshTokenService refreshTokenService;
    private final SessionService sessionService;
    private final PasswordEncoder passwordEncoder;
    private final com.autocare.backend.infrastructure.email.service.EmailSenderService emailSenderService;

    @Override
    public void initiateForgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email());
        if (userOpt.isEmpty()) {
            log.warn("Password reset initiated for non-existent email: {}", request.email());
            return;
        }

        User user = userOpt.get();
        if (user.getStatus() == com.autocare.backend.auth.entity.AccountStatus.UNVERIFIED) {
            throw new AuthException("Email address is unverified. Please verify your email before resetting your password.");
        }

        Optional<AuthToken> existingOpt = authTokenRepository
                .findByUserAndTokenTypeAndUsedAtIsNull(user, AuthTokenType.PASSWORD_RESET);
        existingOpt.ifPresent(token -> token.setUsedAt(Instant.now()));

        String rawToken = UUID.randomUUID().toString().replace("-", "");
        String tokenHash = refreshTokenService.hashToken(rawToken);

        AuthToken resetToken = new AuthToken();
        resetToken.setUser(user);
        resetToken.setTokenType(AuthTokenType.PASSWORD_RESET);
        resetToken.setTokenHash(tokenHash);
        resetToken.setExpiresAt(Instant.now().plus(Duration.ofMinutes(15)));

        authTokenRepository.save(resetToken);

        emailSenderService.sendPasswordResetEmail(user.getEmail(), rawToken);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = refreshTokenService.hashToken(request.token());
        AuthToken resetToken = authTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new TokenInvalidException("Invalid password reset token"));

        if (resetToken.getTokenType() != AuthTokenType.PASSWORD_RESET) {
            throw new TokenInvalidException("Token is not for password reset");
        }

        if (resetToken.getUsedAt() != null) {
            throw new TokenInvalidException("Reset token has already been used");
        }

        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenExpiredException("Reset token has expired");
        }

        User user = resetToken.getUser();

        validatePasswordHistory(user, request.newPassword());

        String hashedNewPassword = passwordEncoder.encode(request.newPassword());
        user.setPasswordHash(hashedNewPassword);
        userRepository.save(user);

        savePasswordToHistory(user, hashedNewPassword);

        resetToken.setUsedAt(Instant.now());
        authTokenRepository.save(resetToken);

        userSessionRepository.revokeAllByUser(user, Instant.now());

        log.info("Password successfully reset for user {}", user.getEmail());
    }

    @Override
    public void changePassword(User user, ChangePasswordRequest request) {
        changePassword(user, request, null);
    }

    @Override
    public void changePassword(User user, ChangePasswordRequest request, UUID currentSessionId) {
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new AuthException("New password cannot be the same as your current password");
        }

        validatePasswordHistory(user, request.newPassword());

        String hashedNewPassword = passwordEncoder.encode(request.newPassword());
        user.setPasswordHash(hashedNewPassword);
        userRepository.save(user);

        savePasswordToHistory(user, hashedNewPassword);

        if (currentSessionId != null) {
            sessionService.revokeAllOtherSessions(user, currentSessionId);
        } else {
            userSessionRepository.revokeAllByUser(user, Instant.now());
        }

        log.info("Password successfully changed for user {}", user.getEmail());
    }

    private void validatePasswordHistory(User user, String newPassword) {
        List<PasswordHistory> history = passwordHistoryRepository.findTop5ByUserOrderByCreatedAtDesc(user);
        for (PasswordHistory ph : history) {
            if (passwordEncoder.matches(newPassword, ph.getPasswordHash())) {
                throw new AuthException("Cannot reuse a recently used password");
            }
        }
    }

    private void savePasswordToHistory(User user, String hashedPassword) {
        PasswordHistory ph = new PasswordHistory();
        ph.setUser(user);
        ph.setPasswordHash(hashedPassword);
        passwordHistoryRepository.save(ph);
    }
}
