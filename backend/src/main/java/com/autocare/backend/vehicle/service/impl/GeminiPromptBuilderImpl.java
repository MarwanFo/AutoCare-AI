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
        prompt.append("You are an elite automotive engineering database. ")
              .append("Generate a highly accurate, factory-grade digital twin profile for the following vehicle:\n")
              .append("- Brand: ").append(brand).append("\n")
              .append("- Model: ").append(model).append("\n")
              .append("- Year: ").append(year).append("\n");

        if (trim != null && !trim.isBlank()) {
            prompt.append("- Trim/Configuration: ").append(trim).append("\n");
        }
        if (engine != null && !engine.isBlank()) {
            prompt.append("- Engine/Motor: ").append(engine).append("\n");
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
              .append("      \"name\": \"Exact Component Name\",\n")
              .append("      \"standardPartNumber\": \"OEM part number format or specification reference\",\n")
              .append("      \"standardSpecifications\": \"Exact viscosity, capacity, dimensions, or material spec\"\n")
              .append("    }\n")
              .append("  ],\n")
              .append("  \"intervals\": [\n")
              .append("    {\n")
              .append("      \"title\": \"Maintenance Task Title\",\n")
              .append("      \"description\": \"Detailed description of maintenance task\",\n")
              .append("      \"intervalMileage\": 10000,\n")
              .append("      \"intervalMonths\": 12,\n")
              .append("      \"isInspectionOnly\": false\n")
              .append("    }\n")
              .append("  ],\n")
              .append("  \"documents\": [\n")
              .append("    {\n")
              .append("      \"title\": \"Document Title\",\n")
              .append("      \"notes\": \"Document description\",\n")
              .append("      \"fileUrl\": \"Real PDF URL or null\"\n")
              .append("    }\n")
              .append("  ]\n")
              .append("}\n\n")
              .append("STRICT AUTOMOTIVE COMPONENT RULES (MUST FOLLOW EXPLICITLY):\n")
              .append("1. DRIVETRAIN EXCLUSIONS (CRITICAL):\n")
              .append("   - IF ELECTRIC (EV): NEVER generate Engine Oil, Engine Oil Filter, Engine Air Filter, Spark Plugs, Glow Plugs, Fuel Filter, Exhaust System, DPF, or Clutch. Generate ONLY EV-relevant parts (e.g. Inverter/Battery Coolant, 12V Auxiliary Battery, High Voltage Battery Pack, Cabin Air Filter, Front/Rear Brake Pads, Brake Rotors, Brake Fluid, Tires, Wiper Blades, Steering Tie Rods).\n")
              .append("   - IF DIESEL: NEVER generate Spark Plugs. Generate Glow Plugs, Fuel Filter/Water Separator, DPF/AdBlue System, Engine Oil, Engine Oil Filter, Cabin Filter, Engine Air Filter.\n")
              .append("   - IF GASOLINE or HYBRID: Generate Spark Plugs, Engine Oil, Engine Oil Filter, Engine Air Filter, Cabin Air Filter, Coolant, Brake Pads, Brake Rotors, 12V Battery, Tires, Wiper Blades.\n")
              .append("2. TRANSMISSION EXCLUSIONS (CRITICAL):\n")
              .append("   - IF AUTOMATIC, CVT, or DUAL_CLUTCH: NEVER generate Manual Clutch Plate or Clutch Pedal. Include Automatic Transmission Fluid (ATF/CVT Fluid) and Transmission Filter.\n")
              .append("   - IF MANUAL: Generate Manual Clutch Kit/Friction Plate and Manual Gearbox Oil.\n")
              .append("3. Under 'components', generate EXACTLY 12 to 15 real, authentic service components that strictly exist on this exact vehicle.\n")
              .append("4. Under 'intervals', generate 8 to 12 maintenance intervals matching the components generated above.\n")
              .append("5. Under 'documents', generate at least 5 standard vehicle documents.\n")
              .append("6. Output raw JSON only. Do not include markdown code blocks or conversational text.");

        return prompt.toString();
    }
}

