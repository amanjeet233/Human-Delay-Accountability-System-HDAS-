package com.hdas.domain.escalation;

import com.hdas.domain.common.BaseEntity;
import com.hdas.domain.process.ProcessStep;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "escalation_rules", indexes = {
    @Index(name = "idx_escalation_step", columnList = "process_step_id"),
    @Index(name = "idx_escalation_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscalationRule extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_step_id", nullable = false)
    @NotNull
    private ProcessStep processStep;
    
    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Integer thresholdPercentage = 80;
    
    @Column(name = "escalation_role_id", columnDefinition = "BINARY(16)")
    private UUID escalationRoleId;
    
    @Column(name = "escalation_user_id", columnDefinition = "BINARY(16)")
    private UUID escalationUserId;
    
    @NotNull
    @Column(nullable = false, columnDefinition = "BIGINT")
    @Builder.Default
    private Long cooldownSeconds = 3600L;
    
    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
