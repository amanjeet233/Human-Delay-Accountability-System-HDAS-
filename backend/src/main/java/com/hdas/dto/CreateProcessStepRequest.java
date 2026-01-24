package com.hdas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateProcessStepRequest {
    @NotBlank
    private String name;
    
    private String description;
    
    @NotNull
    private Integer sequenceOrder;
    
    private String responsibleRole;
    
    private Long defaultSlaDurationSeconds;
}
