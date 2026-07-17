package com.autocare.backend.job.worker;

import com.autocare.backend.auth.entity.User;
import com.autocare.backend.auth.exception.BusinessException;
import com.autocare.backend.auth.exception.DuplicateResourceException;
import com.autocare.backend.auth.exception.ResourceNotFoundException;
import com.autocare.backend.auth.repository.UserRepository;
import com.autocare.backend.job.entity.Job;
import com.autocare.backend.job.entity.enums.JobStage;
import com.autocare.backend.job.entity.enums.JobType;
import com.autocare.backend.job.service.JobService;
import com.autocare.backend.vehicle.dto.CreateVehicleRequest;
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
import com.autocare.backend.vehicle.service.VehicleTemplateCloneService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class DigitalTwinGenerationHandler implements JobHandler {

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final BrandRepository brandRepository;
    private final ModelRepository modelRepository;
    private final UserVehicleRepository userVehicleRepository;
    private final VehicleTemplateRepository vehicleTemplateRepository;
    private final GeminiVehicleProfileService geminiVehicleProfileService;
    private final VehicleTemplateCloneService vehicleTemplateCloneService;
    private final JobService jobService;

    @Autowired
    public DigitalTwinGenerationHandler(
            ObjectMapper objectMapper,
            UserRepository userRepository,
            BrandRepository brandRepository,
            ModelRepository modelRepository,
            UserVehicleRepository userVehicleRepository,
            VehicleTemplateRepository vehicleTemplateRepository,
            GeminiVehicleProfileService geminiVehicleProfileService,
            VehicleTemplateCloneService vehicleTemplateCloneService,
            @Lazy JobService jobService) {
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
        this.brandRepository = brandRepository;
        this.modelRepository = modelRepository;
        this.userVehicleRepository = userVehicleRepository;
        this.vehicleTemplateRepository = vehicleTemplateRepository;
        this.geminiVehicleProfileService = geminiVehicleProfileService;
        this.vehicleTemplateCloneService = vehicleTemplateCloneService;
        this.jobService = jobService;
    }

    @Override
    public JobType getType() {
        return JobType.DIGITAL_TWIN_GENERATION;
    }

    @Override
    public void execute(Job job) throws Exception {
        UUID userId = job.getUser().getId();
        log.info("Executing digital twin generation for job: {}, user: {}", job.getId(), userId);

        // 1. Validating Request Stage
        jobService.updateStage(job.getId(), JobStage.VALIDATING_REQUEST);
        CreateVehicleRequest request = objectMapper.convertValue(job.getPayload(), CreateVehicleRequest.class);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with ID: " + request.getBrandId()));

        Model model = modelRepository.findById(request.getModelId())
                .orElseThrow(() -> new ResourceNotFoundException("Model not found with ID: " + request.getModelId()));

        if (!model.getBrand().getId().equals(brand.getId())) {
            throw new BusinessException("Model '" + model.getName() + "' does not belong to brand '" + brand.getName() + "'");
        }

        if (request.getVin() != null && !request.getVin().trim().isEmpty()) {
            String sanitizedVin = request.getVin().trim().toUpperCase();
            if (userVehicleRepository.existsByVinAndStatus(sanitizedVin, VehicleStatus.ACTIVE)) {
                throw new DuplicateResourceException("A vehicle with the VIN '" + sanitizedVin + "' is already registered and active.");
            }
        }

        if (request.getLicensePlate() != null && !request.getLicensePlate().trim().isEmpty()) {
            String sanitizedPlate = request.getLicensePlate().trim().toUpperCase();
            if (userVehicleRepository.existsByLicensePlateIgnoreCaseAndStatus(sanitizedPlate, VehicleStatus.ACTIVE)) {
                throw new DuplicateResourceException("A vehicle with the license plate '" + sanitizedPlate + "' is already registered and active.");
            }
        }

        if (request.isPrimary()) {
            userVehicleRepository.findByUserIdAndIsPrimaryTrueAndStatus(userId, VehicleStatus.ACTIVE)
                    .ifPresent(primaryVehicle -> {
                        log.info("De-prioritizing existing primary vehicle ID: {}", primaryVehicle.getId());
                        primaryVehicle.setPrimary(false);
                        userVehicleRepository.saveAndFlush(primaryVehicle);
                    });
        }

        // 2. Look for Template Stage
        jobService.updateStage(job.getId(), JobStage.LOOKING_FOR_TEMPLATE);
        VehicleTemplate template = resolveTemplate(request, brand, model, job);

        // 3. Clone Digital Twin Stage
        jobService.updateStage(job.getId(), JobStage.CLONING_DIGITAL_TWIN);
        log.info("Cloning template ID: {} to user: {}", template.getId(), userId);
        UserVehicle userVehicle = vehicleTemplateCloneService.cloneTemplateToUser(
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

        // 4. Finalizing Stage
        jobService.updateStage(job.getId(), JobStage.FINALIZING);
        job.setResult(Map.of("vehicleId", userVehicle.getId().toString()));
        log.info("Digital twin cloning finalized for vehicle: {}", userVehicle.getId());
    }

    private VehicleTemplate resolveTemplate(CreateVehicleRequest request, Brand brand, Model model, Job job) {
        String trim = request.getTrimConfiguration() != null && !request.getTrimConfiguration().trim().isEmpty()
                ? request.getTrimConfiguration().trim()
                : "Standard";

        // Check if template already exists
        var existingTemplate = vehicleTemplateRepository
                .findByBrandIdAndModelIdAndYearAndTrimConfigurationIgnoreCase(brand.getId(), model.getId(), request.getYear(), trim);

        if (existingTemplate.isPresent()) {
            log.info("Found existing template ID: {}", existingTemplate.get().getId());
            return existingTemplate.get();
        }

        // Future Optimization Hook:
        // Here we could query active jobs to see if there is another DIGITAL_TWIN_GENERATION job running
        // for the same configuration and wait/poll on it.
        // E.g.: jobRepository.findRunningJobsByPayload(brand.getId(), model.getId(), request.getYear(), trim)

        // Generate new template via Gemini API
        jobService.updateStage(job.getId(), JobStage.GENERATING_TEMPLATE);
        log.info("Template not found. Triggering Gemini generation...");
        
        VehicleTemplate generatedTemplate = geminiVehicleProfileService.generateAndSaveTemplate(
                brand,
                model,
                request.getYear(),
                trim,
                request.getEngine(),
                request.getTransmission() != null ? request.getTransmission().name() : null,
                request.getFuelType() != null ? request.getFuelType().name() : null
        );

        jobService.updateStage(job.getId(), JobStage.SAVING_TEMPLATE);
        log.info("Successfully generated and saved template ID: {}", generatedTemplate.getId());
        return generatedTemplate;
    }
}
