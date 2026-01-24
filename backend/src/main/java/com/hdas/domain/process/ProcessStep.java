package com.hdas.domain.process;

import com.hdas.domain.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "process_steps", indexes = {
    @Index(name = "idx_step_process", columnList = "process_id"),
    @Index(name = "idx_step_sequence", columnList = "process_id,sequence_order")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessStep extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    @NotNull
    private Process process;
    
    @NotBlank
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull
    @Column(nullable = false)
    private Integer sequenceOrder;
    
    @Column(length = 100)
    private String responsibleRole;
    
    @Column(columnDefinition = "BIGINT")
    private Long defaultSlaDurationSeconds;
    
    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
