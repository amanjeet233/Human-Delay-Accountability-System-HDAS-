package com.hdas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CreateSLAExclusionRuleRequest {
    private UUID processStepId;
    
    @NotBlank
    private String ruleType; // HOLIDAY, WEEKEND, EMERGENCY
    
    @NotNull
    private Instant exclusionStart;
    
    @NotNull
    private Instant exclusionEnd;
    
    private String description;
}
