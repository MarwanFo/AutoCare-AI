package com.autocare.backend.vehicle.service.impl;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.exception.BusinessException;
import com.autocare.backend.auth.exception.DuplicateResourceException;
import com.autocare.backend.auth.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.vehicle.dto.CreateVehicleRequest;
import com.autocare.backend.vehicle.dto.UpdateVehicleRequest;
import com.autocare.backend.vehicle.entity.Brand;
import com.autocare.backend.vehicle.entity.Model;
import com.autocare.backend.vehicle.entity.UserVehicle;
import com.autocare.backend.vehicle.entity.VehicleTemplate;
import com.autocare.backend.vehicle.entity.enums.VehicleStatus;
import com.autocare.backend.vehicle.repository.BrandRepository;
import com.autocare.backend.vehicle.repository.ModelRepository;
import com.autocare.backend.vehicle.repository.UserVehicleRepository;
import com.autocare.backend.vehicle.repository.VehicleTemplateRepository;
import com.autocare.backend.vehicle.service.GeminiVehicleProfileService;
import com.autocare.backend.vehicle.service.VehicleService;
import com.autocare.backend.vehicle.service.VehicleTemplateCloneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import com.autocare.backend.vehicle.repository.UserComponentRepository;
import com.autocare.backend.vehicle.repository.UserDocumentRepository;
import com.autocare.backend.vehicle.repository.UserIntervalRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final UserRepository userRepository;
    private final BrandRepository brandRepository;
    private final ModelRepository modelRepository;
    private final UserVehicleRepository userVehicleRepository;
    private final VehicleTemplateRepository vehicleTemplateRepository;
    private final VehicleTemplateCloneService vehicleTemplateCloneService;
    private final GeminiVehicleProfileService geminiVehicleProfileService;
    private final UserComponentRepository userComponentRepository;
    private final UserDocumentRepository userDocumentRepository;
    private final UserIntervalRepository userIntervalRepository;
    private final com.autocare.backend.vehicle.service.ComponentDegradationService componentDegradationService;
    private final com.autocare.backend.notification.service.NotificationService notificationService;
    private final com.autocare.backend.vehicle.service.GeminiClient geminiClient;

    @Override
    @Transactional
    public UserVehicle createVehicle(UUID userId, CreateVehicleRequest request) {
        log.info("Onboarding request received for user: {}, vehicle model ID: {}", userId, request.getModelId());

        // 1. Validation: Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // 2. Validation: Verify brand and model exist
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with ID: " + request.getBrandId()));

        Model model = modelRepository.findById(request.getModelId())
                .orElseThrow(() -> new ResourceNotFoundException("Model not found with ID: " + request.getModelId()));

        // 3. Validation: Verify model belongs to brand
        if (!model.getBrand().getId().equals(brand.getId())) {
            throw new BusinessException("Model '" + model.getName() + "' does not belong to brand '" + brand.getName() + "'");
        }

        // 4. Duplicate Check: Validate VIN if provided
        if (request.getVin() != null && !request.getVin().trim().isEmpty()) {
            String sanitizedVin = request.getVin().trim().toUpperCase();
            if (userVehicleRepository.existsByVinAndStatus(sanitizedVin, VehicleStatus.ACTIVE)) {
                throw new DuplicateResourceException("A vehicle with the VIN '" + sanitizedVin + "' is already registered and active.");
            }
        }

        // 5. Duplicate Check: Validate license plate if provided
        if (request.getLicensePlate() != null && !request.getLicensePlate().trim().isEmpty()) {
            String sanitizedPlate = request.getLicensePlate().trim().toUpperCase();
            if (userVehicleRepository.existsByLicensePlateIgnoreCaseAndStatus(sanitizedPlate, VehicleStatus.ACTIVE)) {
                throw new DuplicateResourceException("A vehicle with the license plate '" + sanitizedPlate + "' is already registered and active.");
            }
        }

        // 6. Manage Primary Flag: If this vehicle is primary, unset any existing active primary vehicle
        if (request.isPrimary()) {
            userVehicleRepository.findByUserIdAndIsPrimaryTrueAndStatus(userId, VehicleStatus.ACTIVE)
                    .ifPresent(primaryVehicle -> {
                        log.info("De-prioritizing existing primary vehicle ID: {}", primaryVehicle.getId());
                        primaryVehicle.setPrimary(false);
                        userVehicleRepository.saveAndFlush(primaryVehicle);
                    });
        }

        // 7. Find or Generate Vehicle Template
        String trim = request.getTrimConfiguration() != null && !request.getTrimConfiguration().trim().isEmpty()
                ? request.getTrimConfiguration().trim()
                : "Standard";

        VehicleTemplate template = vehicleTemplateRepository
                .findByBrandIdAndModelIdAndYearAndTrimConfigurationIgnoreCase(brand.getId(), model.getId(), request.getYear(), trim)
                .orElseGet(() -> {
                    log.info("No existing template found. Generating new template via Gemini API...");
                    // Call the AI profile generation service to call Gemini and persist a new template
                    return geminiVehicleProfileService.generateAndSaveTemplate(
                            brand,
                            model,
                            request.getYear(),
                            trim,
                            request.getEngine(),
                            request.getTransmission() != null ? request.getTransmission().name() : null,
                            request.getFuelType() != null ? request.getFuelType().name() : null
                    );
                });

        // 8. Clone Template to User's Digital Twin
        log.info("Cloning template ID: {} to user: {}", template.getId(), userId);
        return vehicleTemplateCloneService.cloneTemplateToUser(
                template,
                user,
                request.getLicensePlate() != null ? request.getLicensePlate().trim().toUpperCase() : null,
                request.getVin() != null ? request.getVin().trim().toUpperCase() : null,
                request.getCurrentMileage(),
                request.getMileageUnit(),
                request.getFuelType(),
                request.getTransmission(),
                request.getColor(),
                request.isPrimary(),
                request.getPurchaseCondition(),
                request.getNickname(),
                request.getPurchaseDate(),
                request.getMileageAtPurchase(),
                request.getInitialComponentHealths()
        );
    }

    @Override
    @Transactional
    public UserVehicle getVehicleById(UUID userId, UUID id) {
        UserVehicle vehicle = userVehicleRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        componentDegradationService.updateVehicleComponentDegradation(vehicle);
        return vehicle;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserVehicle> getVehicles(UUID userId, VehicleStatus status, Pageable pageable) {
        return userVehicleRepository.findByUserIdAndStatus(userId, status, pageable);
    }

    @Override
    @Transactional
    public UserVehicle updateVehicle(UUID userId, UUID id, UpdateVehicleRequest request) {
        UserVehicle vehicle = userVehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        // 1. Validate VIN duplicates if modified
        if (request.getVin() != null && !request.getVin().trim().isEmpty()) {
            String sanitizedVin = request.getVin().trim().toUpperCase();
            if (!sanitizedVin.equals(vehicle.getVin())) {
                if (userVehicleRepository.existsByVinAndStatus(sanitizedVin, VehicleStatus.ACTIVE)) {
                    throw new DuplicateResourceException("A vehicle with the VIN '" + sanitizedVin + "' is already registered and active.");
                }
            }
            vehicle.setVin(sanitizedVin);
        } else {
            vehicle.setVin(null);
        }

        // 2. Validate License Plate duplicates if modified
        if (request.getLicensePlate() != null && !request.getLicensePlate().trim().isEmpty()) {
            String sanitizedPlate = request.getLicensePlate().trim().toUpperCase();
            if (!sanitizedPlate.equals(vehicle.getLicensePlate())) {
                if (userVehicleRepository.existsByLicensePlateIgnoreCaseAndStatus(sanitizedPlate, VehicleStatus.ACTIVE)) {
                    throw new DuplicateResourceException("A vehicle with the license plate '" + sanitizedPlate + "' is already registered and active.");
                }
            }
            vehicle.setLicensePlate(sanitizedPlate);
        } else {
            vehicle.setLicensePlate(null);
        }

        // 3. Update fields
        vehicle.setColor(request.getColor());
        if (request.getCurrentMileage() != null) {
            vehicle.setCurrentMileage(request.getCurrentMileage());
        }
        if (request.getMileageUnit() != null) {
            vehicle.setMileageUnit(request.getMileageUnit());
        }
        if (request.getFuelType() != null) {
            vehicle.setFuelType(request.getFuelType());
        }
        if (request.getTransmission() != null) {
            vehicle.setTransmission(request.getTransmission());
        }
        vehicle.setLastServiceDate(request.getLastServiceDate());
        vehicle.setLastServiceMileage(request.getLastServiceMileage());
        
        if (request.getStatus() != null) {
            if (request.getStatus() == VehicleStatus.ARCHIVED || request.getStatus() == VehicleStatus.SOLD) {
                vehicle.setPrimary(false);
            }
            vehicle.setStatus(request.getStatus());
        }

        UserVehicle savedVehicle = userVehicleRepository.save(vehicle);
        // Automatically recalculate degradation scores and alerts when vehicle details or mileage change
        componentDegradationService.updateVehicleComponentDegradation(savedVehicle);
        return savedVehicle;
    }

    @Override
    @Transactional
    public void archiveVehicle(UUID userId, UUID id) {
        UserVehicle vehicle = userVehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        vehicle.setStatus(VehicleStatus.ARCHIVED);
        vehicle.setPrimary(false);
        userVehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public UserVehicle setPrimaryVehicle(UUID userId, UUID id) {
        UserVehicle vehicle = userVehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        if (vehicle.getStatus() != VehicleStatus.ACTIVE) {
            throw new BusinessException("Only active vehicles can be set as primary.");
        }

        if (!vehicle.isPrimary()) {
            userVehicleRepository.findByUserIdAndIsPrimaryTrueAndStatus(userId, VehicleStatus.ACTIVE)
                    .ifPresent(primaryVehicle -> {
                        primaryVehicle.setPrimary(false);
                        userVehicleRepository.saveAndFlush(primaryVehicle);
                    });
            vehicle.setPrimary(true);
        }

        return userVehicleRepository.save(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public void checkDuplicates(String vin, String licensePlate) {
        if (vin != null && !vin.trim().isEmpty()) {
            String sanitizedVin = vin.trim().toUpperCase();
            if (userVehicleRepository.existsByVinAndStatus(sanitizedVin, VehicleStatus.ACTIVE)) {
                throw new DuplicateResourceException("A vehicle with the VIN '" + sanitizedVin + "' is already registered and active.");
            }
        }
        if (licensePlate != null && !licensePlate.trim().isEmpty()) {
            String sanitizedPlate = licensePlate.trim().toUpperCase();
            if (userVehicleRepository.existsByLicensePlateIgnoreCaseAndStatus(sanitizedPlate, VehicleStatus.ACTIVE)) {
                throw new DuplicateResourceException("A vehicle with the license plate '" + sanitizedPlate + "' is already registered and active.");
            }
        }
    }

    @Override
    @Transactional
    public com.autocare.backend.vehicle.entity.UserComponent addComponent(UUID userId, UUID vehicleId, com.autocare.backend.vehicle.dto.CreateComponentRequest request) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        com.autocare.backend.vehicle.entity.UserComponent component = new com.autocare.backend.vehicle.entity.UserComponent();
        component.setUserVehicle(vehicle);
        component.setCategory(request.getCategory());
        component.setName(request.getName());
        component.setPartNumber(request.getPartNumber());
        component.setSpecifications(request.getSpecifications());
        component.setLastReplacedMileage(request.getLastReplacedMileage());
        component.setLastReplacedDate(request.getLastReplacedDate());
        component.setNotes(request.getNotes());
        component.setCustom(true);
        component.setModifiedFromTemplate(false);
        component.setStatus(request.getStatus() != null ? request.getStatus() : com.autocare.backend.vehicle.entity.enums.ComponentStatus.NEEDS_VERIFICATION);
        component.setHealthScore(request.getHealthScore());
        component.setConfidenceScore(request.getConfidenceScore() != null ? request.getConfidenceScore() : 100);
        component.setEstimatedRemainingLife(request.getEstimatedRemainingLife());
        component.setInstallationMileage(request.getInstallationMileage());
        component.setInstallationDate(request.getInstallationDate());
        component.setLastInspectionDate(request.getLastInspectionDate());
        component.setOrigin(com.autocare.backend.vehicle.entity.enums.DataOrigin.USER_CONFIRMED);

        return userComponentRepository.save(component);
    }

    @Override
    @Transactional
    public com.autocare.backend.vehicle.entity.UserComponent updateComponent(UUID userId, UUID vehicleId, UUID componentId, com.autocare.backend.vehicle.dto.UpdateComponentRequest request) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        com.autocare.backend.vehicle.entity.UserComponent component = userComponentRepository.findById(componentId)
                .orElseThrow(() -> new ResourceNotFoundException("Component not found with ID: " + componentId));

        if (!component.getUserVehicle().getId().equals(vehicleId)) {
            throw new BusinessException("Component does not belong to the specified vehicle.");
        }

        component.setCategory(request.getCategory());
        component.setName(request.getName());
        component.setPartNumber(request.getPartNumber());
        component.setSpecifications(request.getSpecifications());
        component.setLastReplacedMileage(request.getLastReplacedMileage());
        component.setLastReplacedDate(request.getLastReplacedDate());
        component.setNotes(request.getNotes());
        if (request.getStatus() != null) {
            component.setStatus(request.getStatus());
        }
        component.setHealthScore(request.getHealthScore());
        if (request.getConfidenceScore() != null) {
            component.setConfidenceScore(request.getConfidenceScore());
        }
        component.setEstimatedRemainingLife(request.getEstimatedRemainingLife());
        component.setInstallationMileage(request.getInstallationMileage());
        component.setInstallationDate(request.getInstallationDate());
        component.setLastInspectionDate(request.getLastInspectionDate());
        component.setOrigin(com.autocare.backend.vehicle.entity.enums.DataOrigin.USER_CONFIRMED);

        return userComponentRepository.save(component);
    }

    @Override
    @Transactional
    public void deleteComponent(UUID userId, UUID vehicleId, UUID componentId) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        com.autocare.backend.vehicle.entity.UserComponent component = userComponentRepository.findById(componentId)
                .orElseThrow(() -> new ResourceNotFoundException("Component not found with ID: " + componentId));

        if (!component.getUserVehicle().getId().equals(vehicleId)) {
            throw new BusinessException("Component does not belong to the specified vehicle.");
        }

        userComponentRepository.delete(component);
    }

    @Override
    @Transactional
    public com.autocare.backend.vehicle.entity.UserDocument addDocument(UUID userId, UUID vehicleId, com.autocare.backend.vehicle.dto.CreateDocumentRequest request) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        com.autocare.backend.vehicle.entity.UserDocument document = new com.autocare.backend.vehicle.entity.UserDocument();
        document.setUserVehicle(vehicle);
        document.setTitle(request.getTitle());
        document.setUrl(request.getUrl());
        document.setExpiryDate(request.getExpiryDate());
        document.setNotes(request.getNotes());

        com.autocare.backend.vehicle.entity.UserDocument saved = userDocumentRepository.save(document);
        notificationService.evaluateDocumentNotification(userId, vehicle, saved);
        return saved;
    }

    @Override
    @Transactional
    public com.autocare.backend.vehicle.entity.UserDocument updateDocument(UUID userId, UUID vehicleId, UUID documentId, com.autocare.backend.vehicle.dto.UpdateDocumentRequest request) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        com.autocare.backend.vehicle.entity.UserDocument document = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + documentId));

        if (!document.getUserVehicle().getId().equals(vehicleId)) {
            throw new BusinessException("Document does not belong to the specified vehicle.");
        }

        document.setTitle(request.getTitle());
        document.setUrl(request.getUrl());
        document.setExpiryDate(request.getExpiryDate());
        document.setNotes(request.getNotes());

        com.autocare.backend.vehicle.entity.UserDocument updated = userDocumentRepository.save(document);
        notificationService.evaluateDocumentNotification(userId, vehicle, updated);
        return updated;
    }

    @Override
    @Transactional
    public void deleteDocument(UUID userId, UUID vehicleId, UUID documentId) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        com.autocare.backend.vehicle.entity.UserDocument document = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + documentId));

        if (!document.getUserVehicle().getId().equals(vehicleId)) {
            throw new BusinessException("Document does not belong to the specified vehicle.");
        }

        notificationService.resolveDocumentNotificationsBeforeDelete(userId, documentId);
        userDocumentRepository.delete(document);
    }

    @Override
    @Transactional
    public com.autocare.backend.vehicle.entity.UserInterval addInterval(UUID userId, UUID vehicleId, com.autocare.backend.vehicle.dto.CreateIntervalRequest request) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        com.autocare.backend.vehicle.entity.UserInterval interval = new com.autocare.backend.vehicle.entity.UserInterval();
        interval.setUserVehicle(vehicle);
        interval.setTitle(request.getTitle());
        interval.setDescription(request.getDescription());
        interval.setIntervalMileage(request.getIntervalMileage());
        interval.setIntervalMonths(request.getIntervalMonths());
        interval.setInspectionOnly(request.isInspectionOnly());
        interval.setModifiedFromTemplate(false);

        return userIntervalRepository.save(interval);
    }

    @Override
    @Transactional
    public com.autocare.backend.vehicle.entity.UserInterval updateInterval(UUID userId, UUID vehicleId, UUID intervalId, com.autocare.backend.vehicle.dto.UpdateIntervalRequest request) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        com.autocare.backend.vehicle.entity.UserInterval interval = userIntervalRepository.findById(intervalId)
                .orElseThrow(() -> new ResourceNotFoundException("Interval not found with ID: " + intervalId));

        if (!interval.getUserVehicle().getId().equals(vehicleId)) {
            throw new BusinessException("Interval does not belong to the specified vehicle.");
        }

        interval.setTitle(request.getTitle());
        interval.setDescription(request.getDescription());
        interval.setIntervalMileage(request.getIntervalMileage());
        interval.setIntervalMonths(request.getIntervalMonths());
        interval.setInspectionOnly(request.isInspectionOnly());
        interval.setModifiedFromTemplate(true);

        return userIntervalRepository.save(interval);
    }

    @Override
    @Transactional
    public void deleteInterval(UUID userId, UUID vehicleId, UUID intervalId) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        com.autocare.backend.vehicle.entity.UserInterval interval = userIntervalRepository.findById(intervalId)
                .orElseThrow(() -> new ResourceNotFoundException("Interval not found with ID: " + intervalId));

        if (!interval.getUserVehicle().getId().equals(vehicleId)) {
            throw new BusinessException("Interval does not belong to the specified vehicle.");
        }

        userIntervalRepository.delete(interval);
    }

    @Override
    @Transactional
    public void batchUpdateComponentDates(UUID userId, UUID vehicleId, java.util.Map<String, String> componentDates) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        if (componentDates == null || componentDates.isEmpty()) {
            return;
        }

        int matched = 0;
        for (com.autocare.backend.vehicle.entity.UserComponent comp : vehicle.getComponents()) {
            String dateStr = componentDates.get(comp.getName());
            if (dateStr != null && !dateStr.isBlank()) {
                try {
                    java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
                    comp.setLastReplacedDate(date);
                    comp.setInstallationDate(date);
                    comp.setInstallationMileage(vehicle.getCurrentMileage() != null ? vehicle.getCurrentMileage() : 0);
                    comp.setOrigin(com.autocare.backend.vehicle.entity.enums.DataOrigin.USER_CONFIRMED);
                    comp.setConfidenceScore(100);
                    comp.setStatus(com.autocare.backend.vehicle.entity.enums.ComponentStatus.GOOD);
                    userComponentRepository.save(comp);
                    matched++;
                } catch (java.time.format.DateTimeParseException e) {
                    log.warn("Invalid date format for component '{}': {}", comp.getName(), dateStr);
                }
            }
        }

        log.info("Updated last-changed dates for {}/{} components on vehicle {}", matched, vehicle.getComponents().size(), vehicleId);

        // Recalculate degradation for all components now that dates are set
        componentDegradationService.updateVehicleComponentDegradation(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public com.autocare.backend.vehicle.dto.AiAdvisorResponse consultAiAdvisor(
            UUID userId, 
            UUID vehicleId, 
            com.autocare.backend.vehicle.dto.AiAdvisorRequest request
    ) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        String vehicleContext = String.format("%s %s %s (%s, %s)",
                vehicle.getTemplate().getYear(),
                vehicle.getTemplate().getBrand().getName(),
                vehicle.getTemplate().getModel().getName(),
                vehicle.getFuelType(),
                vehicle.getTransmission()
        );

        String question = request.getQuestion().trim();

        // Build rich mechanical digital twin prompt for AI Advisor
        StringBuilder componentsSummary = new StringBuilder();
        if (vehicle.getComponents() != null && !vehicle.getComponents().isEmpty()) {
            for (com.autocare.backend.vehicle.entity.UserComponent c : vehicle.getComponents()) {
                componentsSummary.append(String.format("- %s (Category: %s, Health: %d%%, Status: %s, Remaining: %s km / %s days)\n",
                        c.getName(),
                        c.getCategory() != null ? c.getCategory().name() : "GENERAL",
                        c.getHealthScore() != null ? c.getHealthScore() : 100,
                        c.getStatus() != null ? c.getStatus().name() : "GOOD",
                        c.getRemainingMileage() != null ? c.getRemainingMileage() : "N/A",
                        c.getRemainingDays() != null ? c.getRemainingDays() : "N/A"
                ));
            }
        } else {
            componentsSummary.append("Standard factory specifications.\n");
        }

        String prompt = String.format(
                "You are the AutoCare Expert Automotive Master Technician & AI Advisor.\n" +
                "The user is asking a question regarding their vehicle:\n\n" +
                "Vehicle Specifications:\n" +
                "- Make & Model: %s %s %s\n" +
                "- Trim Configuration: %s\n" +
                "- Fuel: %s, Transmission: %s\n" +
                "- Current Odometer Mileage: %d %s\n\n" +
                "Installed Digital Twin Components Status:\n" +
                "%s\n" +
                "User's Question: \"%s\"\n\n" +
                "Instructions:\n" +
                "1. Provide precise, actionable, factory-grade mechanical advice tailored to this vehicle.\n" +
                "2. Directly address the user's question, including OEM fluid specifications, part numbers, maintenance intervals, or diagnosis tips if relevant.\n" +
                "3. Keep the tone helpful, professional, and clear with clean Markdown bullet points.\n" +
                "4. Answer concisely (150-250 words max).",
                vehicle.getTemplate().getYear(),
                vehicle.getTemplate().getBrand().getName(),
                vehicle.getTemplate().getModel().getName(),
                vehicle.getTemplate().getTrimConfiguration() != null ? vehicle.getTemplate().getTrimConfiguration() : "Standard",
                vehicle.getFuelType(),
                vehicle.getTransmission(),
                vehicle.getCurrentMileage() != null ? vehicle.getCurrentMileage() : 0,
                vehicle.getMileageUnit() != null ? vehicle.getMileageUnit() : "KM",
                componentsSummary.toString(),
                question
        );

        String answer = geminiClient.askAdvisor(prompt);
        return new com.autocare.backend.vehicle.dto.AiAdvisorResponse(vehicleContext, question, answer);
    }

    @Override
    @Transactional(readOnly = true)
    public com.autocare.backend.vehicle.dto.VehicleReportResponse exportVehicleReport(UUID userId, UUID vehicleId) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        java.util.List<com.autocare.backend.vehicle.dto.VehicleReportResponse.ComponentReportItem> items = new java.util.ArrayList<>();
        java.util.List<String> warnings = new java.util.ArrayList<>();
        int totalHealth = 0;
        int count = 0;

        if (vehicle.getComponents() != null) {
            for (com.autocare.backend.vehicle.entity.UserComponent c : vehicle.getComponents()) {
                int health = c.getHealthScore() != null ? c.getHealthScore() : 100;
                totalHealth += health;
                count++;

                if (health < 25) {
                    warnings.add("CRITICAL: " + c.getName() + " health is " + health + "%. Immediate replacement required!");
                }

                items.add(com.autocare.backend.vehicle.dto.VehicleReportResponse.ComponentReportItem.builder()
                        .name(c.getName())
                        .category(c.getCategory() != null ? c.getCategory().name() : "GENERAL")
                        .healthScore(health)
                        .status(c.getStatus() != null ? c.getStatus().name() : "GOOD")
                        .remainingMileage(c.getRemainingMileage())
                        .remainingDays(c.getRemainingDays())
                        .lastReplacedDate(c.getLastReplacedDate() != null ? c.getLastReplacedDate().toString() : null)
                        .build()
                );
            }
        }

        int avgHealth = count > 0 ? totalHealth / count : 100;

        return com.autocare.backend.vehicle.dto.VehicleReportResponse.builder()
                .vehicleId(vehicle.getId())
                .vehicleTitle(vehicle.getTemplate().getYear() + " " + vehicle.getTemplate().getBrand().getName() + " " + vehicle.getTemplate().getModel().getName())
                .nickname(vehicle.getNickname())
                .vin(vehicle.getVin())
                .licensePlate(vehicle.getLicensePlate())
                .currentMileage(vehicle.getCurrentMileage())
                .mileageUnit(vehicle.getMileageUnit() != null ? vehicle.getMileageUnit().name() : "KM")
                .fuelType(vehicle.getFuelType() != null ? vehicle.getFuelType().name() : "GASOLINE")
                .transmission(vehicle.getTransmission() != null ? vehicle.getTransmission().name() : "AUTOMATIC")
                .completenessScore(vehicle.getCompletenessScore())
                .overallHealthScore(avgHealth)
                .generatedAt(java.time.Instant.now().toString())
                .components(items)
                .criticalWarnings(warnings)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public com.autocare.backend.vehicle.dto.VehicleBudgetForecastResponse getVehicleBudgetForecast(UUID userId, UUID vehicleId, String requestedCurrency) {
        UserVehicle vehicle = userVehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

        String brandName = vehicle.getTemplate().getBrand().getName().trim();
        String modelName = vehicle.getTemplate().getModel().getName().trim();
        int year = vehicle.getTemplate().getYear();
        String fuelType = vehicle.getFuelType() != null ? vehicle.getFuelType().name() : "GASOLINE";
        String currency = (requestedCurrency != null && !requestedCurrency.trim().isEmpty()) ? requestedCurrency.toUpperCase() : "EUR";

        // 1. Determine Brand Tier & Rates
        String brandTier = determineBrandTier(brandName);
        double tierMultiplier = getTierMultiplier(brandTier);
        int baseLaborRate = getBaseLaborRate(brandTier);
        double currencyRate = getCurrencyExchangeRate(currency);

        int laborRatePerHour = (int) Math.round(baseLaborRate * currencyRate);

        // 2. Build items and calculate timeframe budgets
        java.util.List<com.autocare.backend.vehicle.dto.VehicleBudgetForecastResponse.BudgetItem> budgetItems = new java.util.ArrayList<>();
        int budget0To3 = 0;
        int budget3To6 = 0;
        int budget6To12 = 0;
        double totalLaborHours = 0.0;

        if (vehicle.getComponents() != null && !vehicle.getComponents().isEmpty()) {
            for (com.autocare.backend.vehicle.entity.UserComponent c : vehicle.getComponents()) {
                String cName = c.getName();
                String nameLower = cName.toLowerCase();

                // Skip combustion-only parts for Electric Vehicles
                if ("ELECTRIC".equalsIgnoreCase(fuelType) && (nameLower.contains("oil") || nameLower.contains("spark") || nameLower.contains("timing"))) {
                    continue;
                }

                int health = c.getHealthScore() != null ? c.getHealthScore() : 100;
                Integer remainingDays = c.getRemainingDays();

                // Determine base part cost & labor hours
                ComponentCostEstimate estimate = getComponentBaseEstimate(nameLower);
                int partCost = (int) Math.round(estimate.basePartCost * tierMultiplier * currencyRate);
                int laborCost = (int) Math.round(estimate.laborHours * laborRatePerHour);
                int itemTotal = partCost + laborCost;
                totalLaborHours += estimate.laborHours;

                // Determine timeframe & urgency based on health and remaining lifespan
                String timeframe;
                String urgency;
                String recommendation;

                if (health < 40 || (remainingDays != null && remainingDays <= 90)) {
                    timeframe = "0-3M";
                    urgency = "URGENT";
                    budget0To3 += itemTotal;
                    recommendation = "High wear detected (" + health + "% health). Schedule replacement soon to avoid breakdown.";
                } else if (health < 70 || (remainingDays != null && remainingDays <= 180)) {
                    timeframe = "3-6M";
                    urgency = "UPCOMING";
                    budget3To6 += itemTotal;
                    recommendation = "Moderate wear. Monitor condition during upcoming routine inspections.";
                } else {
                    timeframe = "6-12M";
                    urgency = "SCHEDULED";
                    budget6To12 += itemTotal;
                    recommendation = "Good condition. Standard preventive factory maintenance scheduled.";
                }

                budgetItems.add(com.autocare.backend.vehicle.dto.VehicleBudgetForecastResponse.BudgetItem.builder()
                        .componentName(cName)
                        .category(c.getCategory() != null ? c.getCategory().name() : "GENERAL")
                        .healthScore(health)
                        .urgency(urgency)
                        .estimatedPartCost(partCost)
                        .estimatedLaborCost(laborCost)
                        .totalCost(itemTotal)
                        .timeframe(timeframe)
                        .aiRecommendation(recommendation)
                        .build());
            }
        }

        int totalBudget = budget0To3 + budget3To6 + budget6To12;

        // 3. Generate rich AI summary
        String aiSummary = String.format(
                "AI Maintenance Forecast for %d %s %s (%s Tier, %s):\n" +
                "Estimated 12-month investment is %s %s (%s %s parts + %s %s labor across %.1f workshop hours). " +
                (budget0To3 > 0
                        ? "Priority attention required for 0-3 month items due to critical component wear."
                        : "No immediate critical repairs needed; major maintenance is deferred to scheduled 6-12 month intervals."),
                year, brandName, modelName, brandTier, fuelType,
                currencySymbol(currency), totalBudget,
                currencySymbol(currency), (int)(totalBudget * 0.6),
                currencySymbol(currency), (int)(totalBudget * 0.4),
                totalLaborHours
        );

        String vehicleTitle = String.format("%d %s %s", year, brandName, modelName);

        return com.autocare.backend.vehicle.dto.VehicleBudgetForecastResponse.builder()
                .vehicleId(vehicle.getId().toString())
                .vehicleTitle(vehicleTitle)
                .brandTier(brandTier)
                .currency(currency)
                .totalEstimatedBudget(totalBudget)
                .budget0To3Months(budget0To3)
                .budget3To6Months(budget3To6)
                .budget6To12Months(budget6To12)
                .estimatedLaborRatePerHour(laborRatePerHour)
                .totalLaborHours(Math.round(totalLaborHours * 10.0) / 10.0)
                .aiSummary(aiSummary)
                .items(budgetItems)
                .build();
    }

    private String determineBrandTier(String brand) {
        if (brand == null) return "STANDARD";
        String b = brand.toLowerCase().trim();

        if (b.contains("ferrari") || b.contains("lamborghini") || b.contains("mclaren") || b.contains("bugatti") ||
            b.contains("rolls-royce") || b.contains("bentley") || b.contains("aston martin") || b.contains("maserati")) {
            return "EXOTIC";
        }
        if (b.contains("porsche") || b.contains("audi") || b.contains("bmw") || b.contains("mercedes") ||
            b.contains("land rover") || b.contains("jaguar") || b.contains("lexus") || b.contains("genesis") || b.contains("alfa")) {
            return "LUXURY";
        }
        if (b.contains("tesla") || b.contains("volvo") || b.contains("mini") || b.contains("infiniti") ||
            b.contains("acura") || b.contains("cupra") || b.contains("jeep") || b.contains("ds")) {
            return "PREMIUM";
        }
        if (b.contains("dacia") || b.contains("renault") || b.contains("fiat") || b.contains("citroen") ||
            b.contains("suzuki") || b.contains("lada") || b.contains("mg") || b.contains("mitsubishi") || b.contains("byd") || b.contains("geely")) {
            return "ECONOMY";
        }
        return "STANDARD";
    }

    private double getTierMultiplier(String tier) {
        switch (tier) {
            case "EXOTIC": return 3.5;
            case "LUXURY": return 2.1;
            case "PREMIUM": return 1.45;
            case "ECONOMY": return 0.75;
            case "STANDARD":
            default: return 1.0;
        }
    }

    private int getBaseLaborRate(String tier) {
        switch (tier) {
            case "EXOTIC": return 180;
            case "LUXURY": return 125;
            case "PREMIUM": return 95;
            case "ECONOMY": return 55;
            case "STANDARD":
            default: return 75;
        }
    }

    private double getCurrencyExchangeRate(String currency) {
        switch (currency) {
            case "USD": return 1.08;
            case "MAD": return 10.8;
            case "GBP": return 0.85;
            case "EUR":
            default: return 1.0;
        }
    }

    private String currencySymbol(String currency) {
        switch (currency) {
            case "USD": return "$";
            case "MAD": return "DH";
            case "GBP": return "£";
            case "EUR":
            default: return "€";
        }
    }

    private static class ComponentCostEstimate {
        final int basePartCost;
        final double laborHours;

        ComponentCostEstimate(int basePartCost, double laborHours) {
            this.basePartCost = basePartCost;
            this.laborHours = laborHours;
        }
    }

    private ComponentCostEstimate getComponentBaseEstimate(String nameLower) {
        if (nameLower.contains("oil filter") || nameLower.contains("cabin") || nameLower.contains("air filter")) {
            return new ComponentCostEstimate(25, 0.3);
        }
        if (nameLower.contains("engine oil") || nameLower.contains("oil change")) {
            return new ComponentCostEstimate(65, 0.5);
        }
        if (nameLower.contains("brake rotor") || nameLower.contains("rotor")) {
            return new ComponentCostEstimate(120, 1.5);
        }
        if (nameLower.contains("brake pad") || nameLower.contains("brake")) {
            return new ComponentCostEstimate(80, 1.0);
        }
        if (nameLower.contains("tire") || nameLower.contains("tyre")) {
            return new ComponentCostEstimate(340, 0.8);
        }
        if (nameLower.contains("battery")) {
            return new ComponentCostEstimate(130, 0.4);
        }
        if (nameLower.contains("spark plug") || nameLower.contains("spark")) {
            return new ComponentCostEstimate(60, 1.0);
        }
        if (nameLower.contains("timing") || nameLower.contains("belt") || nameLower.contains("chain")) {
            return new ComponentCostEstimate(220, 3.5);
        }
        if (nameLower.contains("transmission") || nameLower.contains("clutch") || nameLower.contains("gearbox")) {
            return new ComponentCostEstimate(150, 2.0);
        }
        if (nameLower.contains("coolant") || nameLower.contains("radiator")) {
            return new ComponentCostEstimate(50, 0.8);
        }
        if (nameLower.contains("wiper")) {
            return new ComponentCostEstimate(30, 0.2);
        }
        return new ComponentCostEstimate(70, 0.8);
    }
}

