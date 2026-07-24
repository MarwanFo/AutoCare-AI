package com.autocare.backend.auth.service.impl;

import com.autocare.backend.auth.dto.UserProfileResponse;
import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.exception.DuplicateResourceException;
import com.autocare.backend.auth.exception.UserNotFoundException;
import com.autocare.backend.auth.mapper.UserMapper;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.auth.service.UserService;
import com.autocare.backend.user.dto.request.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

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
