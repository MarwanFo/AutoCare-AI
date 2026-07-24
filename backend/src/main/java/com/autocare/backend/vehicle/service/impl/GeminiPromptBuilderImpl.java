package com.autocare.backend.vehicle.service.impl;

import com.autocare.backend.vehicle.service.GeminiPromptBuilder;
import org.springframework.stereotype.Component;

@Component
public class GeminiPromptBuilderImpl implements GeminiPromptBuilder {

    @Override
    public String buildPrompt(
            String brand, 
            String model, 
            String trim, 
            Integer year, 
            String engine, 
            String transmission, 
            String fuelType) {
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert automotive intelligence engine. ")
              .append("Generate a detailed digital twin profile for the following vehicle:\n")
              .append("- Brand: ").append(brand).append("\n")
              .append("- Model: ").append(model).append("\n")
              .append("- Year: ").append(year).append("\n");

        if (trim != null && !trim.isBlank()) {
            prompt.append("- Trim/Configuration: ").append(trim).append("\n");
        }
        if (engine != null && !engine.isBlank()) {
            prompt.append("- Engine: ").append(engine).append("\n");
        }
        if (transmission != null && !transmission.isBlank()) {
            prompt.append("- Transmission: ").append(transmission).append("\n");
        }
        if (fuelType != null && !fuelType.isBlank()) {
            prompt.append("- Fuel Type: ").append(fuelType).append("\n");
        }

        prompt.append("\nReturn a JSON object conforming exactly to the following structure:\n")
              .append("{\n")
              .append("  \"transmission\": \"(MUST be exactly one of: MANUAL, AUTOMATIC, CVT, DUAL_CLUTCH)\",\n")
              .append("  \"fuelType\": \"(MUST be exactly one of: GASOLINE, DIESEL, ELECTRIC, HYBRID, PLUG_IN_HYBRID, LPG)\",\n")
              .append("  \"specifications\": { ... },\n")
              .append("  \"components\": [\n")
              .append("    {\n")
              .append("      \"category\": \"(one of: ENGINE, TRANSMISSION, BRAKES, FLUIDS, FILTERS, TIRES, BATTERY, OTHER)\",\n")
              .append("      \"name\": \"Component Name (e.g. Engine Oil, Front Brake Pads, Cabin Air Filter)\",\n")
              .append("      \"standardPartNumber\": \"Common OEM part number format or OEM specification reference\",\n")
              .append("      \"standardSpecifications\": \"Viscosity, capacity (e.g. 4.5 liters of 0W-20), dimensions, or chemistry\"\n")
              .append("    }\n")
              .append("  ],\n")
              .append("  \"intervals\": [\n")
              .append("    {\n")
              .append("      \"title\": \"Maintenance Task Title (e.g. Engine Oil & Filter Change)\",\n")
              .append("      \"description\": \"Detailed description of what needs to be inspected or replaced\",\n")
              .append("      \"intervalMileage\": 10000, \n")
              .append("      \"intervalMonths\": 12, \n")
              .append("      \"isInspectionOnly\": false\n")
              .append("    }\n")
              .append("  ],\n")
              .append("  \"documents\": [\n")
              .append("    {\n")
              .append("      \"title\": \"Document Title (e.g. Owner's Manual, Standard Maintenance Schedule, Extended Warranty Guide, Registration & Insurance Checklist)\",\n")
              .append("      \"notes\": \"Short description/notes on the purpose, content or usage of this document\"\n")
              .append("    }\n")
              .append("  ]\n")
              .append("}\n\n")
              .append("Instructions:\n")
              .append("1. If transmission or fuel type is not specified in the input above, you MUST determine the standard/most common transmission and fuel type for this specific vehicle model, year, and trim, and populate those top-level JSON fields accordingly.\n")
              .append("2. Under 'specifications', include factory-known specifications only: oil capacity, oil viscosity, tire size, battery group size, wiper blade sizes, spark plug gap, coolant type, brake fluid specification, and torque specs. Do NOT generate dynamic user or condition-based estimates.\n")
              .append("3. Under 'components', you MUST generate a comprehensive list of standard service items (minimum of 12 components) including: Engine Oil, Engine Oil Filter, Engine Air Filter, Cabin Air Filter, Front Brake Pads, Rear Brake Pads, Brake Rotors, 12V Battery, Tires, Spark Plugs, Coolant, Transmission Fluid, and Wiper Blades.\n")
              .append("4. Under 'intervals', include standard maintenance intervals corresponding to each component (minimum of 8 intervals).\n")
              .append("5. Under 'documents', generate a list of at least 5 standard documents (e.g., Owner's Manual, Maintenance Guide, Warranty Booklet, Roadside Safety Guide, Infotainment Manual).\n")
              .append("6. Do not wrap the response in markdown blocks. Output raw JSON only.");

        return prompt.toString();
    }
}
