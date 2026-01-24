package com.hdas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateEscalationRuleRequest {
    @NotNull
    private UUID processStepId;
    
    @NotNull
    private Integer thresholdPercentage;
    
    private UUID escalationRoleId;
    
    private UUID escalationUserId;
    
    @NotNull
    private Long cooldownSeconds;
}
