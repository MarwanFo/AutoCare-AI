package com.autocare.backend.subscription.dto;

import com.autocare.backend.subscription.entity.BillingPeriod;
import com.autocare.backend.subscription.entity.PackType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record PricingPackRequest(
        @NotBlank(message = "Pack code identifier is required")
        String code,

        @NotBlank(message = "Pack name is required")
        String name,

        String description,

        @NotNull(message = "Pack type is required (SUBSCRIPTION or CREDIT_PACK)")
        PackType packType,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative")
        BigDecimal price,

        String currency,

        BillingPeriod billingPeriod,

        Integer vehicleLimit,

        Integer aiCredits,

        @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = FeaturesDeserializer.class)
        String features,

        String badge,

        Boolean isActive,

        Integer displayOrder
) {
    public static class FeaturesDeserializer extends com.fasterxml.jackson.databind.JsonDeserializer<String> {
        @Override
        public String deserialize(com.fasterxml.jackson.core.JsonParser p, com.fasterxml.jackson.databind.DeserializationContext ctxt)
                throws java.io.IOException {
            com.fasterxml.jackson.core.JsonToken token = p.currentToken();
            if (token == com.fasterxml.jackson.core.JsonToken.VALUE_STRING) {
                return p.getText();
            } else if (token == com.fasterxml.jackson.core.JsonToken.VALUE_NULL) {
                return null;
            } else {
                com.fasterxml.jackson.core.TreeNode node = p.readValueAsTree();
                return node != null ? node.toString() : null;
            }
        }
    }
}
