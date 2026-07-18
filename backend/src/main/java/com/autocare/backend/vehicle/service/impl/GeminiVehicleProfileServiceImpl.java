package com.autocare.backend.vehicle.service.impl;

import com.autocare.backend.vehicle.dto.GeminiVehicleProfileResponse;
import com.autocare.backend.vehicle.entity.*;
import com.autocare.backend.vehicle.entity.enums.ComponentCategory;
import com.autocare.backend.vehicle.repository.VehicleTemplateRepository;
import com.autocare.backend.vehicle.service.GeminiClient;
import com.autocare.backend.vehicle.service.GeminiPromptBuilder;
import com.autocare.backend.vehicle.service.GeminiResponseValidator;
import com.autocare.backend.vehicle.service.GeminiVehicleProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiVehicleProfileServiceImpl implements GeminiVehicleProfileService {

    private final GeminiClient geminiClient;
    private final GeminiPromptBuilder geminiPromptBuilder;
    private final GeminiResponseValidator geminiResponseValidator;
    private final VehicleTemplateRepository vehicleTemplateRepository;

    @Override
    @Transactional
    public VehicleTemplate generateAndSaveTemplate(
            Brand brand, 
            Model model, 
            Integer year, 
            String trimConfiguration, 
            String engine, 
            String transmission, 
            String fuelType) {
        
        log.info("Starting AI profile generation for vehicle: {} {} {}", year, brand.getName(), model.getName());

        // 1. Build structured prompt
        String prompt = geminiPromptBuilder.buildPrompt(
                brand.getName(), 
                model.getName(), 
                trimConfiguration, 
                year, 
                engine, 
                transmission, 
                fuelType
        );

        // 2. Query Gemini API
        GeminiVehicleProfileResponse aiResponse = geminiClient.fetchProfile(prompt);

        // 3. Validate structured response
        if (!geminiResponseValidator.isValid(aiResponse)) {
            log.error("Gemini response validation failed for vehicle {} {} {}. Response: {}", year, brand.getName(), model.getName(), aiResponse);
            throw new IllegalArgumentException("The AI-generated vehicle profile failed structural validation constraints.");
        }

        log.info("AI vehicle profile successfully validated. Persisting template...");

        // 4. Assemble and populate VehicleTemplate entity
        VehicleTemplate template = new VehicleTemplate();
        template.setBrand(brand);
        template.setModel(model);
        template.setYear(year);
        template.setTrimConfiguration(trimConfiguration != null && !trimConfiguration.isBlank() ? trimConfiguration : "Standard");
        java.util.Map<String, Object> specs = aiResponse.getSpecifications();
        if (specs == null) {
            specs = new java.util.HashMap<>();
        } else {
            specs = new java.util.HashMap<>(specs);
        }
        if (aiResponse.getTransmission() != null) {
            specs.put("transmission", aiResponse.getTransmission());
        }
        if (aiResponse.getFuelType() != null) {
            specs.put("fuelType", aiResponse.getFuelType());
        }
        if (aiResponse.getDocuments() != null) {
            specs.put("documents", aiResponse.getDocuments());
        }
        template.setSpecifications(specs);
        template.setVersion(1);

        // Map DTO components to TemplateComponent entity hierarchy
        for (GeminiVehicleProfileResponse.ComponentDto compDto : aiResponse.getComponents()) {
            TemplateComponent tc = new TemplateComponent();
            ComponentCategory category;
            try {
                category = ComponentCategory.valueOf(compDto.getCategory().toUpperCase());
            } catch (IllegalArgumentException | NullPointerException e) {
                category = ComponentCategory.OTHER;
            }
            tc.setCategory(category);
            tc.setName(compDto.getName());
            tc.setStandardPartNumber(compDto.getStandardPartNumber());
            tc.setStandardSpecifications(compDto.getStandardSpecifications());
            
            template.addComponent(tc);
        }

        // Map DTO intervals to TemplateInterval entity hierarchy
        for (GeminiVehicleProfileResponse.IntervalDto intDto : aiResponse.getIntervals()) {
            TemplateInterval ti = new TemplateInterval();
            ti.setTitle(intDto.getTitle());
            ti.setDescription(intDto.getDescription());
            ti.setIntervalMileage(intDto.getIntervalMileage());
            ti.setIntervalMonths(intDto.getIntervalMonths());
            ti.setInspectionOnly(intDto.isInspectionOnly());
            
            template.addInterval(ti);
        }

        // 5. Persist template (CascadeType.ALL propagates inserts to components and intervals)
        return vehicleTemplateRepository.save(template);
    }
}
