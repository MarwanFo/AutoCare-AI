package com.autocare.backend.auth.mapper;

import com.autocare.backend.auth.dto.AuthResponse.AuthUserResponse;
import com.autocare.backend.auth.dto.RegisterRequest;
import com.autocare.backend.auth.dto.UserProfileResponse;
import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.Permission;
import com.autocare.backend.auth.entity.Role;
import com.autocare.backend.auth.entity.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public User toEntity(RegisterRequest request) {
        if (request == null) return null;
        User user = new User();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPhoneNumber(request.phoneNumber());
        return user;
    }

    public AuthUserResponse toAuthUserResponse(User user) {
        if (user == null) return null;
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                mapRoles(user.getRoles()),
                mapPermissions(user.getRoles()),
                user.getStatus() != AccountStatus.UNVERIFIED,
                user.isProfileCompleted()
        );
    }

    public UserProfileResponse toUserProfileResponse(User user) {
        if (user == null) return null;
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getAvatarUrl(),
                user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "FR",
                user.getPreferredCurrency() != null ? user.getPreferredCurrency() : "EUR",
                user.getPreferredDistanceUnit() != null ? user.getPreferredDistanceUnit() : "KM",
                user.isPushNotificationsEnabled(),
                user.isEmailNotificationsEnabled(),
                user.isProfileCompleted(),
                mapRoles(user.getRoles()),
                mapPermissions(user.getRoles()),
                user.getStatus() != null ? user.getStatus().name() : "ACTIVE",
                user.getCreatedAt()
        );
    }

    public Set<String> mapRoles(Set<Role> roles) {
        if (roles == null) {
            return Collections.emptySet();
        }
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }

    public Set<String> mapPermissions(Set<Role> roles) {
        if (roles == null) {
            return Collections.emptySet();
        }
        return roles.stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .collect(Collectors.toSet());
    }
}
