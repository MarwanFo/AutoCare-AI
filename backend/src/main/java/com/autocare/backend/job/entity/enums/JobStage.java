package com.autocare.backend.job.entity.enums;

public enum JobStage {
    PENDING,
    
    // Digital Twin Generation backend operations
    VALIDATING_REQUEST,
    LOOKING_FOR_TEMPLATE,
    GENERATING_TEMPLATE,
    SAVING_TEMPLATE,
    CLONING_DIGITAL_TWIN,
    FINALIZING,
    
    // General lifecycle stages
    COMPLETED,
    FAILED
}
