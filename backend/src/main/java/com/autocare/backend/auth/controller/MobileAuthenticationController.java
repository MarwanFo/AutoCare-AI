package com.autocare.backend.auth.controller;

import com.autocare.backend.auth.dto.*;
import com.autocare.backend.auth.repository.UserSessionRepository;
import com.autocare.backend.auth.service.AuthenticationService;
import com.autocare.backend.auth.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth/mobile")
@RequiredArgsConstructor
@Tag(name = "Mobile Authentication", description = "Endpoints for React Native mobile clients (tokens returned/accepted strictly in JSON bodies).")
public class MobileAuthenticationController {

    private final AuthenticationService authenticationService;
    private final RefreshTokenService refreshTokenService;
    private final UserSessionRepository userSessionRepository;

    @PostMapping("/login")
    @Operation(summary = "Authenticate mobile user", description = "Validates user login details and returns access and refresh tokens directly in the JSON response.")
    @ApiResponse(responseCode = "200", description = "Successful authentication", content = @Content(schema = @Schema(implementation = MobileAuthResponse.class)))
    public ResponseEntity<MobileAuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest
    ) {
        String ipAddress = httpServletRequest.getRemoteAddr();
        String userAgent = httpServletRequest.getHeader(HttpHeaders.USER_AGENT);

        AuthenticationService.TokenResult tokenResult = authenticationService.login(request, ipAddress, userAgent);

        MobileAuthResponse response = new MobileAuthResponse(
                tokenResult.authResponse().accessToken(),
                tokenResult.refreshToken(),
                tokenResult.authResponse().tokenType(),
                tokenResult.authResponse().expiresIn(),
                tokenResult.authResponse().user()
        );

        log.info("Mobile user {} successfully logged in with session", request.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token for mobile", description = "Exchanges a valid refresh token from request body for rotated access and refresh tokens.")
    @ApiResponse(responseCode = "200", description = "Tokens rotated successfully", content = @Content(schema = @Schema(implementation = MobileRefreshResponse.class)))
    public ResponseEntity<MobileRefreshResponse> refresh(
            @Valid @RequestBody MobileRefreshRequest request,
            HttpServletRequest httpServletRequest
    ) {
        String ipAddress = httpServletRequest.getRemoteAddr();
        String userAgent = httpServletRequest.getHeader(HttpHeaders.USER_AGENT);

        AuthenticationService.TokenResult tokenResult = authenticationService.refresh(request.refreshToken(), ipAddress, userAgent);

        MobileRefreshResponse response = new MobileRefreshResponse(
                tokenResult.authResponse().accessToken(),
                tokenResult.refreshToken(),
                tokenResult.authResponse().tokenType(),
                tokenResult.authResponse().expiresIn()
        );

        log.info("Mobile token rotated successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout mobile session", description = "Invalidates the current session without using cookies.")
    @ApiResponse(responseCode = "204", description = "Logged out successfully")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestBody(required = false) MobileLogoutRequest request
    ) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                authenticationService.logout(token);
            } catch (Exception e) {
                log.warn("Failed session logout by access token: {}", e.getMessage());
            }
        }
        if (request != null && request.refreshToken() != null && !request.refreshToken().isBlank()) {
            try {
                String tokenHash = refreshTokenService.hashToken(request.refreshToken());
                userSessionRepository.findByTokenHash(tokenHash).ifPresent(session -> {
                    session.setRevokedAt(Instant.now());
                    userSessionRepository.save(session);
                    log.info("Session ID {} revoked via refresh token logout", session.getId());
                });
            } catch (Exception e) {
                log.warn("Failed session revocation by refresh token: {}", e.getMessage());
            }
        }
        return ResponseEntity.noContent().build();
    }
}
