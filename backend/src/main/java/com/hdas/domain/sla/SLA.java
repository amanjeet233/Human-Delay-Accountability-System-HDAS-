package com.hdas.domain.sla;

import com.hdas.domain.common.BaseEntity;
import com.hdas.domain.process.ProcessStep;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "slas", indexes = {
    @Index(name = "idx_sla_step", columnList = "process_step_id"),
    @Index(name = "idx_sla_role", columnList = "role_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLA extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_step_id", nullable = false)
    @NotNull
    private ProcessStep processStep;
    
    @Column(name = "role_id", columnDefinition = "BINARY(16)")
    private UUID roleId;
    
    @Column(length = 100)
    private String roleName;
    
    @NotNull
    @Column(nullable = false, columnDefinition = "BIGINT")
    private Long allowedDurationSeconds;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
