package com.autocare.backend.admin.service;

import com.autocare.backend.admin.dto.AdminUserSummaryResponse;
import com.autocare.backend.auth.entity.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AdminUserService {
    Page<AdminUserSummaryResponse> getUsers(String query, AccountStatus status, Pageable pageable);
    AdminUserSummaryResponse getUserById(UUID userId);
    AdminUserSummaryResponse updateUserStatus(UUID userId, AccountStatus status);
    AdminUserSummaryResponse updateUserRole(UUID userId, String roleName);
}
