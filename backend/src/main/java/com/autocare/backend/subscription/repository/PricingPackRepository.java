package com.autocare.backend.subscription.repository;

import com.autocare.backend.subscription.entity.PackType;
import com.autocare.backend.subscription.entity.PricingPack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PricingPackRepository extends JpaRepository<PricingPack, UUID> {

    Optional<PricingPack> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);

    List<PricingPack> findAllByOrderByDisplayOrderAsc();

    List<PricingPack> findAllByIsActiveTrueOrderByDisplayOrderAsc();

    List<PricingPack> findAllByPackTypeAndIsActiveTrueOrderByDisplayOrderAsc(PackType packType);

    List<PricingPack> findAllByPackTypeOrderByDisplayOrderAsc(PackType packType);
}
