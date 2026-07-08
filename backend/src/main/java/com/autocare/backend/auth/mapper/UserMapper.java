package com.autocare.backend.auth.mapper;

import com.autocare.backend.auth.dto.AuthResponse.AuthUserResponse;
import com.autocare.backend.auth.dto.RegisterRequest;
import com.autocare.backend.auth.dto.UserProfileResponse;
import com.autocare.backend.auth.entity.Permission;
import com.autocare.backend.auth.entity.Role;
import com.autocare.backend.auth.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "profileCompleted", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "aiCredits", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "sessions", ignore = true)
    @Mapping(target = "authTokens", ignore = true)
    @Mapping(target = "passwordHistory", ignore = true)
    @Mapping(target = "auditLogs", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "lastModifiedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    User toEntity(RegisterRequest request);

    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRoles")
    @Mapping(target = "permissions", source = "roles", qualifiedByName = "mapPermissions")
    @Mapping(target = "isEmailVerified", expression = "java(user.getStatus() != com.autocare.backend.auth.entity.AccountStatus.UNVERIFIED)")
    @Mapping(target = "isProfileCompleted", source = "profileCompleted")
    AuthUserResponse toAuthUserResponse(User user);

    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRoles")
    @Mapping(target = "permissions", source = "roles", qualifiedByName = "mapPermissions")
    @Mapping(target = "status", source = "status")
    UserProfileResponse toUserProfileResponse(User user);

    @Named("mapRoles")
    default Set<String> mapRoles(Set<Role> roles) {
        if (roles == null) {
            return Collections.emptySet();
        }
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }

    @Named("mapPermissions")
    default Set<String> mapPermissions(Set<Role> roles) {
        if (roles == null) {
            return Collections.emptySet();
        }
        return roles.stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .collect(Collectors.toSet());
    }
}
