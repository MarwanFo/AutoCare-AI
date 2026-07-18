package com.autocare.backend.vehicle.service.impl;

import com.autocare.backend.vehicle.dto.GeminiVehicleProfileResponse;
import com.autocare.backend.vehicle.service.GeminiResponseValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GeminiResponseValidatorImpl implements GeminiResponseValidator {

    @Override
    public boolean isValid(GeminiVehicleProfileResponse response) {
        if (response == null) {
            log.warn("Gemini response validation failed: response object is null");
            return false;
        }

        // 1. Validate Specifications JSON structure exists
        if (response.getSpecifications() == null || response.getSpecifications().isEmpty()) {
            log.warn("Gemini response validation failed: specifications map is null or empty");
            return false;
        }

        // 2. Validate Components list
        if (response.getComponents() == null || response.getComponents().isEmpty()) {
            log.warn("Gemini response validation failed: components list is null or empty");
            return false;
        }

        for (int i = 0; i < response.getComponents().size(); i++) {
            GeminiVehicleProfileResponse.ComponentDto comp = response.getComponents().get(i);
            if (comp.getName() == null || comp.getName().isBlank()) {
                log.warn("Gemini response validation failed: component at index {} has null or blank name", i);
                return false;
            }
            if (comp.getCategory() == null || comp.getCategory().isBlank()) {
                log.warn("Gemini response validation failed: component '{}' at index {} has null or blank category", comp.getName(), i);
                return false;
            }
        }

        // 3. Validate Intervals list
        if (response.getIntervals() == null || response.getIntervals().isEmpty()) {
            log.warn("Gemini response validation failed: intervals list is null or empty");
            return false;
        }

        for (int i = 0; i < response.getIntervals().size(); i++) {
            GeminiVehicleProfileResponse.IntervalDto interval = response.getIntervals().get(i);
            if (interval.getTitle() == null || interval.getTitle().isBlank()) {
                log.warn("Gemini response validation failed: interval at index {} has null or blank title", i);
                return false;
            }
            if (interval.getIntervalMileage() == null && interval.getIntervalMonths() == null) {
                log.warn("Gemini response validation failed: interval '{}' at index {} has both mileage and months as null", interval.getTitle(), i);
                return false;
            }
            if (interval.getIntervalMileage() != null && interval.getIntervalMileage() <= 0) {
                log.warn("Gemini response validation failed: interval '{}' at index {} has non-positive mileage: {}", interval.getTitle(), i, interval.getIntervalMileage());
                return false;
            }
            if (interval.getIntervalMonths() != null && interval.getIntervalMonths() <= 0) {
                log.warn("Gemini response validation failed: interval '{}' at index {} has non-positive months: {}", interval.getTitle(), i, interval.getIntervalMonths());
                return false;
            }
        }

        // 4. Validate Documents list (optional or required structure check)
        if (response.getDocuments() != null) {
            for (int i = 0; i < response.getDocuments().size(); i++) {
                GeminiVehicleProfileResponse.DocumentDto doc = response.getDocuments().get(i);
                if (doc.getTitle() == null || doc.getTitle().isBlank()) {
                    log.warn("Gemini response validation failed: document at index {} has null or blank title", i);
                    return false;
                }
            }
        }

        return true;
    }
}
