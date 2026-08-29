package com.autocare.backend.admin.service;

import com.autocare.backend.admin.dto.AdminPlatformStatsResponse;
import com.autocare.backend.job.dto.JobResponse;
import com.autocare.backend.job.entity.enums.JobStatus;
import com.autocare.backend.vehicle.dto.VehicleSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminDashboardService {
    AdminPlatformStatsResponse getPlatformStats();
    Page<JobResponse> getJobs(JobStatus status, Pageable pageable);
    Page<VehicleSummaryResponse> getVehicles(String query, Pageable pageable);
}
