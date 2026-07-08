package com.autocare.backend.auth.repository;

import com.autocare.backend.auth.entity.AuditLog;
import com.autocare.backend.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    Page<AuditLog> findAllByUser(User user, Pageable pageable);
}
