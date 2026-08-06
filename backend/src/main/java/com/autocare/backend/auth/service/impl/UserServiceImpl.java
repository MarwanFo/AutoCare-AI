package com.autocare.backend.auth.service.impl;

import com.autocare.backend.auth.dto.UserProfileResponse;
import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.exception.DuplicateResourceException;
import com.autocare.backend.auth.exception.InvalidCredentialsException;
import com.autocare.backend.auth.exception.UserNotFoundException;
import com.autocare.backend.auth.mapper.UserMapper;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.auth.repository.UserSessionRepository;
import com.autocare.backend.auth.service.UserService;
import com.autocare.backend.infrastructure.storage.dto.StoredFile;
import com.autocare.backend.infrastructure.storage.service.StorageService;
import com.autocare.backend.user.dto.request.DeactivateAccountRequest;
import com.autocare.backend.user.dto.request.UpdatePreferencesRequest;
import com.autocare.backend.user.dto.request.UpdateProfileRequest;
import com.autocare.backend.user.dto.response.AvatarUploadResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final UserMapper userMapper;
    private final StorageService storageService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserProfileResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));
        return userMapper.toUserProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        log.info("Updating profile details for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));

        if (request.phoneNumber() != null && !request.phoneNumber().trim().isEmpty()) {
            String sanitizedPhone = request.phoneNumber().trim();
            if (userRepository.existsByPhoneNumberAndIdNot(sanitizedPhone, userId)) {
                throw new DuplicateResourceException("The phone number '" + sanitizedPhone + "' is already in use by another active account.");
            }
            user.setPhoneNumber(sanitizedPhone);
        } else {
            user.setPhoneNumber(null);
        }

        user.setFullName(request.fullName().trim());
        user.setProfileCompleted(true);

        User savedUser = userRepository.save(user);
        return userMapper.toUserProfileResponse(savedUser);
    }

    @Override
    @Transactional
    public UserProfileResponse updatePreferences(UUID userId, UpdatePreferencesRequest request) {
        log.info("Updating preferences for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));

        user.setPreferredLanguage(request.preferredLanguage().trim().toUpperCase());
        user.setPreferredCurrency(request.preferredCurrency().trim().toUpperCase());
        user.setPreferredDistanceUnit(request.preferredDistanceUnit().trim().toUpperCase());
        user.setPushNotificationsEnabled(request.pushNotificationsEnabled());
        user.setEmailNotificationsEnabled(request.emailNotificationsEnabled());

        User savedUser = userRepository.save(user);
        return userMapper.toUserProfileResponse(savedUser);
    }

    @Override
    @Transactional
    public AvatarUploadResponse uploadAvatar(UUID userId, MultipartFile file) {
        log.info("Uploading new avatar for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));

        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            try {
                storageService.delete(user.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Could not delete previous avatar file at URL: {}", user.getAvatarUrl(), e);
            }
        }

        StoredFile storedFile = storageService.store(file, "avatars");
        user.setAvatarUrl(storedFile.fileUrl());
        userRepository.save(user);

        return new AvatarUploadResponse(storedFile.fileUrl());
    }

    @Override
    @Transactional
    public void deleteAvatar(UUID userId) {
        log.info("Deleting custom avatar for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));

        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            storageService.delete(user.getAvatarUrl());
            user.setAvatarUrl(null);
            userRepository.save(user);
        }
    }

    @Override
    @Transactional
    public void deactivateAccount(UUID userId, DeactivateAccountRequest request) {
        log.info("Request to deactivate account for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));

        if (!passwordEncoder.matches(request.confirmationPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Confirmation password is incorrect");
        }

        user.setDeletedAt(Instant.now());
        user.setStatus(AccountStatus.SUSPENDED);
        userRepository.save(user);

        userSessionRepository.revokeAllByUser(user, Instant.now());
        log.info("Successfully soft-deleted account and revoked all active sessions for user ID: {}", userId);
    }

    @Override
    public User getById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));
    }

    @Override
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));
    }
}
