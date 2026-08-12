package com.autocare.backend.vehicle.repository;

import com.autocare.backend.vehicle.entity.UserDocument;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDocumentRepository extends JpaRepository<UserDocument, UUID> {
    List<UserDocument> findByUserVehicleIdOrderByTitleAsc(UUID userVehicleId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM UserDocument d WHERE d.id = :id")
    Optional<UserDocument> findByIdForUpdate(@Param("id") UUID id);

    @Query("SELECT d.id FROM UserDocument d WHERE d.expiryDate IS NOT NULL AND (d.expiryDate <= :warningCutoff OR d.id IN (SELECT n.document.id FROM Notification n WHERE n.type IN ('DOCUMENT_EXPIRING', 'DOCUMENT_EXPIRED') AND n.resolvedAt IS NULL))")
    List<UUID> findCandidateDocumentIdsForExpirationCheck(@Param("warningCutoff") LocalDate warningCutoff);
}
