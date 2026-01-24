package com.hdas.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "username", nullable = false)
    private String username;
    
    @Column(name = "action", nullable = false)
    private String action;
    
    @Column(name = "entity_type", nullable = false)
    private String entityType;
    
    @Column(name = "entity_id")
    private String entityId;
    
    @Column(name = "details", columnDefinition = "TEXT")
    private String details;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "severity", nullable = false)
    private String severity;
    
    @Column(name = "category", nullable = false)
    private String category;
    
    @Column(name = "legal_hold", nullable = false)
    @Builder.Default
    private Boolean legalHold = false;
    
    @Column(name = "legal_hold_reason", columnDefinition = "TEXT")
    private String legalHoldReason;
    
    @Column(name = "legal_hold_by")
    private String legalHoldBy;
    
    @Column(name = "legal_hold_at")
    private LocalDateTime legalHoldAt;
    
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
        if (legalHold == null) {
            legalHold = false;
        }
    }
}
