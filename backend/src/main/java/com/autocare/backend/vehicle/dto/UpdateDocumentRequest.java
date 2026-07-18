package com.autocare.backend.vehicle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateDocumentRequest {

    @NotBlank(message = "Document title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;

    @NotBlank(message = "Document URL is required")
    @Size(max = 255, message = "URL cannot exceed 255 characters")
    private String url;

    private LocalDate expiryDate;

    private String notes;
}
