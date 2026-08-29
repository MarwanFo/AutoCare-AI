package com.autocare.backend.job.repository;

import com.autocare.backend.job.entity.Job;
import com.autocare.backend.job.entity.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    
    Optional<Job> findByClientRequestId(UUID clientRequestId);
    
    List<Job> findByStatusAndLastHeartbeatAtBefore(JobStatus status, Instant threshold);
    
    long countByStatus(JobStatus status);

    org.springframework.data.domain.Page<Job> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Job> findByStatusOrderByCreatedAtDesc(JobStatus status, org.springframework.data.domain.Pageable pageable);

    @Modifying
    @Query("DELETE FROM Job j WHERE j.expiresAt < :now")
    int deleteExpiredJobs(Instant now);
}
