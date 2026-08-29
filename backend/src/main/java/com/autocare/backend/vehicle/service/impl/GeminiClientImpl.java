package com.autocare.backend.vehicle.service.impl;

import com.autocare.backend.vehicle.dto.GeminiVehicleProfileResponse;
import com.autocare.backend.vehicle.exception.GeminiException;
import com.autocare.backend.vehicle.exception.GeminiPermanentException;
import com.autocare.backend.vehicle.exception.GeminiTransientException;
import com.autocare.backend.vehicle.service.GeminiClient;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClientImpl implements GeminiClient {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String apiUrl;

    @Value("${gemini.api.connect-timeout-ms:5000}")
    private int connectTimeout;

    @Value("${gemini.api.read-timeout-ms:30000}")
    private int readTimeout;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void init() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeout);
        requestFactory.setReadTimeout(readTimeout);
        restTemplate.setRequestFactory(requestFactory);
        log.info("Initialized Gemini REST Client with Connect Timeout: {}ms, Read Timeout: {}ms", connectTimeout, readTimeout);
    }

    @Override
    public GeminiVehicleProfileResponse fetchProfile(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty() || "mock".equalsIgnoreCase(apiKey) || apiKey.toLowerCase().contains("dummy")) {
            log.info("Gemini API key is missing, 'mock', or dummy. Simulating Gemini profile response for testing...");
            GeminiVehicleProfileResponse mockResponse = new GeminiVehicleProfileResponse();
            mockResponse.setSpecifications(java.util.Map.of(
                "horsepower", 203,
                "engine_oil_capacity", "4.8 quarts",
                "recommended_fuel", "Regular Unleaded 87",
                "tire_size", "225/45R17",
                "battery_group_size", "35",
                "wiper_blade_sizes", "22\" Driver / 18\" Passenger",
                "coolant_specification", "Organic Acid Technology (OAT)",
                "brake_fluid_specification", "DOT 4 Low Viscosity"
            ));

            List<GeminiVehicleProfileResponse.ComponentDto> comps = new java.util.ArrayList<>();
            
            GeminiVehicleProfileResponse.ComponentDto comp1 = new GeminiVehicleProfileResponse.ComponentDto();
            comp1.setCategory("ENGINE");
            comp1.setName("Engine Timing Chain / Belt");
            comp1.setStandardPartNumber("OEM-TC-77291");
            comp1.setStandardSpecifications("Heavy Duty Steel Link Chain");
            comp1.setExpectedLifespanMileage(100000);
            comp1.setExpectedLifespanMonths(72);
            comps.add(comp1);

            GeminiVehicleProfileResponse.ComponentDto comp2 = new GeminiVehicleProfileResponse.ComponentDto();
            comp2.setCategory("ENGINE");
            comp2.setName("Spark Plugs Set");
            comp2.setStandardPartNumber("NGK-IRIDIUM-9");
            comp2.setStandardSpecifications("Laser Iridium, 0.044 inch gap");
            comp2.setExpectedLifespanMileage(60000);
            comp2.setExpectedLifespanMonths(48);
            comps.add(comp2);

            GeminiVehicleProfileResponse.ComponentDto comp3 = new GeminiVehicleProfileResponse.ComponentDto();
            comp3.setCategory("TRANSMISSION");
            comp3.setName("Transmission Clutch / Torque Converter");
            comp3.setStandardPartNumber("OEM-TX-109");
            comp3.setStandardSpecifications("Lock-up torque converter assembly");
            comp3.setExpectedLifespanMileage(120000);
            comp3.setExpectedLifespanMonths(84);
            comps.add(comp3);

            GeminiVehicleProfileResponse.ComponentDto comp4 = new GeminiVehicleProfileResponse.ComponentDto();
            comp4.setCategory("BRAKES");
            comp4.setName("Front Brake Pads");
            comp4.setStandardPartNumber("OEM-BRK-PAD-F");
            comp4.setStandardSpecifications("Ceramic Low-Dust Formula");
            comp4.setExpectedLifespanMileage(30000);
            comp4.setExpectedLifespanMonths(24);
            comps.add(comp4);

            GeminiVehicleProfileResponse.ComponentDto comp5 = new GeminiVehicleProfileResponse.ComponentDto();
            comp5.setCategory("BRAKES");
            comp5.setName("Rear Brake Pads");
            comp5.setStandardPartNumber("OEM-BRK-PAD-R");
            comp5.setStandardSpecifications("Ceramic Low-Dust Formula");
            comp5.setExpectedLifespanMileage(40000);
            comp5.setExpectedLifespanMonths(30);
            comps.add(comp5);

            GeminiVehicleProfileResponse.ComponentDto comp6 = new GeminiVehicleProfileResponse.ComponentDto();
            comp6.setCategory("BRAKES");
            comp6.setName("Brake Rotors (Front)");
            comp6.setStandardPartNumber("OEM-ROT-F");
            comp6.setStandardSpecifications("Vented High-Carbon Cast Iron");
            comp6.setExpectedLifespanMileage(60000);
            comp6.setExpectedLifespanMonths(48);
            comps.add(comp6);

            GeminiVehicleProfileResponse.ComponentDto comp7 = new GeminiVehicleProfileResponse.ComponentDto();
            comp7.setCategory("FLUIDS");
            comp7.setName("Engine Oil");
            comp7.setStandardPartNumber("CASTROL-0W20");
            comp7.setStandardSpecifications("0W-20 Full Synthetic, Capacity: 4.8 Quarts");
            comp7.setExpectedLifespanMileage(10000);
            comp7.setExpectedLifespanMonths(12);
            comps.add(comp7);

            GeminiVehicleProfileResponse.ComponentDto comp8 = new GeminiVehicleProfileResponse.ComponentDto();
            comp8.setCategory("FLUIDS");
            comp8.setName("Brake Fluid");
            comp8.setStandardPartNumber("DOT-4-LV");
            comp8.setStandardSpecifications("DOT 4 Low Viscosity Synthetic");
            comp8.setExpectedLifespanMileage(30000);
            comp8.setExpectedLifespanMonths(24);
            comps.add(comp8);

            GeminiVehicleProfileResponse.ComponentDto comp9 = new GeminiVehicleProfileResponse.ComponentDto();
            comp9.setCategory("FLUIDS");
            comp9.setName("Engine Coolant");
            comp9.setStandardPartNumber("PRESTONE-OAT");
            comp9.setStandardSpecifications("Organic Acid Technology (OAT) 50/50 Prediluted");
            comp9.setExpectedLifespanMileage(60000);
            comp9.setExpectedLifespanMonths(48);
            comps.add(comp9);

            GeminiVehicleProfileResponse.ComponentDto comp10 = new GeminiVehicleProfileResponse.ComponentDto();
            comp10.setCategory("FILTERS");
            comp10.setName("Engine Oil Filter");
            comp10.setStandardPartNumber("OEM-OIL-FIL");
            comp10.setStandardSpecifications("High-Efficiency Synthetic Blend Media");
            comp10.setExpectedLifespanMileage(10000);
            comp10.setExpectedLifespanMonths(12);
            comps.add(comp10);

            GeminiVehicleProfileResponse.ComponentDto comp11 = new GeminiVehicleProfileResponse.ComponentDto();
            comp11.setCategory("FILTERS");
            comp11.setName("Cabin Air Filter");
            comp11.setStandardPartNumber("OEM-CAB-FIL");
            comp11.setStandardSpecifications("Activated Carbon Odor & Allergen Shield");
            comp11.setExpectedLifespanMileage(15000);
            comp11.setExpectedLifespanMonths(12);
            comps.add(comp11);

            GeminiVehicleProfileResponse.ComponentDto comp12 = new GeminiVehicleProfileResponse.ComponentDto();
            comp12.setCategory("FILTERS");
            comp12.setName("Engine Air Filter");
            comp12.setStandardPartNumber("OEM-AIR-FIL");
            comp12.setStandardSpecifications("High-Flow Dry Element");
            comp12.setExpectedLifespanMileage(20000);
            comp12.setExpectedLifespanMonths(18);
            comps.add(comp12);

            GeminiVehicleProfileResponse.ComponentDto comp13 = new GeminiVehicleProfileResponse.ComponentDto();
            comp13.setCategory("TIRES");
            comp13.setName("All-Season Tires Set");
            comp13.setStandardPartNumber("MICHELIN-PS4S");
            comp13.setStandardSpecifications("225/45R17 94Y, Max Press: 44 PSI");
            comp13.setExpectedLifespanMileage(50000);
            comp13.setExpectedLifespanMonths(36);
            comps.add(comp13);

            GeminiVehicleProfileResponse.ComponentDto comp14 = new GeminiVehicleProfileResponse.ComponentDto();
            comp14.setCategory("BATTERY");
            comp14.setName("12V AGM Battery");
            comp14.setStandardPartNumber("OPT-AGM-35");
            comp14.setStandardSpecifications("Group 35, 650 CCA, 12V 60Ah");
            comp14.setExpectedLifespanMileage(60000);
            comp14.setExpectedLifespanMonths(48);
            comps.add(comp14);

            GeminiVehicleProfileResponse.ComponentDto comp15 = new GeminiVehicleProfileResponse.ComponentDto();
            comp15.setCategory("OTHER");
            comp15.setName("Wiper Blades Set");
            comp15.setStandardPartNumber("BOSCH-ICON-F22");
            comp15.setStandardSpecifications("Beam Blade, 22-inch driver / 18-inch passenger");
            comp15.setExpectedLifespanMileage(15000);
            comp15.setExpectedLifespanMonths(12);
            comps.add(comp15);

            mockResponse.setComponents(comps);

            List<GeminiVehicleProfileResponse.IntervalDto> ints = new java.util.ArrayList<>();

            GeminiVehicleProfileResponse.IntervalDto int1 = new GeminiVehicleProfileResponse.IntervalDto();
            int1.setTitle("Engine Oil & Filter Change");
            int1.setDescription("Drain old engine oil, replace oil filter, fill with fresh synthetic oil.");
            int1.setIntervalMileage(10000);
            int1.setIntervalMonths(12);
            int1.setInspectionOnly(false);
            ints.add(int1);

            GeminiVehicleProfileResponse.IntervalDto int2 = new GeminiVehicleProfileResponse.IntervalDto();
            int2.setTitle("Tire Rotation & Balance");
            int2.setDescription("Rotate tires front-to-back, cross-patterns, and verify balancing weights.");
            int2.setIntervalMileage(7500);
            int2.setIntervalMonths(6);
            int2.setInspectionOnly(false);
            ints.add(int2);

            GeminiVehicleProfileResponse.IntervalDto int3 = new GeminiVehicleProfileResponse.IntervalDto();
            int3.setTitle("Brake System Inspection");
            int3.setDescription("Inspect front/rear brake pads, calipers, rotors, and hoses.");
            int3.setIntervalMileage(15000);
            int3.setIntervalMonths(12);
            int3.setInspectionOnly(true);
            ints.add(int3);

            GeminiVehicleProfileResponse.IntervalDto int4 = new GeminiVehicleProfileResponse.IntervalDto();
            int4.setTitle("Engine Air Filter Replacement");
            int4.setDescription("Remove dusty air filter element and replace with new dry element filter.");
            int4.setIntervalMileage(20000);
            int4.setIntervalMonths(24);
            int4.setInspectionOnly(false);
            ints.add(int4);

            GeminiVehicleProfileResponse.IntervalDto int5 = new GeminiVehicleProfileResponse.IntervalDto();
            int5.setTitle("Cabin Air Filter Replacement");
            int5.setDescription("Access behind glovebox, replace cabin air filter to ensure clean HVAC airflow.");
            int5.setIntervalMileage(15000);
            int5.setIntervalMonths(12);
            int5.setInspectionOnly(false);
            ints.add(int5);

            GeminiVehicleProfileResponse.IntervalDto int6 = new GeminiVehicleProfileResponse.IntervalDto();
            int6.setTitle("Brake Fluid Flush");
            int6.setDescription("Bleed out old hygroscopic brake fluid and replace with fresh DOT 4 fluid.");
            int6.setIntervalMileage(30000);
            int6.setIntervalMonths(24);
            int6.setInspectionOnly(false);
            ints.add(int6);

            GeminiVehicleProfileResponse.IntervalDto int7 = new GeminiVehicleProfileResponse.IntervalDto();
            int7.setTitle("Spark Plugs Replacement");
            int7.setDescription("Remove old spark plugs, check gap, and install new spark plugs.");
            int7.setIntervalMileage(60000);
            int7.setIntervalMonths(72);
            int7.setInspectionOnly(false);
            ints.add(int7);

            GeminiVehicleProfileResponse.IntervalDto int8 = new GeminiVehicleProfileResponse.IntervalDto();
            int8.setTitle("Coolant System Flush");
            int8.setDescription("Drain radiator and engine block, flush with distilled water, refill with organic acid technology coolant.");
            int8.setIntervalMileage(100000);
            int8.setIntervalMonths(120);
            int8.setInspectionOnly(false);
            ints.add(int8);

            mockResponse.setIntervals(ints);

            List<GeminiVehicleProfileResponse.DocumentDto> docs = new java.util.ArrayList<>();

            GeminiVehicleProfileResponse.DocumentDto doc1 = new GeminiVehicleProfileResponse.DocumentDto();
            doc1.setTitle("Owner's Manual");
            doc1.setNotes("Complete operator guide detailing controls, safety systems, instrument panel indicators, and basic operations.");
            doc1.setFileUrl("https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf");
            docs.add(doc1);

            GeminiVehicleProfileResponse.DocumentDto doc2 = new GeminiVehicleProfileResponse.DocumentDto();
            doc2.setTitle("Manufacturer Maintenance Schedule");
            doc2.setNotes("Official manufacturer mileage and time maintenance table showing required service points.");
            doc2.setFileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
            docs.add(doc2);

            GeminiVehicleProfileResponse.DocumentDto doc3 = new GeminiVehicleProfileResponse.DocumentDto();
            doc3.setTitle("New Vehicle Warranty Booklet");
            doc3.setNotes("Information on the bumper-to-bumper, powertrain, and anti-corrosion factory warranty coverage limits.");
            doc3.setFileUrl("https://www.orimi.com/pdf-test.pdf");
            docs.add(doc3);

            GeminiVehicleProfileResponse.DocumentDto doc4 = new GeminiVehicleProfileResponse.DocumentDto();
            doc4.setTitle("Emergency Roadside Assistance Guide");
            doc4.setNotes("Emergency contact numbers, towing instructions, jumpstart guidelines, and flat tire changing instructions.");
            doc4.setFileUrl("https://www.unm.edu/~tbeach/terms/PDFsample.pdf");
            docs.add(doc4);

            GeminiVehicleProfileResponse.DocumentDto doc5 = new GeminiVehicleProfileResponse.DocumentDto();
            doc5.setTitle("Infotainment & Bluetooth Setup Guide");
            doc5.setNotes("Step-by-step instructions for pairing mobile phones, using voice commands, navigation, and system updates.");
            doc5.setFileUrl("https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf");
            docs.add(doc5);

            GeminiVehicleProfileResponse.DocumentDto doc6 = new GeminiVehicleProfileResponse.DocumentDto();
            doc6.setTitle("Do-It-Yourself (DIY) Service Guide");
            doc6.setNotes("Simplified step-by-step procedures for owner-performed maintenance tasks like cabin filter and wiper replacements.");
            doc6.setFileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
            docs.add(doc6);

            mockResponse.setDocuments(docs);

            return mockResponse;
        }

        String requestUrl = apiUrl + "?key=" + apiKey;

        // 1. Build request payload matching Gemini API expectations
        GeminiApiRequest requestPayload = new GeminiApiRequest();
        
        GeminiApiRequest.Part part = new GeminiApiRequest.Part();
        part.setText(prompt);

        GeminiApiRequest.Content content = new GeminiApiRequest.Content();
        content.setParts(Collections.singletonList(part));

        requestPayload.setContents(Collections.singletonList(content));

        GeminiApiRequest.GenerationConfig config = new GeminiApiRequest.GenerationConfig();
        config.setResponseMimeType("application/json");
        config.setTemperature(0.1);
        requestPayload.setGenerationConfig(config);

        // 2. Set Http Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<GeminiApiRequest> entity = new HttpEntity<>(requestPayload, headers);

        try {
            log.info("Sending vehicle profiling request to Gemini API endpoint...");
            ResponseEntity<GeminiApiResponse> responseEntity = restTemplate.postForEntity(requestUrl, entity, GeminiApiResponse.class);
            
            GeminiApiResponse apiResponse = responseEntity.getBody();
            if (apiResponse == null || apiResponse.getCandidates() == null || apiResponse.getCandidates().isEmpty()) {
                throw new GeminiPermanentException("Empty response candidates block received from Gemini API.");
            }

            GeminiApiResponse.Candidate candidate = apiResponse.getCandidates().get(0);
            if (candidate.getContent() == null || candidate.getContent().getParts() == null || candidate.getContent().getParts().isEmpty()) {
                throw new GeminiPermanentException("No text parts generated in the Gemini candidate response.");
            }

            String rawJsonText = candidate.getContent().getParts().get(0).getText();
            log.debug("Received raw response text from Gemini: {}", rawJsonText);

            // 3. Deserialize JSON string to domain profile DTO
            return objectMapper.readValue(rawJsonText, GeminiVehicleProfileResponse.class);

        } catch (HttpClientErrorException e) {
            int statusCode = e.getStatusCode().value();
            log.error("Gemini API returned client error code: {}", statusCode);
            if (statusCode == 429) {
                throw new GeminiTransientException("Gemini API rate limit exceeded (429). Please try again later.", e);
            } else if (statusCode == 401 || statusCode == 403) {
                throw new GeminiPermanentException("Gemini API authorization failure (Invalid/restricted API Key).", e);
            } else {
                throw new GeminiPermanentException("Gemini API client failure: " + e.getResponseBodyAsString(), e);
            }
        } catch (HttpServerErrorException e) {
            int statusCode = e.getStatusCode().value();
            log.error("Gemini API returned server error code: {}", statusCode);
            if (statusCode == 503 || statusCode == 504) {
                throw new GeminiTransientException("Gemini API is temporarily unavailable (503/504).", e);
            } else {
                throw new GeminiTransientException("Gemini API server internal failure (" + statusCode + ").", e);
            }
        } catch (ResourceAccessException e) {
            log.error("Gemini API network connection timeout or I/O failure", e);
            throw new GeminiTransientException("Gemini API network connection timeout or I/O failure.", e);
        } catch (Exception e) {
            if (e instanceof GeminiException) {
                throw (GeminiException) e;
            }
            log.error("Unexpected error in Gemini API integration flow", e);
            throw new GeminiPermanentException("Unexpected failure in vehicle profiling: " + e.getMessage(), e);
        }
    }

    @Override
    public String askAdvisor(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty() || "mock".equalsIgnoreCase(apiKey) || apiKey.toLowerCase().contains("dummy")) {
            log.info("Gemini API key is missing or mock. Providing smart default advice for testing...");
            return "Based on your vehicle's digital twin and factory maintenance standards:\n\n" +
                    "• **Recommended Action**: Check your current maintenance intervals and inspect all critical-wear items (engine oil, brake pads, and battery health).\n" +
                    "• **Maintenance Rule**: Always use OEM-grade fluids and adhere strictly to the recommended viscosity specified in your digital twin specs.";
        }

        String requestUrl = apiUrl + "?key=" + apiKey;

        GeminiApiRequest requestPayload = new GeminiApiRequest();
        GeminiApiRequest.Part part = new GeminiApiRequest.Part();
        part.setText(prompt);

        GeminiApiRequest.Content content = new GeminiApiRequest.Content();
        content.setParts(Collections.singletonList(part));
        requestPayload.setContents(Collections.singletonList(content));

        GeminiApiRequest.GenerationConfig config = new GeminiApiRequest.GenerationConfig();
        config.setTemperature(0.4);
        requestPayload.setGenerationConfig(config);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<GeminiApiRequest> entity = new HttpEntity<>(requestPayload, headers);

        try {
            log.info("Sending AI Advisor question to Gemini API...");
            ResponseEntity<GeminiApiResponse> responseEntity = restTemplate.postForEntity(requestUrl, entity, GeminiApiResponse.class);
            GeminiApiResponse apiResponse = responseEntity.getBody();

            if (apiResponse != null && apiResponse.getCandidates() != null && !apiResponse.getCandidates().isEmpty()) {
                GeminiApiResponse.Candidate candidate = apiResponse.getCandidates().get(0);
                if (candidate.getContent() != null && candidate.getContent().getParts() != null && !candidate.getContent().getParts().isEmpty()) {
                    return candidate.getContent().getParts().get(0).getText();
                }
            }
            return "No response could be generated by AutoCare AI Advisor. Please rephrase your question.";
        } catch (Exception e) {
            log.error("Error calling Gemini AI Advisor: {}", e.getMessage());
            return "AutoCare AI Advisor is currently operating in offline mode. Please consult your vehicle manual or service technician.";
        }
    }

    // --- Private Helper DTOs for Gemini REST API Protocol ---

    @Getter
    @Setter
    private static class GeminiApiRequest {
        private List<Content> contents;
        private GenerationConfig generationConfig;

        @Getter
        @Setter
        public static class Content {
            private List<Part> parts;
        }

        @Getter
        @Setter
        public static class Part {
            private String text;
        }

        @Getter
        @Setter
        public static class GenerationConfig {
            private String responseMimeType;
            private Double temperature;
        }
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GeminiApiResponse {
        private List<Candidate> candidates;

        @Getter
        @Setter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Candidate {
            private Content content;
        }

        @Getter
        @Setter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Content {
            private List<Part> parts;
        }

        @Getter
        @Setter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Part {
            private String text;
        }
    }
}

