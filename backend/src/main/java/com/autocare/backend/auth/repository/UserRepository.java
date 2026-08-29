package com.autocare.backend.auth.repository;

import com.autocare.backend.auth.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, UUID id);

    long countByStatus(com.autocare.backend.auth.entity.AccountStatus status);

    org.springframework.data.domain.Page<User> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
            String email, String fullName, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<User> findByStatus(
            com.autocare.backend.auth.entity.AccountStatus status, org.springframework.data.domain.Pageable pageable);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findWithRolesAndPermissionsByEmail(String email);

    @EntityGraph(attributePaths = {"roles"})
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdWithRoles(UUID id);
}
