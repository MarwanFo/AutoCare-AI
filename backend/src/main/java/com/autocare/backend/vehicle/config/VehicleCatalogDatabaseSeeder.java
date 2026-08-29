package com.autocare.backend.vehicle.config;

import com.autocare.backend.vehicle.entity.Brand;
import com.autocare.backend.vehicle.entity.Model;
import com.autocare.backend.vehicle.repository.BrandRepository;
import com.autocare.backend.vehicle.repository.ModelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class VehicleCatalogDatabaseSeeder {

    private final BrandRepository brandRepository;
    private final ModelRepository modelRepository;

    private static final Map<String, List<String>> POPULAR_CATALOG = Map.ofEntries(
        Map.entry("Toyota", List.of("Camry", "Corolla", "RAV4", "Land Cruiser", "Hilux", "Yaris", "Prado", "Fortuner", "Prius", "Supra")),
        Map.entry("Mercedes-Benz", List.of("C-Class", "E-Class", "S-Class", "A-Class", "CLA", "GLA", "GLC", "GLE", "G-Class")),
        Map.entry("BMW", List.of("3 Series", "5 Series", "1 Series", "4 Series", "7 Series", "X1", "X3", "X5", "X6", "M3", "M5")),
        Map.entry("Audi", List.of("A3", "A4", "A6", "Q3", "Q5", "Q7", "Q8", "RS3", "RS6")),
        Map.entry("Volkswagen", List.of("Golf", "Polo", "Tiguan", "Passat", "Touareg", "T-Roc", "Arteon", "Caddy")),
        Map.entry("Renault", List.of("Clio", "Megane", "Captur", "Kadjar", "Austral", "Duster", "Arkana", "Kangoo")),
        Map.entry("Peugeot", List.of("208", "308", "508", "2008", "3008", "5008", "Partner")),
        Map.entry("Dacia", List.of("Sandero", "Duster", "Logan", "Jogger", "Spring")),
        Map.entry("Hyundai", List.of("Tucson", "i10", "i20", "i30", "Elantra", "Santa Fe", "Kona", "Ioniq 5")),
        Map.entry("Kia", List.of("Sportage", "Picanto", "Rio", "Ceed", "Sorento", "Seltos", "EV6")),
        Map.entry("Nissan", List.of("Qashqai", "Juke", "X-Trail", "Micra", "Patrol", "Navara", "GT-R")),
        Map.entry("Ford", List.of("Fiesta", "Focus", "Mustang", "Ranger", "Kuga", "Explorer", "Puma", "Transit")),
        Map.entry("Honda", List.of("Civic", "Accord", "CR-V", "HR-V", "Jazz", "City")),
        Map.entry("Fiat", List.of("500", "Panda", "Tipo", "Punto", "Doblo")),
        Map.entry("Seat", List.of("Ibiza", "Leon", "Arona", "Ateca", "Tarraco")),
        Map.entry("Skoda", List.of("Octavia", "Fabia", "Superb", "Kamiq", "Karoq", "Kodiaq")),
        Map.entry("Land Rover", List.of("Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar", "Defender", "Discovery")),
        Map.entry("Porsche", List.of("911", "Cayenne", "Macan", "Panamera", "Taycan", "718 Boxster", "718 Cayman")),
        Map.entry("Tesla", List.of("Model 3", "Model Y", "Model S", "Model X", "Cybertruck")),
        Map.entry("Volvo", List.of("XC40", "XC60", "XC90", "S60", "S90", "V60")),
        Map.entry("Citroen", List.of("C3", "C4", "C5 Aircross", "Berlingo")),
        Map.entry("Alfa Romeo", List.of("Giulia", "Stelvio", "Tonale", "Giulietta")),
        Map.entry("Jeep", List.of("Wrangler", "Grand Cherokee", "Cherokee", "Renegade", "Compass")),
        Map.entry("Mitsubishi", List.of("Outlander", "Lancer", "ASX", "Pajero", "L200")),
        Map.entry("Mazda", List.of("2", "3", "6", "CX-3", "CX-30", "CX-5", "CX-90", "MX-5 Miata")),
        Map.entry("Suzuki", List.of("Swift", "Jimny", "Vitara", "Baleno", "Ignis", "Celerio")),
        Map.entry("Cupra", List.of("Formentor", "Leon", "Ateca", "Born")),
        Map.entry("Mini", List.of("Cooper", "Countryman", "Clubman")),
        Map.entry("Lexus", List.of("IS", "ES", "GS", "LS", "NX", "RX", "GX", "LX")),
        Map.entry("Chevrolet", List.of("Camaro", "Corvette", "Cruze", "Malibu", "Tahoe", "Silverado"))
    );

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void ensureCatalogPopulated() {
        long brandCount = brandRepository.count();
        if (brandCount < 10) {
            log.info("Vehicle catalog has only {} brands. Auto-seeding core manufacturer catalog...", brandCount);
            for (Map.Entry<String, List<String>> entry : POPULAR_CATALOG.entrySet()) {
                String brandName = entry.getKey();
                Brand brand = brandRepository.findByNameIgnoreCase(brandName).orElseGet(() -> {
                    Brand b = new Brand();
                    b.setName(brandName);
                    String slug = brandName.toLowerCase().replace(" ", "-");
                    b.setLogoUrl("https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/" + slug + ".png");
                    return brandRepository.save(b);
                });

                for (String modelName : entry.getValue()) {
                    if (!modelRepository.existsByBrandIdAndNameIgnoreCase(brand.getId(), modelName)) {
                        Model model = new Model();
                        model.setBrand(brand);
                        model.setName(modelName);
                        modelRepository.save(model);
                    }
                }
            }
            log.info("Catalog auto-seed completed. Total brands now: {}", brandRepository.count());
        }
    }
}
