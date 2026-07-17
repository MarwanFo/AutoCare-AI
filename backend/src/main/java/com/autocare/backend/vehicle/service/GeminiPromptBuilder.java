package com.autocare.backend.vehicle.service;

public interface GeminiPromptBuilder {
    String buildPrompt(
            String brand, 
            String model, 
            String trim, 
            Integer year, 
            String engine, 
            String transmission, 
            String fuelType
    );
}
