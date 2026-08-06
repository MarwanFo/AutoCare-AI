package com.autocare.backend.vehicle.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiAdvisorRequest {

    @NotBlank(message = "Question or prompt is required")
    private String question;
}
