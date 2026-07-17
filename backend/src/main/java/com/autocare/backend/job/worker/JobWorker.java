package com.autocare.backend.job.worker;

import com.autocare.backend.job.entity.Job;
import com.autocare.backend.job.entity.enums.JobType;
import com.autocare.backend.job.service.JobService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JobWorker {

    private final Map<JobType, JobHandler> handlerMap;
    private final JobService jobService;

    @Autowired
    public JobWorker(List<JobHandler> handlers, @Lazy JobService jobService) {
        this.handlerMap = handlers.stream()
                .collect(Collectors.toMap(JobHandler::getType, Function.identity()));
        this.jobService = jobService;
    }

    @Async("jobTaskExecutor")
    public void executeJobAsync(UUID jobId) {
        log.info("Worker picked up job execution for ID: {}", jobId);

        Job job = null;
        for (int i = 0; i < 5; i++) {
            try {
                job = jobService.getJobById(jobId);
                break;
            } catch (com.autocare.backend.auth.exception.ResourceNotFoundException e) {
                log.info("Job ID {} not visible in DB yet. Retrying in 100ms... (attempt {}/5)", jobId, i + 1);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    log.error("Async worker thread interrupted while waiting for job record commit", ie);
                    return;
                }
            }
        }

        if (job == null) {
            log.error("Job ID: {} not found after waiting for transaction commit. Execution aborted.", jobId);
            return;
        }

        JobHandler handler = handlerMap.get(job.getType());
        if (handler == null) {
            log.error("No handler registered for job type: {}", job.getType());
            jobService.failJob(jobId, new IllegalArgumentException("No handler registered for job type: " + job.getType()));
            return;
        }

        // Initialize heartbeat publisher
        ScheduledExecutorService heartbeatExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "job-heartbeat-" + jobId);
            t.setDaemon(true);
            return t;
        });

        // Set status to RUNNING and record start timestamps
        jobService.startJobExecution(jobId);

        try {
            // Heartbeat updates every 5 seconds
            heartbeatExecutor.scheduleAtFixedRate(() -> {
                try {
                    jobService.updateHeartbeat(jobId);
                } catch (Exception e) {
                    log.error("Failed to update heartbeat for job ID: {}", jobId, e);
                }
            }, 5, 5, TimeUnit.SECONDS);

            // Execute actual task logic
            handler.execute(job);

            // Complete successfully
            jobService.completeJob(jobId, job.getResult());
            log.info("Job ID: {} execution completed successfully", jobId);

        } catch (Throwable t) {
            log.error("Error occurred while executing job ID: {}", jobId, t);
            jobService.failJob(jobId, t);
        } finally {
            heartbeatExecutor.shutdownNow();
            try {
                if (!heartbeatExecutor.awaitTermination(2, TimeUnit.SECONDS)) {
                    log.warn("Heartbeat executor for job {} failed to terminate cleanly", jobId);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
