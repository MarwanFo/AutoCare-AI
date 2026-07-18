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
                "recommended_fuel", "Regular Unleaded 87"
            ));

            GeminiVehicleProfileResponse.ComponentDto comp1 = new GeminiVehicleProfileResponse.ComponentDto();
            comp1.setCategory("Engine");
            comp1.setName("Engine Oil Filter");
            comp1.setStandardPartNumber("TOY-12345");
            comp1.setStandardSpecifications("0W-20 Full Synthetic");

            GeminiVehicleProfileResponse.ComponentDto comp2 = new GeminiVehicleProfileResponse.ComponentDto();
            comp2.setCategory("Brakes");
            comp2.setName("Front Brake Pads");
            comp2.setStandardPartNumber("TOY-PAD-99");
            comp2.setStandardSpecifications("Ceramic");

            mockResponse.setComponents(List.of(comp1, comp2));

            GeminiVehicleProfileResponse.IntervalDto int1 = new GeminiVehicleProfileResponse.IntervalDto();
            int1.setTitle("Engine Oil & Filter Change");
            int1.setDescription("Replace engine oil and filter. Check fluid levels.");
            int1.setIntervalMileage(10000);
            int1.setIntervalMonths(12);
            int1.setInspectionOnly(false);

            GeminiVehicleProfileResponse.IntervalDto int2 = new GeminiVehicleProfileResponse.IntervalDto();
            int2.setTitle("Brake System Inspection");
            int2.setDescription("Inspect front/rear brake pads, calipers, rotors, and hoses.");
            int2.setIntervalMileage(5000);
            int2.setIntervalMonths(6);
            int2.setInspectionOnly(true);

            mockResponse.setIntervals(List.of(int1, int2));

            GeminiVehicleProfileResponse.DocumentDto doc1 = new GeminiVehicleProfileResponse.DocumentDto();
            doc1.setTitle("Owner's Manual");
            doc1.setNotes("Standard digital copy of the owner's instruction manual.");

            GeminiVehicleProfileResponse.DocumentDto doc2 = new GeminiVehicleProfileResponse.DocumentDto();
            doc2.setTitle("Warranty Information Booklet");
            doc2.setNotes("Details factory-backed 3-year/36,000-mile comprehensive warranty.");

            mockResponse.setDocuments(List.of(doc1, doc2));

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

