package com.autocare.backend.infrastructure.storage.service.impl;

import com.autocare.backend.infrastructure.storage.dto.StoredFile;
import com.autocare.backend.infrastructure.storage.exception.StorageException;
import com.autocare.backend.infrastructure.storage.service.StorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class LocalStorageServiceImpl implements StorageService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    @Value("${storage.local.upload-dir:uploads}")
    private String uploadDir;

    @Value("${storage.local.base-url:http://localhost:8080/uploads/}")
    private String baseUrl;

    @PostConstruct
    public void init() {
        try {
            Path rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(rootPath);
            log.info("Initialized Local Storage Service. Root Upload Directory: {}", rootPath);
        } catch (Exception e) {
            log.error("Could not initialize local storage root directory", e);
            throw new StorageException("Could not initialize local storage directory", e);
        }
    }

    @Override
    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new StorageException("Failed to store file: Payload is empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new StorageException("File size (" + (file.getSize() / 1024 / 1024) + "MB) exceeds maximum limit of 5MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
            throw new StorageException("Unsupported media format: Only JPEG, PNG, and WEBP image files are allowed.");
        }

        // Magic byte signature inspection
        try (InputStream inputStream = file.getInputStream()) {
            byte[] headerBytes = new byte[12];
            int bytesRead = inputStream.read(headerBytes, 0, headerBytes.length);
            if (bytesRead < 4 || !isMagicByteImageHeader(headerBytes)) {
                throw new StorageException("Security check failed: File header magic bytes do not match a valid JPEG, PNG, or WEBP image.");
            }
        } catch (StorageException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to read image header magic bytes", e);
            throw new StorageException("Failed to validate image file header.", e);
        }
    }

    @Override
    public StoredFile store(MultipartFile file, String subDirectory) {
        validate(file);

        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "avatar.jpg");
            String extension = extractExtension(originalFilename, file.getContentType());
            String newFilename = UUID.randomUUID().toString() + extension;

            String subFolder = subDirectory != null && !subDirectory.isBlank() ? subDirectory.trim() : "general";
            Path targetFolder = Paths.get(uploadDir, subFolder).toAbsolutePath().normalize();
            Files.createDirectories(targetFolder);

            Path targetPath = targetFolder.resolve(newFilename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
            String fileUrl = normalizedBaseUrl + subFolder + "/" + newFilename;
            log.info("Successfully stored image file at: {}", targetPath);

            return new StoredFile(fileUrl, newFilename, file.getContentType(), file.getSize());

        } catch (Exception e) {
            log.error("Failed to store file in local storage", e);
            throw new StorageException("Failed to store file in local storage: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank() || !fileUrl.startsWith(baseUrl)) {
            return;
        }

        try {
            String relativePath = fileUrl.substring(baseUrl.length());
            Path filePath = Paths.get(uploadDir, relativePath).toAbsolutePath().normalize();
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("Successfully deleted stored image file: {}", filePath);
            }
        } catch (Exception e) {
            log.warn("Could not delete stored file at URL: {}", fileUrl, e);
        }
    }

    private boolean isMagicByteImageHeader(byte[] header) {
        // JPEG: FF D8 FF
        boolean isJpeg = (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF;

        // PNG: 89 50 4E 47
        boolean isPng = (header[0] & 0xFF) == 0x89 && (header[1] & 0xFF) == 0x50 && (header[2] & 0xFF) == 0x4E && (header[3] & 0xFF) == 0x47;

        // WEBP: RIFF (bytes 0..3) ... WEBP (bytes 8..11)
        boolean isWebp = (header[0] & 0xFF) == 'R' && (header[1] & 0xFF) == 'I' && (header[2] & 0xFF) == 'F' && (header[3] & 0xFF) == 'F'
                && (header[8] & 0xFF) == 'W' && (header[9] & 0xFF) == 'E' && (header[10] & 0xFF) == 'B' && (header[11] & 0xFF) == 'P';

        return isJpeg || isPng || isWebp;
    }

    private String extractExtension(String filename, String contentType) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex).toLowerCase();
        }
        if ("image/png".equalsIgnoreCase(contentType)) return ".png";
        if ("image/webp".equalsIgnoreCase(contentType)) return ".webp";
        return ".jpg";
    }
}
