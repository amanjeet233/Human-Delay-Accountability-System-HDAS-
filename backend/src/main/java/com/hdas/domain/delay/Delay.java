package com.hdas.domain.delay;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "delays", indexes = {
    @Index(name = "idx_delay_assignment", columnList = "assignment_id"),
    @Index(name = "idx_delay_responsible", columnList = "responsible_user_id"),
    @Index(name = "idx_delay_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delay extends com.hdas.domain.common.BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    @NotNull
    private Assignment assignment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_user_id", nullable = false)
    @NotNull
    private User responsibleUser;
    
    @NotNull
    @jakarta.validation.constraints.Min(value = 0, message = "Delay seconds must be non-negative")
    @Column(nullable = false, columnDefinition = "BIGINT")
    private Long delaySeconds;

    @Column(name = "delay_days", nullable = false)
    @Builder.Default
    private Integer delayDays = 0;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @Column(length = 100)
    private String reasonCategory;

    @Column(name = "responsible_role", length = 100)
    private String responsibleRole;
    
    @Column(nullable = false)
    @Builder.Default
    private Instant detectedAt = Instant.now();
    
    @Column(columnDefinition = "TEXT")
    private String justification;
    
    @Column(name = "justified_by_id", columnDefinition = "BINARY(16)")
    private UUID justifiedById;
    
    @Column
    private Instant justifiedAt;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean justified = false;
    
    @Column(name = "original_assignment_id", columnDefinition = "BINARY(16)")
    private UUID originalAssignmentId;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isShadowDelay = false;
}
