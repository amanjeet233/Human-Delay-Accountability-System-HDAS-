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
public class CurrentUserResponse {
    // Keep both id and userId to retain frontend compatibility
    private String id;          // same as userId
    private String userId;      // canonical user identifier
    private String username;
    private String role;        // primary role used for routing
    private String departmentId; // department identifier (string)
    private Set<String> permissions; // union of role permissions
}
