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
public class SimpleAuthResponse {
    private String token;
    private String username;
    private String email;
    private String role;
    private Set<String> permissions;
    private boolean success;
    private String message;
}
