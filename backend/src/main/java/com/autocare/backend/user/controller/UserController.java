package com.autocare.backend.user.controller;

import com.autocare.backend.auth.dto.UserProfileResponse;
import com.autocare.backend.auth.service.UserService;
import com.autocare.backend.security.CustomUserDetails;
import com.autocare.backend.user.dto.request.UpdateProfileRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Endpoints for managing authenticated user profiles, preferences, and avatars.")
public class UserController {

    private final UserService userService;

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
}
