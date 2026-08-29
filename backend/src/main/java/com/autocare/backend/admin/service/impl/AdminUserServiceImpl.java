package com.autocare.backend.admin.service.impl;

import com.autocare.backend.admin.dto.AdminUserSummaryResponse;
import com.autocare.backend.admin.service.AdminUserService;
import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.Role;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.exception.ResourceNotFoundException;
import com.autocare.backend.auth.repository.RoleRepository;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.vehicle.repository.UserVehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserVehicleRepository userVehicleRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserSummaryResponse> getUsers(String query, AccountStatus status, Pageable pageable) {
        Page<User> usersPage;
        if (query != null && !query.trim().isEmpty()) {
            usersPage = userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                    query.trim(), query.trim(), pageable);
        } else if (status != null) {
            usersPage = userRepository.findByStatus(status, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        return usersPage.map(this::mapToSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserSummaryResponse getUserById(UUID userId) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapToSummary(user);
    }

    @Override
    @Transactional
    public AdminUserSummaryResponse updateUserStatus(UUID userId, AccountStatus status) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        log.info("Admin changing status for user: {} from {} to {}", userId, user.getStatus(), status);
        user.setStatus(status);
        User saved = userRepository.save(user);
        return mapToSummary(saved);
    }

    @Override
    @Transactional
    public AdminUserSummaryResponse updateUserRole(UUID userId, String roleName) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Role role = roleRepository.findByName(roleName.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));

        // Ensure user retains at least one role
        Set<Role> roles = new HashSet<>(user.getRoles());
        roles.add(role);
        user.setRoles(roles);

        log.info("Admin updated roles for user: {}, new roles: {}", userId, roles.stream().map(Role::getName).collect(Collectors.toSet()));
        User saved = userRepository.save(user);
        return mapToSummary(saved);
    }

    private AdminUserSummaryResponse mapToSummary(User user) {
        Set<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
                : Set.of();

        long vehicleCount = userVehicleRepository.countByUserId(user.getId());

        return AdminUserSummaryResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus() != null ? user.getStatus().name() : "ACTIVE")
                .profileCompleted(user.isProfileCompleted())
                .roles(roleNames)
                .vehicleCount(vehicleCount)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getLastModifiedAt())
                .build();
    }
}
