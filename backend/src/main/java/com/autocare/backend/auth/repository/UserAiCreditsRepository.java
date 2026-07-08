package com.autocare.backend.auth.repository;

import com.autocare.backend.auth.entity.UserAiCredits;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserAiCreditsRepository extends JpaRepository<UserAiCredits, UUID> {
}
