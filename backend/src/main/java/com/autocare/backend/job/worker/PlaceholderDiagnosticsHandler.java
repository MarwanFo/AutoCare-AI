package com.autocare.backend.job.worker;

import com.autocare.backend.job.entity.Job;
import com.autocare.backend.job.entity.enums.JobStage;
import com.autocare.backend.job.entity.enums.JobType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class PlaceholderDiagnosticsHandler implements JobHandler {

    @Override
    public JobType getType() {
        return JobType.DIAGNOSTICS;
    }

    @Override
    public void execute(Job job) throws Exception {
        log.info("Starting mock diagnostics execution for job: {}", job.getId());
        Thread.sleep(1000);
        job.setCurrentStage(JobStage.FINALIZING);
        log.info("Mock diagnostics initialized for job {}", job.getId());
    }
}
