package com.autocare.backend.vehicle.service;

import com.autocare.backend.vehicle.repository.UserDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DocumentExpirationScheduler {

    private final UserDocumentRepository userDocumentRepository;
    private final DocumentExpirationEvaluator documentExpirationEvaluator;
    private final Clock clock;

    @Value("${autocare.notifications.document-expiry-warning-days:30}")
    private int documentExpiryWarningDays;

    @Scheduled(cron = "${autocare.notifications.document-evaluation-cron:0 0 2 * * *}")
    public void runDailyDocumentExpirationEvaluation() {
        log.info("Starting scheduled daily document expiration evaluation...");
        LocalDate warningCutoff = LocalDate.now(clock).plusDays(documentExpiryWarningDays);

        List<UUID> candidateDocumentIds = userDocumentRepository.findCandidateDocumentIdsForExpirationCheck(warningCutoff);
        log.info("Found {} candidate document records for expiration check.", candidateDocumentIds.size());

        for (UUID docId : candidateDocumentIds) {
            try {
                documentExpirationEvaluator.evaluateDocumentInIsolatedTransaction(docId);
            } catch (Exception e) {
                log.error("Failed to evaluate document expiration for ID: {}", docId, e);
            }
        }
        log.info("Scheduled daily document expiration evaluation completed.");
    }
}
