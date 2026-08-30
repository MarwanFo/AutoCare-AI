package com.autocare.backend.vehicle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleBudgetForecastResponse {
    private String vehicleId;
    private String vehicleTitle;
    private String brandTier; // ECONOMY, STANDARD, PREMIUM, LUXURY, EXOTIC
    private String currency;  // EUR, USD, MAD, GBP
    private int totalEstimatedBudget;
    private int budget0To3Months;
    private int budget3To6Months;
    private int budget6To12Months;
    private int estimatedLaborRatePerHour;
    private double totalLaborHours;
    private String aiSummary;
    private List<BudgetItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetItem {
        private String componentName;
        private String category;
        private Integer healthScore;
        private String urgency; // URGENT, UPCOMING, SCHEDULED
        private int estimatedPartCost;
        private int estimatedLaborCost;
        private int totalCost;
        private String timeframe; // 0-3M, 3-6M, 6-12M
        private String aiRecommendation;
    }
}
