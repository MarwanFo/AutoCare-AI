package com.autocare.backend.auth.repository;

import com.autocare.backend.auth.entity.AuthToken;
import com.autocare.backend.auth.entity.AuthTokenType;
import com.autocare.backend.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken, UUID> {
    Optional<AuthToken> findByTokenHash(String tokenHash);
    Optional<AuthToken> findByUserAndTokenTypeAndUsedAtIsNull(User user, AuthTokenType tokenType);
}
