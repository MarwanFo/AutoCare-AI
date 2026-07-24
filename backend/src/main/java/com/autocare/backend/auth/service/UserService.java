package com.autocare.backend.auth.service;

import com.autocare.backend.auth.dto.UserProfileResponse;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.user.dto.request.UpdatePreferencesRequest;
import com.autocare.backend.user.dto.request.UpdateProfileRequest;
import com.autocare.backend.user.dto.response.AvatarUploadResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

public interface UserService {
    UserProfileResponse getUserProfile(UUID userId);
    UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request);
    UserProfileResponse updatePreferences(UUID userId, UpdatePreferencesRequest request);
    AvatarUploadResponse uploadAvatar(UUID userId, MultipartFile file);
    void deleteAvatar(UUID userId);
    User getById(UUID userId);
    User getByEmail(String email);
}
