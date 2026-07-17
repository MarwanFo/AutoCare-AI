package com.autocare.backend.job.dto;

import com.autocare.backend.job.entity.enums.JobStage;
import com.autocare.backend.job.entity.enums.JobStatus;
import com.autocare.backend.job.entity.enums.JobType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private UUID id;
    private JobType type;
    private JobStatus status;
    private JobStage currentStage;
    private Map<String, Object> payload;
    private Map<String, Object> result;
    private String errorMessage;
    private Integer retryCount;
    private UUID clientRequestId;
    private Instant createdAt;
    private Instant startedAt;
    private Instant completedAt;
}
