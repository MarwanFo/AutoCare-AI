package com.autocare.backend.admin.controller;

import com.autocare.backend.admin.dto.AdminPlatformStatsResponse;
import com.autocare.backend.admin.service.AdminDashboardService;
import com.autocare.backend.job.dto.JobResponse;
import com.autocare.backend.job.entity.enums.JobStatus;
import com.autocare.backend.vehicle.dto.VehicleSummaryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<AdminPlatformStatsResponse> getPlatformStats() {
        log.info("Admin request for global platform statistics");
        return ResponseEntity.ok(adminDashboardService.getPlatformStats());
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobResponse>> getJobs(
            @RequestParam(required = false) JobStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("Admin request for background jobs, status filter: {}", status);
        return ResponseEntity.ok(adminDashboardService.getJobs(status, pageable));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<Page<VehicleSummaryResponse>> getVehicles(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("Admin request for global vehicle fleet, query: {}", query);
        return ResponseEntity.ok(adminDashboardService.getVehicles(query, pageable));
    }
}
