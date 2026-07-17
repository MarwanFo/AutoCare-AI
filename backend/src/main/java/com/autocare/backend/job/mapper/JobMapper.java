package com.autocare.backend.job.mapper;

import com.autocare.backend.job.dto.JobResponse;
import com.autocare.backend.job.entity.Job;
import org.springframework.stereotype.Component;

@Component
public class JobMapper {
    
    public JobResponse toResponse(Job job) {
        if (job == null) {
            return null;
        }
        return JobResponse.builder()
                .id(job.getId())
                .type(job.getType())
                .status(job.getStatus())
                .currentStage(job.getCurrentStage())
                .payload(job.getPayload())
                .result(job.getResult())
                .errorMessage(job.getErrorMessage())
                .retryCount(job.getRetryCount())
                .clientRequestId(job.getClientRequestId())
                .createdAt(job.getCreatedAt())
                .startedAt(job.getStartedAt())
                .completedAt(job.getCompletedAt())
                .build();
    }
}
