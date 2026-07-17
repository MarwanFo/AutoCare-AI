package com.autocare.backend.vehicle.controller;

import com.autocare.backend.vehicle.dto.BrandResponse;
import com.autocare.backend.vehicle.entity.Brand;
import com.autocare.backend.vehicle.mapper.BrandMapper;
import com.autocare.backend.vehicle.repository.BrandRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Tag(name = "Brand Management", description = "Endpoints for retrieving vehicle brands.")
public class BrandController {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @GetMapping
    @Operation(summary = "Get all brands", description = "Retrieves a list of all vehicle brands, sorted alphabetically.")
    @ApiResponse(responseCode = "200", description = "List of brands retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT token required")
    public ResponseEntity<List<BrandResponse>> getBrands() {
        log.info("Fetching all vehicle brands");
        List<Brand> brands = brandRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
        List<BrandResponse> response = brandMapper.toResponseList(brands);
        return ResponseEntity.ok(response);
    }
}
