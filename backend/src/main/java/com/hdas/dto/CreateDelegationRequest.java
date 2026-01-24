package com.hdas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateDelegationRequest {
    @NotNull
    private UUID assignmentId;
    
    @NotNull
    private UUID originalUserId;
    
    @NotNull
    private UUID delegatedToId;
    
    private String reason;
    
    private Boolean retainAccountability;
}
