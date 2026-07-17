package com.autocare.backend.auth.controller;

import com.autocare.backend.auth.dto.*;
import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.service.*;
import com.autocare.backend.auth.exception.InvalidTokenException;
import com.autocare.backend.security.CustomUserDetails;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, token rotation, and session management.")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final SessionService sessionService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;
    private final JwtService jwtService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account", description = "Registers a new user and dispatches a verification email.")
    @ApiResponse(responseCode = "201", description = "Registration successful", content = @Content(schema = @Schema(implementation = Map.class)))
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authenticationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Registration successful. Please check your email to verify your account."
        ));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify account email", description = "Verifies a registered account using the secure email token.")
    @ApiResponse(responseCode = "200", description = "Email verified successfully")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam("token") String token) {
        emailVerificationService.verifyEmail(token);
        return ResponseEntity.ok(Map.of(
                "message", "Email verified successfully. You can now log in."
        ));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend email verification token", description = "Resends verification token. Returns success silently if user is not found to prevent enumeration.")
    @ApiResponse(responseCode = "200", description = "Verification email resent")
    public ResponseEntity<Map<String, String>> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        try {
            User user = userService.getByEmail(request.email());
            if (user.getStatus() == AccountStatus.UNVERIFIED) {
                emailVerificationService.sendVerificationEmail(user);
            }
        } catch (Exception e) {
            log.warn("Resend verification requested for non-existent or verified email: {}", request.email());
        }
        return ResponseEntity.ok(Map.of(
                "message", "If the email is registered, a new verification link has been sent."
        ));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials", description = "Validates user login details and sets HTTP-only refresh token cookie.")
    @ApiResponse(responseCode = "200", description = "Successful authentication", content = @Content(schema = @Schema(implementation = AuthResponse.class)))
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest
    ) {
        String ipAddress = httpServletRequest.getRemoteAddr();
        String userAgent = httpServletRequest.getHeader(HttpHeaders.USER_AGENT);

        AuthenticationService.TokenResult tokenResult = authenticationService.login(request, ipAddress, userAgent);

        ResponseCookie cookie = ResponseCookie.from("refresh_token", tokenResult.refreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(request.rememberMe() ? 2592000 : 604800)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(tokenResult.authResponse());
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user session", description = "Invalidates the current user session and clears the refresh token cookie.")
    @ApiResponse(responseCode = "204", description = "Logged out successfully")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader
    ) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authenticationService.logout(token);
        }

        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Logout all active sessions", description = "Invalidates all active sessions across all devices for the current user.")
    @ApiResponse(responseCode = "204", description = "All sessions revoked successfully")
    public ResponseEntity<Void> logoutAll() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        sessionService.revokeAllOtherSessions(userDetails.getUser(), null);

        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token", description = "Exchanges a valid refresh token cookie for a new rotated refresh token and access token.")
    @ApiResponse(responseCode = "200", description = "Tokens rotated successfully", content = @Content(schema = @Schema(implementation = AuthResponse.class)))
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            HttpServletRequest httpServletRequest
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidTokenException("Refresh token is missing.");
        }
        String ipAddress = httpServletRequest.getRemoteAddr();
        String userAgent = httpServletRequest.getHeader(HttpHeaders.USER_AGENT);

        AuthenticationService.TokenResult tokenResult = authenticationService.refresh(refreshToken, ipAddress, userAgent);

        ResponseCookie cookie = ResponseCookie.from("refresh_token", tokenResult.refreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(tokenResult.authResponse());
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Initiates password reset flow and sends transactional recovery email.")
    @ApiResponse(responseCode = "200", description = "Password reset link sent successfully")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.initiateForgotPassword(request);
        return ResponseEntity.ok(Map.of(
                "message", "If the email is registered, a password reset link has been sent."
        ));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using recovery token", description = "Completes password reset workflow using the reset token.")
    @ApiResponse(responseCode = "200", description = "Password reset successful")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(Map.of(
                "message", "Password has been reset successfully. You may now login."
        ));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password (Authenticated)", description = "Allows authenticated users to update their password after verifying credentials.")
    @ApiResponse(responseCode = "200", description = "Password changed successfully")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        passwordResetService.changePassword(userDetails.getUser(), request);
        return ResponseEntity.ok(Map.of(
                "message", "Password changed successfully."
        ));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Returns user profile details, roles, and permissions.")
    @ApiResponse(responseCode = "200", description = "Profile details retrieved successfully", content = @Content(schema = @Schema(implementation = UserProfileResponse.class)))
    public ResponseEntity<UserProfileResponse> me() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UserProfileResponse profile = userService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/sessions")
    @Operation(summary = "List active user sessions", description = "Retrieves all active devices logged into the user's account.")
    @ApiResponse(responseCode = "200", description = "Sessions listed successfully", content = @Content(schema = @Schema(implementation = SessionResponse.class)))
    public ResponseEntity<List<SessionResponse>> listSessions(HttpServletRequest httpServletRequest) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String authHeader = httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION);
        UUID currentSessionId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                currentSessionId = jwtService.getSessionIdFromToken(token);
            } catch (Exception e) {
                log.warn("Failed to extract session ID from current access token during session listing", e);
            }
        }

        List<SessionResponse> sessions = sessionService.getActiveSessions(userDetails.getUser(), currentSessionId);
        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/sessions/{sessionId}")
    @Operation(summary = "Revoke active session", description = "Terminates the specified active device session. Clears cookie if current session is revoked.")
    @ApiResponse(responseCode = "204", description = "Session revoked successfully")
    public ResponseEntity<Void> revokeSession(
            @PathVariable("sessionId") UUID sessionId,
            HttpServletRequest httpServletRequest
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String authHeader = httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION);
        boolean isCurrent = false;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                UUID currentSessionId = jwtService.getSessionIdFromToken(token);
                if (sessionId.equals(currentSessionId)) {
                    isCurrent = true;
                }
            } catch (Exception e) {
                log.warn("Failed to extract current session ID during specific session revocation", e);
            }
        }

        sessionService.revokeSession(sessionId, userDetails.getUser());

        if (isCurrent) {
            ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Strict")
                    .path("/api/v1/auth")
                    .maxAge(0)
                    .build();
            return ResponseEntity.noContent()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .build();
        }

        return ResponseEntity.noContent().build();
    }
}
