package com.autocare.backend.job.controller;

import com.autocare.backend.job.dto.CreateJobRequest;
import com.autocare.backend.job.dto.JobResponse;
import com.autocare.backend.job.entity.Job;
import com.autocare.backend.job.mapper.JobMapper;
import com.autocare.backend.job.service.JobService;
import com.autocare.backend.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Background Job Management", description = "Endpoints for initiating, tracking status of, and cancelling background tasks.")
public class JobController {

    private final JobService jobService;
    private final JobMapper jobMapper;

    @PostMapping
    @Operation(summary = "Submit a background job", description = "Enqueues a generic background job (e.g. digital twin, OCR, diagnostics) and begins execution asynchronously.")
    @ApiResponse(responseCode = "202", description = "Job enqueued successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request payload")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<JobResponse> createJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateJobRequest request
    ) {
        log.info("Client request to create job of type {} for user: {}", request.getType(), userDetails.getUser().getId());
        Job job = jobService.createJob(userDetails.getUser().getId(), request.getType(), request.getPayload(), request.getClientRequestId());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(jobMapper.toResponse(job));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get background job details", description = "Retrieves current status, progress stage, and completion results of a background job.")
    @ApiResponse(responseCode = "200", description = "Job details retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this job")
    @ApiResponse(responseCode = "404", description = "Job not found")
    public ResponseEntity<JobResponse> getJobById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id
    ) {
        log.info("Client request to check status of job ID: {}", id);
        Job job = jobService.getJobById(id);
        
        // Verify ownership
        if (!job.getUser().getId().equals(userDetails.getUser().getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job.");
        }
        
        return ResponseEntity.ok(jobMapper.toResponse(job));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a background job", description = "Explicitly terminates a running or pending background job.")
    @ApiResponse(responseCode = "200", description = "Job cancelled successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this job")
    @ApiResponse(responseCode = "404", description = "Job not found")
    public ResponseEntity<Void> cancelJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id
    ) {
        log.info("Client request to cancel job ID: {}", id);
        jobService.cancelJob(id, userDetails.getUser().getId());
        return ResponseEntity.ok().build();
    }
}
