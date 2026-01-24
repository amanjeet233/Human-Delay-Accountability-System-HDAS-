package com.hdas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String role;  // PRIMARY ROLE for frontend routing (singular)
    private Set<String> roles;  // All roles for backend authorization
    private Set<String> permissions;
    
    @Builder.Default
    private boolean isSystemAdmin = false;  // Flag to indicate hardcoded admin
}
