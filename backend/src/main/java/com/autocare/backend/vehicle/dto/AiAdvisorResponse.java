package com.autocare.backend.vehicle.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiAdvisorResponse {

    private String vehicleContext;
    private String question;
    private String answer;
}
