package com.autocare.backend.infrastructure.storage.dto;

public record StoredFile(
    String fileUrl,
    String filename,
    String contentType,
    long sizeBytes
) {}
