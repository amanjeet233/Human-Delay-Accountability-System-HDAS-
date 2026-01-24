package com.hdas.domain.audit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    
    private UUID id;
    
    @Builder.Default
    private Instant createdAt = Instant.now();
    
    private UUID userId;
    
    private String username;
    
    @NotBlank
    private String action;
    
    @NotBlank
    private String entityType;
    
    private UUID entityId;
    
    private String oldValue;
    
    private String newValue;
    
    private String details;
    
    private String ipAddress;
    
    private String userAgent;
    
    @NotNull
    @Builder.Default
    private Instant timestamp = Instant.now();
}
