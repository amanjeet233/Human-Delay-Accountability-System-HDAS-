package com.hdas.dto;

import lombok.Data;

import java.util.Set;

@Data
public class UpdateRoleRequest {
    private String description;
    
    private Set<String> permissions;
    
    private Boolean active;
}
