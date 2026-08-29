package com.autocare.backend.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminPlatformStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;
    private long unverifiedUsers;
    
    private long totalVehicles;
    private long activeVehicles;
    private long archivedVehicles;

    private long totalTemplates;
    private long totalBrands;
    private long totalModels;

    private long totalJobs;
    private long completedJobs;
    private long failedJobs;
    private long pendingJobs;
}
