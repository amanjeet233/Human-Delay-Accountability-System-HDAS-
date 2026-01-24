package com.hdas.domain.escalation;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "escalation_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscalationHistory extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    @NotNull
    private Assignment assignment;
    
    @Column(name = "escalated_from_user_id", columnDefinition = "BINARY(16)")
    private UUID escalatedFromUserId;
    
    @Column(name = "escalated_to_user_id", columnDefinition = "BINARY(16)")
    private UUID escalatedToUserId;
    
    @Column(name = "escalated_to_role_id", columnDefinition = "BINARY(16)")
    private UUID escalatedToRoleId;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @Column(nullable = false)
    @Builder.Default
    private Instant escalatedAt = Instant.now();
    
    @Column
    private Instant resolvedAt;
}
