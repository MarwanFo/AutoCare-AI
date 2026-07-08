package com.autocare.backend.auth.service;

import com.autocare.backend.auth.dto.UserProfileResponse;
import com.autocare.backend.auth.entity.User;
import java.util.UUID;

public interface UserService {
    UserProfileResponse getUserProfile(UUID userId);
    User getById(UUID userId);
    User getByEmail(String email);
}
