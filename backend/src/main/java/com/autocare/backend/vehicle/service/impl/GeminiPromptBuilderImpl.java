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
        prompt.append("You are a Senior Automotive Systems Engineer and Technical Data Specialist (SAE International Master Certified).\n")
              .append("Your mission is to generate a comprehensive, highly accurate, factory-grade Digital Twin profile for the following vehicle:\n")
              .append("• Brand: ").append(brand).append("\n")
              .append("• Model: ").append(model).append("\n")
              .append("• Manufacturing Year: ").append(year).append("\n");

        if (trim != null && !trim.isBlank()) {
            prompt.append("• Trim / Configuration: ").append(trim).append("\n");
        }
        if (engine != null && !engine.isBlank()) {
            prompt.append("• Engine / Drivetrain Spec: ").append(engine).append("\n");
        }
        if (transmission != null && !transmission.isBlank()) {
            prompt.append("• Transmission Type: ").append(transmission).append("\n");
        }
        if (fuelType != null && !fuelType.isBlank()) {
            prompt.append("• Fuel / Energy Type: ").append(fuelType).append("\n");
        }

        prompt.append("\nGenerate a JSON object conforming STRICTLY to the following structure:\n")
              .append("{\n")
              .append("  \"transmission\": \"(MUST be exactly one of: MANUAL, AUTOMATIC, CVT, DUAL_CLUTCH)\",\n")
              .append("  \"fuelType\": \"(MUST be exactly one of: GASOLINE, DIESEL, ELECTRIC, HYBRID, PLUG_IN_HYBRID, LPG)\",\n")
              .append("  \"specifications\": {\n")
              .append("    \"engine_displacement\": \"e.g., 2.0L Turbo Inline-4\",\n")
              .append("    \"horsepower\": \"e.g., 252 hp @ 5000 RPM\",\n")
              .append("    \"torque\": \"e.g., 370 Nm @ 1600 RPM\",\n")
              .append("    \"oil_capacity\": \"e.g., 5.2 Liters\",\n")
              .append("    \"recommended_oil_viscosity\": \"e.g., 5W-30 Synthetic ACEA C3\",\n")
              .append("    \"coolant_capacity\": \"e.g., 7.5 Liters\",\n")
              .append("    \"brake_fluid_type\": \"DOT 4 Low Viscosity\",\n")
              .append("    \"tire_size_front\": \"e.g., 225/45 R18\",\n")
              .append("    \"tire_size_rear\": \"e.g., 225/45 R18\"\n")
              .append("  },\n")
              .append("  \"components\": [\n")
              .append("    {\n")
              .append("      \"category\": \"(MUST be exactly one of: ENGINE, TRANSMISSION, BRAKES, FLUIDS, FILTERS, TIRES, BATTERY, OTHER)\",\n")
              .append("      \"name\": \"Standard Component Name (e.g. Engine Oil, Front Brake Pads, Cabin Air Filter)\",\n")
              .append("      \"standardPartNumber\": \"Exact OEM / Aftermarket part number or specification reference (e.g. OEM # 04152-YZZA1, NGK SILZKR7B11)\",\n")
              .append("      \"standardSpecifications\": \"Technical spec (e.g., 5W-30 Full Synthetic VW 504.00, DOT 4, 205/55 R16 91V)\",\n")
              .append("      \"expectedLifespanMileage\": 15000,\n")
              .append("      \"expectedLifespanMonths\": 12\n")
              .append("    }\n")
              .append("  ],\n")
              .append("  \"intervals\": [\n")
              .append("    {\n")
              .append("      \"title\": \"Maintenance Task Title\",\n")
              .append("      \"description\": \"Professional engineering service guidelines including step-by-step inspection criteria\",\n")
              .append("      \"intervalMileage\": 15000,\n")
              .append("      \"intervalMonths\": 12,\n")
              .append("      \"isInspectionOnly\": false\n")
              .append("    }\n")
              .append("  ],\n")
              .append("  \"documents\": [\n")
              .append("    {\n")
              .append("      \"title\": \"Owner's Manual & Factory Maintenance Passport\",\n")
              .append("      \"notes\": \"Official manufacturer specifications, service schedule, and fluid capacities.\",\n")
              .append("      \"fileUrl\": null\n")
              .append("    }\n")
              .append("  ]\n")
              .append("}\n\n")
              .append("========================================================================\n")
              .append("CRITICAL ENGINEERING & COMPONENT RULES (MUST BE FOLLOWED 100%):\n")
              .append("========================================================================\n")
              .append("1. DRIVETRAIN & FUEL STRICT EXCLUSIONS:\n")
              .append("   • IF ELECTRIC (EV):\n")
              .append("     - ABSOLUTELY NEVER generate Engine Oil, Engine Oil Filter, Engine Air Filter, Spark Plugs, Glow Plugs, Fuel Filter, Exhaust System, DPF, or Manual Clutch.\n")
              .append("     - MUST generate: High Voltage Battery Pack (Lifespan: 160000 km / 96 mo), 12V Auxiliary Battery (60000 km / 36 mo), Inverter & Battery Thermal Coolant (100000 km / 48 mo), Cabin Air Filter (20000 km / 12 mo), Front Brake Pads (60000 km / 36 mo), Rear Brake Pads (60000 km / 36 mo), Front Brake Rotors (90000 km / 60 mo), Rear Brake Rotors (90000 km / 60 mo), Brake Fluid (40000 km / 24 mo), Set of 4 Tires (50000 km / 36 mo), Wiper Blades (20000 km / 12 mo).\n")
              .append("   • IF DIESEL:\n")
              .append("     - ABSOLUTELY NEVER generate Spark Plugs.\n")
              .append("     - MUST generate: Diesel Engine Oil, Engine Oil Filter, Fuel Filter / Water Separator, Glow Plugs, DPF / AdBlue System, Cabin Air Filter, Engine Air Filter, Engine Coolant, Front & Rear Brake Pads, Brake Fluid, 12V Battery, Set of Tires, Wiper Blades.\n")
              .append("   • IF GASOLINE or HYBRID:\n")
              .append("     - MUST generate: Engine Oil, Engine Oil Filter, Engine Air Filter, Cabin Air Filter, Spark Plugs, Engine Coolant, Front Brake Pads, Rear Brake Pads, Front Brake Rotors, Brake Fluid, 12V Battery, Set of 4 Tires, Wiper Blades, Serpentine Accessory Drive Belt.\n")
              .append("\n")
              .append("2. TRANSMISSION EXCLUSIONS:\n")
              .append("   • IF AUTOMATIC, CVT, or DUAL_CLUTCH: NEVER generate Manual Clutch Plate or Clutch Pedal. Include Automatic Transmission Fluid (ATF/CVT Fluid) (Lifespan: 60000 km / 48 mo) and Transmission Filter.\n")
              .append("   • IF MANUAL: Include Manual Gearbox Oil (80000 km / 60 mo) and Manual Clutch Kit (100000 km / 60 mo).\n")
              .append("\n")
              .append("3. COMPONENT LIFESPAN ACCURACY:\n")
              .append("   • Provide REALISTIC factory lifespan values for 'expectedLifespanMileage' (in kilometers) and 'expectedLifespanMonths' (in months).\n")
              .append("   • For pre-owned vehicles, these lifespans are critical for calculating degradation and accurate replacement prediction dates.\n")
              .append("\n")
              .append("4. QUANTITY REQUIREMENTS:\n")
              .append("   • Generate EXACTLY 12 to 16 authentic components.\n")
              .append("   • Generate 8 to 12 maintenance intervals matching the components.\n")
              .append("   • Generate 4 to 6 standard owner documents.\n")
              .append("\n")
              .append("5. FORMATTING:\n")
              .append("   • Output RAW valid JSON only. Do NOT enclose in markdown ```json blocks. Do NOT include introductory text.");

        return prompt.toString();
    }
}
