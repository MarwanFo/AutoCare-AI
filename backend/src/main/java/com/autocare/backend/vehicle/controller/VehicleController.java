package com.autocare.backend.vehicle.controller;

import com.autocare.backend.job.dto.JobResponse;
import com.autocare.backend.job.entity.Job;
import com.autocare.backend.job.entity.enums.JobType;
import com.autocare.backend.job.mapper.JobMapper;
import com.autocare.backend.job.service.JobService;
import com.autocare.backend.security.CustomUserDetails;
import com.autocare.backend.vehicle.dto.CreateVehicleRequest;
import com.autocare.backend.vehicle.dto.UpdateVehicleRequest;
import com.autocare.backend.vehicle.dto.VehicleResponse;
import com.autocare.backend.vehicle.dto.VehicleSummaryResponse;
import com.autocare.backend.vehicle.dto.CreateComponentRequest;
import com.autocare.backend.vehicle.dto.UpdateComponentRequest;
import com.autocare.backend.vehicle.dto.CreateDocumentRequest;
import com.autocare.backend.vehicle.dto.UpdateDocumentRequest;
import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.UserComponent;
import com.autocare.backend.vehicle.entity.UserDocument;
import com.autocare.backend.vehicle.entity.enums.VehicleStatus;
import com.autocare.backend.vehicle.mapper.VehicleMapper;
import com.autocare.backend.vehicle.service.VehicleService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicle Management", description = "Endpoints for vehicle onboarding, profile retrieval, updates, soft-deletes, and setting primary vehicles.")
public class VehicleController {

    private final VehicleService vehicleService;
    private final VehicleMapper vehicleMapper;
    private final JobService jobService;
    private final JobMapper jobMapper;
    private final ObjectMapper objectMapper;

    @PostMapping
    @Operation(summary = "Onboard a new vehicle (Asynchronous)", description = "Enqueues a background job to build the vehicle's digital twin representation.")
    @ApiResponse(responseCode = "202", description = "Vehicle onboarding job enqueued successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request payload")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT token required")
    public ResponseEntity<JobResponse> createVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-Client-Request-Id", required = false) UUID clientRequestId,
            @Valid @RequestBody CreateVehicleRequest request
    ) {
        log.info("Onboarding vehicle via background job for user: {}", userDetails.getUser().getId());
        vehicleService.checkDuplicates(request.getVin(), request.getLicensePlate());
        Map<String, Object> payload = objectMapper.convertValue(request, new TypeReference<Map<String, Object>>() {});
        Job job = jobService.createJob(
                userDetails.getUser().getId(),
                JobType.DIGITAL_TWIN_GENERATION,
                payload,
                clientRequestId
        );
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(jobMapper.toResponse(job));
    }

    @GetMapping
    @Operation(summary = "Get user's vehicles", description = "Retrieves a paginated list of vehicles registered to the authenticated user filtered by status.")
    @ApiResponse(responseCode = "200", description = "List of vehicles retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT token required")
    public ResponseEntity<Page<VehicleSummaryResponse>> getVehicles(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "status", defaultValue = "ACTIVE") VehicleStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("Fetching vehicles for user: {}, status: {}", userDetails.getUser().getId(), status);
        Pageable translatedPageable = translatePageable(pageable);
        Page<UserVehicle> vehicles = vehicleService.getVehicles(userDetails.getUser().getId(), status, translatedPageable);
        Page<VehicleSummaryResponse> response = vehicles.map(vehicleMapper::toSummaryResponse);
        return ResponseEntity.ok(response);
    }

    private Pageable translatePageable(Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            return pageable;
        }
        java.util.List<Sort.Order> orders = pageable.getSort().stream()
                .map(order -> {
                    if ("created_at".equalsIgnoreCase(order.getProperty())) {
                        return new Sort.Order(order.getDirection(), "createdAt");
                    }
                    if ("last_modified_at".equalsIgnoreCase(order.getProperty())) {
                        return new Sort.Order(order.getDirection(), "lastModifiedAt");
                    }
                    return order;
                })
                .collect(Collectors.toList());
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle details by ID", description = "Retrieves the full digital twin representation of a vehicle by its ID, checking ownership.")
    @ApiResponse(responseCode = "200", description = "Vehicle details retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT token required")
    @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this vehicle")
    @ApiResponse(responseCode = "404", description = "Not Found - Vehicle does not exist")
    public ResponseEntity<VehicleResponse> getVehicleById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id
    ) {
        log.info("Fetching vehicle ID: {} for user: {}", id, userDetails.getUser().getId());
        UserVehicle vehicle = vehicleService.getVehicleById(userDetails.getUser().getId(), id);
        return ResponseEntity.ok(vehicleMapper.toResponse(vehicle));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vehicle details", description = "Updates editable attributes of a user's vehicle, validating ownership and unique constraints.")
    @ApiResponse(responseCode = "200", description = "Vehicle updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request payload")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT token required")
    @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this vehicle")
    @ApiResponse(responseCode = "404", description = "Not Found - Vehicle does not exist")
    @ApiResponse(responseCode = "409", description = "Duplicate VIN or license plate conflict")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateVehicleRequest request
    ) {
        log.info("Updating vehicle ID: {} for user: {}", id, userDetails.getUser().getId());
        UserVehicle vehicle = vehicleService.updateVehicle(userDetails.getUser().getId(), id, request);
        return ResponseEntity.ok(vehicleMapper.toResponse(vehicle));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete / Archive vehicle", description = "Soft-deletes the vehicle by archiving its status, preserving historical maintenance records.")
    @ApiResponse(responseCode = "204", description = "Vehicle archived successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT token required")
    @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this vehicle")
    @ApiResponse(responseCode = "404", description = "Not Found - Vehicle does not exist")
    public ResponseEntity<Void> archiveVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id
    ) {
        log.info("Archiving vehicle ID: {} for user: {}", id, userDetails.getUser().getId());
        vehicleService.archiveVehicle(userDetails.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/primary")
    @Operation(summary = "Set primary vehicle", description = "Marks a vehicle as the primary vehicle for the user, resetting any other active primary vehicle.")
    @ApiResponse(responseCode = "200", description = "Vehicle marked as primary successfully")
    @ApiResponse(responseCode = "400", description = "Vehicle is not active or invalid request")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Valid JWT token required")
    @ApiResponse(responseCode = "403", description = "Forbidden - User does not own this vehicle")
    @ApiResponse(responseCode = "404", description = "Not Found - Vehicle does not exist")
    public ResponseEntity<VehicleResponse> setPrimaryVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id
    ) {
        log.info("Setting vehicle ID: {} as primary for user: {}", id, userDetails.getUser().getId());
        UserVehicle vehicle = vehicleService.setPrimaryVehicle(userDetails.getUser().getId(), id);
        return ResponseEntity.ok(vehicleMapper.toResponse(vehicle));
    }

    @PostMapping("/{vehicleId}/components")
    @Operation(summary = "Add a component manually", description = "Allows the user to manually add a component/part to their vehicle's digital twin.")
    public ResponseEntity<VehicleResponse.ComponentResponse> addComponent(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @Valid @RequestBody CreateComponentRequest request
    ) {
        log.info("Adding component manually to vehicle ID: {} for user: {}", vehicleId, userDetails.getUser().getId());
        UserComponent component = vehicleService.addComponent(userDetails.getUser().getId(), vehicleId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleMapper.toComponentResponse(component));
    }

    @PutMapping("/{vehicleId}/components/{componentId}")
    @Operation(summary = "Update a component manually", description = "Allows the user to manually update a component/part in their vehicle's digital twin.")
    public ResponseEntity<VehicleResponse.ComponentResponse> updateComponent(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @PathVariable UUID componentId,
            @Valid @RequestBody UpdateComponentRequest request
    ) {
        log.info("Updating component ID: {} for vehicle ID: {} for user: {}", componentId, vehicleId, userDetails.getUser().getId());
        UserComponent component = vehicleService.updateComponent(userDetails.getUser().getId(), vehicleId, componentId, request);
        return ResponseEntity.ok(vehicleMapper.toComponentResponse(component));
    }

    @DeleteMapping("/{vehicleId}/components/{componentId}")
    @Operation(summary = "Delete a component manually", description = "Allows the user to delete a manually added or cloned component/part from their vehicle's digital twin.")
    public ResponseEntity<Void> deleteComponent(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @PathVariable UUID componentId
    ) {
        log.info("Deleting component ID: {} for vehicle ID: {} for user: {}", componentId, vehicleId, userDetails.getUser().getId());
        vehicleService.deleteComponent(userDetails.getUser().getId(), vehicleId, componentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{vehicleId}/documents")
    @Operation(summary = "Add a document manually", description = "Allows the user to manually add a document (e.g. insurance, receipt) to their vehicle's profile.")
    public ResponseEntity<VehicleResponse.DocumentResponse> addDocument(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @Valid @RequestBody CreateDocumentRequest request
    ) {
        log.info("Adding document manually to vehicle ID: {} for user: {}", vehicleId, userDetails.getUser().getId());
        UserDocument document = vehicleService.addDocument(userDetails.getUser().getId(), vehicleId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleMapper.toDocumentResponse(document));
    }

    @PutMapping("/{vehicleId}/documents/{documentId}")
    @Operation(summary = "Update a document manually", description = "Allows the user to manually update document details (e.g. title, notes, expiry date).")
    public ResponseEntity<VehicleResponse.DocumentResponse> updateDocument(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @PathVariable UUID documentId,
            @Valid @RequestBody UpdateDocumentRequest request
    ) {
        log.info("Updating document ID: {} for vehicle ID: {} for user: {}", documentId, vehicleId, userDetails.getUser().getId());
        UserDocument document = vehicleService.updateDocument(userDetails.getUser().getId(), vehicleId, documentId, request);
        return ResponseEntity.ok(vehicleMapper.toDocumentResponse(document));
    }

    @DeleteMapping("/{vehicleId}/documents/{documentId}")
    @Operation(summary = "Delete a document manually", description = "Allows the user to delete a document from their vehicle's profile.")
    public ResponseEntity<Void> deleteDocument(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @PathVariable UUID documentId
    ) {
        log.info("Deleting document ID: {} for vehicle ID: {} for user: {}", documentId, vehicleId, userDetails.getUser().getId());
        vehicleService.deleteDocument(userDetails.getUser().getId(), vehicleId, documentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{vehicleId}/intervals")
    @Operation(summary = "Add a maintenance interval manually", description = "Allows the user to manually add a maintenance interval to their vehicle's digital twin.")
    public ResponseEntity<VehicleResponse.IntervalResponse> addInterval(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @Valid @RequestBody com.autocare.backend.vehicle.dto.CreateIntervalRequest request
    ) {
        log.info("Adding interval manually to vehicle ID: {} for user: {}", vehicleId, userDetails.getUser().getId());
        com.autocare.backend.vehicle.entity.UserInterval interval = vehicleService.addInterval(userDetails.getUser().getId(), vehicleId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleMapper.toIntervalResponse(interval));
    }

    @PutMapping("/{vehicleId}/intervals/{intervalId}")
    @Operation(summary = "Update a maintenance interval manually", description = "Allows the user to manually update a maintenance interval in their vehicle's digital twin.")
    public ResponseEntity<VehicleResponse.IntervalResponse> updateInterval(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @PathVariable UUID intervalId,
            @Valid @RequestBody com.autocare.backend.vehicle.dto.UpdateIntervalRequest request
    ) {
        log.info("Updating interval ID: {} for vehicle ID: {} for user: {}", intervalId, vehicleId, userDetails.getUser().getId());
        com.autocare.backend.vehicle.entity.UserInterval interval = vehicleService.updateInterval(userDetails.getUser().getId(), vehicleId, intervalId, request);
        return ResponseEntity.ok(vehicleMapper.toIntervalResponse(interval));
    }

    @DeleteMapping("/{vehicleId}/intervals/{intervalId}")
    @Operation(summary = "Delete a maintenance interval manually", description = "Allows the user to delete a maintenance interval from their vehicle's digital twin.")
    public ResponseEntity<Void> deleteInterval(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @PathVariable UUID intervalId
    ) {
        log.info("Deleting interval ID: {} for vehicle ID: {} for user: {}", intervalId, vehicleId, userDetails.getUser().getId());
        vehicleService.deleteInterval(userDetails.getUser().getId(), vehicleId, intervalId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{vehicleId}/components/batch-dates")
    @Operation(summary = "Batch update component last-changed dates", description = "Updates the last-changed dates for multiple components at once. Used during pre-owned vehicle onboarding after AI generation.")
    @ApiResponse(responseCode = "200", description = "Component dates updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid date format")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "403", description = "Forbidden")
    @ApiResponse(responseCode = "404", description = "Vehicle not found")
    public ResponseEntity<VehicleResponse> batchUpdateComponentDates(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @Valid @RequestBody com.autocare.backend.vehicle.dto.BatchComponentDatesRequest request
    ) {
        log.info("Batch updating component dates for vehicle ID: {} for user: {}", vehicleId, userDetails.getUser().getId());
        vehicleService.batchUpdateComponentDates(userDetails.getUser().getId(), vehicleId, request.getComponentDates());
        UserVehicle vehicle = vehicleService.getVehicleById(userDetails.getUser().getId(), vehicleId);
        return ResponseEntity.ok(vehicleMapper.toResponse(vehicle));
    }

    @PostMapping("/{vehicleId}/ai-advisor")
    @Operation(summary = "Consult vehicle AI advisor", description = "Asks the AI assistant a question regarding maintenance, specs, or troubleshooting tailored to this vehicle's digital twin.")
    public ResponseEntity<com.autocare.backend.vehicle.dto.AiAdvisorResponse> consultAiAdvisor(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @Valid @RequestBody com.autocare.backend.vehicle.dto.AiAdvisorRequest request
    ) {
        log.info("Consulting AI advisor for vehicle ID: {} for user: {}", vehicleId, userDetails.getUser().getId());
        com.autocare.backend.vehicle.dto.AiAdvisorResponse response = vehicleService.consultAiAdvisor(userDetails.getUser().getId(), vehicleId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{vehicleId}/export-report")
    @Operation(summary = "Export vehicle digital twin health report", description = "Generates a structured health inspection report for downloading or sharing.")
    public ResponseEntity<com.autocare.backend.vehicle.dto.VehicleReportResponse> exportVehicleReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId
    ) {
        log.info("Exporting health report for vehicle ID: {} for user: {}", vehicleId, userDetails.getUser().getId());
        com.autocare.backend.vehicle.dto.VehicleReportResponse report = vehicleService.exportVehicleReport(userDetails.getUser().getId(), vehicleId);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/{vehicleId}/budget-forecast")
    @Operation(summary = "Get AI predictive maintenance budget forecast", description = "Calculates vehicle-specific maintenance costs based on brand tier, engine type, mileage, and component health scores.")
    public ResponseEntity<com.autocare.backend.vehicle.dto.VehicleBudgetForecastResponse> getVehicleBudgetForecast(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID vehicleId,
            @RequestParam(required = false, defaultValue = "EUR") String currency
    ) {
        log.info("Generating AI budget forecast for vehicle ID: {} with currency: {} for user: {}", vehicleId, currency, userDetails.getUser().getId());
        com.autocare.backend.vehicle.dto.VehicleBudgetForecastResponse forecast = vehicleService.getVehicleBudgetForecast(userDetails.getUser().getId(), vehicleId, currency);
        return ResponseEntity.ok(forecast);
    }
}
