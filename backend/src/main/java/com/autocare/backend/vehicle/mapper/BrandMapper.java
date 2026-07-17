package com.autocare.backend.vehicle.mapper;

import com.autocare.backend.vehicle.dto.BrandResponse;
import com.autocare.backend.vehicle.entity.Brand;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BrandMapper {
    BrandResponse toResponse(Brand brand);
    List<BrandResponse> toResponseList(List<Brand> brands);
}
