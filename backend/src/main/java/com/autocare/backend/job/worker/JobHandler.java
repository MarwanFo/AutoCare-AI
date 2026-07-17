package com.autocare.backend.job.worker;

import com.autocare.backend.job.entity.Job;
import com.autocare.backend.job.entity.enums.JobType;

public interface JobHandler {
    JobType getType();
    void execute(Job job) throws Exception;
}
