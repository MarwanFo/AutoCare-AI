package com.autocare.backend.admin.dto;

import com.autocare.backend.auth.entity.AccountStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUpdateUserStatusRequest {
    @NotNull(message = "Status cannot be null")
    private AccountStatus status;
}
