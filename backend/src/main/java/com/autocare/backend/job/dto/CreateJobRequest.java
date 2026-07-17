package com.autocare.backend.job.dto;

import com.autocare.backend.job.entity.enums.JobType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class CreateJobRequest {
    @NotNull(message = "Job type is required")
    private JobType type;
    
    private Map<String, Object> payload;
    
    private UUID clientRequestId;
}
