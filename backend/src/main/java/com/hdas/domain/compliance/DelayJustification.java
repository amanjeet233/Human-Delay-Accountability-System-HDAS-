package com.hdas.domain.compliance;

import com.hdas.domain.common.BaseEntity;
import com.hdas.domain.delay.Delay;
import com.hdas.domain.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "delay_justifications", indexes = {
    @Index(name = "idx_justification_delay", columnList = "delay_id"),
    @Index(name = "idx_justification_approved", columnList = "approved")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DelayJustification extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delay_id", nullable = false)
    @NotNull
    private Delay delay;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "justified_by_id", nullable = false)
    @NotNull
    private User justifiedBy;
    
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String justificationText;
    
    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean approved = false;
    
    @Column(name = "approved_by_id", columnDefinition = "BINARY(16)")
    private UUID approvedById;
    
    @Column
    private Instant approvedAt;
}
