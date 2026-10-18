package com.autocare.backend.admin.service.impl;

import com.autocare.backend.admin.dto.AdminCreateUserRequest;
import com.autocare.backend.admin.dto.AdminUserSummaryResponse;
import com.autocare.backend.admin.service.AdminUserService;
import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.PasswordHistory;
import com.autocare.backend.auth.entity.Role;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.entity.UserAiCredits;
import com.autocare.backend.auth.exception.EmailAlreadyExistsException;
import com.autocare.backend.auth.exception.PhoneNumberAlreadyExistsException;
import com.autocare.backend.auth.exception.ResourceNotFoundException;
import com.autocare.backend.auth.repository.PasswordHistoryRepository;
import com.autocare.backend.auth.repository.RoleRepository;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.vehicle.repository.UserVehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;
    private final PasswordHistoryRepository passwordHistoryRepository;

    @Override
    @Transactional
    public AdminUserSummaryResponse createUser(AdminCreateUserRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException("Email is already registered: " + normalizedEmail);
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber().trim())) {
                throw new PhoneNumberAlreadyExistsException("Phone number is already registered.");
            }
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setFullName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        user.setStatus(request.getStatus() != null ? request.getStatus() : AccountStatus.ACTIVE);
        user.setProfileCompleted(true);
        user.setPreferredLanguage("en");
        user.setPreferredCurrency("MAD");
        user.setPreferredDistanceUnit("KM");
        user.setPushNotificationsEnabled(true);
        user.setEmailNotificationsEnabled(true);

        String rawRole = (request.getRole() != null && !request.getRole().trim().isEmpty())
                ? request.getRole().trim().toUpperCase()
                : "ROLE_USER";
        final String roleName = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;

        Role assignedRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        user.getRoles().add(assignedRole);

        // Initial default starting AI credits
        UserAiCredits credits = new UserAiCredits();
        credits.setUser(user);
        credits.setCredits(10);
        user.setAiCredits(credits);

        User savedUser = userRepository.save(user);

        PasswordHistory history = new PasswordHistory();
        history.setUser(savedUser);
        history.setPasswordHash(savedUser.getPasswordHash());
        passwordHistoryRepository.save(history);

        log.info("Admin created new user: id={}, email={}, role={}", savedUser.getId(), savedUser.getEmail(), roleName);
        return mapToSummary(savedUser);
    }

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
