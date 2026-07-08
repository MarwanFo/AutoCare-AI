package com.autocare.backend.auth.repository;

import com.autocare.backend.auth.entity.PasswordHistory;
import com.autocare.backend.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, UUID> {
    List<PasswordHistory> findTop5ByUserOrderByCreatedAtDesc(User user);
}
