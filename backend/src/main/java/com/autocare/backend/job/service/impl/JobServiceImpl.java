package com.autocare.backend.job.service.impl;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.exception.ResourceNotFoundException;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.job.entity.Job;
import com.autocare.backend.job.entity.enums.JobStage;
import com.autocare.backend.job.entity.enums.JobStatus;
import com.autocare.backend.job.entity.enums.JobType;
import com.autocare.backend.job.repository.JobRepository;
import com.autocare.backend.job.service.JobService;
import com.autocare.backend.job.worker.JobWorker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobWorker jobWorker;

    @Override
    @Transactional
    public Job createJob(UUID userId, JobType type, Map<String, Object> payload, UUID clientRequestId) {
        log.info("Creating job of type {} for user: {}", type, userId);

        // Idempotency check
        if (clientRequestId != null) {
            Optional<Job> existingJob = jobRepository.findByClientRequestId(clientRequestId);
            if (existingJob.isPresent()) {
                log.info("Idempotency match found for clientRequestId: {}. Returning existing job ID: {}", 
                        clientRequestId, existingJob.get().getId());
                return existingJob.get();
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Job job = new Job();
        job.setUser(user);
        job.setType(type);
        job.setStatus(JobStatus.PENDING);
        job.setCurrentStage(JobStage.PENDING);
        job.setPayload(payload);
        job.setClientRequestId(clientRequestId);
        job.setCreatedAt(Instant.now());

        Job savedJob = jobRepository.save(job);
        
        // Dispatch job asynchronously to the worker pool
        jobWorker.executeJobAsync(savedJob.getId());

        return savedJob;
    }

    @Override
    @Transactional(readOnly = true)
    public Job getJobById(UUID jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));
    }

    @Override
    @Transactional
    public void startJobExecution(UUID jobId) {
        Job job = getJobById(jobId);
        job.setStatus(JobStatus.RUNNING);
        job.setStartedAt(Instant.now());
        job.setLastHeartbeatAt(Instant.now());
        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void updateHeartbeat(UUID jobId) {
        Job job = getJobById(jobId);
        // Only update if currently running
        if (job.getStatus() == JobStatus.RUNNING) {
            job.setLastHeartbeatAt(Instant.now());
            jobRepository.save(job);
        }
    }

    @Override
    @Transactional
    public void updateStage(UUID jobId, JobStage stage) {
        Job job = getJobById(jobId);
        job.setCurrentStage(stage);
        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void completeJob(UUID jobId, Map<String, Object> result) {
        Job job = getJobById(jobId);
        job.setStatus(JobStatus.COMPLETED);
        job.setCurrentStage(JobStage.COMPLETED);
        job.setResult(result);
        job.setCompletedAt(Instant.now());
        // Clean up completed jobs in 7 days
        job.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void failJob(UUID jobId, Throwable throwable) {
        Job job = getJobById(jobId);
        
        // Increment retry count
        int newRetryCount = job.getRetryCount() + 1;
        job.setRetryCount(newRetryCount);

        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        throwable.printStackTrace(pw);
        job.setErrorMessage(sw.toString());

        if (newRetryCount < job.getMaxRetries()) {
            log.info("Job {} failed, but retries remain ({} of {}). Rescheduling...", 
                    jobId, newRetryCount, job.getMaxRetries());
            job.setStatus(JobStatus.PENDING);
            job.setCurrentStage(JobStage.PENDING);
            job.setLastHeartbeatAt(null);
            jobRepository.save(job);
            
            // Retry execution async
            jobWorker.executeJobAsync(jobId);
        } else {
            log.warn("Job {} failed and retries are exhausted ({} of {}). Marking terminal FAILED.", 
                    jobId, newRetryCount, job.getMaxRetries());
            job.setStatus(JobStatus.FAILED);
            job.setCurrentStage(JobStage.FAILED);
            job.setCompletedAt(Instant.now());
            // Keep failed jobs in database for 30 days for analysis
            job.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
            jobRepository.save(job);
        }
    }

    @Override
    @Transactional
    public void cancelJob(UUID jobId, UUID userId) {
        Job job = getJobById(jobId);
        if (!job.getUser().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("You do not own this job");
        }

        if (job.getStatus() == JobStatus.PENDING || job.getStatus() == JobStatus.RUNNING) {
            job.setStatus(JobStatus.CANCELLED);
            job.setCompletedAt(Instant.now());
            job.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
            jobRepository.save(job);
            log.info("Job ID: {} cancelled by user: {}", jobId, userId);
        }
    }

    @Override
    @Scheduled(fixedDelay = 30000) // Runs every 30 seconds
    @Transactional
    public void recoverDeadJobs() {
        // Find jobs in RUNNING status that haven't updated their heartbeat for more than 30 seconds
        Instant threshold = Instant.now().minus(30, ChronoUnit.SECONDS);
        List<Job> deadJobs = jobRepository.findByStatusAndLastHeartbeatAtBefore(JobStatus.RUNNING, threshold);

        if (!deadJobs.isEmpty()) {
            log.warn("Found {} running jobs with stalled heartbeats. Recovering...", deadJobs.size());
            for (Job job : deadJobs) {
                log.warn("Job ID: {} has stalled heartbeat. Failing/Retrying...", job.getId());
                failJob(job.getId(), new IllegalStateException("Job execution stalled (heartbeat timeout)"));
            }
        }
    }

    @Override
    @Scheduled(cron = "0 0 * * * *") // Runs every hour
    @Transactional
    public void cleanExpiredJobs() {
        log.info("Starting expired jobs cleanup scheduler...");
        int deleted = jobRepository.deleteExpiredJobs(Instant.now());
        log.info("Cleanup completed. Deleted {} expired jobs.", deleted);
    }
}
