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
    @Transactional(readOnly = true)
    public UserVehicle getVehicleById(UUID userId, UUID id) {
        UserVehicle vehicle = userVehicleRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle.");
        }

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

        return userVehicleRepository.save(vehicle);
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
}

