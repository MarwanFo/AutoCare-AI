package com.autocare.backend.user.controller;

import com.autocare.backend.auth.dto.ChangePasswordRequest;
import com.autocare.backend.auth.dto.UserProfileResponse;
import com.autocare.backend.auth.service.JwtService;
import com.autocare.backend.auth.service.PasswordResetService;
import com.autocare.backend.auth.service.UserService;
import com.autocare.backend.security.CustomUserDetails;
import com.autocare.backend.user.dto.request.DeactivateAccountRequest;
import com.autocare.backend.user.dto.request.UpdatePreferencesRequest;
import com.autocare.backend.user.dto.request.UpdateProfileRequest;
import com.autocare.backend.user.dto.response.AvatarUploadResponse;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Endpoints for managing authenticated user profiles, preferences, and avatars.")
public class UserController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;
    private final JwtService jwtService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Retrieves profile details, localization preferences, roles, and status for the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Profile retrieved successfully", content = @Content(schema = @Schema(implementation = UserProfileResponse.class)))
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT required")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Fetching profile for authenticated user ID: {}", userDetails.getId());
        UserProfileResponse response = userService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile details", description = "Updates editable personal attributes (fullName, phoneNumber) for the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Profile updated successfully", content = @Content(schema = @Schema(implementation = UserProfileResponse.class)))
    @ApiResponse(responseCode = "400", description = "Invalid request payload or format")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT required")
    @ApiResponse(responseCode = "409", description = "Phone number already in use by another active user")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        log.info("Updating profile details for authenticated user ID: {}", userDetails.getId());
        UserProfileResponse response = userService.updateProfile(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/preferences")
    @Operation(summary = "Update current user preferences", description = "Updates localization settings (language, currency, distance unit) and notification toggles.")
    @ApiResponse(responseCode = "200", description = "Preferences updated successfully", content = @Content(schema = @Schema(implementation = UserProfileResponse.class)))
    @ApiResponse(responseCode = "400", description = "Invalid request payload or unsupported preference value")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT required")
    public ResponseEntity<UserProfileResponse> updatePreferences(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdatePreferencesRequest request
    ) {
        log.info("Updating preferences for authenticated user ID: {}", userDetails.getId());
        UserProfileResponse response = userService.updatePreferences(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload custom profile avatar", description = "Uploads a profile picture (JPEG, PNG, WEBP, max 5MB), validates header magic bytes, and updates user avatar URL.")
    @ApiResponse(responseCode = "200", description = "Avatar uploaded successfully", content = @Content(schema = @Schema(implementation = AvatarUploadResponse.class)))
    @ApiResponse(responseCode = "400", description = "Invalid file or security check failure")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT required")
    @ApiResponse(responseCode = "413", description = "File size exceeds 5MB limit")
    public ResponseEntity<AvatarUploadResponse> uploadAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file
    ) {
        log.info("Uploading profile avatar for authenticated user ID: {}", userDetails.getId());
        AvatarUploadResponse response = userService.uploadAvatar(userDetails.getId(), file);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me/avatar")
    @Operation(summary = "Delete custom profile avatar", description = "Deletes existing custom avatar file and reverts profile avatar URL to null.")
    @ApiResponse(responseCode = "204", description = "Avatar deleted successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT required")
    public ResponseEntity<Void> deleteAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Deleting custom avatar for authenticated user ID: {}", userDetails.getId());
        userService.deleteAvatar(userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change authenticated user password", description = "Verifies current password, updates password hash, and revokes other active device sessions.")
    @ApiResponse(responseCode = "200", description = "Password changed successfully")
    @ApiResponse(responseCode = "400", description = "Incorrect current password, password reuse violation, or weak complexity")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT required")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpServletRequest
    ) {
        log.info("Changing password for authenticated user ID: {}", userDetails.getId());

        String authHeader = httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION);
        UUID currentSessionId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                currentSessionId = jwtService.getSessionIdFromToken(token);
            } catch (Exception e) {
                log.warn("Failed to extract current session ID from JWT during password change", e);
            }
        }

        passwordResetService.changePassword(userDetails.getUser(), request, currentSessionId);
        return ResponseEntity.ok(Map.of(
                "message", "Password changed successfully. Other active device sessions have been revoked for your security."
        ));
    }

    @DeleteMapping("/me")
    @Operation(summary = "Deactivate authenticated user account", description = "Requires password confirmation, marks account status as SUSPENDED, sets deletedAt timestamp, and revokes all active sessions.")
    @ApiResponse(responseCode = "204", description = "Account deactivated successfully")
    @ApiResponse(responseCode = "400", description = "Incorrect confirmation password")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT required")
    public ResponseEntity<Void> deactivateAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody DeactivateAccountRequest request
    ) {
        log.info("Deactivating user account for user ID: {}", userDetails.getId());
        userService.deactivateAccount(userDetails.getId(), request);
        return ResponseEntity.noContent().build();
    }
}
