package com.autocare.backend.vehicle.mapper;

import com.autocare.backend.vehicle.dto.VehicleResponse;
import com.autocare.backend.vehicle.dto.VehicleSummaryResponse;
import com.autocare.backend.vehicle.entity.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class VehicleMapper {

    public VehicleResponse toResponse(UserVehicle vehicle) {
        if (vehicle == null) return null;
        VehicleResponse response = new VehicleResponse();
        response.setId(vehicle.getId());
        if (vehicle.getUser() != null) {
            response.setUserId(vehicle.getUser().getId());
        }
        if (vehicle.getTemplate() != null) {
            response.setTemplateId(vehicle.getTemplate().getId());
            if (vehicle.getTemplate().getBrand() != null) {
                response.setBrandName(vehicle.getTemplate().getBrand().getName());
            }
            if (vehicle.getTemplate().getModel() != null) {
                response.setModelName(vehicle.getTemplate().getModel().getName());
            }
            response.setYear(vehicle.getTemplate().getYear());
            response.setTrimConfiguration(vehicle.getTemplate().getTrimConfiguration());
            response.setSpecifications(vehicle.getTemplate().getSpecifications());
        }
        response.setLicensePlate(vehicle.getLicensePlate());
        response.setVin(vehicle.getVin());
        response.setCurrentMileage(vehicle.getCurrentMileage());
        response.setMileageUnit(vehicle.getMileageUnit());
        response.setFuelType(vehicle.getFuelType());
        response.setTransmission(vehicle.getTransmission());
        response.setColor(vehicle.getColor());
        response.setNickname(vehicle.getNickname());
        response.setPurchaseCondition(vehicle.getPurchaseCondition());
        response.setPrimary(vehicle.isPrimary());
        response.setStatus(vehicle.getStatus());
        response.setLastServiceDate(vehicle.getLastServiceDate());
        response.setLastServiceMileage(vehicle.getLastServiceMileage());
        response.setPurchaseDate(vehicle.getPurchaseDate());
        response.setCompletenessScore(vehicle.getCompletenessScore());
        response.setEstimatedAnnualMileage(vehicle.getEstimatedAnnualMileage());
        if (vehicle.getDrivingProfile() != null) {
            response.setDrivingProfile(vehicle.getDrivingProfile().name());
        }
        if (vehicle.getClimateAssumptions() != null) {
            response.setClimateAssumptions(vehicle.getClimateAssumptions().name());
        }

        if (vehicle.getComponents() != null) {
            response.setComponents(vehicle.getComponents().stream()
                    .map(this::toComponentResponse)
                    .collect(Collectors.toList()));
        }
        if (vehicle.getIntervals() != null) {
            response.setIntervals(vehicle.getIntervals().stream()
                    .map(this::toIntervalResponse)
                    .collect(Collectors.toList()));
        }
        if (vehicle.getDocuments() != null) {
            response.setDocuments(vehicle.getDocuments().stream()
                    .map(this::toDocumentResponse)
                    .collect(Collectors.toList()));
        }
        if (vehicle.getPhotos() != null) {
            response.setPhotos(vehicle.getPhotos().stream()
                    .map(this::toPhotoResponse)
                    .collect(Collectors.toList()));
        }
        return response;
    }

    public List<VehicleResponse> toResponseList(List<UserVehicle> vehicles) {
        if (vehicles == null) return Collections.emptyList();
        return vehicles.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public VehicleResponse.ComponentResponse toComponentResponse(UserComponent component) {
        if (component == null) return null;
        VehicleResponse.ComponentResponse response = new VehicleResponse.ComponentResponse();
        response.setId(component.getId());
        if (component.getCategory() != null) {
            response.setCategory(component.getCategory().name());
        }
        response.setName(component.getName());
        response.setPartNumber(component.getPartNumber());
        response.setSpecifications(component.getSpecifications());
        response.setLastReplacedMileage(component.getLastReplacedMileage());
        response.setLastReplacedDate(component.getLastReplacedDate());
        response.setNotes(component.getNotes());
        response.setCustom(component.isCustom());
        response.setModifiedFromTemplate(component.isModifiedFromTemplate());
        if (component.getStatus() != null) {
            response.setStatus(component.getStatus().name());
        }
        response.setHealthScore(component.getHealthScore());
        response.setConfidenceScore(component.getConfidenceScore());
        response.setEstimatedRemainingLife(component.getEstimatedRemainingLife());
        response.setExpectedLifespanMileage(component.getExpectedLifespanMileage());
        response.setExpectedLifespanMonths(component.getExpectedLifespanMonths());
        response.setRemainingMileage(component.getRemainingMileage());
        response.setRemainingDays(component.getRemainingDays());
        response.setInstallationMileage(component.getInstallationMileage());
        response.setInstallationDate(component.getInstallationDate());
        response.setLastInspectionDate(component.getLastInspectionDate());
        if (component.getOrigin() != null) {
            response.setOrigin(component.getOrigin().name());
        }
        response.setRecommendations(component.getRecommendations());
        return response;
    }

    public VehicleResponse.DocumentResponse toDocumentResponse(UserDocument document) {
        if (document == null) return null;
        VehicleResponse.DocumentResponse response = new VehicleResponse.DocumentResponse();
        response.setId(document.getId());
        response.setTitle(document.getTitle());
        response.setUrl(document.getUrl());
        response.setExpiryDate(document.getExpiryDate());
        response.setNotes(document.getNotes());
        return response;
    }

    public VehicleResponse.IntervalResponse toIntervalResponse(UserInterval interval) {
        if (interval == null) return null;
        VehicleResponse.IntervalResponse response = new VehicleResponse.IntervalResponse();
        response.setId(interval.getId());
        response.setTitle(interval.getTitle());
        response.setDescription(interval.getDescription());
        response.setIntervalMileage(interval.getIntervalMileage());
        response.setIntervalMonths(interval.getIntervalMonths());
        response.setInspectionOnly(interval.isInspectionOnly());
        response.setModifiedFromTemplate(interval.isModifiedFromTemplate());
        return response;
    }

    public VehicleResponse.PhotoResponse toPhotoResponse(VehiclePhoto photo) {
        if (photo == null) return null;
        VehicleResponse.PhotoResponse response = new VehicleResponse.PhotoResponse();
        response.setId(photo.getId());
        response.setUrl(photo.getUrl());
        response.setMain(photo.isMain());
        response.setUploadedAt(photo.getUploadedAt());
        return response;
    }

    public VehicleSummaryResponse toSummaryResponse(UserVehicle vehicle) {
        if (vehicle == null) return null;
        VehicleSummaryResponse response = new VehicleSummaryResponse();
        response.setId(vehicle.getId());
        if (vehicle.getTemplate() != null) {
            if (vehicle.getTemplate().getBrand() != null) {
                response.setBrandName(vehicle.getTemplate().getBrand().getName());
            }
            if (vehicle.getTemplate().getModel() != null) {
                response.setModelName(vehicle.getTemplate().getModel().getName());
            }
            response.setYear(vehicle.getTemplate().getYear());
            response.setTrimConfiguration(vehicle.getTemplate().getTrimConfiguration());
        }
        response.setLicensePlate(vehicle.getLicensePlate());
        response.setVin(vehicle.getVin());
        response.setCurrentMileage(vehicle.getCurrentMileage());
        response.setMileageUnit(vehicle.getMileageUnit());
        response.setFuelType(vehicle.getFuelType());
        response.setTransmission(vehicle.getTransmission());
        response.setColor(vehicle.getColor());
        response.setNickname(vehicle.getNickname());
        response.setPurchaseCondition(vehicle.getPurchaseCondition());
        response.setPrimary(vehicle.isPrimary());
        response.setStatus(vehicle.getStatus());
        response.setMainPhotoUrl(mapMainPhotoUrl(vehicle.getPhotos()));
        response.setLastServiceDate(vehicle.getLastServiceDate());
        response.setLastServiceMileage(vehicle.getLastServiceMileage());
        response.setPurchaseDate(vehicle.getPurchaseDate());
        response.setCompletenessScore(vehicle.getCompletenessScore());
        response.setEstimatedAnnualMileage(vehicle.getEstimatedAnnualMileage());
        if (vehicle.getDrivingProfile() != null) {
            response.setDrivingProfile(vehicle.getDrivingProfile().name());
        }
        if (vehicle.getClimateAssumptions() != null) {
            response.setClimateAssumptions(vehicle.getClimateAssumptions().name());
        }
        return response;
    }

    public List<VehicleSummaryResponse> toSummaryResponseList(List<UserVehicle> vehicles) {
        if (vehicles == null) return Collections.emptyList();
        return vehicles.stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    public String mapMainPhotoUrl(List<VehiclePhoto> photos) {
        if (photos == null) {
            return null;
        }
        return photos.stream()
                .filter(VehiclePhoto::isMain)
                .map(VehiclePhoto::getUrl)
                .findFirst()
                .orElse(null);
    }
}
