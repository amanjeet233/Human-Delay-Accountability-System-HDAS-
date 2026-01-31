package com.hdas.dto.profile;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class SelfProfileResponse {
    private UUID id;
    private String username;
    private String fullName;
    private String email;
    private String department;
    private String role;
}
