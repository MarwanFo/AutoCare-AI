package com.autocare.backend.vehicle.mapper;

import com.autocare.backend.vehicle.dto.VehicleResponse;
import com.autocare.backend.vehicle.dto.VehicleSummaryResponse;
import com.autocare.backend.vehicle.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VehicleMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "templateId", source = "template.id")
    @Mapping(target = "brandName", source = "template.brand.name")
    @Mapping(target = "modelName", source = "template.model.name")
    @Mapping(target = "year", source = "template.year")
    @Mapping(target = "trimConfiguration", source = "template.trimConfiguration")
    @Mapping(target = "specifications", source = "template.specifications")
    VehicleResponse toResponse(UserVehicle vehicle);

    List<VehicleResponse> toResponseList(List<UserVehicle> vehicles);

    VehicleResponse.ComponentResponse toComponentResponse(UserComponent component);

    VehicleResponse.DocumentResponse toDocumentResponse(UserDocument document);

    @Mapping(target = "brandName", source = "template.brand.name")
    @Mapping(target = "modelName", source = "template.model.name")
    @Mapping(target = "year", source = "template.year")
    @Mapping(target = "trimConfiguration", source = "template.trimConfiguration")
    @Mapping(target = "mainPhotoUrl", source = "photos", qualifiedByName = "mapMainPhotoUrl")
    VehicleSummaryResponse toSummaryResponse(UserVehicle vehicle);

    List<VehicleSummaryResponse> toSummaryResponseList(List<UserVehicle> vehicles);

    @Named("mapMainPhotoUrl")
    default String mapMainPhotoUrl(List<VehiclePhoto> photos) {
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
