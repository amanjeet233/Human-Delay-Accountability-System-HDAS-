package com.hdas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class CreateRoleRequest {
    @NotBlank
    private String name;
    
    private String description;
    
    private Set<String> permissions;
    
    private Boolean active;
}
