package com.autocare.backend.vehicle.mapper;

import com.autocare.backend.vehicle.dto.BrandResponse;
import com.autocare.backend.vehicle.entity.Brand;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class BrandMapper {

    public BrandResponse toResponse(Brand brand) {
        if (brand == null) return null;
        BrandResponse response = new BrandResponse();
        response.setId(brand.getId());
        response.setName(brand.getName());
        response.setLogoUrl(brand.getLogoUrl());
        return response;
    }

    public List<BrandResponse> toResponseList(List<Brand> brands) {
        if (brands == null) return Collections.emptyList();
        return brands.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
