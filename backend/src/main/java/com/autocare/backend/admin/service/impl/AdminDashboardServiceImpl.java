package com.autocare.backend.admin.service.impl;

import com.autocare.backend.admin.dto.AdminPlatformStatsResponse;
import com.autocare.backend.admin.service.AdminDashboardService;
import com.autocare.backend.auth.entity.AccountStatus;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.job.dto.JobResponse;
import com.autocare.backend.job.entity.Job;
import com.autocare.backend.job.entity.enums.JobStatus;
import com.autocare.backend.job.repository.JobRepository;
import com.autocare.backend.vehicle.dto.VehicleSummaryResponse;
import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.enums.VehicleStatus;
import com.autocare.backend.vehicle.repository.BrandRepository;
import com.autocare.backend.vehicle.repository.ModelRepository;
import com.autocare.backend.vehicle.repository.UserVehicleRepository;
import com.autocare.backend.vehicle.repository.VehicleTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final UserVehicleRepository userVehicleRepository;
    private final VehicleTemplateRepository vehicleTemplateRepository;
    private final BrandRepository brandRepository;
    private final ModelRepository modelRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminPlatformStatsResponse getPlatformStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(AccountStatus.ACTIVE);
        long suspendedUsers = userRepository.countByStatus(AccountStatus.SUSPENDED);
        long unverifiedUsers = userRepository.countByStatus(AccountStatus.UNVERIFIED);

        long totalVehicles = userVehicleRepository.count();
        long activeVehicles = userVehicleRepository.countByStatus(VehicleStatus.ACTIVE);
        long archivedVehicles = userVehicleRepository.countByStatus(VehicleStatus.ARCHIVED);

        long totalTemplates = vehicleTemplateRepository.count();
        long totalBrands = brandRepository.count();
        long totalModels = modelRepository.count();

        long totalJobs = jobRepository.count();
        long completedJobs = jobRepository.countByStatus(JobStatus.COMPLETED);
        long failedJobs = jobRepository.countByStatus(JobStatus.FAILED);
        long pendingJobs = jobRepository.countByStatus(JobStatus.PENDING) + jobRepository.countByStatus(JobStatus.RUNNING);

        return AdminPlatformStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .suspendedUsers(suspendedUsers)
                .unverifiedUsers(unverifiedUsers)
                .totalVehicles(totalVehicles)
                .activeVehicles(activeVehicles)
                .archivedVehicles(archivedVehicles)
                .totalTemplates(totalTemplates)
                .totalBrands(totalBrands)
                .totalModels(totalModels)
                .totalJobs(totalJobs)
                .completedJobs(completedJobs)
                .failedJobs(failedJobs)
                .pendingJobs(pendingJobs)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getJobs(JobStatus status, Pageable pageable) {
        Page<Job> jobsPage = status != null
                ? jobRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : jobRepository.findAllByOrderByCreatedAtDesc(pageable);

        return jobsPage.map(job -> JobResponse.builder()
                .id(job.getId())
                .clientRequestId(job.getClientRequestId())
                .type(job.getType())
                .status(job.getStatus())
                .currentStage(job.getCurrentStage())
                .payload(job.getPayload())
                .result(job.getResult())
                .errorMessage(job.getErrorMessage())
                .retryCount(job.getRetryCount())
                .createdAt(job.getCreatedAt())
                .startedAt(job.getStartedAt())
                .completedAt(job.getCompletedAt())
                .build()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VehicleSummaryResponse> getVehicles(String query, Pageable pageable) {
        Page<UserVehicle> vehicles = userVehicleRepository.findAllWithDetails(
                query != null && !query.trim().isEmpty() ? query.trim() : null, pageable);

        return vehicles.map(v -> {
            VehicleSummaryResponse summary = new VehicleSummaryResponse();
            summary.setId(v.getId());
            summary.setBrandName(v.getTemplate().getBrand().getName());
            summary.setModelName(v.getTemplate().getModel().getName());
            summary.setYear(v.getTemplate().getYear());
            summary.setTrimConfiguration(v.getTemplate().getTrimConfiguration());
            summary.setNickname(v.getNickname());
            summary.setLicensePlate(v.getLicensePlate());
            summary.setVin(v.getVin());
            summary.setCurrentMileage(v.getCurrentMileage());
            summary.setMileageUnit(v.getMileageUnit());
            summary.setFuelType(v.getFuelType());
            summary.setTransmission(v.getTransmission());
            summary.setColor(v.getColor());
            summary.setPurchaseCondition(v.getPurchaseCondition());
            summary.setPrimary(v.isPrimary());
            summary.setStatus(v.getStatus());
            summary.setCompletenessScore(v.getCompletenessScore());
            summary.setPurchaseDate(v.getPurchaseDate());
            summary.setMileageAtPurchase(v.getMileageAtPurchase());
            summary.setLastServiceDate(v.getLastServiceDate());
            summary.setLastServiceMileage(v.getLastServiceMileage());
            return summary;
        });
    }
}
