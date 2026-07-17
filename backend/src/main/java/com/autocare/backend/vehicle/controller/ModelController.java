package com.autocare.backend.vehicle.controller;

import com.autocare.backend.auth.exception.ResourceNotFoundException;
import com.autocare.backend.vehicle.dto.ModelResponse;
import com.autocare.backend.vehicle.entity.Model;
import com.autocare.backend.vehicle.repository.BrandRepository;
import com.autocare.backend.vehicle.repository.ModelRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Tag(name = "Model Management", description = "Endpoints for retrieving vehicle models.")
public class ModelController {

    private final BrandRepository brandRepository;
    private final ModelRepository modelRepository;

    @GetMapping("/{brandId}/models")
    @Operation(summary = "Get models by brand ID", description = "Retrieves a list of vehicle models for the specified brand, sorted alphabetically.")
    @ApiResponse(responseCode = "200", description = "List of models retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT token required")
    @ApiResponse(responseCode = "404", description = "Not Found - Brand does not exist")
    public ResponseEntity<List<ModelResponse>> getModelsByBrand(@PathVariable UUID brandId) {
        log.info("Fetching models for brand ID: {}", brandId);
        if (!brandRepository.existsById(brandId)) {
            throw new ResourceNotFoundException("Brand not found with ID: " + brandId);
        }
        List<Model> models = modelRepository.findByBrandIdOrderByNameAsc(brandId);
        List<ModelResponse> response = models.stream()
                .map(model -> ModelResponse.builder()
                        .id(model.getId())
                        .name(model.getName())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
