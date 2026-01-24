package com.hdas.domain.governance;

import com.hdas.domain.common.BaseEntity;
import com.hdas.domain.process.ProcessStep;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "sla_exclusion_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLAExclusionRule extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_step_id")
    private ProcessStep processStep;
    
    @NotBlank
    @Column(nullable = false, length = 50)
    private String ruleType; // HOLIDAY, WEEKEND, EMERGENCY
    
    @NotNull
    @Column(nullable = false)
    private Instant exclusionStart;
    
    @NotNull
    @Column(nullable = false)
    private Instant exclusionEnd;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
