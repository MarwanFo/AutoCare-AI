package com.autocare.backend.job.service;

import com.autocare.backend.job.entity.Job;
import com.autocare.backend.job.entity.enums.JobStage;
import com.autocare.backend.job.entity.enums.JobType;

import java.util.Map;
import java.util.UUID;

public interface JobService {
    
    Job createJob(UUID userId, JobType type, Map<String, Object> payload, UUID clientRequestId);
    
    Job getJobById(UUID jobId);
    
    void startJobExecution(UUID jobId);
    
    void updateHeartbeat(UUID jobId);
    
    void updateStage(UUID jobId, JobStage stage);
    
    void completeJob(UUID jobId, Map<String, Object> result);
    
    void failJob(UUID jobId, Throwable throwable);
    
    void cancelJob(UUID jobId, UUID userId);
    
    void recoverDeadJobs();
    
    void cleanExpiredJobs();
}
