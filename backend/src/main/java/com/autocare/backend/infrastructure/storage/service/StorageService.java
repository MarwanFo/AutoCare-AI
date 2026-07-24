package com.autocare.backend.infrastructure.storage.service;

import com.autocare.backend.infrastructure.storage.dto.StoredFile;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    StoredFile store(MultipartFile file, String subDirectory);
    void delete(String fileUrl);
    void validate(MultipartFile file);
}
