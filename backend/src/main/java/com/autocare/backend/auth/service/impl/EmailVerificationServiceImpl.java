package com.autocare.backend.auth.service.impl;

import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.AuthToken;
import com.autocare.backend.auth.entity.AuthTokenType;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.exception.TokenExpiredException;
import com.autocare.backend.auth.exception.TokenInvalidException;
import com.autocare.backend.auth.repository.AuthTokenRepository;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.auth.service.EmailVerificationService;
import com.autocare.backend.auth.service.RefreshTokenService;
import com.autocare.backend.infrastructure.email.service.EmailSenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final UserRepository userRepository;
    private final AuthTokenRepository authTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final EmailSenderService emailSenderService;

    @Override
    public void sendVerificationEmail(User user) {
        Optional<AuthToken> existingTokenOpt = authTokenRepository
                .findByUserAndTokenTypeAndUsedAtIsNull(user, AuthTokenType.EMAIL_VERIFICATION);
        existingTokenOpt.ifPresent(token -> token.setUsedAt(Instant.now()));

        String rawToken = UUID.randomUUID().toString().replace("-", "");
        String tokenHash = refreshTokenService.hashToken(rawToken);

        AuthToken verificationToken = new AuthToken();
        verificationToken.setUser(user);
        verificationToken.setTokenType(AuthTokenType.EMAIL_VERIFICATION);
        verificationToken.setTokenHash(tokenHash);
        verificationToken.setExpiresAt(Instant.now().plus(Duration.ofHours(24)));

        authTokenRepository.save(verificationToken);

        // Dispatch email via EmailSenderService (SMTP + Console Fallback)
        emailSenderService.sendVerificationEmail(user.getEmail(), rawToken);
    }

    @Override
    public void verifyEmail(String token) {
        String tokenHash = refreshTokenService.hashToken(token);
        AuthToken verificationToken = authTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new TokenInvalidException("Invalid email verification token"));

        if (verificationToken.getTokenType() != AuthTokenType.EMAIL_VERIFICATION) {
            throw new TokenInvalidException("Token is not for email verification");
        }

        if (verificationToken.getUsedAt() != null) {
            throw new TokenInvalidException("Verification token has already been used");
        }

        if (verificationToken.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenExpiredException("Verification token has expired");
        }

        verificationToken.setUsedAt(Instant.now());

        User user = verificationToken.getUser();
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        log.info("User {} email successfully verified", user.getEmail());
    }
}
