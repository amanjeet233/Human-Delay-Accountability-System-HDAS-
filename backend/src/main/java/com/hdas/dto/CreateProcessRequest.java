package com.hdas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateProcessRequest {
    @NotBlank
    private String name;
    
    private String version;
    
    private String description;
    
    private List<CreateProcessStepRequest> steps;
}
