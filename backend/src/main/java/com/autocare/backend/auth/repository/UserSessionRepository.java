package com.autocare.backend.auth.repository;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {
    Optional<UserSession> findByTokenHash(String tokenHash);
    Optional<UserSession> findByUserAndDeviceId(User user, UUID deviceId);
    List<UserSession> findAllByUserAndRevokedAtIsNull(User user);
    Optional<UserSession> findByIdAndUser(UUID id, User user);
    void deleteByUser(User user);
}
