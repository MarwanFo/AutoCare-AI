package com.autocare.backend.admin.controller;

import com.autocare.backend.admin.dto.AdminUpdateUserRoleRequest;
import com.autocare.backend.admin.dto.AdminUpdateUserStatusRequest;
import com.autocare.backend.admin.dto.AdminUserSummaryResponse;
import com.autocare.backend.admin.service.AdminUserService;
import com.autocare.backend.auth.entity.AccountStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<Page<AdminUserSummaryResponse>> getUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) AccountStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("Admin request to list users, query: {}, status: {}", query, status);
        Page<AdminUserSummaryResponse> users = adminUserService.getUsers(query, status, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserSummaryResponse> getUserById(@PathVariable UUID id) {
        log.info("Admin request to get user details by ID: {}", id);
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminUserSummaryResponse> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateUserStatusRequest request
    ) {
        log.info("Admin changing status for user: {} to {}", id, request.getStatus());
        return ResponseEntity.ok(adminUserService.updateUserStatus(id, request.getStatus()));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<AdminUserSummaryResponse> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateUserRoleRequest request
    ) {
        log.info("Admin updating role for user: {} to {}", id, request.getRoleName());
        return ResponseEntity.ok(adminUserService.updateUserRole(id, request.getRoleName()));
    }
}
