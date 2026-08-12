package com.autocare.backend.vehicle.service;

import com.autocare.backend.notification.service.NotificationService;
import com.autocare.backend.vehicle.entity.UserDocument;
import com.autocare.backend.vehicle.repository.UserDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentExpirationEvaluator {

    private final UserDocumentRepository userDocumentRepository;
    private final NotificationService notificationService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void evaluateDocumentInIsolatedTransaction(UUID documentId) {
        if (documentId == null) return;

        // Acquire pessimistic write lock on individual UserDocument row
        UserDocument document = userDocumentRepository.findByIdForUpdate(documentId).orElse(null);
        if (document == null || document.getUserVehicle() == null || document.getUserVehicle().getUser() == null) {
            return;
        }

        notificationService.evaluateDocumentNotification(
                document.getUserVehicle().getUser().getId(),
                document.getUserVehicle(),
                document
        );
    }
}
