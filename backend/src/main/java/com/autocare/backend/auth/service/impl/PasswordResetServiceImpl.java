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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void initiateForgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email());
        if (userOpt.isEmpty()) {
            // Prevent user enumeration by silent return
            log.warn("Password reset initiated for non-existent email: {}", request.email());
            return;
        }

        User user = userOpt.get();

        // Invalidate active reset tokens
        Optional<AuthToken> existingOpt = authTokenRepository
                .findByUserAndTokenTypeAndUsedAtIsNull(user, AuthTokenType.PASSWORD_RESET);
        existingOpt.ifPresent(token -> token.setUsedAt(Instant.now()));

        // Generate raw reset token and hash it for DB persistence
        String rawToken = UUID.randomUUID().toString().replace("-", "");
        String tokenHash = refreshTokenService.hashToken(rawToken);

        AuthToken resetToken = new AuthToken();
        resetToken.setUser(user);
        resetToken.setTokenType(AuthTokenType.PASSWORD_RESET);
        resetToken.setTokenHash(tokenHash);
        resetToken.setExpiresAt(Instant.now().plus(Duration.ofMinutes(15))); // Valid for 15 minutes

        authTokenRepository.save(resetToken);

        // Simulate asynchronous email transmission
        log.info("Password reset email sent to {}. Raw reset token: {}", user.getEmail(), rawToken);
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

        // Prevent reuse check against last 5 passwords
        validatePasswordHistory(user, request.newPassword());

        // Update password and record to history
        String hashedNewPassword = passwordEncoder.encode(request.newPassword());
        user.setPasswordHash(hashedNewPassword);
        userRepository.save(user);

        savePasswordToHistory(user, hashedNewPassword);

        // Consume token
        resetToken.setUsedAt(Instant.now());
        authTokenRepository.save(resetToken);

        // Revoke all active sessions for security
        userSessionRepository.revokeAllByUser(user, Instant.now());

        log.info("Password successfully reset for user {}", user.getEmail());
    }

    @Override
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Prevent reuse check against last 5 passwords
        validatePasswordHistory(user, request.newPassword());

        // Update password and record to history
        String hashedNewPassword = passwordEncoder.encode(request.newPassword());
        user.setPasswordHash(hashedNewPassword);
        userRepository.save(user);

        savePasswordToHistory(user, hashedNewPassword);

        // Revoke all sessions (forcing re-login across all devices for security)
        userSessionRepository.revokeAllByUser(user, Instant.now());

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
