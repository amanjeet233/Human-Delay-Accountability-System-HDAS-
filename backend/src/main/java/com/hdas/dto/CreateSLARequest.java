package com.hdas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateSLARequest {
    @NotNull
    private UUID processStepId;
    
    private UUID roleId;
    
    private String roleName;
    
    @NotNull
    private Long allowedDurationSeconds;
    
    private String description;
    
    private Boolean active;
}
