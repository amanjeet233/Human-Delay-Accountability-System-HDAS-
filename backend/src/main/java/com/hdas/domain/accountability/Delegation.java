package com.hdas.domain.accountability;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.common.BaseEntity;
import com.hdas.domain.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "delegations", indexes = {
    @Index(name = "idx_delegation_assignment", columnList = "assignment_id"),
    @Index(name = "idx_delegation_original", columnList = "original_user_id"),
    @Index(name = "idx_delegation_delegated", columnList = "delegated_to_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delegation extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    @NotNull
    private Assignment assignment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_user_id", nullable = false)
    @NotNull
    private User originalUser;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegated_to_id", nullable = false)
    @NotNull
    private User delegatedTo;
    
    @Column(nullable = false)
    @Builder.Default
    private Instant delegatedAt = Instant.now();
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean retainAccountability = true;
    
    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
