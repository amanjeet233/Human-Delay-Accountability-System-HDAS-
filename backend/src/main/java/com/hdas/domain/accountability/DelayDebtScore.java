package com.hdas.domain.accountability;

import com.hdas.domain.common.BaseEntity;
import com.hdas.domain.user.Role;
import com.hdas.domain.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "delay_debt_scores", indexes = {
    @Index(name = "idx_delay_debt_user", columnList = "user_id"),
    @Index(name = "idx_delay_debt_role", columnList = "role_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DelayDebtScore extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;
    
    @NotNull
    @Column(nullable = false, columnDefinition = "BIGINT")
    @Builder.Default
    private Long totalDelaySeconds = 0L;
    
    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Integer totalDelaysCount = 0;
    
    @NotNull
    @Column(nullable = false, columnDefinition = "BIGINT")
    @Builder.Default
    private Long averageDelaySeconds = 0L;
    
    @Column(nullable = false)
    @Builder.Default
    private Instant lastCalculatedAt = Instant.now();
}
