package com.autocare.backend.subscription.repository;

import com.autocare.backend.subscription.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, UUID> {
    Optional<UserSubscription> findFirstByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status);
}
