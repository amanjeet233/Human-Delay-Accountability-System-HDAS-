package com.hdas.domain.request;

import com.hdas.domain.common.BaseEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "request_status_history", indexes = {
    @Index(name = "idx_rsh_request", columnList = "request_id"),
    @Index(name = "idx_rsh_changed_at", columnList = "changed_at"),
    @Index(name = "idx_rsh_new_status", columnList = "new_status"),
    @Index(name = "idx_rsh_assigned_role", columnList = "assigned_role"),
    @Index(name = "idx_rsh_assigned_user", columnList = "assigned_user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestStatusHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    @NotNull
    private Request request;

    @NotBlank
    @Column(name = "previous_status", nullable = false, length = 50)
    private String previousStatus;

    @NotBlank
    @Column(name = "new_status", nullable = false, length = 50)
    private String newStatus;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "assigned_role", nullable = false, length = 20)
    @NotNull
    private AssignedRole assignedRole;

    @Column(name = "assigned_user_id", columnDefinition = "BINARY(16)", nullable = false)
    @NotNull
    private UUID assignedUserId;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "changed_at", nullable = false)
    @Builder.Default
    private Instant changedAt = Instant.now();

    // Number of whole days spent in the previous status until this change
    @Column(name = "days_spent_days", nullable = false)
    @Builder.Default
    private Integer daysSpentDays = 0;

    @PrePersist
    public void prePersistDefaults() {
        if (changedAt == null) {
            changedAt = Instant.now();
        }
        if (daysSpentDays == null) {
            daysSpentDays = 0;
        }
    }
}
