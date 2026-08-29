package com.autocare.backend.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUpdateUserRoleRequest {
    @NotBlank(message = "Role name cannot be blank")
    private String roleName;
}
